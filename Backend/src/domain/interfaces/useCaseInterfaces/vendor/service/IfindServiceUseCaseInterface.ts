import { FindServiceDTO } from "../../../../dto/services/findServiceDTO";

export interface IfindServiceUseCaseInterface {
    findService(vendorId: string, pageNo: number): Promise<{ Services: FindServiceDTO[], totalPages: number }>
}