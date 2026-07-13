import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Dialog, DialogHeader, DialogTitle, DialogContent, DialogFooter } from '../ui/Dialog';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { api } from '../../lib/api-client';

export default function InquiryForm({ open, onOpenChange, part = null, onSuccess }) {
  const [submitting, setSubmitting] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: { customer_name: '', phone_number: '', email_address: '', message: '' },
  });

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      await api.post('/inquiries', {
        part_id: part?.id || null,
        part_name: part?.description || null,
        part_no: part?.part_no || null,
        customer_name: data.customer_name,
        phone_number: data.phone_number,
        email_address: data.email_address,
        message: data.message,
      });
      toast.success('Inquiry submitted successfully!');
      reset();
      onSuccess?.();
      onOpenChange(false);
    } catch (err) {
      toast.error(err.message || 'Failed to submit inquiry');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => { reset(); onOpenChange(false); };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogHeader onClose={handleClose}>
        <DialogTitle>Send Inquiry</DialogTitle>
      </DialogHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent className="space-y-4">
          {part && (
            <div className="rounded-md bg-bg-light p-3">
              <p className="text-xs font-medium text-text-gray">Part</p>
              <p className="text-sm font-semibold text-brand-navy">{part.part_no}</p>
              {part.description && <p className="mt-0.5 text-xs text-text-gray">{part.description}</p>}
            </div>
          )}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-brand-navy">Name <span className="text-brand-red">*</span></label>
            <Input {...register('customer_name', { required: 'Name is required' })} placeholder="Your full name" error={errors.customer_name?.message} />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-brand-navy">Phone</label>
              <Input {...register('phone_number', { pattern: { value: /^[0-9+\-\s]{10,15}$/, message: 'Enter a valid phone number' } })} placeholder="9876543210" error={errors.phone_number?.message} />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-brand-navy">Email <span className="text-brand-red">*</span></label>
              <Input type="email" {...register('email_address', { required: 'Email is required', pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Enter a valid email' } })} placeholder="you@example.com" error={errors.email_address?.message} />
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-brand-navy">Message</label>
            <textarea {...register('message')} placeholder="Describe what you need..." rows={4}
              className="w-full rounded-md border border-border-subtle bg-white px-3 py-2 text-sm text-text-black placeholder:text-text-gray/60 focus:outline-none focus:shadow-input-focus focus:border-brand-navy" />
          </div>
        </DialogContent>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={handleClose}>Cancel</Button>
          <Button type="submit" disabled={submitting}>{submitting ? 'Submitting...' : 'Submit Inquiry'}</Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
}
