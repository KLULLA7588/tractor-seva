import { motion, AnimatePresence } from 'framer-motion';
import { X, Copy, Plus } from 'lucide-react';
import { toast } from 'sonner';

export default function PartDetailsDrawer({ open, onClose, part, onInquiry }) {
  const handleCopy = (text, label) => {
    navigator.clipboard.writeText(text || '');
    toast.success(`${label} copied`);
  };

  return (
    <AnimatePresence>
      {open && part && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/50"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col bg-white shadow-panel"
          >
            <div className="flex items-center justify-between bg-brand-navy px-5 py-4 text-white">
              <div className="flex items-center gap-3">
                <h2 className="font-mono-code text-base font-medium">{part.part_no}</h2>
                <button
                  onClick={() => handleCopy(part.part_no, 'Part number')}
                  className="rounded-md p-1.5 hover:bg-white/10 transition-colors"
                  title="Copy part number"
                >
                  <Copy className="h-4 w-4" />
                </button>
              </div>
              <button onClick={onClose} className="rounded-md p-1.5 hover:bg-white/10 transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4">
              <DetailRow label="Serial Number" value={part.serial_no} />
              <DetailRow label="Part Number" value={part.part_no} mono copyable onCopy={() => handleCopy(part.part_no, 'Part number')} />
              <DetailRow label="Kubota Part Code" value={part.kubota_part_no} mono copyable onCopy={() => handleCopy(part.kubota_part_no, 'Kubota code')} />
              <DetailRow label="Description" value={part.description} fullWidth />
              <DetailRow label="Quantity" value={part.quantity} />
              <DetailRow label="FM World Code" value={part.fm_code} mono copyable onCopy={() => handleCopy(part.fm_code, 'FM World code')} />
            </div>

            <div className="border-t border-border-light p-4">
              <button
                onClick={() => {
                  onClose();
                  onInquiry?.(part);
                }}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-brand-red px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-red-dark"
              >
                <Plus className="h-4 w-4" />
                Add to Inquiry
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function DetailRow({ label, value, mono = false, fullWidth = false, copyable = false, onCopy }) {
  return (
    <div className={`flex ${fullWidth ? 'flex-col' : 'justify-between'} border-b border-border-light/60 py-3 ${fullWidth ? '' : 'items-center'}`}>
      <span className="text-sm font-medium text-text-gray">{label}</span>
      <div className={`flex items-center gap-2 ${fullWidth ? 'mt-1' : ''}`}>
        <span className={`text-sm ${mono ? 'font-mono-code text-brand-navy' : 'text-text-black'}`}>
          {value || '-'}
        </span>
        {copyable && value && (
          <button onClick={onCopy} className="text-text-gray hover:text-brand-navy transition-colors" title="Copy">
            <Copy className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
