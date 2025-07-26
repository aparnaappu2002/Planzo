import { clientEntity } from "../../../entities/clientEntity";
export interface IClientDatabaseRepository{
    createClient(client:clientEntity):Promise<clientEntity | null>
    findByEmail(email:string):Promise<clientEntity | null>
    resetPassword(clientId: string, password: string): Promise<clientEntity | null>
    googleLogin(client: clientEntity): Promise<clientEntity | null>
}