import { VendorEntity } from "../../../domain/entities/vendorEntitty";
import { IvendorDatabaseRepositoryInterface } from "../../../domain/interfaces/repositoryInterfaces/vendor/vendorDatabaseRepository";
import { IfindVendorForClientUseCase } from "../../../domain/interfaces/useCaseInterfaces/client/vendor/IfindVendorForClientUseCase";

export class FindVendorForClientUseCase implements IfindVendorForClientUseCase {
    private vendorDatabase: IvendorDatabaseRepositoryInterface
    constructor(vendorDatabase: IvendorDatabaseRepositoryInterface) {
        this.vendorDatabase = vendorDatabase
    }
    async findVendorForClientUseCase(): Promise<VendorEntity[] | []> {
        return this.vendorDatabase.findVendorsForCarousal()
    }
}