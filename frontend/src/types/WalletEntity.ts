

export interface WalletEntity {
    _id?: string;
    walletId: string;
    balance: number;
    createdAt?: Date;
    userId:string;
    userModel: "client" | "vendors"
}
