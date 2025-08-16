import { useState } from "react";
import { useFindWalletClient } from "@/hooks/clientCustomHooks";
import { WalletCard } from "./WalletCard";

import { Button } from "@/components/ui/button";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {  Wallet, History, TrendingUp, TrendingDown, ArrowUpDown } from "lucide-react";
import { RootState } from "@/redux/Store";
import { useSelector } from "react-redux";
import { formatDistanceToNow } from "date-fns";

// Transaction interface updated to match your actual data structure
interface Transaction {
  _id: string;
  amount: number;
  currency: string;
  paymentStatus: 'credit' | 'debit'; // Updated to match actual data
  paymentType: string; // Added to match actual data
  walletId: string; // Added to match actual data
  date: string;
  description?: string; // Made optional since it might not always be present
  status?: string;
  reference?: string;
}

interface WalletData {
  message: string;
  wallet: {
    _id: string;
    walletId: string;
    userId: string;
    userModel: string;
    balance: number;
    createdAt: string;
    updatedAt: string;
  };
  transactions: Transaction[];
  totalPages: number;
}

export default function ClientWallet() {
  
  const [pageNo, setPageNo] = useState(1);
  const clientId = useSelector((state: RootState) => state.clientSlice.client?._id);
  const { data, isLoading, error } = useFindWalletClient(clientId, pageNo) as {
    data: WalletData | null;
    isLoading: boolean;
    error: any;
  };
  console.log(data)

  const handleNextPage = () => {
    if (data && pageNo < data.totalPages) {
      setPageNo(prev => prev + 1);
    }
  };

  const handlePrevPage = () => {
    if (pageNo > 1) {
      setPageNo(prev => prev - 1);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 rounded-xl bg-gradient-primary shadow-golden">
              <Wallet className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Client Wallet</h1>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-gradient-card shadow-card border-border/50">
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
              </CardHeader>
              <CardContent className="space-y-3">
                <Skeleton className="h-8 w-1/2" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
            </Card>
            <Card className="bg-gradient-card shadow-card border-border/50">
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
              </CardHeader>
              <CardContent className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Wallet Information */}
            <div>
              <WalletCard wallet={data.wallet} />
            </div>

            {/* Transaction History */}
            <div>
              <Card className="bg-gradient-card shadow-card border-border/50">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-card-foreground">
                      <div className="p-2 rounded-lg bg-gradient-primary">
                        <History className="h-4 w-4 text-primary-foreground" />
                      </div>
                      <span className="text-lg font-semibold">Recent Transactions</span>
                    </CardTitle>
                    <Badge variant="outline" className="text-xs">
                      Page {pageNo} of {data.totalPages}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {data.transactions && data.transactions.length > 0 ? (
                    <>
                      {data.transactions.map((transaction) => (
                        <TransactionItem key={transaction._id} transaction={transaction} />
                      ))}
                      
                      {/* Pagination Controls */}
                      {data.totalPages > 1 && (
                        <div className="flex items-center justify-between pt-4 border-t border-border/50">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handlePrevPage}
                            disabled={pageNo === 1}
                            className="text-xs"
                          >
                            Previous
                          </Button>
                          <span className="text-xs text-muted-foreground">
                            Page {pageNo} of {data.totalPages}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleNextPage}
                            disabled={pageNo === data.totalPages}
                            className="text-xs"
                          >
                            Next
                          </Button>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-center py-8">
                      <div className="p-4 rounded-full bg-muted/20 w-fit mx-auto mb-3">
                        <ArrowUpDown className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <p className="text-muted-foreground text-sm">
                        No transactions found
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
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
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return 'Invalid date';
    }
    return formatDistanceToNow(date, { addSuffix: true });
  } catch (error) {
    console.warn('Error formatting date:', dateString, error);
    return 'Invalid date';
  }
}

// Transaction Item Component - Fixed to use paymentStatus instead of type
function TransactionItem({ transaction }: { transaction: Transaction }) {
  const isCredit = transaction.paymentStatus === 'credit'; // Fixed: using paymentStatus instead of type
  
  // Create a display description from paymentType or use description
  const displayDescription = transaction.description || 
    transaction.paymentType.charAt(0).toUpperCase() + transaction.paymentType.slice(1);
  
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg border border-border/50 bg-card/50 hover:bg-card/80 transition-colors">
      <div className={`p-2 rounded-lg ${
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
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-card-foreground truncate">
            {displayDescription}
          </p>
          <p className={`text-sm font-semibold ${
            isCredit ? 'text-green-600' : 'text-red-600'
          }`}>
            {isCredit ? '+' : '-'}₹{Math.abs(transaction.amount)}
          </p>
        </div>
        
        <div className="flex items-center justify-between mt-1">
          <p className="text-xs text-muted-foreground">
            {formatTransactionDate(transaction.date)}
          </p>
          
          {/* Show payment type as status badge */}
          <Badge 
            variant={isCredit ? 'default' : 'secondary'}
            className="text-xs"
          >
            {transaction.paymentType}
          </Badge>
        </div>
        
        {/* Show currency info */}
        <p className="text-xs text-muted-foreground mt-1">
          Currency: {transaction.currency.toUpperCase()}
        </p>
      </div>
    </div>
  );
}