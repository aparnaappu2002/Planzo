import { Request,Response } from "express";
import { IgoogleLoginClientUseCase } from "../../../../domain/interfaces/useCaseInterfaces/client/authentication/IgoogleLoginClientUseCase";
import { HttpStatus } from "../../../../domain/entities/httpStatus";
import { IjwtInterface } from "../../../../domain/interfaces/serviceInterface/IjwtService";
import { setCookie } from "../../../../framework/services/tokenCookieSetting";
import { IredisService } from "../../../../domain/interfaces/serviceInterface/IredisService";

export class GoogleLoginClient{
    private googleLoginClientUseCase : IgoogleLoginClientUseCase
    private jwtService:IjwtInterface
    private redisService:IredisService
    constructor(googleLoginClientUseCase:IgoogleLoginClientUseCase,jwtService:IjwtInterface,redisService:IredisService){
        this.googleLoginClientUseCase=googleLoginClientUseCase
        this.jwtService=jwtService
        this.redisService=redisService
    }
    async handleGoogleLogin(req:Request,res:Response):Promise<void>{
        try{
            const {client}=req.body
            const createdClient = await this.googleLoginClientUseCase.googleLogin(client)
            console.log(createdClient)
            const ACCESSTOKEN_SECRET_KEY = process.env.ACCESSTOKEN_SECRET_KEY as string
            const REFRESHTOKEN_SECRET_KEY = process.env.REFRESHTOKEN_SECRET_KEY as string
            const accessToken = await this.jwtService.createAccesstoken(ACCESSTOKEN_SECRET_KEY,createdClient?._id?.toString() || '',createdClient?.role!)
            const refreshToken = await this.jwtService.createRefreshToken(REFRESHTOKEN_SECRET_KEY,createdClient?._id?.toString() || '')
            await this.redisService.set(`user:${createdClient?.role}:${createdClient?._id}`, 15* 60, createdClient?.role!)
            setCookie(res,refreshToken)
            const selectedFields={
                clientId:createdClient?.clientId,
                email:createdClient?.email,
                name:createdClient?.phone,
                profileImage:createdClient?.profileImage,
                _id:createdClient?._id,
                role:createdClient?.role,
                status:createdClient?.status
            }
            res.status(HttpStatus.OK).json({
                messag:'Google login successfull',
                client,selectedFields,accessToken
            })
        }catch(error){
            console.log('Error while google login',error)
            res.status(HttpStatus.BAD_REQUEST).json({
                message:'Error while google login',
                error : error instanceof Error? error.message : 'error while google login'
            })
        }
    }
}