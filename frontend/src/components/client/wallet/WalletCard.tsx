import { WalletEntity } from "@/types/WalletEntity";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Wallet, Calendar, DollarSign, IndianRupee, User } from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";

interface WalletCardProps {
  wallet: WalletEntity;
  clientName?: string;
}

export function WalletCard({ wallet, clientName = "Client" }: WalletCardProps) {
  console.log(wallet.balance);
  
  const roundedBalance = (Math.floor(wallet.balance ));
  
  return (
    <Card className="bg-gradient-card shadow-card border-border/50 hover:shadow-golden transition-all duration-300 group">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-card-foreground">
            <div className="p-2 rounded-lg bg-gradient-primary">
              <User className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-lg font-semibold">{clientName}</span>
          </CardTitle>
          <Badge variant="secondary" className="text-xs capitalize">
            {wallet.userModel}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Balance Section */}
        <div className="p-4 rounded-lg bg-gradient-primary/5 border border-primary/10">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-gradient-primary">
              <IndianRupee className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                Available Balance
              </p>
              <p className="text-3xl font-bold text-card-foreground mt-1">
                ₹{roundedBalance}
              </p>
            </div>
          </div>
        </div>

        
      </CardContent>
    </Card>
  );
}