import { AlertTriangle } from 'lucide-react';
import { Dialog, DialogHeader, DialogTitle, DialogContent, DialogFooter } from './Dialog';
import Button from './Button';

/**
 * Confirmation dialog for destructive actions.
 */
export default function AlertDialog({
  open,
  onOpenChange,
  title = 'Are you sure?',
  description = 'This action cannot be undone.',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  destructive = true,
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogHeader onClose={() => onOpenChange(false)}>
        <DialogTitle className="flex items-center gap-2">
          <AlertTriangle className={`h-5 w-5 ${destructive ? 'text-brand-red' : 'text-amber-500'}`} />
          {title}
        </DialogTitle>
      </DialogHeader>
      <DialogContent>
        <p className="text-sm text-text-gray">{description}</p>
      </DialogContent>
      <DialogFooter>
        <Button variant="outline" onClick={() => onOpenChange(false)}>
          {cancelText}
        </Button>
        <Button
          variant={destructive ? 'destructive' : 'default'}
          onClick={() => {
            onConfirm();
            onOpenChange(false);
          }}
        >
          {confirmText}
        </Button>
      </DialogFooter>
    </Dialog>
  );
}
