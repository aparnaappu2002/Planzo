import { ObjectId, Types } from "mongoose";
import { TransactionsEntity } from "../../../domain/entities/wallet/transactionEntity";
import { ItransactionRepository } from "../../../domain/interfaces/repositoryInterfaces/transaction/ItransactionRepository";
import { transactionModel } from "../../../framework/database/models/transactionModel";

export class TransactionRepository implements ItransactionRepository {
  async createTransaction(
    transaction: TransactionsEntity
  ): Promise<TransactionsEntity> {
    return await transactionModel.create(transaction);
  }
  async findTransactionsOfAWallet(
    walletId: string | ObjectId,
    pageNo: number
  ): Promise<{ transactions: TransactionsEntity[] | []; totalPages: number }> {
    const page = Math.max(pageNo, 1);
    console.log(walletId);
    const limit = 10;
    const skip = (page - 1) * limit;
    const formattedWalletId =
      typeof walletId === "string" ? new Types.ObjectId(walletId) : walletId;
    const transactions = await transactionModel
      .find({ walletId })
      .select("-__v -createdAt -updatedAt")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    const totalPages =
      Math.ceil(
        (await transactionModel.countDocuments({
          walletId: formattedWalletId,
        })) / limit
      ) || 1;
    return { transactions, totalPages };
  }
  async findTransactionsByPaymentStatus(
    paymentStatus: "credit" | "debit" | string,
    pageNo: number,
    sortBy: string = "newest"
  ): Promise<{
    transactions: TransactionsEntity[] | [];
    totalPages: number;
    total?: number;
  }> {
    const sortOptions: Record<string, any> = {
      "amount-high-low": { amount: -1 },
      "amount-low-high": { amount: 1 },
      newest: { date: -1 },
      oldest: { date: 1 },
    };

    const sort = sortOptions[sortBy] || { date: -1 };

    const limit = 10;
    const page = Math.max(pageNo, 1);
    const skip = (page - 1) * limit;

    // Normalize input
    const status = paymentStatus.toLowerCase().trim();
    if (!["credit", "debit"].includes(status)) {
      return { transactions: [], totalPages: 0 };
    }

    const query = { paymentStatus: status }; // exact match

    const [transactions, totalCount] = await Promise.all([
      transactionModel
        .find(query)
        .select("-__v -updatedAt")
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean<TransactionsEntity[]>(),

      transactionModel.countDocuments(query),
    ]);

    return {
      transactions: transactions || [],
      totalPages: Math.ceil(totalCount / limit) || 1,
      total: totalCount,
    };
  }
  async revenueChart(walletId: string, datePeriod: Date | null): Promise<{ month: string; revenue: number; }[]> {
        const matchStage: any = {
            walletId: new Types.ObjectId(walletId),
            paymentStatus: "credit",
            paymentType: { $in: ["ticketBooking", "bookingPayment"] },
        }

        if (datePeriod) {
            matchStage.date = { $gte: datePeriod }
        }
        const revenueData = await transactionModel.aggregate([
            {
                $match: { ...matchStage },
            },
            {
                $group: {
                    _id: {
                        month: { $month: "$date" },
                        year: { $year: "$date" },
                    },
                    totalRevenue: { $sum: "$amount" },
                },
            },
            {
                $sort: {
                    "_id.year": 1,
                    "_id.month": 1,
                },
            },
        ])

        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
        const formatted = revenueData.map((entry) => ({
            month: monthNames[entry._id.month - 1],
            revenue: entry.totalRevenue,
        }))
        return formatted
    }
}
