import { ClientUpdateProfileEntity } from "../../../../dto/profile/clientUpdateProfileDTO";
import { clientEntity } from "../../../../entities/clientEntity";

export interface IupdateProfileDataUseCase {
    updateClientProfile(client: ClientUpdateProfileEntity): Promise<clientEntity | null>
}