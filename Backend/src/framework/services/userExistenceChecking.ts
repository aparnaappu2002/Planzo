import { IuserExistenceService } from "../../domain/interfaces/serviceInterface/IuserExistenceService";
import { IClientDatabaseRepository } from "../../domain/interfaces/repositoryInterfaces/client/clientDatabaseRepository";
export class userExistence implements IuserExistenceService{
    private clientRepository:IClientDatabaseRepository
    constructor(clientRepository:IClientDatabaseRepository){
        this.clientRepository=clientRepository
    }
    async emailExists(email: string): Promise<Boolean> {
        const [client]=await Promise.all([
            this.clientRepository.findByEmail(email)
        ])
        return Boolean(client)
    }
    
}