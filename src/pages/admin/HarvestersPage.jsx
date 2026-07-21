import { useState } from 'react';
import { Tractor, Plus, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useApi } from '../../hooks/useApi';
import { api } from '../../lib/api-client';
import HarvesterForm from '../../components/forms/HarvesterForm';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { CardSkeleton, EmptyState } from '../../components/common/Skeleton';
import { imageUrl } from '../../lib/utils';

export default function HarvestersPage() {
  const { data, loading, refetch } = useApi('/admin/harvesters');
  const [showForm, setShowForm] = useState(false);
  const [editHarvester, setEditHarvester] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  const harvesters = data?.harvesters || [];

 const handleDelete = async () => {
  try {
    await api.delete(`/admin/harvesters/${deleteId}`);
    toast.success('Harvester deleted');
    setDeleteId(null);
    refetch();
  } catch (err) {
    toast.error(err.message);
  }
};
  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-oswald text-2xl font-bold text-brand-navy">Harvesters</h1>
          <p className="mt-1 text-sm text-text-gray">Manage harvester models</p>
        </div>
        <button
          onClick={() => { setEditHarvester(null); setShowForm(true); }}
          className="inline-flex items-center gap-2 rounded-full bg-gradient-to-b from-[#1B2870] to-[#172263] px-4 py-2 text-sm font-semibold text-white shadow-button transition-all duration-150 hover:-translate-y-0.5 hover:brightness-110"
        >
          <Plus className="h-4 w-4" />
          Add Harvester
        </button>
      </div>

      {loading && <CardSkeleton count={3} />}

      {!loading && harvesters.length === 0 && (
        <div className="mt-8">
          <EmptyState icon={Tractor} title="No harvesters yet" message="Add your first harvester model to get started." />
        </div>
      )}

      {!loading && harvesters.length > 0 && (
        <div className="mt-6 overflow-hidden rounded-lg border border-border-subtle bg-white shadow-card">
          <table className="w-full">
            <thead className="border-b border-border-subtle bg-bg-light">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-gray">Name</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-text-gray">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {harvesters.map((h) => (
                <tr key={h.id} className="transition-colors hover:bg-bg-light">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {h.image_url ? (
                        <img src={imageUrl(h.image_url)} alt={h.name} className="h-10 w-10 rounded object-cover" />
                      ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded bg-bg-light">
                          <Tractor className="h-5 w-5 text-text-gray/40" />
                        </div>
                      )}
                      <span className="font-medium text-brand-navy">{h.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => { setEditHarvester(h); setShowForm(true); }}
                        className="rounded-md p-1.5 text-text-gray hover:bg-brand-navy/10 hover:text-brand-navy"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setDeleteId(h.id)}
                        className="rounded-md p-1.5 text-text-gray hover:bg-brand-red/10 hover:text-brand-red"
                      >
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

      <HarvesterForm
        open={showForm}
        onOpenChange={setShowForm}
        harvester={editHarvester}
        onSuccess={refetch}
      />
      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Harvester"
        message="Are you sure? This will also delete all sections, diagrams, and parts for this harvester."
      />
    </div>
  );
}
