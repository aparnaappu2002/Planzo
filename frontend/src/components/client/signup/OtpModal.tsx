import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

import { Mail } from "lucide-react";

import { toast } from "react-toastify";
interface OtpModalProps {
  isOpen: boolean;
  onClose: () => void;
  email: string;
  data?:any
  createAccount:any;
  resendOtp:any;
  onVerifySuccess: () => void;
}

const OtpModal = ({ isOpen, onClose, email,data,resendOtp,createAccount, onVerifySuccess }: OtpModalProps) => {
  const [otp, setOtp] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [timeLeft,setTimeLeft]=useState<number>(120)
  
  
useEffect(()=>{
  if(!isOpen) return

  let timer:NodeJS.Timeout
  if(timeLeft>0){
    timer=setInterval(()=>{
      setTimeLeft((prevTime)=>{
        if(prevTime<=1){
        
          clearInterval(timer)
          return 0
        }
        return prevTime-1
      })
    },1000)
  }
  return ()=>{
    if(timer) clearInterval(timer)
  }
},[isOpen,timeLeft])

const formatTime=(seconds:number):string=>{
  const mins=Math.floor(seconds/60)
  const secs=seconds%60
  return `${mins}:${secs <10 ? "0" : ""}${secs}`
}


  const handleVerifyOtp = async () => {
    if (otp.length !== 6) {
     toast.error("Please enter a valid otp")
      return;
    }

    setIsVerifying(true);
    
    try {
      
    const response = await createAccount.mutateAsync({
      formdata: {
                email: email,
                ...data
            },
            otpString: otp,
    })
    console.log(response)
      
     
      
        onVerifySuccess();
        onClose();
      
    } catch (error) {
      toast.error('Error in verifying the otp')
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendOtp = async () => {
    setIsResending(true);
    
    try {
      
      const response = await resendOtp();
      console.log('Resend OTP response:', response);
      
      toast.success("OTP resent successfully")
      setTimeLeft(120)
      setOtp("");
    } catch (error) {
      console.error('Resend OTP error:', error);
      
      const errorMessage = "Failed to resend OTP";
      toast.error(errorMessage)
    } finally {
      setIsResending(false);
    }
  };


  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md border-border/50 bg-card/90 backdrop-blur-sm">
        <DialogHeader className="text-center space-y-3">
          <div className="mx-auto w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center">
            <Mail className="h-6 w-6 text-white" />
          </div>
          <DialogTitle className="text-xl font-semibold text-foreground">
            Verify Your Email
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            We've sent a 6-digit verification code to{" "}
            <span className="font-medium text-foreground">{email}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <div className="flex justify-center">
              <InputOTP
                maxLength={6}
                value={otp}
                onChange={(value) => setOtp(value)}
                className="gap-2"
              >
                <InputOTPGroup>
                  <InputOTPSlot 
                    index={0} 
                    className="w-12 h-12 text-lg font-semibold border-2 border-border focus:border-primary transition-colors" 
                  />
                  <InputOTPSlot 
                    index={1} 
                    className="w-12 h-12 text-lg font-semibold border-2 border-border focus:border-primary transition-colors" 
                  />
                  <InputOTPSlot 
                    index={2} 
                    className="w-12 h-12 text-lg font-semibold border-2 border-border focus:border-primary transition-colors" 
                  />
                  <InputOTPSlot 
                    index={3} 
                    className="w-12 h-12 text-lg font-semibold border-2 border-border focus:border-primary transition-colors" 
                  />
                  <InputOTPSlot 
                    index={4} 
                    className="w-12 h-12 text-lg font-semibold border-2 border-border focus:border-primary transition-colors" 
                  />
                  <InputOTPSlot 
                    index={5} 
                    className="w-12 h-12 text-lg font-semibold border-2 border-border focus:border-primary transition-colors" 
                  />
                </InputOTPGroup>
              </InputOTP>
            </div>
            <p className="text-xs text-center text-muted-foreground">
              Enter the 6-digit code sent to your email
            </p>
          </div>

          <div className="space-y-3">
            <Button
              onClick={handleVerifyOtp}
              disabled={otp.length !== 6 || isVerifying}
              className="w-full bg-gradient-primary hover:shadow-glow transition-all duration-300 font-medium"
            >
              {isVerifying ? "Verifying..." : "Verify & Complete Setup"}
            </Button>
              
            <div className="flex flex-col items-center space-y-3 py-2">
              {timeLeft > 0 ? (
                <div className="flex items-center space-x-3 px-4 py-3 bg-muted/50 rounded-lg border border-border/50 backdrop-blur-sm">
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                  <span className="text-sm text-muted-foreground">Resend code in</span>
                  <div className="flex items-center space-x-1 bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
                    <span className="text-sm font-mono font-semibold text-primary">
                      {formatTime(timeLeft)}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="text-center space-y-3">
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-2 h-2 bg-destructive rounded-full"></div>
                    <p className="text-sm text-muted-foreground">
                      Didn't receive the code?
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleResendOtp}
                    disabled={isResending}
                    className="text-primary border-primary/30 hover:bg-primary/5 hover:border-primary/50 disabled:opacity-50 transition-all duration-200 px-6"
                  >
                    {isResending ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                        <span>Sending...</span>
                      </div>
                    ) : (
                      "Resend OTP"
                    )}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OtpModal;