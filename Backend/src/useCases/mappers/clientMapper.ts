import { clientEntity } from "../../domain/entities/clientEntity";
import { FindClientDTO } from "../../domain/dto/findClientDTO";

export const mapClientEntityToDTO = (client: clientEntity): FindClientDTO => ({
    _id: client._id?.toString(),
    name: client.name,
    email: client.email,
    phone: client.phone,
    role: client.role,
    status: client.status,
    profileImage: client.profileImage,
    createdAt: client.createdAt,
    lastLogin: client.lastLogin,
    onlineStatus: client.onlineStatus,
    clientId: client.clientId,
    googleVerified: client.googleVerified
});