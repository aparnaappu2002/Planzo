import { WorkSamplesEntity } from "../../../domain/entities/workSample/WorkSampleEntity";
import { IworkSampleRepository } from "../../../domain/interfaces/repositoryInterfaces/workSamples/workSampleRepositoryInterface";
import { IWorkSampleCreationUseCase } from "../../../domain/interfaces/useCaseInterfaces/vendor/workSamples/IworkSamplesCreationUseCase";

export class WorkSampleCreationUseCase implements IWorkSampleCreationUseCase {
    private workSampleDatabase: IworkSampleRepository
    constructor(workSampleDatabase: IworkSampleRepository) {
        this.workSampleDatabase = workSampleDatabase
    }
    async createWorkSample(workSample: WorkSamplesEntity): Promise<WorkSamplesEntity | null> {
        return await this.workSampleDatabase.createWorkSamples(workSample)
    }
}
