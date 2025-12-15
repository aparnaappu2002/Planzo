import { ReviewDetailsDTO } from "../../../domain/dto/reviewDetailsDTO";
import { ServiceWithVendorEntity } from "../../../domain/entities/serviceWithVendorEntity";
import { IreviewRepository } from "../../../domain/interfaces/repositoryInterfaces/review/IreviewRepository";
import { IserviceRepository } from "../../../domain/interfaces/repositoryInterfaces/service/IserviceRepository";
import { IshowServiceWithVendorUseCase } from "../../../domain/interfaces/useCaseInterfaces/client/booking/IshowServiceWithVendorUseCase";

export class ServiceWithVendorUseCase implements IshowServiceWithVendorUseCase {
    private serviceDatabase: IserviceRepository
    private reviewDatabase: IreviewRepository
    constructor(serviceDatabase: IserviceRepository, reviewDatabase: IreviewRepository) {
        this.serviceDatabase = serviceDatabase
        this.reviewDatabase = reviewDatabase
    }
    async showServiceWithVendorUseCase(serviceId: string, pageNo: number, rating?: number): Promise<{ service: ServiceWithVendorEntity | null, reviews: ReviewDetailsDTO[], totalPages: number }> {
        const serviceWithVendor = await this.serviceDatabase.showServiceDataInBookingPage(serviceId)
        if (!serviceWithVendor) throw new Error('No service found in this service ID')
        const { reviews, totalPages } = await this.reviewDatabase.findReviews(serviceId, pageNo, rating)
        return { service: serviceWithVendor, reviews, totalPages }
    }
}
