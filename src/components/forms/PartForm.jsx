import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Dialog, DialogHeader, DialogTitle, DialogContent, DialogFooter } from '../ui/Dialog';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { api } from '../../lib/api-client';

export default function PartForm({ open, onOpenChange, part = null, imageId = null, partsCount = 0, onSuccess }) {
  const isEdit = !!part;
  const [submitting, setSubmitting] = useState(false);
  const nextSerial = partsCount + 1;

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: {
      serial_no: part?.serial_no || (imageId ? String(nextSerial) : ''),
      part_no: part?.part_no || '',
      kubota_part_no: part?.kubota_part_no || '',
      description: part?.description || '',
      quantity: part?.quantity || 1,
      fm_code: part?.fm_code || '',
    },
  });

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      if (isEdit) {
        // Only for EDIT: update existing part
        const payload = {
          serial_no: data.serial_no || null,
          part_no: data.part_no,
          kubota_part_no: data.kubota_part_no || null,
          description: data.description || null,
          quantity: parseInt(data.quantity, 10) || 1,
          fm_code: data.fm_code || null,
        };
        await api.put(`/admin/parts/${part.id}`, payload);
        toast.success('Part updated successfully');
        onSuccess?.();
      } else {
        // For NEW part: just pass data to parent, don't create yet
        // HotspotEditor will create with coordinates
        const partData = {
          serial_no: data.serial_no || String(nextSerial),
          part_no: data.part_no,
          kubota_part_no: data.kubota_part_no || null,
          description: data.description || null,
          quantity: parseInt(data.quantity, 10) || 1,
          fm_code: data.fm_code || null,
        };
        toast.success('Part details saved. Now place it on the diagram.');
        onSuccess?.(partData); // Pass data, not created part
      }
      reset();
      onOpenChange(false);
    } catch (err) {
      toast.error(err.message || 'Failed to save part');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    reset({
      serial_no: part?.serial_no || '',
      part_no: part?.part_no || '',
      kubota_part_no: part?.kubota_part_no || '',
      description: part?.description || '',
      quantity: part?.quantity || 1,
      fm_code: part?.fm_code || '',
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogHeader onClose={handleClose}>
        <DialogTitle>{isEdit ? 'Edit Part' : 'Add Part'}</DialogTitle>
      </DialogHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-brand-navy">Serial No</label>
              <Input {...register('serial_no')} placeholder="e.g. 1" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-brand-navy">Part No <span className="text-brand-red">*</span></label>
              <Input {...register('part_no', { required: 'Part number is required' })} placeholder="e.g. 220.1.0.1" error={errors.part_no?.message} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-brand-navy">Kubota Part No</label>
              <Input {...register('kubota_part_no')} placeholder="e.g. KBT-123" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-brand-navy">Quantity</label>
              <Input type="number" {...register('quantity')} placeholder="1" min="1" />
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-brand-navy">Description</label>
            <textarea {...register('description')} placeholder="Part description" rows={3}
              className="w-full rounded-md border border-border-subtle bg-white px-3 py-2 text-sm text-text-black placeholder:text-text-gray/60 focus:outline-none focus:shadow-input-focus focus:border-brand-navy" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-brand-navy">FM Code</label>
            <Input {...register('fm_code')} placeholder="e.g. FM-001" />
          </div>
        </DialogContent>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={handleClose}>Cancel</Button>
          <Button type="submit" disabled={submitting}>{submitting ? 'Saving...' : isEdit ? 'Update' : 'Next (Place on Diagram)'}</Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
}