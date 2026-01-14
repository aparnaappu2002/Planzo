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
exports.CategoryClientController = void 0;
const httpStatus_1 = require("../../../../domain/enums/httpStatus");
const messages_1 = require("../../../../domain/enums/messages");
class CategoryClientController {
    constructor(findCategoryClientUSeCase) {
        this.findCategoryClientUSeCase = findCategoryClientUSeCase;
    }
    handleFindCategoryClient(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const categories = yield this.findCategoryClientUSeCase.findCategory();
                res.status(httpStatus_1.HttpStatus.OK).json({ message: messages_1.Messages.CATEGORY_FETCHED, categories });
            }
            catch (error) {
                console.log('error while fetching categories in client side', error);
                res.status(httpStatus_1.HttpStatus.BAD_REQUEST).json({
                    message: messages_1.Messages.CATEGORY_FETCH_ERROR,
                    error: error instanceof Error ? error.message : messages_1.Messages.CATEGORY_FETCH_ERROR
                });
            }
        });
    }
}
exports.CategoryClientController = CategoryClientController;
