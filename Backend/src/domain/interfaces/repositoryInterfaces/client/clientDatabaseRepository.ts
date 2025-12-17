import { clientEntity } from "../../../entities/clientEntity";
import { ClientUpdateProfileEntity } from "../../../dto/profile/clientUpdateProfileDTO";
export interface IClientDatabaseRepository{
    createClient(client:clientEntity):Promise<clientEntity | null>
    findByEmail(email:string):Promise<clientEntity | null>
    resetPassword(clientId: string, password: string): Promise<clientEntity | null>
    googleLogin(client: clientEntity): Promise<clientEntity | null>
    blockUser(clientId:string):Promise<string | null>
    unBlockUser(clientId:string):Promise<string | null>
    findAllClients(pageNo:number):Promise<{clients:clientEntity[];totalPages:number}>
    findById(id: string): Promise<clientEntity | null>
    changeProfileImage(clientId: string, profileImage: string): Promise<clientEntity | null>
    showProfileDetails(cliendId: string): Promise<clientEntity | null>
    updateProfile(client: ClientUpdateProfileEntity): Promise<clientEntity | null>
    findPassword(clientId: string): Promise<string | null>
    changePassword(clientId: string, password: string): Promise<clientEntity | null>
    findStatusForMiddleware(clientId: string): Promise<string>
    searchClients(search: string): Promise<clientEntity[]>;
    totalClient(): Promise<number>
    
}