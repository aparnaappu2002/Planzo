"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedisService = void 0;
const redis_1 = require("redis");
class RedisService {
    constructor() {
        this.connectionPromise = null;
        this.failureCount = 0;
        this.lastFailureTime = 0;
        this.maxFailures = 5;
        this.resetTimeout = 60000; // 1 minute
        this.keyPrefix = process.env.REDIS_KEY_PREFIX || 'app:';
        this.client = (0, redis_1.createClient)({
            url: process.env.REDIS_URL,
            socket: {
                reconnectStrategy: (retries) => {
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
    setupEventHandlers() {
        this.client.on('error', (err) => {
            console.error('Redis client error:', err);
            this.onFailure();
        });
        this.client.on('connect', () => __awaiter(this, void 0, void 0, function* () {
            console.log("Redis client connected");
            try {
                yield this.authenticate();
                this.onSuccess();
            }
            catch (err) {
                console.error('Authentication failed:', err);
                this.onFailure();
            }
        }));
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
    authenticate() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (process.env.REDIS_PASSWORD) {
                    yield this.client.sendCommand(['AUTH', process.env.REDIS_PASSWORD]);
                }
                const dbNumber = process.env.REDIS_DB || '0';
                if (dbNumber !== '0') {
                    yield this.client.sendCommand(['SELECT', dbNumber]);
                }
            }
            catch (err) {
                console.error('Redis authentication failed:', err);
                throw err;
            }
        });
    }
    checkCircuitBreaker() {
        if (this.failureCount >= this.maxFailures) {
            if (Date.now() - this.lastFailureTime < this.resetTimeout) {
                throw new Error('Circuit breaker is open - Redis service temporarily unavailable');
            }
            else {
                this.failureCount = 0;
            }
        }
    }
    onSuccess() {
        this.failureCount = 0;
    }
    onFailure() {
        this.failureCount++;
        this.lastFailureTime = Date.now();
    }
    validateKey(key) {
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
    prefixKey(key) {
        return this.keyPrefix + key;
    }
    connect() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.connectionPromise && !this.client.isOpen) {
                this.connectionPromise = this.client.connect();
            }
            if (this.connectionPromise) {
                yield this.connectionPromise;
            }
        });
    }
    disconnect() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.client.isOpen) {
                this.connectionPromise = null;
                yield this.client.quit();
            }
        });
    }
    gracefulShutdown() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.disconnect();
            }
            catch (error) {
                console.error('Error during graceful shutdown:', error);
            }
        });
    }
    get(key) {
        return __awaiter(this, void 0, void 0, function* () {
            this.validateKey(key);
            this.checkCircuitBreaker();
            if (!this.client.isOpen) {
                yield this.connect();
            }
            try {
                const result = yield this.client.get(this.prefixKey(key));
                this.onSuccess();
                return result;
            }
            catch (err) {
                console.error(`Error getting key ${key}:`, err);
                this.onFailure();
                throw err;
            }
        });
    }
    set(key, seconds, value) {
        return __awaiter(this, void 0, void 0, function* () {
            this.validateKey(key);
            this.checkCircuitBreaker();
            if (!key || typeof value !== 'string') {
                throw new Error('Invalid parameters for set operation');
            }
            if (seconds <= 0 || seconds > 86400) {
                throw new Error('Invalid expiration time: must be between 1 and 86400 seconds');
            }
            if (!this.client.isOpen) {
                yield this.connect();
            }
            try {
                yield this.client.set(this.prefixKey(key), value, {
                    EX: seconds
                });
                this.onSuccess();
            }
            catch (err) {
                console.error(`Error setting key ${key}:`, err);
                this.onFailure();
                throw err;
            }
        });
    }
    del(key) {
        return __awaiter(this, void 0, void 0, function* () {
            this.validateKey(key);
            this.checkCircuitBreaker();
            if (!this.client.isOpen) {
                yield this.connect();
            }
            try {
                yield this.client.del(this.prefixKey(key));
                this.onSuccess();
            }
            catch (err) {
                console.error(`Error deleting key ${key}:`, err);
                this.onFailure();
                throw err;
            }
        });
    }
    exists(key) {
        return __awaiter(this, void 0, void 0, function* () {
            this.validateKey(key);
            this.checkCircuitBreaker();
            if (!this.client.isOpen) {
                yield this.connect();
            }
            try {
                const result = yield this.client.exists(this.prefixKey(key));
                this.onSuccess();
                return result === 1;
            }
            catch (err) {
                console.error(`Error checking existence of key ${key}:`, err);
                this.onFailure();
                throw err;
            }
        });
    }
    setEx(key, seconds, value) {
        return __awaiter(this, void 0, void 0, function* () {
            this.validateKey(key);
            this.checkCircuitBreaker();
            if (!this.client.isOpen) {
                yield this.connect();
            }
            try {
                yield this.client.setEx(this.prefixKey(key), seconds, value);
                this.onSuccess();
            }
            catch (err) {
                console.error(`Error setting key with expiration ${key}:`, err);
                this.onFailure();
                throw err;
            }
        });
    }
    setNx(key, value) {
        return __awaiter(this, void 0, void 0, function* () {
            this.validateKey(key);
            this.checkCircuitBreaker();
            if (!this.client.isOpen) {
                yield this.connect();
            }
            try {
                const result = yield this.client.setNX(this.prefixKey(key), value);
                this.onSuccess();
                // Convert Redis number response (1 or 0) to boolean
                return result === 1;
            }
            catch (err) {
                console.error(`Error setting key if not exists ${key}:`, err);
                this.onFailure();
                throw err;
            }
        });
    }
    mget(keys) {
        return __awaiter(this, void 0, void 0, function* () {
            keys.forEach(key => this.validateKey(key));
            this.checkCircuitBreaker();
            if (!this.client.isOpen) {
                yield this.connect();
            }
            try {
                const prefixedKeys = keys.map(key => this.prefixKey(key));
                const result = yield this.client.mGet(prefixedKeys);
                this.onSuccess();
                return result;
            }
            catch (err) {
                console.error(`Error getting multiple keys:`, err);
                this.onFailure();
                throw err;
            }
        });
    }
    mset(keyValuePairs) {
        return __awaiter(this, void 0, void 0, function* () {
            Object.keys(keyValuePairs).forEach(key => this.validateKey(key));
            this.checkCircuitBreaker();
            if (!this.client.isOpen) {
                yield this.connect();
            }
            try {
                const prefixedPairs = {};
                Object.entries(keyValuePairs).forEach(([key, value]) => {
                    prefixedPairs[this.prefixKey(key)] = value;
                });
                yield this.client.mSet(prefixedPairs);
                this.onSuccess();
            }
            catch (err) {
                console.error(`Error setting multiple keys:`, err);
                this.onFailure();
                throw err;
            }
        });
    }
    ping() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!this.client.isOpen) {
                    yield this.connect();
                }
                yield this.client.ping();
                return true;
            }
            catch (err) {
                console.error('Redis ping failed:', err);
                return false;
            }
        });
    }
    ttl(key) {
        return __awaiter(this, void 0, void 0, function* () {
            this.validateKey(key);
            this.checkCircuitBreaker();
            if (!this.client.isOpen) {
                yield this.connect();
            }
            try {
                const result = yield this.client.ttl(this.prefixKey(key));
                this.onSuccess();
                return result;
            }
            catch (err) {
                console.error(`Error getting TTL for key ${key}:`, err);
                this.onFailure();
                throw err;
            }
        });
    }
    expire(key, seconds) {
        return __awaiter(this, void 0, void 0, function* () {
            this.validateKey(key);
            this.checkCircuitBreaker();
            if (!this.client.isOpen) {
                yield this.connect();
            }
            try {
                const result = yield this.client.expire(this.prefixKey(key), seconds);
                this.onSuccess();
                // Convert Redis number response (1 or 0) to boolean
                return result === 1;
            }
            catch (err) {
                console.error(`Error setting expiration for key ${key}:`, err);
                this.onFailure();
                throw err;
            }
        });
    }
    getInfo(section) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.client.isOpen) {
                yield this.connect();
            }
            try {
                let info;
                if (section) {
                    info = yield this.client.sendCommand(['INFO', section]);
                }
                else {
                    info = yield this.client.sendCommand(['INFO']);
                }
                return String(info);
            }
            catch (err) {
                console.error('Error getting Redis info:', err);
                throw err;
            }
        });
    }
    scanKeys(pattern_1) {
        return __awaiter(this, arguments, void 0, function* (pattern, count = 10) {
            if (!this.client.isOpen) {
                yield this.connect();
            }
            try {
                const keys = [];
                let cursor = '0';
                const prefixedPattern = this.prefixKey(pattern);
                do {
                    const result = yield this.client.sendCommand([
                        'SCAN', cursor, 'MATCH', prefixedPattern, 'COUNT', count.toString()
                    ]);
                    if (Array.isArray(result) && result.length === 2) {
                        cursor = String(result[0]);
                        const foundKeys = result[1];
                        if (Array.isArray(foundKeys)) {
                            keys.push(...foundKeys.map(k => String(k)));
                        }
                    }
                    else {
                        break;
                    }
                    if (keys.length > 10000)
                        break;
                } while (cursor !== '0');
                return keys.map(key => key.substring(this.keyPrefix.length));
            }
            catch (err) {
                console.error('Error scanning keys:', err);
                throw err;
            }
        });
    }
    hset(key, field, value) {
        return __awaiter(this, void 0, void 0, function* () {
            this.validateKey(key);
            this.checkCircuitBreaker();
            if (!this.client.isOpen) {
                yield this.connect();
            }
            try {
                const result = yield this.client.hSet(this.prefixKey(key), field, value);
                this.onSuccess();
                return result;
            }
            catch (err) {
                console.error(`Error setting hash field ${field} for key ${key}:`, err);
                this.onFailure();
                throw err;
            }
        });
    }
    hget(key, field) {
        return __awaiter(this, void 0, void 0, function* () {
            this.validateKey(key);
            this.checkCircuitBreaker();
            if (!this.client.isOpen) {
                yield this.connect();
            }
            try {
                const result = yield this.client.hGet(this.prefixKey(key), field);
                this.onSuccess();
                return result;
            }
            catch (err) {
                console.error(`Error getting hash field ${field} for key ${key}:`, err);
                this.onFailure();
                throw err;
            }
        });
    }
    getClient() {
        return this.client;
    }
    getConnectionStatus() {
        return {
            isOpen: this.client.isOpen,
            failureCount: this.failureCount,
            isCircuitOpen: this.failureCount >= this.maxFailures &&
                (Date.now() - this.lastFailureTime) < this.resetTimeout,
            isReady: this.client.isReady
        };
    }
    healthCheck() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const start = Date.now();
                const pingResult = yield this.ping();
                const latency = Date.now() - start;
                return {
                    status: pingResult ? 'healthy' : 'unhealthy',
                    latency
                };
            }
            catch (error) {
                return {
                    status: 'unhealthy',
                    error: error instanceof Error ? error.message : 'Unknown error'
                };
            }
        });
    }
}
exports.RedisService = RedisService;
const redisService = new RedisService();
const gracefulShutdown = (signal) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(`${signal} received, shutting down Redis connection...`);
    try {
        yield redisService.gracefulShutdown();
        process.exit(0);
    }
    catch (error) {
        console.error('Error during graceful shutdown:', error);
        process.exit(1);
    }
});
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
exports.default = redisService;
