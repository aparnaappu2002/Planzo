import { createClient, RedisClientType } from 'redis';
import { IredisService } from '../../domain/interfaces/serviceInterface/IredisService';

export class RedisService implements IredisService {
    private client: RedisClientType;
    private connectionPromise: Promise<RedisClientType> | null = null;
    private failureCount = 0;
    private lastFailureTime = 0;
    private readonly maxFailures = 5;
    private readonly resetTimeout = 60000; // 1 minute
    private readonly keyPrefix = process.env.REDIS_KEY_PREFIX || 'app:';

    constructor() {
        this.client = createClient({
            url: process.env.REDIS_URL,
            socket: {
                reconnectStrategy: (retries: number) => {
                    if (retries > parseInt(process.env.REDIS_MAX_RETRIES || '10')) {
                        return new Error("Too many retries");
                    }
                    return Math.min(retries * 100, 3000);
                },
                connectTimeout: parseInt(process.env.REDIS_CONNECT_TIMEOUT || '10000')
            }
        });

        this.setupEventHandlers();
    }

    private setupEventHandlers(): void {
        this.client.on('error', (err) => {
            console.error('Redis client error:', err);
            this.onFailure();
        });

        this.client.on('connect', async () => {
            console.log("Redis client connected");
            try {
                await this.authenticate();
                this.onSuccess();
            } catch (err) {
                console.error('Authentication failed:', err);
                this.onFailure();
            }
        });

        this.client.on('reconnecting', () => {
            console.log("Redis client reconnecting...");
        });

        this.client.on('end', () => {
            console.log("Redis client disconnected");
        });

        this.client.on('ready', () => {
            console.log("Redis client ready");
        });
    }

    private async authenticate(): Promise<void> {
        try {
            if (process.env.REDIS_PASSWORD) {
                await this.client.sendCommand(['AUTH', process.env.REDIS_PASSWORD]);
            }
            
            const dbNumber = process.env.REDIS_DB || '0';
            if (dbNumber !== '0') {
                await this.client.sendCommand(['SELECT', dbNumber]);
            }
        } catch (err) {
            console.error('Redis authentication failed:', err);
            throw err;
        }
    }

    private checkCircuitBreaker(): void {
        if (this.failureCount >= this.maxFailures) {
            if (Date.now() - this.lastFailureTime < this.resetTimeout) {
                throw new Error('Circuit breaker is open - Redis service temporarily unavailable');
            } else {
                this.failureCount = 0;
            }
        }
    }

    private onSuccess(): void {
        this.failureCount = 0;
    }

    private onFailure(): void {
        this.failureCount++;
        this.lastFailureTime = Date.now();
    }

    private validateKey(key: string): void {
        if (!key || typeof key !== 'string') {
            throw new Error('Invalid key: must be a non-empty string');
        }
        if (key.length > 512) {
            throw new Error('Key too long: maximum 512 characters allowed');
        }
        if (key.includes('\n') || key.includes('\r') || key.includes(' ')) {
            throw new Error('Key contains invalid characters');
        }
    }

    private prefixKey(key: string): string {
        return this.keyPrefix + key;
    }

    public async connect(): Promise<void> {
        if (!this.connectionPromise && !this.client.isOpen) {
            this.connectionPromise = this.client.connect();
        }
        
        if (this.connectionPromise) {
            await this.connectionPromise;
        }
    }

    public async disconnect(): Promise<void> {
        if (this.client.isOpen) {
            this.connectionPromise = null;
            await this.client.quit();
        }
    }

    public async gracefulShutdown(): Promise<void> {
        try {
            await this.disconnect();
        } catch (error) {
            console.error('Error during graceful shutdown:', error);
        }
    }

    public async get(key: string): Promise<string | null> {
        this.validateKey(key);
        this.checkCircuitBreaker();
        
        if (!this.client.isOpen) {
            await this.connect();
        }
        
        try {
            const result = await this.client.get(this.prefixKey(key));
            this.onSuccess();
            return result;
        } catch (err) {
            console.error(`Error getting key ${key}:`, err);
            this.onFailure();
            throw err;
        }
    }

    public async set(key: string, seconds: number, value: string): Promise<void> {
        this.validateKey(key);
        this.checkCircuitBreaker();

        if (!key || typeof value !== 'string') {
            throw new Error('Invalid parameters for set operation');
        }

        if (seconds <= 0 || seconds > 86400) {
            throw new Error('Invalid expiration time: must be between 1 and 86400 seconds');
        }
        
        if (!this.client.isOpen) {
            await this.connect();
        }
        
        try {
            await this.client.set(this.prefixKey(key), value, {
                EX: seconds
            });
            this.onSuccess();
        } catch (err) {
            console.error(`Error setting key ${key}:`, err);
            this.onFailure();
            throw err;
        }
    }

    public async del(key: string): Promise<void> {
        this.validateKey(key);
        this.checkCircuitBreaker();
        
        if (!this.client.isOpen) {
            await this.connect();
        }
        
        try {
            await this.client.del(this.prefixKey(key));
            this.onSuccess();
        } catch (err) {
            console.error(`Error deleting key ${key}:`, err);
            this.onFailure();
            throw err;
        }
    }

    public async exists(key: string): Promise<boolean> {
        this.validateKey(key);
        this.checkCircuitBreaker();
        
        if (!this.client.isOpen) {
            await this.connect();
        }
        
        try {
            const result = await this.client.exists(this.prefixKey(key));
            this.onSuccess();
            return result === 1;
        } catch (err) {
            console.error(`Error checking existence of key ${key}:`, err);
            this.onFailure();
            throw err;
        }
    }

    public async setEx(key: string, seconds: number, value: string): Promise<void> {
        this.validateKey(key);
        this.checkCircuitBreaker();
        
        if (!this.client.isOpen) {
            await this.connect();
        }
        
        try {
            await this.client.setEx(this.prefixKey(key), seconds, value);
            this.onSuccess();
        } catch (err) {
            console.error(`Error setting key with expiration ${key}:`, err);
            this.onFailure();
            throw err;
        }
    }

    public async setNx(key: string, value: string): Promise<boolean> {
        this.validateKey(key);
        this.checkCircuitBreaker();
        
        if (!this.client.isOpen) {
            await this.connect();
        }
        
        try {
            const result = await this.client.setNX(this.prefixKey(key), value);
            this.onSuccess();
            // Convert Redis number response (1 or 0) to boolean
            return result === 1;
        } catch (err) {
            console.error(`Error setting key if not exists ${key}:`, err);
            this.onFailure();
            throw err;
        }
    }

    public async mget(keys: string[]): Promise<(string | null)[]> {
        keys.forEach(key => this.validateKey(key));
        this.checkCircuitBreaker();
        
        if (!this.client.isOpen) {
            await this.connect();
        }
        
        try {
            const prefixedKeys = keys.map(key => this.prefixKey(key));
            const result = await this.client.mGet(prefixedKeys);
            this.onSuccess();
            return result;
        } catch (err) {
            console.error(`Error getting multiple keys:`, err);
            this.onFailure();
            throw err;
        }
    }

    public async mset(keyValuePairs: Record<string, string>): Promise<void> {
        Object.keys(keyValuePairs).forEach(key => this.validateKey(key));
        this.checkCircuitBreaker();
        
        if (!this.client.isOpen) {
            await this.connect();
        }
        
        try {
            const prefixedPairs: Record<string, string> = {};
            Object.entries(keyValuePairs).forEach(([key, value]) => {
                prefixedPairs[this.prefixKey(key)] = value;
            });
            
            await this.client.mSet(prefixedPairs);
            this.onSuccess();
        } catch (err) {
            console.error(`Error setting multiple keys:`, err);
            this.onFailure();
            throw err;
        }
    }

    public async ping(): Promise<boolean> {
        try {
            if (!this.client.isOpen) {
                await this.connect();
            }
            await this.client.ping();
            return true;
        } catch (err) {
            console.error('Redis ping failed:', err);
            return false;
        }
    }

    public async ttl(key: string): Promise<number> {
        this.validateKey(key);
        this.checkCircuitBreaker();
        
        if (!this.client.isOpen) {
            await this.connect();
        }
        
        try {
            const result = await this.client.ttl(this.prefixKey(key));
            this.onSuccess();
            return result;
        } catch (err) {
            console.error(`Error getting TTL for key ${key}:`, err);
            this.onFailure();
            throw err;
        }
    }

    public async expire(key: string, seconds: number): Promise<boolean> {
        this.validateKey(key);
        this.checkCircuitBreaker();
        
        if (!this.client.isOpen) {
            await this.connect();
        }
        
        try {
            const result = await this.client.expire(this.prefixKey(key), seconds);
            this.onSuccess();
            // Convert Redis number response (1 or 0) to boolean
            return result === 1;
        } catch (err) {
            console.error(`Error setting expiration for key ${key}:`, err);
            this.onFailure();
            throw err;
        }
    }

    public async getInfo(section?: string): Promise<string> {
        if (!this.client.isOpen) {
            await this.connect();
        }
        
        try {
            let info: unknown;
            if (section) {
                info = await this.client.sendCommand(['INFO', section]);
            } else {
                info = await this.client.sendCommand(['INFO']);
            }
            
            return String(info);
        } catch (err) {
            console.error('Error getting Redis info:', err);
            throw err;
        }
    }

    public async scanKeys(pattern: string, count: number = 10): Promise<string[]> {
        if (!this.client.isOpen) {
            await this.connect();
        }
        
        try {
            const keys: string[] = [];
            let cursor = '0';
            const prefixedPattern = this.prefixKey(pattern);
            
            do {
                const result = await this.client.sendCommand([
                    'SCAN', cursor, 'MATCH', prefixedPattern, 'COUNT', count.toString()
                ]);
                
                if (Array.isArray(result) && result.length === 2) {
                    cursor = String(result[0]);
                    const foundKeys = result[1];
                    
                    if (Array.isArray(foundKeys)) {
                        keys.push(...foundKeys.map(k => String(k)));
                    }
                } else {
                    break;
                }
                
                if (keys.length > 10000) break;
                
            } while (cursor !== '0');
            
            return keys.map(key => key.substring(this.keyPrefix.length));
        } catch (err) {
            console.error('Error scanning keys:', err);
            throw err;
        }
    }

    public async hset(key: string, field: string, value: string): Promise<number> {
        this.validateKey(key);
        this.checkCircuitBreaker();
        
        if (!this.client.isOpen) {
            await this.connect();
        }
        
        try {
            const result = await this.client.hSet(this.prefixKey(key), field, value);
            this.onSuccess();
            return result;
        } catch (err) {
            console.error(`Error setting hash field ${field} for key ${key}:`, err);
            this.onFailure();
            throw err;
        }
    }

    public async hget(key: string, field: string): Promise<string | null> {
        this.validateKey(key);
        this.checkCircuitBreaker();
        
        if (!this.client.isOpen) {
            await this.connect();
        }
        
        try {
            const result = await this.client.hGet(this.prefixKey(key), field);
            this.onSuccess();
            return result;
        } catch (err) {
            console.error(`Error getting hash field ${field} for key ${key}:`, err);
            this.onFailure();
            throw err;
        }
    }

    public getClient(): RedisClientType {
        return this.client;
    }

    public getConnectionStatus(): {
        isOpen: boolean;
        failureCount: number;
        isCircuitOpen: boolean;
        isReady: boolean;
    } {
        return {
            isOpen: this.client.isOpen,
            failureCount: this.failureCount,
            isCircuitOpen: this.failureCount >= this.maxFailures && 
                          (Date.now() - this.lastFailureTime) < this.resetTimeout,
            isReady: this.client.isReady
        };
    }

    public async healthCheck(): Promise<{
        status: 'healthy' | 'unhealthy';
        latency?: number;
        error?: string;
    }> {
        try {
            const start = Date.now();
            const pingResult = await this.ping();
            const latency = Date.now() - start;
            
            return {
                status: pingResult ? 'healthy' : 'unhealthy',
                latency
            };
        } catch (error) {
            return {
                status: 'unhealthy',
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }
}

const redisService = new RedisService();

const gracefulShutdown = async (signal: string) => {
    console.log(`${signal} received, shutting down Redis connection...`);
    try {
        await redisService.gracefulShutdown();
        process.exit(0);
    } catch (error) {
        console.error('Error during graceful shutdown:', error);
        process.exit(1);
    }
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

export default redisService;