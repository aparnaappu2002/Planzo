import { BookingEntity } from "../../../domain/entities/bookingEntity";
import { TransactionsEntity } from "../../../domain/entities/wallet/transactionEntity";
import { IbookingRepository } from "../../../domain/interfaces/repositoryInterfaces/booking/IbookingRepository";
import { IpaymentRepository } from "../../../domain/interfaces/repositoryInterfaces/payment/IpaymentRepository";
import { ItransactionRepository } from "../../../domain/interfaces/repositoryInterfaces/transaction/ItransactionRepository";
import { IwalletRepository } from "../../../domain/interfaces/repositoryInterfaces/wallet/IwalletRepository";
import { IStripeService } from "../../../domain/interfaces/serviceInterface/IstripeService";
import { IconfirmBookingPaymentUseCase } from "../../../domain/interfaces/useCaseInterfaces/client/booking/IconfirmBookingPaymentUseCase";

export class ConfirmBookingPaymentUseCase implements IconfirmBookingPaymentUseCase {
    private bookingDatabase: IbookingRepository
    private paymentDatabase: IpaymentRepository
    private walletDatabase: IwalletRepository
    private transactionDatabase: ItransactionRepository
    private paymentService: IStripeService
    constructor(bookingDatabase: IbookingRepository, paymentDatabase: IpaymentRepository, walletDatabase: IwalletRepository, transactionDatabase: ItransactionRepository, paymentService: IStripeService) {
        this.bookingDatabase = bookingDatabase
        this.paymentDatabase = paymentDatabase
        this.walletDatabase = walletDatabase
        this.transactionDatabase = transactionDatabase
        this.paymentDatabase = paymentDatabase
        this.paymentService = paymentService
    }
    async confirmBookingPayment(booking: BookingEntity, paymentIntentId: string): Promise<boolean> {
        if (!booking) throw new Error('No booking found')
        const dateAndServicePrice = await this.bookingDatabase.findServicePriceAndDatesOfBooking(booking._id!)
        if (!dateAndServicePrice) {
            throw new Error("Booking not found or service unavailable");
        }
        console.log("Bookings",booking)
        const clientId = booking.clientId || (booking as any).client?._id;
    const vendorId = booking.vendorId || (booking as any).vendor?._id;

    

        const { date, servicePrice } = dateAndServicePrice
        const paymentTransaction = await this.paymentDatabase.findTransactionOfAUser(booking.clientId, booking.vendorId, booking._id!)
        if (!paymentTransaction) throw new Error("No transaction found in these users")
        const confirmBooking = await this.paymentService.confirmPayment(paymentIntentId)
        if (!confirmBooking) {
            const updateBooking = await this.bookingDatabase.updateBookingPaymentStatus(booking._id!, 'Failed')
            throw new Error("Payment failed")
        }
        const totalAmount = date.length * servicePrice
        const adminCommission = totalAmount * 0.05
        const vendorPrice = totalAmount - adminCommission
        const adminId = process.env.ADMIN_ID
        if (!adminId) throw new Error('NO admin id found')
        const adminWallet = await this.walletDatabase.findWalletByUserId(adminId)
        if (!adminWallet) throw new Error("No admin wallet found in this Admin Id")
        const vendorWallet = await this.walletDatabase.findWalletByUserId(booking.vendorId)
        if (!vendorWallet) throw new Error("No vendorWallet found in this vendor Id")
        const adminTransaction: TransactionsEntity = {
            amount: adminCommission,
            currency: 'inr',
            paymentStatus: "credit",
            paymentType: "adminCommission",
            walletId: adminWallet._id!,
        }

        const vendorTransaction: TransactionsEntity = {
            amount: vendorPrice,
            currency: 'inr',
            paymentStatus: "credit",
            paymentType: "bookingPayment",
            walletId: vendorWallet._id!,
        }
        const CreateVendorTransaction = await this.transactionDatabase.createTransaction(vendorTransaction)
        if (!CreateVendorTransaction) throw new Error('error while creatitng vendor transcation')
        const CreateAdminTransaction = await this.transactionDatabase.createTransaction(adminTransaction)
        if (!CreateAdminTransaction) throw new Error('error while creatitng AdminTransaction')
        const addMoneyToAdminWallet = await this.walletDatabase.addMoney(adminId, adminCommission)
        if (!addMoneyToAdminWallet) throw new Error("error while adding money to admin wallet")
        const addMoneyToVendorWallet = await this.walletDatabase.addMoney(booking.vendorId, vendorPrice)
        if (!addMoneyToVendorWallet) throw new Error("error while adding money to vendor wallet")
        const updateBooking = await this.bookingDatabase.updateBookingPaymentStatus(booking._id!, 'Successfull')
        if(!updateBooking) throw new Error('error while updating booking database')
        return true
    }
}

