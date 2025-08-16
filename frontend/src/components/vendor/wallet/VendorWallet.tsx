import { useState } from 'react';
import { Wallet, Eye, EyeOff, ArrowUpRight, ArrowDownLeft, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useFindWalletDetailsVendor } from '@/hooks/vendorCustomHooks';
import { RootState } from '@/redux/Store';
import { useSelector } from 'react-redux';

// Transaction interface matching your actual data structure
interface Transaction {
  _id: string;
  amount: number;
  currency: string;
  paymentStatus: 'credit' | 'debit';
  paymentType: string;
  walletId: string;
  date: string;
}

interface WalletData {
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

const VendorWallet = () => {
  const vendorId = useSelector((state: RootState) => state.vendorSlice.vendor?._id);
  const [isBalanceVisible, setIsBalanceVisible] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [transactionFilter, setTransactionFilter] = useState('all'); // 'all', 'credit', 'debit'
  const { data: walletData, isLoading } = useFindWalletDetailsVendor(vendorId, currentPage) as {
    data: WalletData | null;
    isLoading: boolean;
  };
  console.log(walletData)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-300 rounded w-64"></div>
            <div className="h-32 bg-gray-300 rounded"></div>
            <div className="h-64 bg-gray-300 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!walletData) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <Wallet className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No wallet found</h3>
            <p className="text-gray-500">Unable to load wallet data.</p>
          </div>
        </div>
      </div>
    );
  }

  const balance = walletData.wallet.balance;
  const transactions = walletData.transactions;
  const totalPages = walletData.totalPages;

  // Filter transactions based on selected filter - using paymentStatus
  const filteredTransactions = transactions.filter((transaction: Transaction) => {
    if (transactionFilter === 'all') return true;
    return transaction.paymentStatus === transactionFilter;
  });

  // Calculate summary stats - using paymentStatus
  const creditTransactions = transactions.filter((t: Transaction) => t.paymentStatus === 'credit');
  const debitTransactions = transactions.filter((t: Transaction) => t.paymentStatus === 'debit');
  const totalCredits = creditTransactions.reduce((sum: number, t: Transaction) => sum + t.amount, 0);
  const totalDebits = debitTransactions.reduce((sum: number, t: Transaction) => sum + t.amount, 0);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 bg-blue-600 rounded-lg">
            <Wallet className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Vendor Wallet</h1>
        </div>

        {/* Balance Card */}
        <Card className="bg-gradient-to-br from-blue-600 to-amber-500 p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Current Balance</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsBalanceVisible(!isBalanceVisible)}
              className="text-white hover:bg-white/20"
            >
              {isBalanceVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>
          <div className="text-3xl font-bold">
            {isBalanceVisible ? formatCurrency(balance) : '••••••'}
          </div>
        </Card>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <ArrowDownLeft className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-gray-600">Total Credits</span>
            </div>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(totalCredits)}
            </div>
            <div className="text-xs text-gray-500">
              {creditTransactions.length} transactions
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <ArrowUpRight className="h-4 w-4 text-red-600" />
              <span className="text-sm font-medium text-gray-600">Total Debits</span>
            </div>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(totalDebits)}
            </div>
            <div className="text-xs text-gray-500">
              {debitTransactions.length} transactions
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Wallet className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-gray-600">Net Change</span>
            </div>
            <div className={`text-2xl font-bold ${totalCredits - totalDebits >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {totalCredits - totalDebits >= 0 ? '+' : ''}
              {formatCurrency(totalCredits - totalDebits)}
            </div>
            <div className="text-xs text-gray-500">
              {transactions.length} total transactions
            </div>
          </Card>
        </div>

        {/* Transactions */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold">All Transactions</h3>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <select 
                value={transactionFilter} 
                onChange={(e) => setTransactionFilter(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Transactions</option>
                <option value="credit">Credits Only</option>
                <option value="debit">Debits Only</option>
              </select>
            </div>
          </div>

          <div className="space-y-3">
            {filteredTransactions && filteredTransactions.length > 0 ? (
              filteredTransactions.map((transaction: Transaction) => {
                const isCredit = transaction.paymentStatus === 'credit';
                
                // Create display description from paymentType
                const displayDescription = transaction.paymentType.charAt(0).toUpperCase() + transaction.paymentType.slice(1);
                
                return (
                  <div
                    key={transaction._id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      {isCredit ? (
                        <div className="p-2 bg-green-100 rounded-full">
                          <ArrowDownLeft className="h-5 w-5 text-green-600" />
                        </div>
                      ) : (
                        <div className="p-2 bg-red-100 rounded-full">
                          <ArrowUpRight className="h-5 w-5 text-red-600" />
                        </div>
                      )}
                      <div>
                        <p className="font-medium">{displayDescription}</p>
                        <p className="text-sm text-gray-500">
                          {formatDate(transaction.date)}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge 
                            variant="secondary" 
                            className={`text-xs ${isCredit ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                          >
                            {isCredit ? 'Credit' : 'Debit'}
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            {transaction.paymentType}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {transaction.currency.toUpperCase()}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div
                        className={`text-lg font-bold ${
                          isCredit ? 'text-green-600' : 'text-red-600'
                        }`}
                      >
                        {isCredit ? '+' : '-'}
                        {formatCurrency(transaction.amount)}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        ID: {transaction._id.slice(-8)}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-12">
                <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <Wallet className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {transactionFilter === 'all' ? 'No transactions found' : 
                   transactionFilter === 'credit' ? 'No credit transactions found' : 
                   'No debit transactions found'}
                </h3>
                <p className="text-gray-500">
                  {transactionFilter === 'all' ? 'Your transaction history will appear here when you start using your wallet.' :
                   'Try changing the filter to see other transaction types.'}
                </p>
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-200">
              <div className="text-sm text-gray-600">
                Showing page {currentPage} of {totalPages} ({transactions.length} total transactions)
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="flex items-center gap-1"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="flex items-center gap-1"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default VendorWallet;