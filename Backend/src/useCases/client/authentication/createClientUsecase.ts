import { hashPassword } from "../../../framework/hashpassword/hashPassword";
import { clientEntity } from "../../../domain/entities/clientEntity";
import { generateRandomUuid } from "../../../framework/services/randomUuid";
import { IClientDatabaseRepository } from "../../../domain/interfaces/repositoryInterfaces/client/clientDatabaseRepository";
import { IclientUsecase } from "../../../domain/interfaces/useCaseInterfaces/client/authentication/clientUseCaseInterface";

export class CreateClientUseCase implements IclientUsecase{
    private clientRepository:IClientDatabaseRepository
    private hashpassword:hashPassword
    constructor(clientRepository:IClientDatabaseRepository)
    {
        this.clientRepository=clientRepository
        this.hashpassword=new hashPassword()
    }
    async createClient(client: clientEntity): Promise<clientEntity | null> {
        const oldClient = await this.clientRepository.findByEmail(client.email)
        if(oldClient){
            throw new Error("user already exist")
        }
        const {password,email,phone,name,googleVerified}=client as clientEntity

        let hashedPassword=null
        if(password){
            hashedPassword=await this.hashpassword.hashPassword(password)
            console.log(hashedPassword)
        }
        const clientId=generateRandomUuid()
        const newClient = await this.clientRepository.createClient({
            name,
            phone,
            email,
            password : hashedPassword ?? "",
            clientId,
            role:"client",
            isAdmin:false,
            googleVerified
        })
        return newClient
    }
}