import { clientEntity } from "../../../domain/entities/clientEntity";
import { IClientDatabaseRepository } from "../../../domain/interfaces/repositoryInterfaces/client/clientDatabaseRepository";
import { ClientModel } from "../../../framework/database/models/clientModel";

export class clientRepository implements IClientDatabaseRepository{
    async createClient(client: clientEntity): Promise<clientEntity | null> {
        return await ClientModel.create(client)
    }
    async findByEmail(email: string): Promise<clientEntity | null> {
        return await ClientModel.findOne({email:email})
    }
    async resetPassword(clientId: string, password: string): Promise<clientEntity | null> {
        return await ClientModel.findOneAndUpdate({ clientId }, { password }, { new: true })
    }
}