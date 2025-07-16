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
    
    verifyToken(token: string): Promise<string | JwtPayload> {
        return this.jwtService.verifyAccessToken(token,this.accessSecretKey)
    }
}