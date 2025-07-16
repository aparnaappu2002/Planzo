import { clientEntity } from "../../../domain/entities/clientEntity";
import { IClientDatabaseRepository } from "../../../domain/interfaces/repositoryInterfaces/client/clientDatabaseRepository";
import { IClientLoginUseCase } from "../../../domain/interfaces/useCaseInterfaces/client/authentication/IclientLoginUseCase";
import { hashPassword } from "../../../framework/hashpassword/hashPassword";

export class LoginClientUseCase implements IClientLoginUseCase{
    private clientDatabase:IClientDatabaseRepository
    private hashpassword:hashPassword
    constructor(clientDatabase:IClientDatabaseRepository){
        this.clientDatabase=clientDatabase
        this.hashpassword=new hashPassword()
    }
    async loginClient(email: string, password: string): Promise<clientEntity | null> {
        const client = await this.clientDatabase.findByEmail(email)
        if(!client) throw new Error('No client exists with this email')
        if(client.status=="block") throw new Error("client is blocked by admin")
        const isPasswordValid=await this.hashpassword.comparePassword(password,client.password)
        if(!isPasswordValid) throw new Error ("Invalid password")
        return client
    }
}
