import { JwtPayload } from "jsonwebtoken";
import { IjwtInterface } from "../../domain/interfaces/serviceInterface/IjwtService";
import { IredisService } from "../../domain/interfaces/serviceInterface/IredisService";
import { ITokenService } from "../../domain/interfaces/serviceInterface/ITokenService";

export class TokenService implements ITokenService{
    private redisService:IredisService
    private jwtService:IjwtInterface
    private accessSecretKey:string
    constructor(redisService:IredisService,jwtService:IjwtInterface,accessSecretKey:string){
        this.redisService=redisService
        this.jwtService=jwtService
        this.accessSecretKey=accessSecretKey
    }
    
    verifyToken(token: string): { userId: string; role: string } | null {
        return this.jwtService.verifyAccessToken(token,this.accessSecretKey)
    }
    async checkTokenBlacklist(token: string): Promise<boolean> {
        const result = await this.redisService.get(`blacklist:${token}`)
        return !!result
    }
}