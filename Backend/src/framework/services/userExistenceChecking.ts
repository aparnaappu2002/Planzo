import { IuserExistenceService } from "../../domain/interfaces/serviceInterface/IuserExistenceService";
import { IClientDatabaseRepository } from "../../domain/interfaces/repositoryInterfaces/client/clientDatabaseRepository";
import { IvendorDatabaseRepositoryInterface } from "../../domain/interfaces/repositoryInterfaces/vendor/vendorDatabaseRepository";
export class userExistence implements IuserExistenceService{
    private clientRepository:IClientDatabaseRepository
    private vendorRepository:IvendorDatabaseRepositoryInterface
    constructor(clientRepository:IClientDatabaseRepository,vendorRepository:IvendorDatabaseRepositoryInterface){
        this.clientRepository=clientRepository
        this.vendorRepository=vendorRepository
    }
    async emailExists(email: string): Promise<Boolean> {
        const [client,vendor]=await Promise.all([
            this.clientRepository.findByEmail(email),
            this.vendorRepository.findByEmaill(email)
        ])
        return Boolean(client || vendor)
    }
    
}