export interface ProfileVendorDto {
    vendorId: string;
    name: string;
    email: string;
    phone: number;
    aboutVendor?: string;
    vendorStatus: 'pending' | 'approved' | 'rejected';
}
