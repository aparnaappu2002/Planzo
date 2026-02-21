import { ISearchClientsUseCase } from "../../../domain/interfaces/useCaseInterfaces/admin/userManagement/ISearchClientUseCase";
import { IClientDatabaseRepository } from "../../../domain/interfaces/repositoryInterfaces/client/clientDatabaseRepository";
import { FindClientDTO } from "../../../domain/dto/findClientDTO";
import { mapClientEntityToDTO } from "../../mappers/clientMapper";

export class SearchClientsUseCase implements ISearchClientsUseCase {
    private clientRepository: IClientDatabaseRepository;

    constructor(clientRepository: IClientDatabaseRepository) {
        this.clientRepository = clientRepository;
    }

    async searchClients(search: string): Promise<FindClientDTO[]> {
        if (!search || search.trim().length === 0) {
            throw new Error('Search query is required');
        }
        if (!search) throw new Error("Search query is required");
        const clients= await this.clientRepository.searchClients(search);
        return clients.map(mapClientEntityToDTO);

    }
}
