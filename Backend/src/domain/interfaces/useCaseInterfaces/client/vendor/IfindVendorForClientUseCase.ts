import { FindVendorDTO } from "../../../../dto/vendor/findVendorDTO"

export interface IfindVendorForClientUseCase {
    findVendorForClientUseCase(): Promise<FindVendorDTO[]>
}