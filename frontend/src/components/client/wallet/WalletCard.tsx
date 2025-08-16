import { WalletEntity } from "@/types/wallet";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Wallet, Calendar, DollarSign,IndianRupee } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface WalletCardProps {
  wallet: WalletEntity;
}

export function WalletCard({ wallet }: WalletCardProps) {
    console.log(wallet)
  return (
    <Card className="bg-gradient-card shadow-card border-border/50 hover:shadow-golden transition-all duration-300 group">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-card-foreground">
            <div className="p-2 rounded-lg bg-gradient-primary">
              <Wallet className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-lg font-semibold">{wallet.walletId}</span>
          </CardTitle>
          <Badge variant="secondary" className="text-xs">
            {wallet.userModel}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-accent/10">
            <IndianRupee className="h-4 w-4 text-accent" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Balance</p>
            <p className="text-2xl font-bold text-card-foreground">
              ₹{wallet.balance}
            </p>
          </div>
        </div>
        
        
      </CardContent>
    </Card>
  );
}