export interface IClientUnblockUseCase{
    unblockClient(clientId:string):Promise<boolean>
}