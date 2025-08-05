import { clientEntity } from "../../../../entities/clientEntity";

export interface IchangePasswordClientUseCase {
    changePasswordClient(clientId: string, Oldpassword: string, newPassword: string): Promise<clientEntity | null>
}