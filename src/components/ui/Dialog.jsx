import { useEffect } from 'react';
import { X } from 'lucide-react';

/**
 * Dialog / modal component with overlay.
 */
export function Dialog({ open, onOpenChange, children }) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 animate-fade-in"
        onClick={() => onOpenChange(false)}
      />
      <div className="relative z-10 w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-lg bg-white shadow-xl animate-scale-in">
        {children}
      </div>
    </div>
  );
}

export function DialogHeader({ children, onClose }) {
  return (
    <div className="flex items-start justify-between border-b border-border-light px-6 py-4">
      <div className="flex-1">{children}</div>
      {onClose && (
        <button
          onClick={onClose}
          className="ml-4 rounded-md p-1 text-text-gray hover:bg-bg-light hover:text-text-black transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
      )}
    </div>
  );
}

export function DialogTitle({ children }) {
  return (
    <h2 className="font-oswald text-lg font-semibold text-brand-navy">
      {children}
    </h2>
  );
}

export function DialogContent({ children, className = '' }) {
  return <div className={`px-6 py-4 ${className}`}>{children}</div>;
}

export function DialogFooter({ children }) {
  return (
    <div className="flex items-center justify-end gap-3 border-t border-border-light px-6 py-4">
      {children}
    </div>
  );
}

export default Dialog;
