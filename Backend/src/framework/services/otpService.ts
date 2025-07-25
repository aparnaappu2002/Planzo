import { IotpService } from "../../domain/interfaces/serviceInterface/IotpInterface";
import nodecache from 'node-cache'
export class OtpService implements IotpService{
    private cache:nodecache
    constructor(){
        this.cache= new nodecache({stdTTL:300})
    }
    generateOtp(): string {
        return Math.floor(100000 + Math.random() * 900000).toString()
    }
    async storeOtp(email: string, otp: string): Promise<void> {
        this.cache.set(email,otp,300)
    }
    async verifyOtp(email: string, otp: string): Promise<boolean> {
        const storedOtp=this.cache.get(email)
        if(!storedOtp || storedOtp != otp)
        {
            return false
        }
        this.cache.del(email)
        return true
    }
}