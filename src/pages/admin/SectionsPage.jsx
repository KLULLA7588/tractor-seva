import { useState, useEffect } from 'react';
import { Layers, Plus, Pencil, Trash2, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { useApi } from '../../hooks/useApi';
import { api } from '../../lib/api-client';
import SectionForm from '../../components/forms/SectionForm';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { EmptyState } from '../../components/common/Skeleton';
import { SectionIconBadge } from '../../components/common/StepIndicator';

export default function SectionsPage() {
  const { data: harvData, loading: harvLoading } = useApi('/admin/harvesters');
  const [selectedHarvester, setSelectedHarvester] = useState('');
  const [sections, setSections] = useState([]);
  const [sectionsLoading, setSectionsLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editSection, setEditSection] = useState(null);
  const [parentId, setParentId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  const harvesters = harvData?.harvesters || [];

  useEffect(() => {
    if (selectedHarvester) loadSections();
  }, [selectedHarvester]);

  const loadSections = async () => {
    setSectionsLoading(true);
    try {
      const res = await api.get(`/admin/sections?harvester_id=${selectedHarvester}&parent_only=false`);
      setSections(res.sections || []);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSectionsLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/admin/sections/${deleteId}`);
      toast.success('Section deleted');
      setDeleteId(null);
      loadSections();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const topLevel = sections.filter((s) => !s.parent_id);
  const subsByParent = sections
    .filter((s) => s.parent_id)
    .reduce((acc, s) => {
      if (!acc[s.parent_id]) acc[s.parent_id] = [];
      acc[s.parent_id].push(s);
      return acc;
    }, {});

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-oswald text-2xl font-bold text-brand-navy">Sections</h1>
          <p className="mt-1 text-sm text-text-gray">Manage sections and subsections</p>
        </div>
        {selectedHarvester && (
          <button
            onClick={() => { setEditSection(null); setParentId(null); setShowForm(true); }}
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-b from-[#1B2870] to-[#172263] px-4 py-2 text-sm font-semibold text-white shadow-button transition-all duration-150 hover:-translate-y-0.5 hover:brightness-110"
          >
            <Plus className="h-4 w-4" />
            Add Section
          </button>
        )}
      </div>

      <div className="mt-4">
        <select
          value={selectedHarvester}
          onChange={(e) => setSelectedHarvester(e.target.value)}
          className="h-9 rounded-md border border-border-subtle bg-white px-3 text-sm text-text-black focus:outline-none focus:shadow-input-focus focus:border-brand-navy"
        >
          <option value="">Select a harvester...</option>
          {harvesters.map((h) => (
            <option key={h.id} value={h.id}>{h.name}</option>
          ))}
        </select>
      </div>

      {harvLoading && <p className="mt-4 text-sm text-text-gray">Loading...</p>}

      {!harvLoading && selectedHarvester && sectionsLoading && (
        <p className="mt-4 text-sm text-text-gray">Loading sections...</p>
      )}

      {!harvLoading && selectedHarvester && !sectionsLoading && topLevel.length === 0 && (
        <div className="mt-8">
          <EmptyState icon={Layers} title="No sections yet" message="Add your first section to get started." />
        </div>
      )}

      {!harvLoading && selectedHarvester && !sectionsLoading && topLevel.length > 0 && (
        <div className="mt-6 space-y-3">
          {topLevel.map((section) => (
            <div key={section.id} className="rounded-lg border border-border-subtle bg-white shadow-card">
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <SectionIconBadge name={section.name} size="sm" />
                  <span className="font-medium text-brand-navy">{section.name}</span>
                  {subsByParent[section.id]?.length > 0 && (
                    <span className="rounded-full bg-bg-light px-2 py-0.5 text-xs text-text-gray">
                      {subsByParent[section.id].length} subsections
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => { setEditSection(null); setParentId(section.id); setShowForm(true); }}
                    className="rounded-md p-1.5 text-text-gray hover:bg-brand-navy/10 hover:text-brand-navy"
                    title="Add subsection"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => { setEditSection(section); setParentId(null); setShowForm(true); }}
                    className="rounded-md p-1.5 text-text-gray hover:bg-brand-navy/10 hover:text-brand-navy"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setDeleteId(section.id)}
                    className="rounded-md p-1.5 text-text-gray hover:bg-brand-red/10 hover:text-brand-red"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              {subsByParent[section.id]?.length > 0 && (
                <div className="border-t border-border-subtle bg-bg-light px-4 py-2">
                  {subsByParent[section.id].map((sub) => (
                    <div key={sub.id} className="flex items-center justify-between py-2">
                      <div className="flex items-center gap-2 pl-4">
                        <ChevronRight className="h-3 w-3 text-text-gray" />
                        <span className="text-sm text-text-black">{sub.name}</span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => { setEditSection(sub); setParentId(null); setShowForm(true); }}
                          className="rounded-md p-1 text-text-gray hover:text-brand-navy"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteId(sub.id)}
                          className="rounded-md p-1 text-text-gray hover:text-brand-red"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <SectionForm
        open={showForm}
        onOpenChange={setShowForm}
        section={editSection}
        harvesterId={selectedHarvester}
        parentId={parentId}
        onSuccess={loadSections}
      />
      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Section"
        message="Are you sure? This will also delete all subsections, diagrams, and parts."
      />
    </div>
  );
}
