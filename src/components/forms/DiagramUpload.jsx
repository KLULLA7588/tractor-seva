import { useState, useRef } from 'react';
import { Upload, X } from 'lucide-react';
import { toast } from 'sonner';
import Button from '../ui/Button';
import { api } from '../../lib/api-client';
import { FILE_UPLOAD } from '../../lib/constants';
import { imageUrl } from '../../lib/utils';

export default function DiagramUpload({ sectionId, existingPath = null, onUploaded }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(existingPath);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const handleFile = (selectedFile) => {
    if (!selectedFile) return;
    if (!FILE_UPLOAD.allowedTypes.includes(selectedFile.type)) { toast.error('Only JPEG, PNG, and WebP images are allowed'); return; }
    if (selectedFile.size > FILE_UPLOAD.maxSize) { toast.error('File size must be under 10MB'); return; }
    setFile(selectedFile);
    setPreview(URL.createObjectURL(selectedFile));
  };

  const handleDrop = (e) => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]); };

  const handleUpload = async () => {
    if (!file || !sectionId) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('section_id', sectionId);
      formData.append('image', file);
      await api.post('/admin/diagrams', formData);
      toast.success('Diagram uploaded successfully');
      setFile(null);
      onUploaded?.();
    } catch (err) {
      toast.error(err.message || 'Failed to upload diagram');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-3">
      <div
        onClick={() => fileInputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={`flex cursor-pointer items-center justify-center rounded-md border-2 border-dashed px-4 py-8 transition-colors ${dragOver ? 'border-brand-navy bg-brand-navy/5' : 'border-border-subtle bg-bg-light hover:border-brand-navy'}`}
      >
        {preview ? (
          <div className="relative">
            <img src={imageUrl(preview)} alt="Preview" className="max-h-40 rounded-md object-contain" />
            {file && (
              <button type="button" onClick={(e) => { e.stopPropagation(); setFile(null); setPreview(existingPath); }} className="absolute -right-2 -top-2 rounded-full bg-brand-red p-1 text-white shadow">
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
        ) : (
          <div className="text-center">
            <Upload className="mx-auto h-8 w-8 text-text-gray" />
            <p className="mt-1 text-sm text-text-gray">Drag & drop or click to upload</p>
          </div>
        )}
      </div>
      <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => handleFile(e.target.files[0])} className="hidden" />
      {file && (
        <Button onClick={handleUpload} disabled={uploading || !sectionId} className="w-full">
          {uploading ? 'Uploading...' : 'Upload / Replace'}
        </Button>
      )}
    </div>
  );
}
