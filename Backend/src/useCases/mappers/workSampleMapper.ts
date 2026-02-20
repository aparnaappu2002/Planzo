import { WorkSamplesEntity } from "../../domain/entities/workSample/WorkSampleEntity";
import { FindWorkSampleDTO } from "../../domain/dto/workSample/findWorkSampleDTO";

export const mapWorkSampleEntityToDTO = (workSample: WorkSamplesEntity): FindWorkSampleDTO => ({
    _id: workSample._id?.toString(),
    title: workSample.title,
    description: workSample.description,
    images: workSample.images,
    vendorId: workSample.vendorId.toString()
});