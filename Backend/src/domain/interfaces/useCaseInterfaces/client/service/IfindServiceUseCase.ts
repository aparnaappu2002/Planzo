import { FindServiceDTO } from "../../../../dto/services/findServiceDTO";

export interface IfindServiceUseCase {
    findServiceForclient(pageNo: number): Promise<{ Services: FindServiceDTO[], totalPages: number }>
}