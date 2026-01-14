import { ShowProfileClientResponseDTO } from "../../../../dto/showProfileClientDTO"
export interface IshowProfileClientUseCase {
    showProfile(clientId: string): Promise<ShowProfileClientResponseDTO>
}