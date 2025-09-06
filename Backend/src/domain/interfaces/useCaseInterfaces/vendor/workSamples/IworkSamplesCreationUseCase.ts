import { WorkSamplesEntity } from "../../../../entities/workSample/WorkSampleEntity"

export interface IWorkSampleCreationUseCase {
    createWorkSample(workSample: WorkSamplesEntity): Promise<WorkSamplesEntity | null>
}