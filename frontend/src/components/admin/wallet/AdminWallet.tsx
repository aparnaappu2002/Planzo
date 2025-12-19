import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"; // ← New: for clean filter
import {
  ChevronLeft,
  ChevronRight,
  Wallet,
  TrendingUp,
  TrendingDown,
  DollarSign,
  ArrowUpRight,
  ArrowDownLeft,
  Calendar,
  ArrowUpCircle,
  ArrowDownCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useFindAdminWallet,useFindTransactionsByPaymentStatus } from "@/hooks/adminCustomHooks";


import Pagination from "@/components/other components/Pagination";
import { Transaction, WalletData } from "@/types/wallet/TransactionType";

type FilterType = "all" | "credit" | "debit";

const AdminWallet = () => {
  const userId = localStorage.getItem('adminId');
  const [currentPage, setCurrentPage] = useState(1);
  const [filter, setFilter] = useState<FilterType>("all");

  // Main wallet data (for balance & stats)
  const { data: walletData, isLoading: loadingWallet } = useFindAdminWallet(userId, 1) as {
    data: WalletData | null;
    isLoading: boolean;
  };

  
  const { 
    data: filteredData, 
    isLoading: loadingTransactions,
    isPreviousData // from keepPreviousData
  } = useFindTransactionsByPaymentStatus(
    filter === "all" ? "credit" : filter, 
    currentPage,
    "newest"
  );

  
  const transactions = filter === "all" 
    ? walletData?.transactions || [] 
    : filteredData?.transactions || [];

  const totalPages = filter === "all"
    ? walletData?.totalPages || 1
    : filteredData?.totalPages || 1;

  const isLoading = loadingWallet || loadingTransactions;

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

  if (isLoading && !isPreviousData) {
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

  if (!walletData?.wallet) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <Card className="p-6 text-center">
          <Wallet className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No wallet found</h3>
          <p className="text-muted-foreground">Unable to load wallet data.</p>
        </Card>
      </div>
    );
  }

  const balance = walletData.wallet.balance;

  const calculateStats = () => {
    const allTxns = walletData?.transactions || [];
    const creditTxns = allTxns.filter(t => t.paymentStatus === 'credit');
    const debitTxns = allTxns.filter(t => t.paymentStatus === 'debit');

    const totalCredits = creditTxns.reduce((sum, t) => sum + t.amount, 0);
    const totalDebits = debitTxns.reduce((sum, t) => sum + t.amount, 0);

    return { totalCredits, totalDebits };
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
            </CardContent>
          </Card>

          <Card style={{ boxShadow: 'var(--shadow-card)' }}>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <ArrowUpCircle className="h-4 w-4 text-success" />
                Total Credits
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">
                {formatCurrency(stats.totalCredits)}
              </div>
            </CardContent>
          </Card>

          <Card style={{ boxShadow: 'var(--shadow-card)' }}>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <ArrowDownCircle className="h-4 w-4 text-destructive" />
                Total Debits
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">
                {formatCurrency(stats.totalDebits)}
              </div>
            </CardContent>
          </Card>

          <Card style={{ boxShadow: 'var(--shadow-card)' }}>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                {balance >= 0 ? <TrendingUp className="h-4 w-4 text-success" /> : <TrendingDown className="h-4 w-4 text-destructive" />}
                Net Balance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={cn("text-2xl font-bold", balance >= 0 ? "text-success" : "text-destructive")}>
                {balance >= 0 ? '+' : ''}{formatCurrency(balance)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filter Tabs + Transactions Table */}
        <Card style={{ boxShadow: 'var(--shadow-card)' }}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Transaction History
              </CardTitle>

              {/* Filter Tabs */}
              <Tabs value={filter} onValueChange={(v) => {
                setFilter(v as FilterType);
                setCurrentPage(1); // Reset to page 1 on filter change
              }}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="all" className="flex items-center gap-2">
                    All
                  </TabsTrigger>
                  <TabsTrigger value="credit" className="flex items-center gap-2">
                    <ArrowUpRight className="h-4 w-4 text-success" />
                    Credits
                  </TabsTrigger>
                  <TabsTrigger value="debit" className="flex items-center gap-2">
                    <ArrowDownLeft className="h-4 w-4 text-destructive" />
                    Debits
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardHeader>

          <CardContent>
            <div className="rounded-lg border border-gray-200 overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50/30">
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">ID</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Type</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Amount</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Payment Type</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.length > 0 ? (
                    transactions.map((t: Transaction) => {
                      const isCredit = t.paymentStatus === 'credit';
                      const displayType = t.paymentType.charAt(0).toUpperCase() + 
                                        t.paymentType.slice(1).replace(/([A-Z])/g, ' $1');

                      return (
                        <tr key={t._id} className="border-t hover:bg-gray-50/20">
                          <td className="px-4 py-3 font-mono text-sm">{t._id.slice(-8)}</td>
                          <td className="px-4 py-3">
                            <Badge variant={isCredit ? "default" : "destructive"}>
                              {isCredit ? "Credit" : "Debit"}
                            </Badge>
                          </td>
                          <td className={cn("px-4 py-3 font-semibold", isCredit ? "text-success" : "text-destructive")}>
                            {isCredit ? "+" : "-"} {formatCurrency(t.amount)}
                          </td>
                          <td className="px-4 py-3">
                            <Badge variant="secondary">{displayType}</Badge>
                          </td>
                          <td className="px-4 py-3 text-sm text-muted-foreground">
                            {t.date ? formatDate(t.date) : "N/A"}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={5} className="text-center py-10 text-muted-foreground">
                        No {filter === "all" ? "" : filter} transactions found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

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