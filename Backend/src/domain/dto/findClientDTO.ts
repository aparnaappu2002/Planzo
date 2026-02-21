
export interface FindClientDTO {
    _id?: string;
    name: string;
    email: string;
    phone: number;
    role: 'client' | 'vendor' | 'admin';
    status?: 'active' | 'block';
    profileImage?: string;
    createdAt?: Date;
    lastLogin?: Date;
    onlineStatus?: 'online' | 'offline';
    clientId: string;
    googleVerified?: boolean;
}