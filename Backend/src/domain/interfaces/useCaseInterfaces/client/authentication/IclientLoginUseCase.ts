import { clientEntity } from "../../../../entities/clientEntity";
export interface IClientLoginUseCase{
    loginClient(email:string,password:string):Promise<clientEntity | null>
}