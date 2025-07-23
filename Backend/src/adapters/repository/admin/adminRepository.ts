import { clientEntity } from "../../../domain/entities/clientEntity";
import { IadminRepository } from "../../../domain/interfaces/repositoryInterfaces/admin/IadminRepositoryInterface";
import { ClientModel } from "../../../framework/database/models/clientModel";

export class AdminRepository implements IadminRepository{
    async findByEmail(email: string): Promise<clientEntity | null> {
        return await ClientModel.findOne({email})
    }
    async findById(id: string): Promise<clientEntity | null> {
        return await ClientModel.findById(id)
    }
    async findState(id: string): Promise<boolean | null> {
        const client= await ClientModel.findById(id).select('isAdmin')
        return client?.isAdmin ?? null
    }
}