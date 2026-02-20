import { useState } from 'react';
import { Wallet, Eye, EyeOff, ArrowUpRight, ArrowDownLeft, Filter } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useFindWalletDetailsVendor } from '@/hooks/vendorCustomHooks';
import { useFindTransactionsByPaymentStatus } from '@/hooks/vendorCustomHooks';
import { RootState } from '@/redux/Store';
import { useSelector } from 'react-redux';

import { Transaction, WalletData } from '@/types/wallet/TransactionType';
import Pagination from '@/components/other components/Pagination';

type FilterType = 'all' | 'credit' | 'debit';

const VendorWallet = () => {
  const vendorId = useSelector((state: RootState) => state.vendorSlice.vendor?._id);
  const [isBalanceVisible, setIsBalanceVisible] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [filter, setFilter] = useState<FilterType>('all');

  const { data: walletData, isLoading: loadingWallet } = useFindWalletDetailsVendor(
    vendorId || '',
    1
  ) as {
    data: WalletData | null;
    isLoading: boolean;
  };

  const {
    data: filteredData,
    isLoading: loadingFiltered,
  } = useFindTransactionsByPaymentStatus(
    filter === 'all' ? 'credit' : filter, // server fallback when 'all'
    currentPage,
    'newest'
  );

  const transactions = filter === 'all'
    ? walletData?.transactions || []
    : filteredData?.data?.transactions || [];

  const totalPages = filter === 'all'
    ? walletData?.totalPages || 1
    : filteredData?.data?.totalPages || 1;

  const isLoading = loadingWallet || (filter !== 'all' && loadingFiltered);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(amount);

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  const stats = walletData?.transactions
    ? (() => {
        const credits = walletData.transactions.filter(t => t.paymentStatus === 'credit');
        const debits = walletData.transactions.filter(t => t.paymentStatus === 'debit');
        return {
          totalCredits: credits.reduce((s, t) => s + t.amount, 0),
          totalDebits: debits.reduce((s, t) => s + t.amount, 0),
          creditCount: credits.length,
          debitCount: debits.length,
        };
      })()
    : { totalCredits: 0, totalDebits: 0, creditCount: 0, debitCount: 0 };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 px-4 py-6 sm:p-8">
        <div className="max-w-5xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-10 bg-gray-300 rounded w-3/5 max-w-xs"></div>
            <div className="h-40 sm:h-48 bg-gray-300 rounded-xl"></div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-300 rounded-xl"></div>
              ))}
            </div>
            <div className="space-y-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-28 sm:h-32 bg-gray-300 rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!walletData?.wallet) {
    return (
      <div className="min-h-screen bg-gray-50 px-4 py-20 text-center">
        <Wallet className="h-14 w-14 sm:h-16 sm:w-16 text-gray-400 mx-auto mb-5" />
        <h3 className="text-xl sm:text-2xl font-medium text-gray-900">No wallet found</h3>
        <p className="text-gray-500 mt-3 text-sm sm:text-base">
          Contact support if this seems wrong.
        </p>
      </div>
    );
  }

  const balance = walletData.wallet.balance;

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-6 sm:space-y-8">

        {/* Header */}
        <div className="flex items-center gap-3 mb-6 sm:mb-8">
          <div className="p-2.5 sm:p-3 bg-blue-600 rounded-lg">
            <Wallet className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">My Wallet</h1>
        </div>

        {/* Balance Card */}
        <Card className="bg-gradient-to-br from-blue-600 to-amber-500 p-5 sm:p-7 text-white shadow-xl rounded-xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base sm:text-lg font-semibold">Available Balance</h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsBalanceVisible(!isBalanceVisible)}
              className="text-white hover:bg-white/20 h-8 w-8 sm:h-9 sm:w-9"
            >
              {isBalanceVisible ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </Button>
          </div>
          <div className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">
            {isBalanceVisible ? formatCurrency(balance) : '••••••'}
          </div>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
          <Card className="p-4 sm:p-5 border-green-200 bg-green-50/60 rounded-xl">
            <div className="flex items-center gap-3 sm:gap-4">
              <ArrowDownLeft className="h-6 w-6 sm:h-7 sm:w-7 text-green-600" />
              <div>
                <p className="text-xs sm:text-sm text-gray-600">Total Credits</p>
                <p className="text-xl sm:text-2xl font-bold text-green-700 mt-0.5">
                  {formatCurrency(stats.totalCredits)}
                </p>
                <p className="text-xs text-gray-500 mt-1">{stats.creditCount} entries</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 sm:p-5 border-red-200 bg-red-50/60 rounded-xl">
            <div className="flex items-center gap-3 sm:gap-4">
              <ArrowUpRight className="h-6 w-6 sm:h-7 sm:w-7 text-red-600" />
              <div>
                <p className="text-xs sm:text-sm text-gray-600">Total Debits</p>
                <p className="text-xl sm:text-2xl font-bold text-red-700 mt-0.5">
                  {formatCurrency(stats.totalDebits)}
                </p>
                <p className="text-xs text-gray-500 mt-1">{stats.debitCount} entries</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 sm:p-5 border-blue-200 bg-blue-50/60 rounded-xl">
            <div className="flex items-center gap-3 sm:gap-4">
              <Wallet className="h-6 w-6 sm:h-7 sm:w-7 text-blue-600" />
              <div>
                <p className="text-xs sm:text-sm text-gray-600">Net Balance</p>
                <p className={`text-xl sm:text-2xl font-bold mt-0.5 ${balance >= 0 ? 'text-blue-700' : 'text-red-700'}`}>
                  {balance >= 0 ? '+' : ''}{formatCurrency(balance)}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Transactions Section */}
        <Card className="p-5 sm:p-6 lg:p-7 rounded-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <h3 className="text-xl font-semibold flex items-center gap-2.5">
              <Filter className="h-5 w-5" />
              Transaction History
            </h3>

            {/* Filter Buttons - responsive */}
            <div className="flex flex-wrap gap-2 bg-gray-100 p-1.5 rounded-lg">
              {(['all', 'credit', 'debit'] as const).map((type) => (
                <Button
                  key={type}
                  variant={filter === type ? 'default' : 'ghost'}
                  size="sm"
                  className="capitalize text-xs sm:text-sm font-medium px-3 sm:px-4"
                  onClick={() => {
                    setFilter(type);
                    setCurrentPage(1);
                  }}
                >
                  {type === 'all' && 'All'}
                  {type === 'credit' && (
                    <>
                      <ArrowDownLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1" />
                      Credits
                    </>
                  )}
                  {type === 'debit' && (
                    <>
                      <ArrowUpRight className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1" />
                      Debits
                    </>
                  )}
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-3 sm:space-y-4">
            {transactions.length > 0 ? (
              transactions.map((t: Transaction) => {
                const isCredit = t.paymentStatus === 'credit';
                const displayType = t.paymentType.charAt(0).toUpperCase() + t.paymentType.slice(1);

                return (
                  <div
                    key={t._id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-5 border rounded-xl hover:shadow-md transition-all bg-white"
                  >
                    <div className="flex items-start sm:items-center gap-3 sm:gap-4">
                      <div className={`p-3 rounded-full ${isCredit ? 'bg-green-100' : 'bg-red-100'}`}>
                        {isCredit ? (
                          <ArrowDownLeft className="h-6 w-6 text-green-600" />
                        ) : (
                          <ArrowUpRight className="h-6 w-6 text-red-600" />
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{displayType}</p>
                        <p className="text-sm text-gray-500 mt-0.5">{formatDate(t.date)}</p>
                        <div className="flex flex-wrap gap-2 mt-2">
                          <Badge variant={isCredit ? 'default' : 'destructive'} className="text-xs">
                            {isCredit ? 'Credit' : 'Debit'}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {t.currency.toUpperCase()}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <div className="text-left sm:text-right pl-10 sm:pl-0">
                      <p className={`text-xl sm:text-2xl font-bold ${isCredit ? 'text-green-600' : 'text-red-600'}`}>
                        {isCredit ? '+' : '−'}{formatCurrency(t.amount)}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        ID: {t._id.slice(-8)}
                      </p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-12 sm:py-16">
                <Wallet className="h-12 w-12 sm:h-14 sm:w-14 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 text-base sm:text-lg">
                  {filter === 'all' ? 'No transactions yet' : `No ${filter} transactions found`}
                </p>
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8 pt-6 border-t">
              <Pagination
                total={totalPages}
                current={currentPage}
                setPage={setCurrentPage}
              />
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default VendorWallet;