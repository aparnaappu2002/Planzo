import { clientEntity } from "../../../domain/entities/clientEntity";
import { IClientDatabaseRepository } from "../../../domain/interfaces/repositoryInterfaces/client/clientDatabaseRepository";
import { ClientModel } from "../../../framework/database/models/clientModel";
import { ClientUpdateProfileEntity } from "../../../domain/entities/clientUpdateProfileEntitiy";

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
    async googleLogin(client: clientEntity): Promise<clientEntity | null> {
        return await ClientModel.create(client)
    }
    async blockUser(clientId: string): Promise<string | null> {
        const blockedUser= await ClientModel.findByIdAndUpdate(clientId,{status:'block'},{new:true}).select('status')
        return blockedUser?.status || null
    }
    async unBlockUser(clientId: string): Promise<string | null> {
        const unBlockedUser= await ClientModel.findByIdAndUpdate(clientId,{status:'active'},{new:true}).select('status')
        return unBlockedUser?.status || null
    }
    async findAllClients(pageNo: number): Promise<{ clients: clientEntity[]; totalPages: number; }> {
        const limit = 5
        const page = Math.max(pageNo,1)
        const skip=(page-1)*limit
        const clients = await ClientModel.find({isAdmin:false}).select('-password').skip(skip).limit(limit)
        const totalPages = Math.ceil(await ClientModel.countDocuments() / limit)
        return {clients,totalPages}
    }
    async findById(id: string): Promise<clientEntity | null> {
        return await ClientModel.findById(id)
    }
    async changeProfileImage(clientId: string, profileImage: string): Promise<clientEntity | null> {
        return await ClientModel.findByIdAndUpdate(clientId, { profileImage })
    }
    async showProfileDetails(cliendId: string): Promise<clientEntity | null> {
        return await ClientModel.findOne({ status: 'active', _id: cliendId }).select('name email phone profileImage').lean() as clientEntity | null;
    }
    async updateProfile(client: ClientUpdateProfileEntity): Promise<clientEntity | null> {
        return await ClientModel.findByIdAndUpdate(client._id, { name: client.name, phone: client.phone, profileImage: client.profileImage }, { new: true }).select('_id clientId email name phone profileImage role stat').lean() as clientEntity | null;
    }
    async findPassword(clientId: string): Promise<string | null> {
        const client = await ClientModel.findById(clientId).select('password')
        return client?.password || null
    }
    async changePassword(clientId: string, password: string): Promise<clientEntity | null> {
        return await ClientModel.findByIdAndUpdate(clientId, { password }, { new: true })
    }
    async findStatusForMiddleware(clientId: string): Promise<string> {
        const client = await ClientModel.findById(clientId).select('status')
        if (!client) throw new Error('No clint found in this ID')
        return client.status!
    }
    async searchClients(search: string): Promise<clientEntity[]> {
    const query: any = { isAdmin: false };
    
    if (search) {
        const orConditions: any[] = [
            { name: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } }
        ];
        
        const phoneNumber = parseInt(search, 10);
        if (!isNaN(phoneNumber)) {
            orConditions.push({ phone: phoneNumber });
        }
        
        orConditions.push({
            $expr: {
                $regexMatch: {
                    input: { $toString: "$phone" },
                    regex: search,
                    options: "i"
                }
            }
        });
        
        query.$or = orConditions;
    }
    
    const clients = await ClientModel.find(query)
        .select('-password');
    
    return clients;
}

async totalClient(): Promise<number> {
        return ClientModel.countDocuments()
    }
}