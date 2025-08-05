import { ISearchClientsUseCase } from "../../../domain/interfaces/useCaseInterfaces/admin/userManagement/ISearchClientUseCase";
import { IClientDatabaseRepository } from "../../../domain/interfaces/repositoryInterfaces/client/clientDatabaseRepository";
import { clientEntity } from "../../../domain/entities/clientEntity";

export class SearchClientsUseCase implements ISearchClientsUseCase {
    private clientRepository: IClientDatabaseRepository;

    constructor(clientRepository: IClientDatabaseRepository) {
        this.clientRepository = clientRepository;
    }

    async searchClients(search: string): Promise<clientEntity[]> {
        if (!search) throw new Error("Search query is required");
        return await this.clientRepository.searchClients(search);
    }
}
