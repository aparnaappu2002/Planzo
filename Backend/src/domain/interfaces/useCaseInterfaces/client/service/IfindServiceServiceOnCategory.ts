import { FindServiceDTO } from "../../../../dto/services/findServiceDTO";

export interface IfindServiceOnCategorybasis {
    findServiceBasedOnCatagory(categoryId: string | null, pageNo: number, sortBy: string ,): Promise<{ Services: FindServiceDTO[], totalPages: number }>
}