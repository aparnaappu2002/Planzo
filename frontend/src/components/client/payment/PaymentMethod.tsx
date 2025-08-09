import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Wallet, CreditCard, Sparkles } from 'lucide-react';

interface PaymentMethodModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPaymentMethod: (method: 'wallet' | 'stripe') => void;
  ticketPrice?: string;
}

const modalVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 20 },
  visible: { 
    opacity: 1, 
    scale: 1, 
    y: 0,
    transition: { 
      duration: 0.3, 
      ease: [0.4, 0, 0.2, 1] as const,
      staggerChildren: 0.1
    } 
  },
  exit: { 
    opacity: 0, 
    scale: 0.95, 
    y: 20,
    transition: { 
      duration: 0.2, 
      ease: [0.4, 0, 0.6, 1] as const
    } 
  },
};

const optionVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] as const }
  },
  hover: { 
    scale: 1.02, 
    transition: { duration: 0.2 } 
  },
  tap: { scale: 0.98 },
};

const iconVariants = {
  hover: { 
    scale: 1.1, 
    rotate: 5,
    transition: { duration: 0.2, ease: [0.4, 0, 0.2, 1] as const } 
  },
};

const PaymentMethodModal: React.FC<PaymentMethodModalProps> = ({ 
  isOpen, 
  onClose, 
  onSelectPaymentMethod, 
  ticketPrice = "$49.99" 
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
          <DialogContent className="p-0 sm:max-w-[500px] overflow-hidden border-none rounded-xl shadow-2xl bg-card/95 backdrop-blur-sm">
            <motion.div
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <DialogHeader className="p-6 pb-4 text-center relative">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, duration: 0.3 }}
                  className="absolute top-4 right-4"
                >
                  <Sparkles className="w-6 h-6 text-[hsl(var(--ticket-gold))] animate-glow" />
                </motion.div>
                
                <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-[hsl(var(--ticket-gold))] to-[hsl(var(--ticket-premium))] bg-clip-text text-transparent">
                  Complete Your Purchase
                </DialogTitle>
                <DialogDescription className="text-muted-foreground mt-2">
                  Total: <span className="font-semibold text-foreground">{ticketPrice}</span>
                  <br />
                  Choose your preferred payment method to secure your tickets.
                </DialogDescription>
              </DialogHeader>
              
              <div className="px-6 pb-6">
                <motion.div 
                  className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6"
                  variants={modalVariants}
                >
                  <motion.div
                    variants={optionVariants}
                    whileHover="hover"
                    whileTap="tap"
                    className="payment-option group"
                    onClick={() => onSelectPaymentMethod('wallet')}
                  >
                    <motion.div variants={iconVariants} className="flex justify-center mb-3">
                      <Wallet className="w-12 h-12 text-[hsl(var(--ticket-gold))] payment-icon" />
                    </motion.div>
                    <h3 className="text-lg font-semibold text-center mb-2">Wallet Payment</h3>
                    <p className="text-xs text-muted-foreground text-center leading-relaxed">
                      Instant payment using your wallet balance. Fast and secure.
                    </p>
                    <div className="mt-3 text-center">
                      <span className="text-xs px-2 py-1 bg-[hsl(var(--ticket-gold))]/20 text-[hsl(var(--ticket-gold))] rounded-full">
                        Instant
                      </span>
                    </div>
                  </motion.div>

                  <motion.div
                    variants={optionVariants}
                    whileHover="hover"
                    whileTap="tap"
                    className="payment-option group"
                    onClick={() => onSelectPaymentMethod('stripe')}
                  >
                    <motion.div variants={iconVariants} className="flex justify-center mb-3">
                      <CreditCard className="w-12 h-12 text-[hsl(var(--ticket-premium))] payment-icon" />
                    </motion.div>
                    <h3 className="text-lg font-semibold text-center mb-2">Card Payment</h3>
                    <p className="text-xs text-muted-foreground text-center leading-relaxed">
                      Pay securely with your credit or debit card via Stripe.
                    </p>
                    <div className="mt-3 text-center">
                      <span className="text-xs px-2 py-1 bg-[hsl(var(--ticket-premium))]/20 text-[hsl(var(--ticket-premium))] rounded-full">
                        Secure
                      </span>
                    </div>
                  </motion.div>
                </motion.div>

                <motion.div 
                  className="flex justify-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  <DialogClose asChild>
                    <Button 
                      variant="outline" 
                      onClick={onClose} 
                      className="w-full md:w-auto px-8 hover:bg-accent/50 transition-all duration-200"
                    >
                      Cancel
                    </Button>
                  </DialogClose>
                </motion.div>
              </div>
            </motion.div>
          </DialogContent>
        </Dialog>
      )}
    </AnimatePresence>
  );
};

export default PaymentMethodModal;