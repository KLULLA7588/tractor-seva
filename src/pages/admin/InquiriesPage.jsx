import { useState, useEffect } from 'react';
import { Mail, Trash2, Search } from 'lucide-react';
import { toast } from 'sonner';
import { useApi } from '../../hooks/useApi';
import { api } from '../../lib/api-client';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { EmptyState } from '../../components/common/Skeleton';
import { INQUIRY_STATUSES } from '../../lib/constants';

export default function InquiriesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchTerm), 300);
    return () => clearTimeout(t);
  }, [searchTerm]);

  const params = new URLSearchParams();
  if (statusFilter) params.append('status', statusFilter);
  if (debouncedSearch) params.append('search', debouncedSearch);

  const { data, loading, refetch } = useApi(
    `/admin/inquiries${params.toString() ? '?' + params.toString() : ''}`,
    [debouncedSearch, statusFilter]
  );

  const inquiries = data?.inquiries || [];

  const handleDelete = async () => {
    try {
      await api.delete(`/admin/inquiries/${deleteId}`);
      toast.success('Inquiry deleted');
      setDeleteId(null);
      refetch();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await api.put(`/admin/inquiries/${id}`, { status });
      toast.success('Status updated');
      refetch();
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div>
      <h1 className="font-oswald text-2xl font-bold text-brand-navy">Inquiries</h1>
      <p className="mt-1 text-sm text-text-gray">Manage customer inquiries</p>

      <div className="mt-4 flex flex-wrap gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-gray" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search inquiries..."
            className="h-9 w-64 rounded-md border border-border-subtle bg-white pl-10 pr-3 text-sm text-text-black placeholder:text-text-gray/60 focus:outline-none focus:shadow-input-focus"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-9 rounded-md border border-border-subtle bg-white px-3 text-sm text-text-black focus:outline-none focus:shadow-input-focus"
        >
          <option value="">All statuses</option>
          {INQUIRY_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {loading && <p className="mt-4 text-sm text-text-gray">Loading...</p>}

      {!loading && inquiries.length === 0 && (
        <div className="mt-6">
          <EmptyState icon={Mail} title="No inquiries" message="Customer inquiries will appear here." />
        </div>
      )}

      {!loading && inquiries.length > 0 && (
        <div className="mt-6 overflow-hidden rounded-lg border border-border-subtle bg-white shadow-card">
          <table className="w-full">
            <thead className="border-b border-border-subtle bg-bg-light">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-text-gray">Customer</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-text-gray">Part</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-text-gray">Date</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-text-gray">Status</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-text-gray">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {inquiries.map((inq) => (
                <tr key={inq.id} className="hover:bg-bg-light">
                  <td className="px-4 py-3">
                    <p className="text-sm font-medium text-brand-navy">{inq.customer_name}</p>
                    <p className="text-xs text-text-gray">{inq.email_address}</p>
                    {inq.phone_number && <p className="text-xs text-text-gray">{inq.phone_number}</p>}
                  </td>
                  <td className="px-4 py-3">
                    {inq.part_no && <p className="font-mono-code text-sm text-text-black">{inq.part_no}</p>}
                    {inq.part_name && <p className="text-xs text-text-gray">{inq.part_name}</p>}
                  </td>
                  <td className="px-4 py-3 text-sm text-text-gray">
                    {new Date(inq.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={inq.status}
                      onChange={(e) => handleStatusChange(inq.id, e.target.value)}
                      className="h-7 rounded-md border border-border-subtle bg-white px-2 text-xs focus:outline-none focus:shadow-input-focus"
                    >
                      {INQUIRY_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end">
                      <button onClick={() => setDeleteId(inq.id)}
                        className="rounded-md p-1.5 text-text-gray hover:bg-brand-red/10 hover:text-brand-red">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Inquiry"
        message="Are you sure you want to delete this inquiry?"
      />
    </div>
  );
}
