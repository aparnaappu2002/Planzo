"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserManagementController = void 0;
const httpStatus_1 = require("../../../../domain/enums/httpStatus");
const messages_1 = require("../../../../domain/enums/messages");
class UserManagementController {
    constructor(clientBlockUseCase, clientUnblockUseCase, findAllClientUseCase, redisService, searchClientUseCase) {
        this.clientBlockUseCase = clientBlockUseCase;
        this.clientUnblockUseCase = clientUnblockUseCase;
        this.findAllClientUseCase = findAllClientUseCase;
        this.redisService = redisService;
        this.searchClientUseCase = searchClientUseCase;
    }
    handleClientBlock(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { clientId } = req.body;
                yield this.clientBlockUseCase.blockClient(clientId);
                const changeStatus = yield this.redisService.set(`user:client:${clientId}`, 15 * 60, JSON.stringify('block'));
                res.status(httpStatus_1.HttpStatus.OK).json({ message: messages_1.Messages.CLIENT_BLOCKED });
            }
            catch (error) {
                //console.log("Error while blocking user",error)
                res.status(httpStatus_1.HttpStatus.BAD_REQUEST).json({
                    message: messages_1.Messages.CLIENT_BLOCK_ERROR,
                    error: error instanceof Error ? error.message : messages_1.Messages.CLIENT_BLOCK_ERROR
                });
            }
        });
    }
    handleClientUnblock(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { clientId } = req.body;
                yield this.clientUnblockUseCase.unblockClient(clientId);
                const changeStatus = yield this.redisService.set(`user:client:${clientId}`, 15 * 60, JSON.stringify('active'));
                res.status(httpStatus_1.HttpStatus.OK).json({ message: messages_1.Messages.CLIENT_UNBLOCKED });
            }
            catch (error) {
                //console.log('Error while unblocking client',error)
                res.status(httpStatus_1.HttpStatus.BAD_REQUEST).json({
                    message: messages_1.Messages.CLIENT_UNBLOCK_ERROR,
                    error: error instanceof Error ? error.message : messages_1.Messages.CLIENT_UNBLOCK_ERROR
                });
            }
        });
    }
    findAllClient(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const pageNo = parseInt(req.query.pageNo, 10) || 1;
                const { clients, totalPages } = yield this.findAllClientUseCase.findAllClient(pageNo);
                if (!clients) {
                    res.status(httpStatus_1.HttpStatus.BAD_REQUEST).json({
                        message: messages_1.Messages.CLIENT_FETCH_ERROR
                    });
                }
                res.status(httpStatus_1.HttpStatus.OK).json({ message: messages_1.Messages.CLIENT_FETCHED, clients, totalPages });
            }
            catch (error) {
                //console.log("Error while fetching all clients",error)
                res.status(httpStatus_1.HttpStatus.BAD_REQUEST).json({
                    message: messages_1.Messages.CLIENT_FETCH_ERROR,
                    error: error instanceof Error ? error.message : messages_1.Messages.CLIENT_FETCH_ERROR
                });
            }
        });
    }
    searchClient(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const search = req.query.search;
                if (!search) {
                    res.status(httpStatus_1.HttpStatus.BAD_REQUEST).json({
                        message: messages_1.Messages.SEARCH_QUERY_REQUIRED
                    });
                    return;
                }
                const clients = yield this.searchClientUseCase.searchClients(search);
                res.status(httpStatus_1.HttpStatus.OK).json({
                    message: messages_1.Messages.CLIENT_FETCHED,
                    clients
                });
            }
            catch (error) {
                //console.log("Error while searching clients", error);
                res.status(httpStatus_1.HttpStatus.BAD_REQUEST).json({
                    message: messages_1.Messages.CLIENT_SEARCH_ERROR,
                    error: error instanceof Error ? error.message : messages_1.Messages.CLIENT_SEARCH_ERROR
                });
            }
        });
    }
}
exports.UserManagementController = UserManagementController;
