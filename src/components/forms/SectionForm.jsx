import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Dialog, DialogHeader, DialogTitle, DialogContent, DialogFooter } from '../ui/Dialog';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { api } from '../../lib/api-client';

export default function SectionForm({ open, onOpenChange, section = null, harvesterId, parentId = null, onSuccess }) {
  const isEdit = !!section;
  const [submitting, setSubmitting] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: { name: section?.name || '' },
  });

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      if (isEdit) {
        await api.put(`/admin/sections/${section.id}`, { name: data.name });
        toast.success('Section updated successfully');
      } else {
        await api.post('/admin/sections', { name: data.name, harvester_id: harvesterId, parent_id: parentId });
        toast.success('Section created successfully');
      }
      reset();
      onSuccess?.();
      onOpenChange(false);
    } catch (err) {
      toast.error(err.message || 'Failed to save section');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => { reset({ name: section?.name || '' }); onOpenChange(false); };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogHeader onClose={handleClose}>
        <DialogTitle>{isEdit ? 'Edit Section' : parentId ? 'Add Subsection' : 'Add Section'}</DialogTitle>
      </DialogHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          <label className="mb-1.5 block text-sm font-medium text-brand-navy">Name <span className="text-brand-red">*</span></label>
          <Input {...register('name', { required: 'Name is required' })} placeholder="e.g. Cutter Head" error={errors.name?.message} />
        </DialogContent>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={handleClose}>Cancel</Button>
          <Button type="submit" disabled={submitting}>{submitting ? 'Saving...' : isEdit ? 'Update' : 'Create'}</Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
}
