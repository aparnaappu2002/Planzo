import { Request, Response } from "express";
import { IfindChatsOfUserUseCase } from "../../../domain/interfaces/useCaseInterfaces/chat/IfindChatsOfUserUseCase";
import { HttpStatus } from "../../../domain/enums/httpStatus";
import { Messages } from "../../../domain/enums/messages";

export class FindChatOfUserController {
    private findChatOfUserUseCase: IfindChatsOfUserUseCase
    constructor(findChatOfUserUseCase: IfindChatsOfUserUseCase) {
        this.findChatOfUserUseCase = findChatOfUserUseCase
    }
    async handleFindChatOfUser(req: Request, res: Response): Promise<void> {
        try {
            const pageNo = req.query.pageNo as string
            const userId = req.query.userId as string
            const page = parseInt(pageNo, 10) || 1
            const { chats, hasMore } = await this.findChatOfUserUseCase.findChatsOfUser(userId, page)
            res.status(HttpStatus.OK).json({ message: Messages.CHAT_FETCHED, chats, hasMore })
        } catch (error) {
            console.log('error while finding the chats of user', error)
            res.status(HttpStatus.BAD_REQUEST).json({
                message: Messages.CHAT_FETCH_ERROR,
                error: error instanceof Error ? error.message : Messages.CHAT_FETCH_ERROR
            })
        }
    }
}