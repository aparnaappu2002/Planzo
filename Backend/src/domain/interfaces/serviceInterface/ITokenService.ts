import { JwtPayload } from "jsonwebtoken";

export interface ITokenService{
   checkTokenBlacklist(token: string): Promise<boolean>
    verifyToken(token:string):{ userId: string; role: string } | null

}