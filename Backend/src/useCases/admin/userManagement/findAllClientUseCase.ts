import { FindClientDTO } from "../../../domain/dto/findClientDTO";
import { IClientDatabaseRepository } from "../../../domain/interfaces/repositoryInterfaces/client/clientDatabaseRepository";
import { IfindAllClientUseCase } from "../../../domain/interfaces/useCaseInterfaces/admin/userManagement/IfindAllClientUseCase";
import { mapClientEntityToDTO } from "../../mappers/clientMapper";

export class FindAllClientUseCase implements IfindAllClientUseCase{
    private clientDatabase:IClientDatabaseRepository
    constructor(clientDatabase:IClientDatabaseRepository){
        this.clientDatabase=clientDatabase
    }
    async findAllClient(pageNo: number): Promise<{ clients: FindClientDTO[]; totalPages: number; }> {
        const {clients,totalPages}=await this.clientDatabase.findAllClients(pageNo)
        return {
            clients: clients.map(mapClientEntityToDTO),
            totalPages
        };

    }
}