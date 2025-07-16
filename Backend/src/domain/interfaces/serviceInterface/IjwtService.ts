import { decodedTokenEntity } from "../../entities/decodedTokenEntity";
export interface IjwtInterface{
    createAccesstoken(accessSecretKey:string,userId:string,role:string):string
    createRefreshToken(refreshSecretKey:string,userId:string):string
    verifyAccessToken(accessToken:string,accessSecretKey:string):any
    verifyRefreshToken(refreshToken:string,refreshSecretKey:string):{userId:string} | null
    generateResetToken(resetSecretKey: string, userId: string, email: string): string 
    verifyPasswordResetToken(resetToken: string, resetSecretKey: string): { userId: string; email: string; purpose: string } | null
       
    tokenDecode(accessToken:string):decodedTokenEntity | null
}