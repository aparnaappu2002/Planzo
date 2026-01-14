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
exports.FindAdminWalletDetailsController = void 0;
const httpStatus_1 = require("../../../../domain/enums/httpStatus");
const messages_1 = require("../../../../domain/enums/messages");
class FindAdminWalletDetailsController {
    constructor(findWalletDetailsUseCase, findTransactionDetailsUseCase, findTransactionByPaymentStatusUseCase) {
        this.findTransactionDetailsUseCase = findTransactionDetailsUseCase;
        this.findWalletDetailsUseCase = findWalletDetailsUseCase;
        this.findTransactionByPaymentStatusUseCase = findTransactionByPaymentStatusUseCase;
    }
    handleFindWalletDetails(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { userId, pageNo } = req.params;
                const page = parseInt(pageNo, 10) || 1;
                const wallet = yield this.findWalletDetailsUseCase.findWallet(userId);
                const { transactions, totalPages } = yield this.findTransactionDetailsUseCase.findTransactions(wallet === null || wallet === void 0 ? void 0 : wallet._id, page);
                res.status(httpStatus_1.HttpStatus.OK).json({ message: messages_1.Messages.WALLET_FETCHED, wallet, transactions, totalPages });
            }
            catch (error) {
                console.log('error while finding admin wallet details', error);
                res.status(httpStatus_1.HttpStatus.BAD_REQUEST).json({ message: messages_1.Messages.WALLET_FETCH_ERROR });
            }
        });
    }
    handleFindWalletByPaymentStatus(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { paymentStatus, pageNo, sortBy } = req.query;
                if (!paymentStatus || !["credit", "debit"].includes(paymentStatus)) {
                    res.status(httpStatus_1.HttpStatus.BAD_REQUEST).json({
                        message: messages_1.Messages.INVALID_PAYMENT_STATUS
                    });
                    return;
                }
                const page = parseInt(pageNo, 10) || 1;
                const sort = sortBy || "newest";
                const result = yield this.findTransactionByPaymentStatusUseCase.findTransactionByPaymentUseCase(paymentStatus, page, sort);
                res.status(httpStatus_1.HttpStatus.OK).json({
                    message: `All ${paymentStatus} transactions fetched successfully`,
                    transactions: result.transactions,
                    totalPages: result.totalPages,
                    total: result.total,
                    page,
                    sortBy: sort
                });
            }
            catch (error) {
                console.error("Error in handleFindTransactionsByPaymentStatus:", error);
                res.status(httpStatus_1.HttpStatus.INTERNAL_SERVER_ERROR).json({
                    message: messages_1.Messages.TRANSACTION_FETCH_ERROR,
                    error: error.message || messages_1.Messages.TRANSACTION_FETCH_ERROR
                });
            }
        });
    }
}
exports.FindAdminWalletDetailsController = FindAdminWalletDetailsController;
