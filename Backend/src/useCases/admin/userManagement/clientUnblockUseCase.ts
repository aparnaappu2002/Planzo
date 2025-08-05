import { IClientDatabaseRepository } from "../../../domain/interfaces/repositoryInterfaces/client/clientDatabaseRepository";
import { IClientUnblockUseCase } from "../../../domain/interfaces/useCaseInterfaces/admin/userManagement/IClientUnblockUseCase";

export class ClientUnblockUseCase implements IClientUnblockUseCase{
    private clientDatabase:IClientDatabaseRepository

    constructor(clientDatabase:IClientDatabaseRepository){
        this.clientDatabase=clientDatabase
    }

    async unblockClient(clientId: string): Promise<boolean> {
        const unblockedClient= await this.clientDatabase.unBlockUser(clientId)
        if(!unblockedClient) throw new Error("There is not client in this ID")
        return true
    }
}