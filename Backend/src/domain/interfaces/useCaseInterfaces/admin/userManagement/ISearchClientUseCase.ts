import { FindClientDTO } from "../../../../dto/findClientDTO";

export interface ISearchClientsUseCase {
    searchClients(search: string): Promise<FindClientDTO[]>;
}
