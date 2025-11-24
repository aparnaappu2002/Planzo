import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ChevronLeft, 
  ChevronRight, 
  Wallet, 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  ArrowUpRight,
  ArrowDownLeft,
  Calendar
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useFindAdminWallet } from "@/hooks/adminCustomHooks";


import Pagination from "@/components/other components/Pagination";


import { Transaction } from "@/types/admin/TransactionType";

import { AdminWalletData } from "@/types/admin/TransactionType";

const AdminWallet = () => {
  const userId = localStorage.getItem('adminId');
  const [currentPage, setCurrentPage] = useState(1);
  const { data, isLoading, error } = useFindAdminWallet(userId, currentPage) as {
    data: AdminWalletData | null;
    isLoading: boolean;
    error: any;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed': 
      case 'success':
      case 'approved': return 'default';
      case 'pending': 
      case 'processing': return 'secondary';
      case 'failed': 
      case 'rejected':
      case 'declined': return 'destructive';
      default: return 'default';
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-2 mb-6">
          <Wallet className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">Admin Wallet</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-3">
                <div className="h-4 bg-muted rounded w-20"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded w-32"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <Card className="p-6 text-center">
          <p className="text-muted-foreground">Failed to load wallet data</p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => window.location.reload()}
          >
            Retry
          </Button>
        </Card>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <Card className="p-6 text-center">
          <Wallet className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">No wallet found</h3>
          <p className="text-muted-foreground">Unable to load wallet data.</p>
        </Card>
      </div>
    );
  }

  const balance = data.wallet.balance;
  const transactions = data.transactions;
  const totalPages = data.totalPages;

  // Calculate stats from transactions using paymentStatus
  const calculateStats = () => {
    const creditTransactions = transactions.filter((t: Transaction) => t.paymentStatus === 'credit');
    const debitTransactions = transactions.filter((t: Transaction) => t.paymentStatus === 'debit');
    
    const totalCredits = creditTransactions.reduce((sum: number, t: Transaction) => sum + t.amount, 0);
    const totalDebits = debitTransactions.reduce((sum: number, t: Transaction) => sum + t.amount, 0);

    const monthlyChange = totalCredits > 0 ? ((totalCredits - totalDebits) / totalCredits * 100) : 0;

    return {
      totalCredits,
      totalDebits,
      monthlyChange: parseFloat(monthlyChange.toFixed(2))
    };
  };

  const stats = calculateStats();

  return (
    <div className="min-h-screen bg-admin-bg p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-r from-primary to-accent rounded-lg">
            <Wallet className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Admin Wallet</h1>
            <p className="text-muted-foreground">Manage transactions and monitor wallet activity</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* ... (all your stat cards remain unchanged) */}
          <Card className="relative overflow-hidden" style={{ boxShadow: 'var(--shadow-card)' }}>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-primary" />
                Current Balance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {formatCurrency(balance)}
              </div>
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-primary/10 to-accent/10 rounded-bl-full"></div>
            </CardContent>
          </Card>

          <Card style={{ boxShadow: 'var(--shadow-card)' }}>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <ArrowUpRight className="h-4 w-4 text-success" />
                Total Credits
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">
                {formatCurrency(stats.totalCredits)}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {transactions.filter(t => t.paymentStatus === 'credit').length} transactions
              </div>
            </CardContent>
          </Card>

          <Card style={{ boxShadow: 'var(--shadow-card)' }}>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <ArrowDownLeft className="h-4 w-4 text-destructive" />
                Total Debits
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">
                {formatCurrency(stats.totalDebits)}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {transactions.filter(t => t.paymentStatus === 'debit').length} transactions
              </div>
            </CardContent>
          </Card>

          <Card style={{ boxShadow: 'var(--shadow-card)' }}>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                {stats.monthlyChange >= 0 ? (
                  <TrendingUp className="h-4 w-4 text-success" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-destructive" />
                )}
                Net Change
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={cn(
                "text-2xl font-bold",
                stats.totalCredits - stats.totalDebits >= 0 ? "text-success" : "text-destructive"
              )}>
                {stats.totalCredits - stats.totalDebits >= 0 ? '+' : ''}
                {formatCurrency(stats.totalCredits - stats.totalDebits)}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {transactions.length} total transactions
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Transactions Table */}
        <Card style={{ boxShadow: 'var(--shadow-card)' }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Recent Transactions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border border-gray-200 overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50/30">
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Transaction ID</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Type</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Amount</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Payment Type</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Date</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Currency</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions?.length > 0 ? (
                    transactions.map((transaction: Transaction) => {
                      const isCredit = transaction.paymentStatus === 'credit';
                      const displayDescription = transaction.paymentType.charAt(0).toUpperCase() + 
                                               transaction.paymentType.slice(1).replace(/([A-Z])/g, ' $1');
                      
                      return (
                        <tr key={transaction._id} className="border-t hover:bg-gray-50/20">
                          <td className="px-4 py-3 font-mono text-sm">
                            {transaction._id.slice(-8)}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              {isCredit ? (
                                <ArrowUpRight className="h-4 w-4 text-green-600" />
                              ) : (
                                <ArrowDownLeft className="h-4 w-4 text-red-600" />
                              )}
                              <Badge 
                                variant={isCredit ? "default" : "destructive"}
                                className="text-xs"
                              >
                                {isCredit ? 'Credit' : 'Debit'}
                              </Badge>
                            </div>
                          </td>
                          <td className={cn(
                            "px-4 py-3 font-semibold",
                            isCredit ? "text-green-600" : "text-red-600"
                          )}>
                            {isCredit ? '+' : '-'}
                            {formatCurrency(transaction.amount)}
                          </td>
                          <td className="px-4 py-3">
                            <Badge variant="secondary" className="text-xs">
                              {displayDescription}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-gray-600">
                            {transaction.date ? formatDate(transaction.date) : 'N/A'}
                          </td>
                          <td className="px-4 py-3">
                            <Badge variant="outline" className="text-xs">
                              {transaction.currency.toUpperCase()}
                            </Badge>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-gray-600">
                        <div className="flex flex-col items-center gap-2">
                          <Wallet className="h-8 w-8 text-gray-400" />
                          <span>No transactions found</span>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* NEW: Custom Pagination Component */}
            {totalPages > 1 && (
              <div className="mt-8">
                <Pagination
                  total={totalPages}
                  current={currentPage}
                  setPage={setCurrentPage}
                />
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminWallet;