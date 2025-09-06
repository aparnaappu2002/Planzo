import { WorkSamplesEntity } from "../../../domain/entities/workSample/WorkSampleEntity";
import { IworkSampleRepository } from "../../../domain/interfaces/repositoryInterfaces/workSamples/workSampleRepositoryInterface";
import { IfindWorkSamplesOfAVendorUseCase } from "../../../domain/interfaces/useCaseInterfaces/vendor/workSamples/IfindWorkSampleofVendorUseCase";

export class FindWorkSamplesOfAVendorUseCase implements IfindWorkSamplesOfAVendorUseCase {
    private workSampleDatbase: IworkSampleRepository
    constructor(workSampleDatbase: IworkSampleRepository) {
        this.workSampleDatbase = workSampleDatbase
    }
    async findWorkSamples(vendorId: string,pageNo:number): Promise<{ workSamples: WorkSamplesEntity[] | [], totalPages: number }> {
        return await this.workSampleDatbase.findWorkSample(vendorId,pageNo)
    }
}