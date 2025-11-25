export interface Transaction {
  _id: string;
  amount: number;
  currency: string;
  paymentStatus: 'credit' | 'debit';
  paymentType: string;
  walletId: string;
  date: string;
}

export interface WalletData {
  message: string;
  wallet: {
    _id: string;
    balance: number;
    createdAt: string;
    updatedAt: string;
    userId: string;
    userModel: string;
    walletId: string;
    __v: number;
  };
  transactions: Transaction[];
  totalPages: number;
}
