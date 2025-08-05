import { clientEntity } from "../../../../entities/clientEntity";

export interface ISearchClientsUseCase {
    searchClients(search: string): Promise<clientEntity[]>;
}
