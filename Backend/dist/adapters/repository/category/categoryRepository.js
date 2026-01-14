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
exports.CategoryDatabaseRepository = void 0;
const categoryModel_1 = require("../../../framework/database/models/categoryModel");
class CategoryDatabaseRepository {
    findByName(name) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield categoryModel_1.categoryModel.findOne({
                title: { $regex: `^${name}$`, $options: "i" }
            });
        });
    }
    createCategory(categoryId, title, image) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield categoryModel_1.categoryModel.create({ categoryId, title, image });
        });
    }
    findCategory(pageNo) {
        return __awaiter(this, void 0, void 0, function* () {
            const limit = 8;
            const page = Math.max(pageNo, 1);
            const skip = (page - 1) * limit;
            const categories = yield categoryModel_1.categoryModel.find().skip(skip).limit(limit);
            const totalPages = Math.ceil((yield categoryModel_1.categoryModel.countDocuments()) / limit);
            return { categories, totalPages };
        });
    }
    changeNameAndImage(categoryId, updates) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!Object.keys(updates).length)
                return false;
            const updatedCategory = yield categoryModel_1.categoryModel.findByIdAndUpdate(categoryId, updates, { new: true });
            return updatedCategory ? true : false;
        });
    }
    changeStatusOfCategory(categoryId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield categoryModel_1.categoryModel.findOneAndUpdate({ _id: categoryId }, [
                {
                    $set: {
                        status: {
                            $cond: {
                                if: { $eq: ['$status', 'active'] },
                                then: 'blocked',
                                else: 'active'
                            }
                        }
                    }
                }
            ]);
        });
    }
    findCategoryForClient() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield categoryModel_1.categoryModel.find({ status: 'active' }).select('_id image title').limit(5);
        });
    }
    findCategoryForCreatingService() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield categoryModel_1.categoryModel.find({ status: 'active' }).select('title _id');
        });
    }
}
exports.CategoryDatabaseRepository = CategoryDatabaseRepository;
