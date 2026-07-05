import React, { useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../../ui/Dialog';
import { Button } from '../../ui/Button';
import { AlertTriangle, Info, ShieldAlert, CheckCircle } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  type?: 'primary' | 'danger' | 'warning' | 'info';
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onOpenChange,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  type = 'primary',
  onConfirm,
  onCancel
}) => {
  // Listen for Enter key to trigger confirm
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        onConfirm();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onConfirm]);

  const getIcon = () => {
    switch (type) {
      case 'danger':
        return <ShieldAlert className="h-6 w-6 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-6 w-6 text-amber-500" />;
      case 'info':
        return <Info className="h-6 w-6 text-sky-500" />;
      case 'primary':
      default:
        return <CheckCircle className="h-6 w-6 text-[#fabd00]" />;
    }
  };

  const getConfirmButtonVariant = () => {
    if (type === 'danger') return 'danger';
    return 'primary';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent showClose={false} className="max-w-md bg-[#0A0A0A] border border-slate-800 text-white p-6 rounded">
        <DialogHeader className="flex flex-row items-start gap-4 space-y-0">
          <div className="p-2 bg-slate-900 rounded-full shrink-0">
            {getIcon()}
          </div>
          <div className="flex-1 space-y-1">
            <DialogTitle className="text-white text-md font-bold leading-normal">{title}</DialogTitle>
            <DialogDescription className="text-slate-400 text-xs leading-relaxed">{description}</DialogDescription>
          </div>
        </DialogHeader>

        <DialogFooter className="mt-6 flex flex-row justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              onCancel();
              onOpenChange(false);
            }}
            className="border-slate-700 hover:bg-slate-900 hover:border-slate-600 text-white text-xs h-10 px-4 rounded font-semibold"
          >
            {cancelLabel}
          </Button>
          <Button
            type="button"
            variant={getConfirmButtonVariant()}
            onClick={() => {
              onConfirm();
              onOpenChange(false);
            }}
            className="text-xs h-10 px-4 rounded font-bold"
          >
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
