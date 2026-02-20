import { FindWorkSampleDTO } from "../../../domain/dto/workSample/findWorkSampleDTO";
import { IworkSampleRepository } from "../../../domain/interfaces/repositoryInterfaces/workSamples/workSampleRepositoryInterface";
import { IfindWorkSamplesOfAVendorUseCase } from "../../../domain/interfaces/useCaseInterfaces/vendor/workSamples/IfindWorkSampleofVendorUseCase";
import { mapWorkSampleEntityToDTO } from "../../mappers/workSampleMapper";
export class FindWorkSamplesOfAVendorUseCase implements IfindWorkSamplesOfAVendorUseCase {
    private workSampleDatbase: IworkSampleRepository
    constructor(workSampleDatbase: IworkSampleRepository) {
        this.workSampleDatbase = workSampleDatbase
    }
    async findWorkSamples(vendorId: string,pageNo:number): Promise<{ workSamples: FindWorkSampleDTO[], totalPages: number }> {
        if (!vendorId || vendorId.trim().length === 0) {
            throw new Error('Vendor ID is required');
        }
        const { workSamples, totalPages }= await this.workSampleDatbase.findWorkSample(vendorId,pageNo)
        return {
            workSamples: workSamples.map(mapWorkSampleEntityToDTO),
            totalPages
        };

    }
}