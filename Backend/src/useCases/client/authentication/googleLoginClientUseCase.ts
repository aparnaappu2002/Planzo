import { clientEntity } from "../../../domain/entities/clientEntity";
import { IClientDatabaseRepository } from "../../../domain/interfaces/repositoryInterfaces/client/clientDatabaseRepository";
import { IgoogleLoginClientUseCase } from "../../../domain/interfaces/useCaseInterfaces/client/authentication/IgoogleLoginClientUseCase";


export class GoogleLoginClientUseCase implements IgoogleLoginClientUseCase{
    private clientDatabase:IClientDatabaseRepository
    constructor(clientDatabase:IClientDatabaseRepository){
        this.clientDatabase=clientDatabase
    }

    async googleLogin(client: clientEntity): Promise<clientEntity | null> {
        const existingUser = await this.clientDatabase.findByEmail(client.email)
        if(existingUser){
            if(existingUser.status!='active') throw new Error('User blocked by admiin')
                return existingUser
        }else{
            return await this.clientDatabase.googleLogin(client)
        }
    }
}