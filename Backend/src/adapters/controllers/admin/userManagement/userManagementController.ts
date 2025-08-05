import { Request,Response } from "express";
import { IClientBlockUseCase } from "../../../../domain/interfaces/useCaseInterfaces/admin/userManagement/IClientBlockUseCase";
import { HttpStatus } from "../../../../domain/entities/httpStatus";
import { IredisService } from "../../../../domain/interfaces/serviceInterface/IredisService";
import { IClientUnblockUseCase } from "../../../../domain/interfaces/useCaseInterfaces/admin/userManagement/IClientUnblockUseCase";
import { IfindAllClientUseCase } from "../../../../domain/interfaces/useCaseInterfaces/admin/userManagement/IfindAllClientUseCase";
import { ISearchClientsUseCase } from "../../../../domain/interfaces/useCaseInterfaces/admin/userManagement/ISearchClientUseCase";

export class UserManagementController{
    private clientBlockUseCase : IClientBlockUseCase
    private clientUnblockUseCase : IClientUnblockUseCase
    private findAllClientUseCase:IfindAllClientUseCase
    private searchClientUseCase:ISearchClientsUseCase
    private redisService:IredisService
    constructor(clientBlockUseCase:IClientBlockUseCase,clientUnblockUseCase:IClientUnblockUseCase,
        findAllClientUseCase:IfindAllClientUseCase,redisService:IredisService,searchClientUseCase:ISearchClientsUseCase){
        this.clientBlockUseCase=clientBlockUseCase
        this.clientUnblockUseCase=clientUnblockUseCase
        this.findAllClientUseCase=findAllClientUseCase
        this.redisService=redisService
        this.searchClientUseCase=searchClientUseCase
    }

    async handleClientBlock(req:Request,res:Response):Promise<void>{
        try{
            const {clientId}=req.body
            await this.clientBlockUseCase.blockClient(clientId)
            const changeStatus = await this.redisService.set(`user:client:${clientId}`,15*60,JSON.stringify('block'))
            res.status(HttpStatus.OK).json({message:'Client Blocked'})
        }catch(error){
            console.log("Error while blocking user",error)
            res.status(HttpStatus.BAD_REQUEST).json({
                message:'Error while blocking user',
                error:error instanceof Error ? error.message : "Error while blocking user"
            })
        }
    }
    async handleClientUnblock(req:Request,res:Response):Promise<void>{
        try{
            const {clientId}=req.body
            await this.clientUnblockUseCase.unblockClient(clientId)
            const changeStatus=await this.redisService.set(`user:client:${clientId}`,15*60,JSON.stringify('active'))
            res.status(HttpStatus.OK).json({message:"Client Unblocked"})
        }catch(error){
            console.log('Error while unblocking client',error)
            res.status(HttpStatus.BAD_REQUEST).json({
                message:"Error while unblocking client",
                error: error instanceof Error ? error.message : 'Error while unblocking client'
            })
        }
    }
    async findAllClient(req:Request,res:Response):Promise<void>{
        try{
            const pageNo=parseInt(req.query.pageNo as string,10) || 1
            const {clients,totalPages}=await this.findAllClientUseCase.findAllClient(pageNo)
            if(!clients){
                res.status(HttpStatus.BAD_REQUEST).json({
                    message:"Error whhile fetching the users"
                })
            }
            res.status(HttpStatus.OK).json({message:"clients fetched successfully",clients,totalPages})
        }catch(error){
            console.log("Error while fetching all clients",error)
            res.status(HttpStatus.BAD_REQUEST).json({
                message:"Error while fetching all clients",
                error: error instanceof Error ? error.message : "Error while fetching all clients"
            })
        }
    }
    async searchClient(req: Request, res: Response): Promise<void> {
    try {
        const search = req.query.search as string;

        if (!search) {
            res.status(HttpStatus.BAD_REQUEST).json({
                message: "Search query is required"
            });
            return;
        }

        const clients = await this.searchClientUseCase.searchClients(search);

        res.status(HttpStatus.OK).json({
            message: "Clients fetched successfully",
            clients
        });
    } catch (error) {
        console.log("Error while searching clients", error);
        res.status(HttpStatus.BAD_REQUEST).json({
            message: "Error while searching clients",
            error: error instanceof Error ? error.message : "Unknown error"
        });
    }
}

}