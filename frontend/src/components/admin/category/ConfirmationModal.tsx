import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Loader2 } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  isLoading?: boolean;
  confirmText?: string;
  cancelText?: string;
  variant?: 'default' | 'destructive' | 'warning';
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  isLoading = false,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'warning'
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'destructive':
        return {
          iconBg: 'bg-red-100 dark:bg-red-900/20',
          iconColor: 'text-red-600 dark:text-red-400',
          buttonClass: 'bg-red-600 hover:bg-red-700 text-white'
        };
      case 'warning':
        return {
          iconBg: 'bg-yellow-100 dark:bg-yellow-900/20',
          iconColor: 'text-yellow-600 dark:text-yellow-400',
          buttonClass: 'bg-yellow-600 hover:bg-yellow-700 text-white'
        };
      default:
        return {
          iconBg: 'bg-blue-100 dark:bg-blue-900/20',
          iconColor: 'text-blue-600 dark:text-blue-400',
          buttonClass: 'bg-blue-600 hover:bg-blue-700 text-white'
        };
    }
  };

  const styles = getVariantStyles();

  const handleConfirm = () => {
    if (!isLoading) {
      onConfirm();
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <div className={`w-12 h-12 rounded-full ${styles.iconBg} flex items-center justify-center`}>
              <AlertTriangle className={`h-6 w-6 ${styles.iconColor}`} />
            </div>
          </div>
          <div className="space-y-2">
            <DialogTitle className="text-foreground text-lg font-semibold">
              {title}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground text-sm">
              {description}
            </DialogDescription>
          </div>
        </DialogHeader>
        
        <div className="flex gap-3 pt-6">
          <Button 
            type="button" 
            variant="outline" 
            onClick={handleClose} 
            className="flex-1"
            disabled={isLoading}
          >
            {cancelText}
          </Button>
          <Button 
            onClick={handleConfirm}
            disabled={isLoading}
            className={`flex-1 ${styles.buttonClass}`}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              confirmText
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};