import { IClientDatabaseRepository } from "../../../domain/interfaces/repositoryInterfaces/client/clientDatabaseRepository";
import { IshowProfileClientUseCase } from "../../../domain/interfaces/useCaseInterfaces/client/profile/IshowProfileClient";
import { ShowProfileClientResponseDTO } from "../../../domain/dto/showProfileClientDTO";

export class ShowProfileDetailsInClientUseCase
  implements IshowProfileClientUseCase
{
  private clientDatabase: IClientDatabaseRepository;
  constructor(clientDatabase: IClientDatabaseRepository) {
    this.clientDatabase = clientDatabase;
  }
  async showProfile(clientId: string): Promise<ShowProfileClientResponseDTO> {
    const client = await this.clientDatabase.showProfileDetails(clientId);

    if (!client) {
      throw new Error("Client not found");
    }

    return {
      _id: client._id!.toString(),
      clientId: client.clientId,

      name: client.name,
      email: client.email,
      phone: client.phone,

      profileImage: client.profileImage,
      status: client.status,
      googleVerified: client.googleVerified,
    };
  }
}
