export interface IemailService{
    
    sendEmail(to:string,subject:string,html:string):Promise<void>
}