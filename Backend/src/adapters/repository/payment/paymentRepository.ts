import { ObjectId } from "mongoose";
import { PaymentEntity } from "../../../domain/entities/payment/paymentEntity";
import { IpaymentRepository } from "../../../domain/interfaces/repositoryInterfaces/payment/IpaymentRepository";
import { paymentModel } from "../../../framework/database/models/paymentModel";

export class PaymentRepository implements IpaymentRepository {
    async createPayment(paymentDetails: PaymentEntity): Promise<PaymentEntity> {
        return await paymentModel.create(paymentDetails)
    }
    
    async findTransactionOfAUser(senderId: string | ObjectId, receiverId: string | ObjectId, bookingId: string | ObjectId): Promise<PaymentEntity | null> {
        return await paymentModel.findOne({ userId: senderId, receiverId, bookingId }).select('-__v -createdAt').lean() as PaymentEntity | null
    }
}