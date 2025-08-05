import { clientEntity } from "../../../domain/entities/clientEntity";
import { IClientDatabaseRepository } from "../../../domain/interfaces/repositoryInterfaces/client/clientDatabaseRepository";
import { IshowProfileClientUseCase } from "../../../domain/interfaces/useCaseInterfaces/client/profile/IshowProfileClient";

export class ShowProfileDetailsInClientUseCase implements IshowProfileClientUseCase {
    private clientDatabase: IClientDatabaseRepository
    constructor(clientDatabase: IClientDatabaseRepository) {
        this.clientDatabase = clientDatabase
    }
    async showProfile(clientId: string): Promise<clientEntity | null> {
        return await this.clientDatabase.showProfileDetails(clientId)
    }
}