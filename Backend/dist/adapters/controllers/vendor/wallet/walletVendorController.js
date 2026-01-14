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
exports.WalletVendorController = void 0;
const httpStatus_1 = require("../../../../domain/enums/httpStatus");
class WalletVendorController {
    constructor(findWalletDetails, findTransactions, findTransactionByPaymentStatusUseCase) {
        this.findTransactions = findTransactions;
        this.findWalletDetails = findWalletDetails;
        this.findTransactionByPaymentStatusUseCase = findTransactionByPaymentStatusUseCase;
    }
    handleShowWalletDetaills(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { userId, pageNo } = req.params;
                const page = parseInt(pageNo, 10) || 1;
                const wallet = yield this.findWalletDetails.findWallet(userId);
                const { transactions, totalPages } = yield this.findTransactions.findTransactions(wallet === null || wallet === void 0 ? void 0 : wallet._id, page);
                res.status(httpStatus_1.HttpStatus.OK).json({ message: 'Wallet details fetched vendor', wallet, transactions, totalPages });
            }
            catch (error) {
                console.log('error while finding wallet details', error);
                res.status(httpStatus_1.HttpStatus.BAD_REQUEST).json({
                    message: "Error whilw finding wallet details",
                    error: error instanceof Error ? error.message : 'error while finding wallet detailsl'
                });
            }
        });
    }
    handleFindTransactionsByPaymentStatus(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { paymentStatus, pageNo, sortBy } = req.query;
                if (!paymentStatus || !["credit", "debit"].includes(paymentStatus)) {
                    res.status(httpStatus_1.HttpStatus.BAD_REQUEST).json({
                        message: "Invalid or missing paymentStatus. Must be 'credit' or 'debit'"
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
                    message: "Failed to fetch transactions",
                    error: error.message || "Internal server error"
                });
            }
        });
    }
}
exports.WalletVendorController = WalletVendorController;
