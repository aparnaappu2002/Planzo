export interface IvendorUnblockUseCase{
    vendorUnblock(vendorId:string):Promise<boolean>
}