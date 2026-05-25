'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description?: string;
  confirmText: string;
  cancelText: string;
  isLoading?: boolean;
  variant?: 'default' | 'danger';
  children?: React.ReactNode;
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText,
  cancelText,
  isLoading = false,
  variant = 'default',
  children,
}: ConfirmModalProps) {
  const handleClose = () => {
    if (!isLoading) {
      onClose();
    }
  };

  const confirmButtonClass = variant === 'danger' 
    ? 'bg-red-500 hover:bg-red-600 text-white'
    : 'bg-orange-500 hover:bg-orange-600 text-white';

  const headerClass = variant === 'danger'
    ? 'bg-gradient-to-r from-red-500 to-rose-500 -mx-4 -mt-6 px-6 pt-6 pb-4 mb-4 rounded-t-xl'
    : 'bg-gradient-to-r from-orange-500 to-red-500 -mx-4 -mt-6 px-6 pt-6 pb-4 mb-4 rounded-t-xl';

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-125 bg-slate-800 border-slate-700" aria-describedby={description ? undefined : 'dialog-description'}>
        <DialogHeader className={headerClass}>
          <DialogTitle className="text-xl text-white">
            {title}
          </DialogTitle>
          <DialogDescription className="text-white/80" id="dialog-description">
            {description || ' '}
          </DialogDescription>
        </DialogHeader>

        {children && (
          <div className="py-4">
            {children}
          </div>
        )}

        <div className="flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isLoading}
            className="border-slate-700 hover:bg-slate-700"
          >
            {cancelText}
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isLoading}
            className={confirmButtonClass}
          >
            {isLoading ? 'Przetwarzanie...' : confirmText}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
