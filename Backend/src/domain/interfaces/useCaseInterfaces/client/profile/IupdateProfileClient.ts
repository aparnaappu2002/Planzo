import { ClientUpdateProfileEntity } from "../../../../entities/profile/clientUpdateProfileDTO";
import { clientEntity } from "../../../../entities/clientEntity";

export interface IupdateProfileDataUseCase {
    updateClientProfile(client: ClientUpdateProfileEntity): Promise<clientEntity | null>
}