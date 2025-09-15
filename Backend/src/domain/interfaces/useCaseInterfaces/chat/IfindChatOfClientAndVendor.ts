import { chatEntity } from "../../../entities/chat/chatEntity"

export interface IfindChatsBetweenClientAndVendorUseCase {
    findChatBetweenClientAndVendor(senderId: string, receiverId: string): Promise<chatEntity | null>
}