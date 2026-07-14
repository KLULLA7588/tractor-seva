import AlertDialog from '../ui/AlertDialog';

/**
 * Re-export AlertDialog as ConfirmDialog for semantic clarity.
 */
export default function ConfirmDialog({ open, onClose, ...rest }) {
  return (
    <AlertDialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) onClose?.();
      }}
      {...rest}
    />
  );
}