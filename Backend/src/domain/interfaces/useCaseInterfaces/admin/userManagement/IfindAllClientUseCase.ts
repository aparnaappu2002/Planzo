import { FindClientDTO } from "../../../../dto/findClientDTO";

export interface IfindAllClientUseCase{
    findAllClient(pageNo:number):Promise<{clients:FindClientDTO[]; totalPages:number}>
}