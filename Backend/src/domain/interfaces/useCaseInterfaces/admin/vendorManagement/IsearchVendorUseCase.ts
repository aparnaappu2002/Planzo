import { VendorEntity } from "../../../../entities/vendorEntitty";

export interface ISearchVendorsUseCase {
    searchVendors(search: string): Promise<VendorEntity[]>;
}