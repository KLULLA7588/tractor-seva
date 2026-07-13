import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { Upload, X } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogHeader, DialogTitle, DialogContent, DialogFooter } from '../ui/Dialog';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { api } from '../../lib/api-client';
import { FILE_UPLOAD } from '../../lib/constants';
import { imageUrl } from '../../lib/utils';

export default function HarvesterForm({ open, onOpenChange, harvester = null, onSuccess }) {
  const isEdit = !!harvester;
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(harvester?.image_url || null);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: { name: harvester?.name || '' },
  });

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!FILE_UPLOAD.allowedTypes.includes(file.type)) { toast.error('Only JPEG, PNG, and WebP images are allowed'); return; }
    if (file.size > FILE_UPLOAD.maxSize) { toast.error('File size must be under 10MB'); return; }
    setImageFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('name', data.name);
      if (imageFile) formData.append('image', imageFile);

      if (isEdit) {
        await api.put(`/admin/harvesters/${harvester.id}`, formData);
        toast.success('Harvester updated successfully');
      } else {
        await api.post('/admin/harvesters', formData);
        toast.success('Harvester created successfully');
      }
      reset();
      setImageFile(null);
      setPreview(null);
      onSuccess?.();
      onOpenChange(false);
    } catch (err) {
      toast.error(err.message || 'Failed to save harvester');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    reset({ name: harvester?.name || '' });
    setImageFile(null);
    setPreview(harvester?.image_url || null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogHeader onClose={handleClose}>
        <DialogTitle>{isEdit ? 'Edit Harvester' : 'Add Harvester'}</DialogTitle>
      </DialogHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-brand-navy">Name <span className="text-brand-red">*</span></label>
            <Input {...register('name', { required: 'Name is required' })} placeholder="e.g. Riz X2 Paddy Harvester" error={errors.name?.message} />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-brand-navy">Image {isEdit && '(optional - leave to keep current)'}</label>
            <div onClick={() => fileInputRef.current?.click()} className="flex cursor-pointer items-center justify-center rounded-md border-2 border-dashed border-border-subtle bg-bg-light px-4 py-6 transition-colors hover:border-brand-navy hover:bg-brand-navy/5">
              {preview ? (
                <div className="relative">
                  <img src={imageUrl(preview)} alt="Preview" className="max-h-32 rounded-md object-contain" />
                  <button type="button" onClick={(e) => { e.stopPropagation(); setImageFile(null); setPreview(null); }} className="absolute -right-2 -top-2 rounded-full bg-brand-red p-1 text-white shadow">
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ) : (
                <div className="text-center">
                  <Upload className="mx-auto h-8 w-8 text-text-gray" />
                  <p className="mt-1 text-sm text-text-gray">Click to upload image</p>
                </div>
              )}
            </div>
            <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleFileChange} className="hidden" />
          </div>
        </DialogContent>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={handleClose}>Cancel</Button>
          <Button type="submit" disabled={submitting}>{submitting ? 'Saving...' : isEdit ? 'Update' : 'Create'}</Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
}
