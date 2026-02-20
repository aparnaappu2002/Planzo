import { ProfileVendorDto } from "../../../domain/dto/vendor/profileVendorDTO";
import { IvendorDatabaseRepositoryInterface } from "../../../domain/interfaces/repositoryInterfaces/vendor/vendorDatabaseRepository";
import { IupdateDetailsVendor} from "../../../domain/interfaces/useCaseInterfaces/vendor/profile/IupdateDetailsVendor";

export class updateDetailsVendorUseCase implements IupdateDetailsVendor {
    private vendorDatabase: IvendorDatabaseRepositoryInterface
    constructor(vendorDatabase: IvendorDatabaseRepositoryInterface) {
        this.vendorDatabase = vendorDatabase
    }
    async updateDetailsVendor(vendorId: string, about: string, phone: string, name: string): Promise<ProfileVendorDto> {
        if (!vendorId || vendorId.trim().length === 0) {
            throw new Error('Vendor ID is required');
        }
        const updatedVendor = await this.vendorDatabase.updateDetailsVendor(vendorId, about, phone,name)
        if(!updatedVendor) throw new Error('No vendor found in this ID')
        const vendorDto: ProfileVendorDto = {
            vendorId: updatedVendor.vendorId,
            name: updatedVendor.name,
            email: updatedVendor.email,
            phone: updatedVendor.phone,
            aboutVendor: updatedVendor.aboutVendor,
            vendorStatus: updatedVendor.vendorStatus
        };

        return vendorDto;
    }
}