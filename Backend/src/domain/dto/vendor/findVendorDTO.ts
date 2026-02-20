export interface FindVendorDTO {
    _id?: string;
    name: string;
    email: string;
    phone: number;
    role: 'client' | 'vendor' | 'admin';
    status?: 'active' | 'block';
    profileImage?: string;
    vendorId: string;
    vendorStatus: 'pending' | 'approved' | 'rejected';
    aboutVendor?: string;
}
