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
exports.PaymentRepository = void 0;
const paymentModel_1 = require("../../../framework/database/models/paymentModel");
class PaymentRepository {
    createPayment(paymentDetails) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield paymentModel_1.paymentModel.create(paymentDetails);
        });
    }
    findTransactionOfAUser(senderId, receiverId, bookingId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield paymentModel_1.paymentModel.findOne({ userId: senderId, receiverId, bookingId }).select('-__v -createdAt');
        });
    }
}
exports.PaymentRepository = PaymentRepository;
