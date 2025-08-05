import { Request,Response } from "express";
import { IloginClientControllerInterface } from "../../../../domain/interfaces/controllerInterfaces/IloginClientControllerInterface";
import { IClientLoginUseCase } from "../../../../domain/interfaces/useCaseInterfaces/client/authentication/IclientLoginUseCase";
import { IjwtInterface } from "../../../../domain/interfaces/serviceInterface/IjwtService";
import { setCookie } from "../../../../framework/services/tokenCookieSetting";
import { IredisService } from "../../../../domain/interfaces/serviceInterface/IredisService";
import { HttpStatus } from "../../../../domain/entities/httpStatus";
import { IgoogleLoginClientUseCase } from "../../../../domain/interfaces/useCaseInterfaces/client/authentication/IgoogleLoginClientUseCase";

export class ClientLoginController implements IloginClientControllerInterface{
    private jwtService : IjwtInterface
    private clientLoginUseCase : IClientLoginUseCase
    private redisService: IredisService
    private googleLoginClientUseCase: IgoogleLoginClientUseCase
    constructor(clientLoginUseCase:IClientLoginUseCase,jwtService:IjwtInterface,redisService:IredisService,googleLoginClientUseCase: IgoogleLoginClientUseCase){
        this.clientLoginUseCase=clientLoginUseCase
        this.jwtService=jwtService,
        this.redisService=redisService
        this.googleLoginClientUseCase=googleLoginClientUseCase
    }
    async handleLogin(req: Request, res: Response): Promise<void> {
        try{
            const {email,password}=req.body
            console.log('this is the email and the password',email,password)
            const client = await this.clientLoginUseCase.loginClient(email,password)
            if(!client){
                res.status(HttpStatus.BAD_REQUEST).json({message:'invalid credentials'})
                return
            }
            const ACCESSTOKEN_SECRET_KEY=process.env.ACCESSTOKEN_SECRET_KEY as string
            const REFRESHTOKEN_SECRET_KEY= process.env.REFRESHTOKEN_SECRET_KEY as string
            const accessToken = this.jwtService.createAccesstoken(ACCESSTOKEN_SECRET_KEY,client._id?.toString() || "",client.role)
            const refreshToken = this.jwtService.createRefreshToken(REFRESHTOKEN_SECRET_KEY,client._id?.toString() || "")
            await this.redisService.set(`user:${client.role}:${client._id}`,15*60,JSON.stringify(client.status))
            setCookie(res,refreshToken)
            const selectedFields = {
                clientId:client.clientId,
                email:client.email,
                name:client.name,
                phone:client.phone,
                profileImage:client.profileImage,
                _id:client._id,
                role:client.role,
                status:client.status
            }
            res.status(HttpStatus.OK).json({message:"user logged",client:selectedFields,accessToken})
        }catch(error){
            console.log('error while login client',error)
            res.status(HttpStatus.BAD_REQUEST).json({
                message:"error while login client",
                error:error instanceof Error ? error.message : 'unknown error from login client controller'
            })
        }
    }
    async handleGoogleLogin(req: Request, res: Response): Promise<void> {
        try {
            console.log('ajhsdfjhasf')
            const { client } = req.body
            const createdClient = await this.googleLoginClientUseCase.googleLogin(client)
            console.log(createdClient)
            const ACCESSTOKEN_SECRET_KEY = process.env.ACCESSTOKEN_SECRET_KEY as string
            const REFRESHTOKEN_SECRET_KEY = process.env.REFRESHTOKEN_SECRET_KEY as string
            const accessToken = await this.jwtService.createAccesstoken(ACCESSTOKEN_SECRET_KEY, createdClient?._id?.toString() || '', createdClient?.role!)
            const refreshToken = await this.jwtService.createRefreshToken(REFRESHTOKEN_SECRET_KEY, createdClient?._id?.toString() || '')
            await this.redisService.set(`user:${createdClient?.role}:${createdClient?._id}`, 15 * 60, createdClient?.role!)
            setCookie(res, refreshToken)
            const selectedFields = {
                clientId: createdClient?.clientId,
                email: createdClient?.email,
                name: createdClient?.name,
                phone: createdClient?.phone,
                profileImage: createdClient?.profileImage,
                _id: createdClient?._id,
                role: createdClient?.role,
                status: createdClient?.status,
                googleVerified:createdClient?.googleVerified
            }
            res.status(HttpStatus.OK).json({ message: 'Google login successFull', client: selectedFields, accessToken })
        } catch (error) {
            console.log('error while google login', error)
            res.status(HttpStatus.BAD_REQUEST).json({
                message: 'error while google login',
                error: error instanceof Error ? error.message : 'error while Google login'
            })
        }

    }
}