export interface IuserExistenceService{
    emailExists(email:string):Promise<boolean>
}