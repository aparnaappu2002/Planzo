import { useState } from 'react';
import { Wallet, Eye, EyeOff, ArrowUpRight, ArrowDownLeft, Filter } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useFindWalletDetailsVendor } from '@/hooks/vendorCustomHooks';
import { useFindTransactionsByPaymentStatus } from '@/hooks/vendorCustomHooks'; // ← Import your hook
import { RootState } from '@/redux/Store';
import { useSelector } from 'react-redux';

import { Transaction } from '@/types/wallet/TransactionType';
import { WalletData } from '@/types/wallet/TransactionType';
import Pagination from '@/components/other components/Pagination';

type FilterType = 'all' | 'credit' | 'debit';

const VendorWallet = () => {
  const vendorId = useSelector((state: RootState) => state.vendorSlice.vendor?._id);
  const [isBalanceVisible, setIsBalanceVisible] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [filter, setFilter] = useState<FilterType>('all');

  // Always get wallet balance + basic data
  const { data: walletData, isLoading: loadingWallet } = useFindWalletDetailsVendor(vendorId || '', 1) as {
    data: WalletData | null;
    isLoading: boolean;
  };

  // Filtered transactions from server
  const {
    data: filteredData,
    isLoading: loadingFiltered,
  } = useFindTransactionsByPaymentStatus(
    filter === 'all' ? 'credit' : filter, // dummy when "all"
    currentPage,
    'newest'
  );
  console.log("Data",filteredData)

  // Choose data source
  const transactions = filter === 'all'
    ? walletData?.transactions || []
    : filteredData?.data?.transactions || [];

  const totalPages = filter === 'all'
    ? walletData?.totalPages || 1
    : filteredData?.data?.totalPages || 1;

  const isLoading = loadingWallet || (filter !== 'all' && loadingFiltered);

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

  // Summary stats (from full data)
  const stats = walletData?.transactions ? (() => {
    const credits = walletData.transactions.filter(t => t.paymentStatus === 'credit');
    const debits = walletData.transactions.filter(t => t.paymentStatus === 'debit');
    return {
      totalCredits: credits.reduce((s, t) => s + t.amount, 0),
      totalDebits: debits.reduce((s, t) => s + t.amount, 0),
      creditCount: credits.length,
      debitCount: debits.length,
    };
  })() : { totalCredits: 0, totalDebits: 0, creditCount: 0, debitCount: 0 };

  if (isLoading ) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-300 rounded w-64"></div>
            <div className="h-32 bg-gray-300 rounded"></div>
            <div className="space-y-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-24 bg-gray-300 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!walletData?.wallet) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 text-center py-20">
        <Wallet className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-medium text-gray-900">No wallet found</h3>
        <p className="text-gray-500 mt-2">Contact support if this seems wrong.</p>
      </div>
    );
  }

  const balance = walletData.wallet.balance;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 bg-blue-600 rounded-lg">
            <Wallet className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">My Wallet</h1>
        </div>

        {/* Balance Card */}
        <Card className="bg-gradient-to-br from-blue-600 to-amber-500 p-6 text-white shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Available Balance</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsBalanceVisible(!isBalanceVisible)}
              className="text-white hover:bg-white/20"
            >
              {isBalanceVisible ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </Button>
          </div>
          <div className="text-4xl font-bold">
            {isBalanceVisible ? formatCurrency(balance) : '••••••'}
          </div>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-5 border-green-200 bg-green-50/50">
            <div className="flex items-center gap-3">
              <ArrowDownLeft className="h-6 w-6 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Total Credits</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(stats.totalCredits)}</p>
                <p className="text-xs text-gray-500">{stats.creditCount} entries</p>
              </div>
            </div>
          </Card>

          <Card className="p-5 border-red-200 bg-red-50/50">
            <div className="flex items-center gap-3">
              <ArrowUpRight className="h-6 w-6 text-red-600" />
              <div>
                <p className="text-sm text-gray-600">Total Debits</p>
                <p className="text-2xl font-bold text-red-600">{formatCurrency(stats.totalDebits)}</p>
                <p className="text-xs text-gray-500">{stats.debitCount} entries</p>
              </div>
            </div>
          </Card>

          <Card className="p-5 border-blue-200 bg-blue-50/50">
            <div className="flex items-center gap-3">
              <Wallet className="h-6 w-6 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Net Balance</p>
                <p className={`text-2xl font-bold ${balance >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                  {balance >= 0 ? '+' : ''}{formatCurrency(balance)}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Transactions with Filter */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Transaction History
            </h3>

            {/* Filter Buttons */}
            <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
              {(['all', 'credit', 'debit'] as const).map((type) => (
                <Button
                  key={type}
                  variant={filter === type ? 'default' : 'ghost'}
                  size="sm"
                  className="capitalize text-xs font-medium"
                  onClick={() => {
                    setFilter(type);
                    setCurrentPage(1);
                  }}
                >
                  {type === 'all' && 'All'}
                  {type === 'credit' && (
                    <>
                      <ArrowDownLeft className="h-3.5 w-3.5 mr-1" />
                      Credits
                    </>
                  )}
                  {type === 'debit' && (
                    <>
                      <ArrowUpRight className="h-3.5 w-3.5 mr-1" />
                      Debits
                    </>
                  )}
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            {transactions.length > 0 ? (
              transactions.map((t: Transaction) => {
                const isCredit = t.paymentStatus === 'credit';
                const displayType = t.paymentType.charAt(0).toUpperCase() + t.paymentType.slice(1);

                return (
                  <div
                    key={t._id}
                    className="flex items-center justify-between p-5 border rounded-lg hover:shadow-md transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-full ${isCredit ? 'bg-green-100' : 'bg-red-100'}`}>
                        {isCredit ? (
                          <ArrowDownLeft className="h-6 w-6 text-green-600" />
                        ) : (
                          <ArrowUpRight className="h-6 w-6 text-red-600" />
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{displayType}</p>
                        <p className="text-sm text-gray-500">{formatDate(t.date)}</p>
                        <div className="flex gap-2 mt-2">
                          <Badge variant={isCredit ? 'default' : 'destructive'}>
                            {isCredit ? 'Credit' : 'Debit'}
                          </Badge>
                          <Badge variant="outline">{t.currency.toUpperCase()}</Badge>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-xl font-bold ${isCredit ? 'text-green-600' : 'text-red-600'}`}>
                        {isCredit ? '+' : '−'}{formatCurrency(t.amount)}
                      </p>
                      <p className="text-xs text-gray-500">ID: {t._id.slice(-8)}</p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-16">
                <Wallet className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">
                  {filter === 'all' ? 'No transactions yet' : `No ${filter} transactions found`}
                </p>
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8 pt-6 border-t text-center">
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