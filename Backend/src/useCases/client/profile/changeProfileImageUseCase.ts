import { clientEntity } from "../../../domain/entities/clientEntity";
import { IClientDatabaseRepository } from "../../../domain/interfaces/repositoryInterfaces/client/clientDatabaseRepository";
import { IchangeProfileImageClientUseCase } from "../../../domain/interfaces/useCaseInterfaces/client/profile/IchangeProfileImage";

export class ChangeProfileImageClientUseCase implements IchangeProfileImageClientUseCase {
    private clientDatabase: IClientDatabaseRepository
    constructor(clientDatabase: IClientDatabaseRepository) {
        this.clientDatabase = clientDatabase
    }
    async changeProfileImage(cliendId: string, profileImage: string): Promise<clientEntity | null> {
        if (!cliendId || cliendId.trim().length === 0) {
            throw new Error('Client ID is required');
        }
        if (!profileImage || profileImage.trim().length === 0) {
            throw new Error('Profile image URL is required');
        }

        
        const user = await this.clientDatabase.findById(cliendId)
        if (!user) throw new Error('No user found in this ID')
        const updatedProfile = await this.clientDatabase.changeProfileImage(cliendId, profileImage)
        return updatedProfile
    }
}