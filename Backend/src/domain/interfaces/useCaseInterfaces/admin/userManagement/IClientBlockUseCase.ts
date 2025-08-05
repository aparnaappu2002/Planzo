export interface IClientBlockUseCase{
    blockClient(clientId:string):Promise<boolean>
}