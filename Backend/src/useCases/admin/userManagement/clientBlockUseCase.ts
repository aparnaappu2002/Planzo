import { IClientDatabaseRepository } from "../../../domain/interfaces/repositoryInterfaces/client/clientDatabaseRepository";
import { IClientBlockUseCase } from "../../../domain/interfaces/useCaseInterfaces/admin/userManagement/IClientBlockUseCase";


export class BlockClientUseCase implements IClientBlockUseCase{
    private clientDatabase :IClientDatabaseRepository
    constructor(clientDatabase:IClientDatabaseRepository){
        this.clientDatabase=clientDatabase
    }

    async blockClient(clientId: string): Promise<boolean> {
        const blockedClient = await this.clientDatabase.blockUser(clientId)
        if(!blockedClient) throw new Error("No client found in this ID")
        return true
    }
}