import { ServiceEntity } from "../../domain/entities/serviceEntity";
import { FindServiceDTO } from "../../domain/dto/services/findServiceDTO";

export const mapServiceEntityToDTO = (service: ServiceEntity): FindServiceDTO => ({
    _id: service._id?.toString(),
    serviceTitle: service.serviceTitle,
    yearsOfExperience: service.yearsOfExperience,
    serviceDescription: service.serviceDescription,
    cancellationPolicy: service.cancellationPolicy,
    termsAndCondition: service.termsAndCondition,
    serviceDuration: service.serviceDuration,
    servicePrice: service.servicePrice,
    additionalHourFee: service.additionalHourFee,
    status: service.status,
    vendorId: service.vendorId.toString(),
    categoryId: service.categoryId.toString()
});