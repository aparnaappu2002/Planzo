import { JwtPayload } from "jsonwebtoken";

export interface ITokenService{
   checkTokenBlacklist(token: string): Promise<boolean>
    verifyToken(token:string):Promise<string | JwtPayload>
}