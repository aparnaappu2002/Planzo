import { FindWorkSampleDTO } from "../../../../dto/workSample/findWorkSampleDTO"

export interface IfindWorkSamplesOfAVendorUseCase {
    findWorkSamples(vendorId: string,pageNo:number): Promise<{ workSamples: FindWorkSampleDTO[], totalPages: number }>
}