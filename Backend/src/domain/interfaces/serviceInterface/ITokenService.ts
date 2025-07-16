import { JwtPayload } from "jsonwebtoken";

export interface ITokenService{
   
    verifyToken(token:string):Promise<string | JwtPayload>
}