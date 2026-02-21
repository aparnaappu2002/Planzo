import { FindVendorDTO } from "../../../../dto/vendor/findVendorDTO";

export interface ISearchVendorsUseCase {
    searchVendors(search: string): Promise<FindVendorDTO[]>;
}