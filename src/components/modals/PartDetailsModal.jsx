import { Dialog, DialogHeader, DialogTitle, DialogContent, DialogFooter } from '../ui/Dialog';
import Button from '../ui/Button';
import Badge from '../ui/Badge';

/**
 * Modal showing full part details.
 * @param {boolean} open
 * @param {function} onOpenChange
 * @param {Object|null} part - Part data
 * @param {function} onInquiry - Callback to open inquiry form
 */
export default function PartDetailsModal({ open, onOpenChange, part, onInquiry }) {
  if (!part) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogHeader onClose={() => onOpenChange(false)}>
        <DialogTitle>Part Details</DialogTitle>
      </DialogHeader>
      <DialogContent className="space-y-3">
        <div className="grid grid-cols-2 gap-x-4 gap-y-3">
          <DetailField label="Part No" value={part.part_no} highlight />
          <DetailField label="Serial No" value={part.serial_no} />
          <DetailField label="Kubota Part No" value={part.kubota_part_no} />
          <DetailField label="Quantity" value={part.quantity} />
          <DetailField label="FM Code" value={part.fm_code} />
        </div>
        {part.description && (
          <div>
            <p className="mb-1 text-xs font-medium text-text-gray">Description</p>
            <p className="text-sm text-text-black">{part.description}</p>
          </div>
        )}
      </DialogContent>
      <DialogFooter>
        <Button variant="outline" onClick={() => onOpenChange(false)}>
          Close
        </Button>
        <Button onClick={() => onInquiry?.(part)}>Send Inquiry</Button>
      </DialogFooter>
    </Dialog>
  );
}

function DetailField({ label, value, highlight = false }) {
  return (
    <div>
      <p className="text-xs font-medium text-text-gray">{label}</p>
      <p className={`text-sm ${highlight ? 'font-semibold text-brand-navy' : 'text-text-black'}`}>
        {value || '-'}
      </p>
    </div>
  );
}
