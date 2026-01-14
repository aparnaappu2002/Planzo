import { ClientUpdateProfileDTO } from "../../../../dto/profile/clientUpdateProfileDTO";
import { clientEntity } from "../../../../entities/clientEntity";

export interface IupdateProfileDataUseCase {
    updateClientProfile(client: ClientUpdateProfileDTO): Promise<clientEntity | null>
}