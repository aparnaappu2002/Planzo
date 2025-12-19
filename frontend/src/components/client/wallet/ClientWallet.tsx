import { useState } from "react";
import { useFindWalletClient } from "@/hooks/clientCustomHooks";
import { WalletCard } from "./WalletCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Wallet, History, TrendingUp, TrendingDown, ArrowUpDown } from "lucide-react";
import { RootState } from "@/redux/Store";
import { useSelector } from "react-redux";
import { formatDistanceToNow, format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Pagination from "@/components/other components/Pagination";

import { Transaction } from "@/types/wallet/TransactionType";

import { WalletData } from "@/types/wallet/TransactionType";

export default function ClientWallet() {
  const [pageNo, setPageNo] = useState(1);
  const clientId = useSelector((state: RootState) => state.clientSlice.client?._id);
  const clientName = useSelector((state: RootState) => state.clientSlice.client?.name || "Client");
  
  const { data, isLoading, error } = useFindWalletClient(clientId, pageNo) as {
    data: WalletData | null;
    isLoading: boolean;
    error: any;
  };
  console.log("WalletData:",data)

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 rounded-xl bg-gradient-primary shadow-golden">
              <Wallet className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">{clientName}'s Wallet</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Manage wallet balance and view transaction history
              </p>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="space-y-6">
            <Card className="bg-gradient-card shadow-card border-border/50">
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
              </CardHeader>
              <CardContent className="space-y-3">
                <Skeleton className="h-8 w-1/2" />
                <Skeleton className="h-4 w-full" />
              </CardContent>
            </Card>
            <Card className="bg-gradient-card shadow-card border-border/50">
              <CardContent className="p-6">
                <Skeleton className="h-64 w-full" />
              </CardContent>
            </Card>
          </div>
        )}

        {/* Error State */}
        {error && (
          <Card className="mb-8 bg-destructive/5 border-destructive/20">
            <CardContent className="p-6">
              <p className="text-destructive text-center">
                Error loading wallet. Please try again.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Wallet and Transactions Display */}
        {data && !isLoading && (
          <div className="space-y-6">
            {/* Wallet Information */}
            <WalletCard wallet={data.wallet} clientName={clientName} />

            {/* Transaction History */}
            <Card className="bg-gradient-card shadow-card border-border/50">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-card-foreground">
                  <div className="p-2 rounded-lg bg-gradient-primary">
                    <History className="h-4 w-4 text-primary-foreground" />
                  </div>
                  <span className="text-lg font-semibold">Transaction History</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {data.transactions && data.transactions.length > 0 ? (
                  <>
                    <div className="rounded-lg border border-border/50 overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-muted/50">
                            <TableHead className="font-semibold">Type</TableHead>
                            <TableHead className="font-semibold">Description</TableHead>
                            <TableHead className="font-semibold">Date</TableHead>
                            <TableHead className="font-semibold">Status</TableHead>
                            <TableHead className="text-right font-semibold">Amount</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {data.transactions.map((transaction) => (
                            <TransactionRow key={transaction._id} transaction={transaction} />
                          ))}
                        </TableBody>
                      </Table>
                    </div>

                    {/* Custom Pagination */}
                    {data.totalPages > 1 && (
                      <div className="mt-8 pt-6 border-t border-border/50">
                        <div className="flex flex-col items-center gap-4">
                          <div className="text-sm text-muted-foreground">
                            Page {pageNo} of {data.totalPages} ({data.transactions.length} transactions)
                          </div>
                          <Pagination
                            total={data.totalPages}
                            current={pageNo}
                            setPage={setPageNo}
                          />
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-12">
                    <div className="p-4 rounded-full bg-muted/20 w-fit mx-auto mb-3">
                      <ArrowUpDown className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <p className="text-muted-foreground text-sm">
                      No transactions found
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Not Found State */}
        {!data && !isLoading && !error && clientId && (
          <Card className="bg-gradient-card shadow-card border-border/50 max-w-md mx-auto">
            <CardContent className="p-12 text-center">
              <div className="p-4 rounded-full bg-muted/20 w-fit mx-auto mb-4">
                <Wallet className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Wallet not found
              </h3>
              <p className="text-muted-foreground">
                No wallet was found for this client
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

// Helper function to safely format date
function formatTransactionDate(dateString: string | undefined | null): string {
  if (!dateString) {
    return 'Unknown date';
  }

  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return 'Invalid date';
    }
    return format(date, 'MMM dd, yyyy');
  } catch (error) {
    console.warn('Error formatting date:', dateString, error);
    return 'Invalid date';
  }
}

// Helper function to format relative time
function formatRelativeTime(dateString: string | undefined | null): string {
  if (!dateString) {
    return '';
  }

  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return '';
    }
    return formatDistanceToNow(date, { addSuffix: true });
  } catch (error) {
    return '';
  }
}

// Helper function to format payment type
function formatPaymentType(paymentType: string): string {
  return paymentType
    .split(/[-_]/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

// Transaction Row Component
function TransactionRow({ transaction }: { transaction: Transaction }) {
  const isCredit = transaction.paymentStatus === 'credit';
  const displayDescription = transaction.description || formatPaymentType(transaction.paymentType);
  const roundedAmount = Math.abs(transaction.amount).toFixed(2);

  return (
    <TableRow className="hover:bg-muted/30 transition-colors">
      <TableCell>
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded-lg ${
            isCredit 
              ? 'bg-green-500/10 text-green-600' 
              : 'bg-red-500/10 text-red-600'
          }`}>
            {isCredit ? (
              <TrendingUp className="h-4 w-4" />
            ) : (
              <TrendingDown className="h-4 w-4" />
            )}
          </div>
          <span className="text-sm font-medium capitalize">
            {formatPaymentType(transaction.paymentType)}
          </span>
        </div>
      </TableCell>
      
      <TableCell>
        <div>
          <p className="text-sm font-medium text-card-foreground">
            {displayDescription}
          </p>
          <p className="text-xs text-muted-foreground">
            {formatRelativeTime(transaction.date)}
          </p>
        </div>
      </TableCell>
      
      <TableCell>
        <span className="text-sm text-muted-foreground">
          {formatTransactionDate(transaction.date)}
        </span>
      </TableCell>
      
      <TableCell>
        <Badge 
          variant={isCredit ? 'default' : 'secondary'}
          className="text-xs capitalize"
        >
          {isCredit ? 'Credit' : 'Debit'}
        </Badge>
      </TableCell>
      
      <TableCell className="text-right">
        <div className="flex flex-col items-end gap-1">
          <span className={`text-sm font-semibold ${
            isCredit ? 'text-green-600' : 'text-red-600'
          }`}>
            {isCredit ? '+' : '-'}₹{roundedAmount}
          </span>
          <span className="text-xs text-muted-foreground uppercase">
            {transaction.currency}
          </span>
        </div>
      </TableCell>
    </TableRow>
  );
}