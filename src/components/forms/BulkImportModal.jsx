import { useState } from 'react';
import { toast } from 'sonner';
import { Dialog, DialogHeader, DialogTitle, DialogContent, DialogFooter } from '../ui/Dialog';
import Button from '../ui/Button';
import { api } from '../../lib/api-client';

const FIELD_OPTIONS = [
  { value: 'ignore', label: 'Ignore this column' },
  { value: 'serial_no', label: 'Serial No' },
  { value: 'part_no', label: 'Part No (required)' },
  { value: 'kubota_part_no', label: 'Kubota Part No' },
  { value: 'description', label: 'Description' },
  { value: 'quantity', label: 'Quantity' },
];

// Guesses a sensible default mapping so the admin usually doesn't have to
// touch the dropdowns — matches the column order seen in the TS master sheet:
// Diagram Ref# | S.No | Category | GAM Part Number | Wubota Part Number | TS Part Number | Description | Qty
function guessMapping(colCount) {
  const guesses = ['serial_no', 'ignore', 'ignore', 'ignore', 'kubota_part_no', 'part_no', 'description', 'quantity'];
  return Array.from({ length: colCount }, (_, i) => guesses[i] || 'ignore');
}

function parseRawText(text) {
  const rawLines = text.split('\n').map((l) => l.replace(/\r$/, '')).filter((l) => l.trim() !== '');

  // Excel sometimes copies a visually word-wrapped row (e.g. "Wrap Text" on
  // a long cell) as two plain-text lines even though it's logically one
  // row. Every real row here starts with a numeric index/serial column, so
  // any line that does NOT start with a number is treated as a continuation
  // of the previous line and glued back on, instead of being read as its
  // own (broken) row.
  const mergedLines = [];
  for (const line of rawLines) {
    const looksLikeNewRow = /^\s*\d/.test(line);
    if (looksLikeNewRow || mergedLines.length === 0) {
      mergedLines.push(line);
    } else {
      mergedLines[mergedLines.length - 1] += '\t' + line;
    }
  }

  const delimiter = mergedLines[0]?.includes('\t') ? '\t' : ',';
  return mergedLines.map((line) => line.split(delimiter).map((cell) => cell.trim()));
}

export default function BulkImportModal({ open, onOpenChange, imageId, onSuccess }) {
  const [step, setStep] = useState(1); // 1 = paste, 2 = map + preview
  const [rawRows, setRawRows] = useState([]);
  const [mapping, setMapping] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const reset = () => {
    setStep(1);
    setRawRows([]);
    setMapping([]);
  };

  const handleClose = () => {
    reset();
    onOpenChange(false);
  };

  const handleParse = (text) => {
    const parsed = parseRawText(text);
    if (parsed.length === 0) {
      toast.error('No rows detected. Paste the data first.');
      return;
    }
    const colCount = Math.max(...parsed.map((r) => r.length));
    setRawRows(parsed);
    setMapping(guessMapping(colCount));
    setStep(2);
  };

  const setColumnField = (colIndex, field) => {
    setMapping((prev) => prev.map((m, i) => (i === colIndex ? field : m)));
  };

  const mappedRows = rawRows.map((row) => {
    const obj = { serial_no: '', part_no: '', kubota_part_no: '', description: '', quantity: '' };
    mapping.forEach((field, i) => {
      if (field !== 'ignore' && row[i] !== undefined) {
        obj[field] = row[i];
      }
    });
    return obj;
  });

  const missingPartNoCount = mappedRows.filter((r) => !r.part_no).length;
  const hasPartNoMapped = mapping.includes('part_no');

  const handleSubmit = async () => {
    if (!hasPartNoMapped) {
      toast.error('You must map one column to "Part No"');
      return;
    }
    setSubmitting(true);
    try {
      const res = await api.post('/admin/parts/bulk', {
        image_id: imageId,
        rows: mappedRows,
      });
      const successCount = (res.created || 0) + (res.linked || 0);
      let message = `${successCount} part(s) added`;
      if (res.created > 0 && res.linked > 0) {
        message += ` (${res.created} new, ${res.linked} already in catalog)`;
      }
      if (res.skipped?.length) {
        message += `, ${res.skipped.length} row(s) skipped`;
      }
      toast.success(message);
      if (res.skipped?.length) {
        console.log('Bulk import — skipped rows:', res.skipped);
      }
      reset();
      onSuccess?.();
    } catch (err) {
      toast.error(err.message || 'Bulk import failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogHeader onClose={handleClose}>
        <DialogTitle>Bulk Upload Parts</DialogTitle>
      </DialogHeader>

      {step === 1 && (
        <>
          <DialogContent className="space-y-3">
            <p className="text-xs text-text-gray">
              Copy rows straight from your Excel sheet (including or excluding a header row) and paste them below.
              Serial No, Kubota Part No, Description, and Quantity are optional — only Part No is required.
            </p>
            <textarea
              id="bulk-paste-area"
              rows={10}
              placeholder="Paste tab-separated rows from Excel here..."
              className="w-full rounded-md border border-border-subtle bg-white px-3 py-2 text-xs font-mono-code text-text-black placeholder:text-text-gray/60 focus:outline-none focus:shadow-input-focus focus:border-brand-navy"
            />
          </DialogContent>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>Cancel</Button>
            <Button
              type="button"
              onClick={() => handleParse(document.getElementById('bulk-paste-area').value)}
            >
              Next: Preview
            </Button>
          </DialogFooter>
        </>
      )}

      {step === 2 && (
        <>
          <DialogContent className="space-y-4">
            <div>
              <p className="mb-2 text-sm font-medium text-brand-navy">Map each column</p>
              <div className="flex flex-wrap gap-2">
                {mapping.map((field, i) => (
                  <select
                    key={i}
                    value={field}
                    onChange={(e) => setColumnField(i, e.target.value)}
                    className="h-8 rounded-md border border-border-subtle bg-white px-2 text-xs text-text-black focus:outline-none focus:shadow-input-focus"
                  >
                    {FIELD_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        Col {i + 1}: {opt.label}
                      </option>
                    ))}
                  </select>
                ))}
              </div>
              {!hasPartNoMapped && (
                <p className="mt-2 text-xs text-brand-red">Map at least one column to "Part No" to continue.</p>
              )}
            </div>

            <div>
              <p className="mb-2 text-sm font-medium text-brand-navy">
                Preview ({mappedRows.length} row{mappedRows.length !== 1 ? 's' : ''}
                {missingPartNoCount > 0 ? `, ${missingPartNoCount} missing Part No — will be skipped` : ''})
              </p>
              <div className="max-h-64 overflow-auto rounded-lg border border-border-subtle">
                <table className="w-full text-xs">
                  <thead className="sticky top-0 border-b border-border-subtle bg-bg-light">
                    <tr>
                      <th className="px-2 py-1.5 text-left font-semibold text-text-gray">Serial No</th>
                      <th className="px-2 py-1.5 text-left font-semibold text-text-gray">Part No</th>
                      <th className="px-2 py-1.5 text-left font-semibold text-text-gray">Kubota Part No</th>
                      <th className="px-2 py-1.5 text-left font-semibold text-text-gray">Description</th>
                      <th className="px-2 py-1.5 text-left font-semibold text-text-gray">Quantity</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-subtle">
                    {mappedRows.slice(0, 50).map((r, i) => (
                      <tr key={i} className={!r.part_no ? 'bg-brand-red/5' : ''}>
                        <td className="px-2 py-1.5 text-text-black">{r.serial_no || '—'}</td>
                        <td className="px-2 py-1.5 font-mono-code text-text-black">{r.part_no || '(missing)'}</td>
                        <td className="px-2 py-1.5 text-text-black">{r.kubota_part_no || '—'}</td>
                        <td className="px-2 py-1.5 text-text-black">{r.description || '—'}</td>
                        <td className="px-2 py-1.5 text-text-black">{r.quantity || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {mappedRows.length > 50 && (
                <p className="mt-1 text-xs text-text-gray">Showing first 50 of {mappedRows.length} rows.</p>
              )}
            </div>
          </DialogContent>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setStep(1)}>Back</Button>
            <Button type="button" onClick={handleSubmit} disabled={submitting || !hasPartNoMapped}>
              {submitting ? 'Importing...' : `Import ${mappedRows.length - missingPartNoCount} Part(s)`}
            </Button>
          </DialogFooter>
        </>
      )}
    </Dialog>
  );
}