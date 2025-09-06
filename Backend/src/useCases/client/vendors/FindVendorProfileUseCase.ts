import { ServiceEntity } from "../../../domain/entities/serviceEntity";
import { VendorProfileEntityInClient } from "../../../domain/entities/vendor/VendorProfileEntityInClient";
import { IserviceRepository } from "../../../domain/interfaces/repositoryInterfaces/service/IserviceRepository";
import { IworkSampleRepository } from "../../../domain/interfaces/repositoryInterfaces/workSamples/workSampleRepositoryInterface";
import { IfindVendorProfileUseCase } from "../../../domain/interfaces/useCaseInterfaces/client/vendor/IfindVendorProfileUseCase";

export class FindVendorProfileUseCase implements IfindVendorProfileUseCase {
    private workSampleDatabase: IworkSampleRepository
    private serviceDatabase: IserviceRepository
    constructor(workSampleDatabase: IworkSampleRepository, serviceDatabase: IserviceRepository) {
        this.workSampleDatabase = workSampleDatabase
        this.serviceDatabase = serviceDatabase
    }
    async findVendorProfile(vendorId: string, pageNo: number): Promise<{ vendorProfile: VendorProfileEntityInClient | null, services: ServiceEntity[] | [], totalPages: number }> {
        const { Services, totalPages } = await this.serviceDatabase.findServiceOfAVendor(vendorId, pageNo)
        const vendor = await this.workSampleDatabase.vendorProfileWithWorkSample(vendorId)
        return { vendorProfile: vendor, services: Services, totalPages }
    }
}