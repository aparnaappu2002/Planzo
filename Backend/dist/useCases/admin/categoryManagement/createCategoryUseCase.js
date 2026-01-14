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
exports.CreateCategoryUseCase = void 0;
const randomUuid_1 = require("../../../framework/services/randomUuid");
class CreateCategoryUseCase {
    constructor(categoryDatabase) {
        this.categoryDatabase = categoryDatabase;
    }
    createCategory(title, img) {
        return __awaiter(this, void 0, void 0, function* () {
            const existingCategory = yield this.categoryDatabase.findByName(title);
            if (existingCategory) {
                console.log('Category already exists');
                throw new Error('This category is already exist');
            }
            const categoryId = (0, randomUuid_1.generateRandomUuid)();
            return yield this.categoryDatabase.createCategory(categoryId, title, img);
        });
    }
}
exports.CreateCategoryUseCase = CreateCategoryUseCase;
