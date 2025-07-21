import { clientEntity } from "../../../entities/clientEntity";
export interface IadminRepository{
    findByEmail(email:string):Promise<clientEntity | null>
    findById(id:string):Promise<clientEntity | null>
    findState(id:string):Promise<boolean | null>
}