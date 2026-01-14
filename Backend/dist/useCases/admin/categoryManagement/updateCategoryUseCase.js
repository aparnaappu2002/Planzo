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
exports.UpdateCategoryUseCase = void 0;
class UpdateCategoryUseCase {
    constructor(categoryDatabase) {
        this.categoryDatabase = categoryDatabase;
    }
    updateCategory(categoryId, updates) {
        return __awaiter(this, void 0, void 0, function* () {
            if (updates.title) {
                const existingCategory = yield this.categoryDatabase.findByName(updates.title);
                if (existingCategory)
                    throw new Error("There is already another category in this name");
            }
            const updateTitleAndImage = yield this.categoryDatabase.changeNameAndImage(categoryId, updates);
            if (!updateTitleAndImage)
                throw new Error('No category presented in ID');
            return true;
        });
    }
}
exports.UpdateCategoryUseCase = UpdateCategoryUseCase;
