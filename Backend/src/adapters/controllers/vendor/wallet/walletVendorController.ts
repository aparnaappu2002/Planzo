import { Request, Response } from "express";
import { IfindWalletUseCase } from "../../../../domain/interfaces/repositoryInterfaces/wallet/IfindWalletUseCase";
import { IfindTransactionsUseCase } from "../../../../domain/interfaces/useCaseInterfaces/trasaction/IfindTransactionUseCase";
import { HttpStatus } from "../../../../domain/enums/httpStatus";
import { IfindTransactionsByPaymentStatusUseCase } from "../../../../domain/interfaces/useCaseInterfaces/trasaction/IfindTrasactionByPaymentUseCase";
import { handleErrorResponse,logError } from "../../../../framework/services/errorHandler";
export class WalletVendorController {
  private findWalletDetails: IfindWalletUseCase;
  private findTransactions: IfindTransactionsUseCase;
  private findTransactionByPaymentStatusUseCase: IfindTransactionsByPaymentStatusUseCase;
  constructor(
    findWalletDetails: IfindWalletUseCase,
    findTransactions: IfindTransactionsUseCase,
    findTransactionByPaymentStatusUseCase: IfindTransactionsByPaymentStatusUseCase
  ) {
    this.findTransactions = findTransactions;
    this.findWalletDetails = findWalletDetails;
    this.findTransactionByPaymentStatusUseCase =
      findTransactionByPaymentStatusUseCase;
  }
  async handleShowWalletDetaills(req: Request, res: Response): Promise<void> {
    try {
      const { userId, pageNo } = req.params;
      const page = parseInt(pageNo, 10) || 1;
      const wallet = await this.findWalletDetails.findWallet(userId);
      if (!wallet || !wallet._id) {
        res.status(HttpStatus.NOT_FOUND).json({
          message: "Wallet not found",
        });
        return;
      }

      const { transactions, totalPages } =
        await this.findTransactions.findTransactions(wallet._id, page);
      res
        .status(HttpStatus.OK)
        .json({
          message: "Wallet details fetched vendor",
          wallet,
          transactions,
          totalPages,
        });
    } catch (error) {
      logError('Error while finding wallet details', error);
      handleErrorResponse(req, res, error, 'Failed to fetch wallet details');
    }
  }
  async handleFindTransactionsByPaymentStatus(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const { paymentStatus, pageNo, sortBy } = req.query;

      if (
        !paymentStatus ||
        !["credit", "debit"].includes(paymentStatus as string)
      ) {
        res.status(HttpStatus.BAD_REQUEST).json({
          message:
            "Invalid or missing paymentStatus. Must be 'credit' or 'debit'",
        });
        return;
      }

      const page = parseInt(pageNo as string, 10) || 1;
      const sort = (sortBy as string) || "newest";

      const result =
        await this.findTransactionByPaymentStatusUseCase.findTransactionByPaymentUseCase(
          paymentStatus as "credit" | "debit",
          page,
          sort
        );

      res.status(HttpStatus.OK).json({
        message: `All ${paymentStatus} transactions fetched successfully`,
        transactions: result.transactions,
        totalPages: result.totalPages,
        total: result.total,
        page,
        sortBy: sort,
      });
    } catch (error: any) {
      logError('Error while finding transactions by payment status', error);
      handleErrorResponse(req, res, error, 'Failed to fetch transactions');
    }
  }
}
