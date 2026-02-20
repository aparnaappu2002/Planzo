import { FindVendorDTO } from "../../../domain/dto/vendor/findVendorDTO";
import { IvendorDatabaseRepositoryInterface } from "../../../domain/interfaces/repositoryInterfaces/vendor/vendorDatabaseRepository";
import { IfindVendorForClientUseCase } from "../../../domain/interfaces/useCaseInterfaces/client/vendor/IfindVendorForClientUseCase";
import { mapVendorEntityToDTO } from "../../mappers/vendorMapper";

export class FindVendorForClientUseCase implements IfindVendorForClientUseCase {
    private vendorDatabase: IvendorDatabaseRepositoryInterface
    constructor(vendorDatabase: IvendorDatabaseRepositoryInterface) {
        this.vendorDatabase = vendorDatabase
    }
    async findVendorForClientUseCase(): Promise<FindVendorDTO[]> {
        const vendors=await this.vendorDatabase.findVendorsForCarousal()
        return vendors.map(mapVendorEntityToDTO);

    }
}