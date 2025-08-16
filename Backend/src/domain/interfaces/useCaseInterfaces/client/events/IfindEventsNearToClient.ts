import { EventEntity } from "../../../../entities/event/eventEntity";

export interface IfindEventsNearToClientUseCase {
    findEventsNearToClient(latitude: number, longitude: number,pageNo:number,range:number): Promise<{ events: EventEntity[] | [], totalPages: number }>
}