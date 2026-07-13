import { useState } from 'react';
import { toast } from 'sonner';
import { Dialog, DialogHeader, DialogTitle, DialogContent, DialogFooter } from '../ui/Dialog';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import Select from '../ui/Select';
import { INQUIRY_STATUSES } from '../../lib/constants';
import { api } from '../../lib/api-client';
import { formatDate } from '../../lib/utils';

/**
 * Admin inquiry detail modal with status update.
 * @param {boolean} open
 * @param {function} onOpenChange
 * @param {Object|null} inquiry
 * @param {function} onUpdated - Callback after status update
 */
export default function InquiryModal({ open, onOpenChange, inquiry, onUpdated }) {
  const [status, setStatus] = useState(inquiry?.status || 'New');
  const [saving, setSaving] = useState(false);

  if (!inquiry) return null;

  const handleStatusUpdate = async () => {
    setSaving(true);
    try {
      await api.put(`/admin/inquiries/${inquiry.id}`, { status });
      toast.success('Inquiry status updated');
      onUpdated?.();
      onOpenChange(false);
    } catch (err) {
      toast.error(err.message || 'Failed to update status');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogHeader onClose={() => onOpenChange(false)}>
        <DialogTitle>Inquiry Details</DialogTitle>
      </DialogHeader>
      <DialogContent className="space-y-4">
        <div className="grid grid-cols-2 gap-x-4 gap-y-3">
          <div>
            <p className="text-xs font-medium text-text-gray">Customer</p>
            <p className="text-sm font-semibold text-brand-navy">
              {inquiry.customer_name}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-text-gray">Date</p>
            <p className="text-sm text-text-black">
              {formatDate(inquiry.created_at, true)}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-text-gray">Email</p>
            <p className="text-sm text-text-black">{inquiry.email_address}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-text-gray">Phone</p>
            <p className="text-sm text-text-black">{inquiry.phone_number || '-'}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-text-gray">Part No</p>
            <p className="text-sm text-text-black">{inquiry.part_no || '-'}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-text-gray">Part Name</p>
            <p className="text-sm text-text-black">{inquiry.part_name || '-'}</p>
          </div>
        </div>

        {inquiry.message && (
          <div>
            <p className="mb-1 text-xs font-medium text-text-gray">Message</p>
            <p className="rounded-md bg-bg-light p-3 text-sm text-text-black">
              {inquiry.message}
            </p>
          </div>
        )}

        <div>
          <label className="mb-1.5 block text-sm font-medium text-brand-navy">
            Update Status
          </label>
          <Select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            options={INQUIRY_STATUSES.map((s) => ({ value: s, label: s }))}
          />
        </div>
      </DialogContent>
      <DialogFooter>
        <Button variant="outline" onClick={() => onOpenChange(false)}>
          Close
        </Button>
        <Button onClick={handleStatusUpdate} disabled={saving}>
          {saving ? 'Updating...' : 'Update Status'}
        </Button>
      </DialogFooter>
    </Dialog>
  );
}
