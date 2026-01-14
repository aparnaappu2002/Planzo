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
exports.ConfirmBookingPaymentUseCase = void 0;
class ConfirmBookingPaymentUseCase {
    constructor(bookingDatabase, paymentDatabase, walletDatabase, transactionDatabase, paymentService) {
        this.bookingDatabase = bookingDatabase;
        this.paymentDatabase = paymentDatabase;
        this.walletDatabase = walletDatabase;
        this.transactionDatabase = transactionDatabase;
        this.paymentDatabase = paymentDatabase;
        this.paymentService = paymentService;
    }
    confirmBookingPayment(booking, paymentIntentId) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d;
            if (!booking)
                throw new Error('No booking found');
            const dateAndServicePrice = yield this.bookingDatabase.findServicePriceAndDatesOfBooking(booking._id);
            if (!dateAndServicePrice) {
                throw new Error("Booking not found or service unavailable");
            }
            console.log("Bookings", booking);
            const clientId = booking.clientId || ((_a = booking.client) === null || _a === void 0 ? void 0 : _a._id);
            const vendorId = booking.vendorId || ((_b = booking.vendor) === null || _b === void 0 ? void 0 : _b._id);
            console.log('=== CONFIRMATION DEBUG ===');
            console.log('Looking for transaction with payment intent ID:', paymentIntentId);
            console.log('Booking ID:', booking._id);
            console.log('Client ID (direct):', booking.clientId);
            console.log('Client ID (populated):', (_c = booking.client) === null || _c === void 0 ? void 0 : _c._id);
            console.log('Vendor ID (direct):', booking.vendorId);
            console.log('Vendor ID (populated):', (_d = booking.vendor) === null || _d === void 0 ? void 0 : _d._id);
            console.log('Final Client ID:', clientId);
            console.log('Final Vendor ID:', vendorId);
            const { date, servicePrice } = dateAndServicePrice;
            const paymentTransaction = yield this.paymentDatabase.findTransactionOfAUser(booking.clientId, booking.vendorId, booking._id);
            if (!paymentTransaction)
                throw new Error("No transaction found in these users");
            const confirmBooking = yield this.paymentService.confirmPayment(paymentIntentId);
            if (!confirmBooking) {
                const updateBooking = yield this.bookingDatabase.updateBookingPaymentStatus(booking._id, 'Failed');
                throw new Error("Payment failed");
            }
            const totalAmount = date.length * servicePrice;
            const adminCommission = totalAmount * 0.05;
            const vendorPrice = totalAmount - adminCommission;
            const adminId = process.env.ADMIN_ID;
            if (!adminId)
                throw new Error('NO admin id found');
            const adminWallet = yield this.walletDatabase.findWalletByUserId(adminId);
            if (!adminWallet)
                throw new Error("No admin wallet found in this Admin Id");
            const vendorWallet = yield this.walletDatabase.findWalletByUserId(booking.vendorId);
            if (!vendorWallet)
                throw new Error("No vendorWallet found in this vendor Id");
            const adminTransaction = {
                amount: adminCommission,
                currency: 'inr',
                paymentStatus: "credit",
                paymentType: "adminCommission",
                walletId: adminWallet._id,
            };
            const vendorTransaction = {
                amount: vendorPrice,
                currency: 'inr',
                paymentStatus: "credit",
                paymentType: "bookingPayment",
                walletId: vendorWallet._id,
            };
            const CreateVendorTransaction = yield this.transactionDatabase.createTransaction(vendorTransaction);
            if (!CreateVendorTransaction)
                throw new Error('error while creatitng vendor transcation');
            const CreateAdminTransaction = yield this.transactionDatabase.createTransaction(adminTransaction);
            if (!CreateAdminTransaction)
                throw new Error('error while creatitng AdminTransaction');
            const addMoneyToAdminWallet = yield this.walletDatabase.addMoney(adminId, adminCommission);
            if (!addMoneyToAdminWallet)
                throw new Error("error while adding money to admin wallet");
            const addMoneyToVendorWallet = yield this.walletDatabase.addMoney(booking.vendorId, vendorPrice);
            if (!addMoneyToVendorWallet)
                throw new Error("error while adding money to vendor wallet");
            const updateBooking = yield this.bookingDatabase.updateBookingPaymentStatus(booking._id, 'Successfull');
            if (!updateBooking)
                throw new Error('error while updating booking database');
            return true;
        });
    }
}
exports.ConfirmBookingPaymentUseCase = ConfirmBookingPaymentUseCase;
