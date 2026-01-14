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
exports.CategoryController = void 0;
const httpStatus_1 = require("../../../../domain/enums/httpStatus");
const messages_1 = require("../../../../domain/enums/messages");
class CategoryController {
    constructor(createCategoryConrollerUseCase, findCategoryUseCase, updateCategoryUseCase, chageCategoryStatusUseCase) {
        this.createCategoryUseCase = createCategoryConrollerUseCase;
        this.findCategoryUseCase = findCategoryUseCase;
        this.updateCategoryUseCase = updateCategoryUseCase;
        this.changeCategoryStatusUseCase = chageCategoryStatusUseCase;
    }
    handleCreatecategory(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { title, image } = req.body;
                const category = yield this.createCategoryUseCase.createCategory(title, image);
                res.status(httpStatus_1.HttpStatus.OK).json({ message: messages_1.Messages.CATEGORY_CREATED, category });
            }
            catch (error) {
                //console.log('error while creating category', error)
                res.status(httpStatus_1.HttpStatus.BAD_REQUEST).json({
                    message: messages_1.Messages.CATEGORY_CREATE_ERROR,
                    error: error instanceof Error ? error.message : messages_1.Messages.CATEGORY_CREATE_ERROR
                });
            }
        });
    }
    handleFindCategory(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const pageNo = parseInt(req.query.pageNo, 10) || 1;
                const { categories, totalPages } = yield this.findCategoryUseCase.findAllCategory(pageNo);
                res.status(httpStatus_1.HttpStatus.OK).json({ message: messages_1.Messages.CATEGORY_FETCHED, categories, totalPages });
            }
            catch (error) {
                //console.log('error while fetching categories', error)
                res.status(httpStatus_1.HttpStatus.BAD_REQUEST).json({
                    message: messages_1.Messages.CATEGORY_FETCH_ERROR,
                    error: error instanceof Error ? error.message : messages_1.Messages.CATEGORY_FETCH_ERROR
                });
            }
        });
    }
    handleUpdateCategory(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { categoryId, updates } = req.body;
                //console.log(categoryId)
                const updateCategory = yield this.updateCategoryUseCase.updateCategory(categoryId, updates);
                res.status(httpStatus_1.HttpStatus.OK).json({ message: messages_1.Messages.CATEGORY_UPDATED });
            }
            catch (error) {
                //console.log('error while changning titlle and image of category', error)
                res.status(httpStatus_1.HttpStatus.BAD_REQUEST).json({
                    message: messages_1.Messages.CATEGORY_UPDATE_ERROR,
                    error: error instanceof Error ? error.message : messages_1.Messages.CATEGORY_UPDATE_ERROR
                });
            }
        });
    }
    handleChangeCategoryStatus(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { categoryId } = req.body;
                const changeStatusOfCategory = yield this.changeCategoryStatusUseCase.changeStatusCategory(categoryId);
                if (changeStatusOfCategory)
                    res.status(httpStatus_1.HttpStatus.OK).json({ message: messages_1.Messages.CATEGORY_STATUS_CHANGED });
            }
            catch (error) {
                //console.log('error while changing the status of the category', error)
                res.status(httpStatus_1.HttpStatus.BAD_REQUEST).json({
                    message: messages_1.Messages.CATEGORY_STATUS_ERROR,
                    error: error instanceof Error ? error.message : messages_1.Messages.CATEGORY_STATUS_ERROR
                });
            }
        });
    }
}
exports.CategoryController = CategoryController;
