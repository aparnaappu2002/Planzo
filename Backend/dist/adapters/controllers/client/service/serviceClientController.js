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
exports.ServiceClientController = void 0;
const httpStatus_1 = require("../../../../domain/enums/httpStatus");
const messages_1 = require("../../../../domain/enums/messages");
class ServiceClientController {
    constructor(findServiceUseCase, findServiceOnCategory, searchServiceUseCase) {
        this.findServiceUseCase = findServiceUseCase;
        this.findServiceOnCategory = findServiceOnCategory;
        this.searchServiceUseCase = searchServiceUseCase;
    }
    handleFindServiceForClient(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const pageNo = parseInt(req.params.pageNo, 10) || 1;
                const { Services, totalPages } = yield this.findServiceUseCase.findServiceForclient(pageNo);
                res.status(httpStatus_1.HttpStatus.OK).json({ message: messages_1.Messages.SERVICE_FETCHED, Services, totalPages });
            }
            catch (error) {
                console.log('error while fetching service for client', error);
                res.status(httpStatus_1.HttpStatus.BAD_REQUEST).json({
                    message: messages_1.Messages.SERVICE_FETCH_ERROR,
                    error: error instanceof Error ? error.message : messages_1.Messages.SERVICE_FETCH_ERROR
                });
            }
        });
    }
    handleFindServiceOnCategorybasis(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { pageNo = 1, sortBy } = req.query;
                const page = parseInt(pageNo, 10) || 1;
                const rawCategoryId = req.query.categoryId;
                const catId = (typeof rawCategoryId === 'string'
                    ? rawCategoryId
                    : Array.isArray(rawCategoryId)
                        ? rawCategoryId[0]
                        : null);
                const sort = typeof sortBy === 'string' ? sortBy : 'a-z';
                const { Services, totalPages } = yield this.findServiceOnCategory.findServiceBasedOnCatagory(catId, page, sort);
                res.status(httpStatus_1.HttpStatus.OK).json({ message: messages_1.Messages.SERVICES_FETCHED_BY_CATEGORY, Services, totalPages });
            }
            catch (error) {
                console.log('error while finding services on basis of cateogry', error);
                res.status(httpStatus_1.HttpStatus.BAD_REQUEST).json({
                    message: messages_1.Messages.SERVICE_FETCH_ERROR,
                    error: error instanceof Error ? error.message : messages_1.Messages.SERVICE_FETCH_ERROR
                });
            }
        });
    }
    handleSearchService(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const queryParam = req.query.query;
                if (typeof queryParam !== 'string') {
                    res.status(httpStatus_1.HttpStatus.BAD_REQUEST).json({ message: messages_1.Messages.INVALID_QUERY_PARAMETER });
                    return;
                }
                const searchedService = yield this.searchServiceUseCase.searchService(queryParam);
                res.status(httpStatus_1.HttpStatus.OK).json({ message: messages_1.Messages.SERVICE_SEARCHED, searchedService });
            }
            catch (error) {
                console.log('error while performing search service', error);
                res.status(httpStatus_1.HttpStatus.BAD_REQUEST).json({
                    message: messages_1.Messages.ERROR_SEARCHING_SERVICE,
                    error: error instanceof Error ? error.message : messages_1.Messages.ERROR_SEARCHING_SERVICE
                });
            }
        });
    }
}
exports.ServiceClientController = ServiceClientController;
