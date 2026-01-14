import { EventResponseDTO } from "../../../../dto/event/eventResponseDTO";

export interface IfindEventsNearToClientUseCase {
    findEventsNearToClient(latitude: number, longitude: number,pageNo:number,range:number): Promise<{ events: EventResponseDTO[] | [], totalPages: number }>
}