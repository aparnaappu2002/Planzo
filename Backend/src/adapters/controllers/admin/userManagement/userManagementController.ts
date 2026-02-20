import { Request,Response } from "express";
import { IClientBlockUseCase } from "../../../../domain/interfaces/useCaseInterfaces/admin/userManagement/IClientBlockUseCase";
import { HttpStatus } from "../../../../domain/enums/httpStatus";
import { IredisService } from "../../../../domain/interfaces/serviceInterface/IredisService";
import { IClientUnblockUseCase } from "../../../../domain/interfaces/useCaseInterfaces/admin/userManagement/IClientUnblockUseCase";
import { IfindAllClientUseCase } from "../../../../domain/interfaces/useCaseInterfaces/admin/userManagement/IfindAllClientUseCase";
import { ISearchClientsUseCase } from "../../../../domain/interfaces/useCaseInterfaces/admin/userManagement/ISearchClientUseCase";
import { Messages } from "../../../../domain/enums/messages";
import { handleErrorResponse,logError } from "../../../../framework/services/errorHandler";

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
            if (!clientId) {
                res.status(HttpStatus.BAD_REQUEST).json({
                    message: 'Client ID is required'
                });
                return;
            }
            await this.clientBlockUseCase.blockClient(clientId)
            await this.redisService.set(`user:client:${clientId}`,15*60,JSON.stringify('block'))
            res.status(HttpStatus.OK).json({message:Messages.CLIENT_BLOCKED})
        }catch(error){
            logError("Error while blocking user", error);
            handleErrorResponse(req, res, error, Messages.CLIENT_BLOCK_ERROR);
        }
    }
    async handleClientUnblock(req:Request,res:Response):Promise<void>{
        try{
            const {clientId}=req.body
            if (!clientId) {
                res.status(HttpStatus.BAD_REQUEST).json({
                    message: 'Client ID is required'
                });
                return;
            }
            await this.clientUnblockUseCase.unblockClient(clientId)
            await this.redisService.set(`user:client:${clientId}`,15*60,JSON.stringify('active'))
            res.status(HttpStatus.OK).json({message:Messages.CLIENT_UNBLOCKED})
        }catch(error){
            logError('Error while unblocking client', error);
            handleErrorResponse(req, res, error, Messages.CLIENT_UNBLOCK_ERROR);
        }
    }
    async findAllClient(req:Request,res:Response):Promise<void>{
        try{
            const pageNo=parseInt(req.query.pageNo as string,10) || 1
            const {clients,totalPages}=await this.findAllClientUseCase.findAllClient(pageNo)
            if(!clients){
                res.status(HttpStatus.BAD_REQUEST).json({
                    message:Messages.CLIENT_FETCH_ERROR
                })
            }
            res.status(HttpStatus.OK).json({message:Messages.CLIENT_FETCHED,clients,totalPages})
        }catch(error){
            logError("Error while fetching all clients", error);
            handleErrorResponse(req, res, error, Messages.CLIENT_FETCH_ERROR);
        }
    }
    async searchClient(req: Request, res: Response): Promise<void> {
    try {
        const search = req.query.search as string;

        if (!search) {
            res.status(HttpStatus.BAD_REQUEST).json({
                message: Messages.SEARCH_QUERY_REQUIRED
            });
            return;
        }

        const clients = await this.searchClientUseCase.searchClients(search);

        res.status(HttpStatus.OK).json({
            message: Messages.CLIENT_FETCHED,
            clients
        });
    } catch (error) {
        logError("Error while searching clients", error);
        handleErrorResponse(req, res, error, Messages.CLIENT_SEARCH_ERROR);
    }
}

}