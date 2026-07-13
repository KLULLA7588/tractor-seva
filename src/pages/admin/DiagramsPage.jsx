import { useState, useEffect } from 'react';
import { Image, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useApi } from '../../hooks/useApi';
import { api } from '../../lib/api-client';
import DiagramUpload from '../../components/forms/DiagramUpload';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { EmptyState } from '../../components/common/Skeleton';
import { imageUrl } from '../../lib/utils';

export default function DiagramsPage() {
  const { data: harvData } = useApi('/admin/harvesters');
  const [selectedHarvester, setSelectedHarvester] = useState('');
  const [sections, setSections] = useState([]);
  const [selectedSection, setSelectedSection] = useState('');
  const [subsections, setSubsections] = useState([]);
  const [selectedSubsection, setSelectedSubsection] = useState('');
  const [diagrams, setDiagrams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const harvesters = harvData?.harvesters || [];

  // Load sections when harvester changes
  useEffect(() => {
    if (!selectedHarvester) return;
    (async () => {
      try {
        const res = await api.get(`/admin/sections?harvester_id=${selectedHarvester}&parent_only=true`);
        setSections(res.sections || []);
        setSelectedSection('');
        setSelectedSubsection('');
        setSubsections([]);
      } catch (err) {
        toast.error(err.message);
      }
    })();
  }, [selectedHarvester]);

  // Load subsections when section changes
  useEffect(() => {
    if (!selectedSection) return;
    (async () => {
      try {
        const res = await api.get(`/admin/sections?harvester_id=${selectedHarvester}&parent_id=${selectedSection}`);
        setSubsections(res.sections || []);
        setSelectedSubsection('');
      } catch (err) {
        toast.error(err.message);
      }
    })();
  }, [selectedSection, selectedHarvester]);

  // Load diagrams when section or subsection changes
  useEffect(() => {
    if (!selectedSection && !selectedSubsection) return;
    (async () => {
      setLoading(true);
      try {
        const targetId = selectedSubsection || selectedSection;
        const res = await api.get(`/admin/diagrams?harvester_id=${selectedHarvester}&section_id=${targetId}`);
        setDiagrams(res.image ? [res.image] : []);
      } catch (err) {
        toast.error(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [selectedSection, selectedSubsection, selectedHarvester]);

  const handleDelete = async () => {
    try {
      await api.delete(`/admin/diagrams/${deleteId}`);
      toast.success('Diagram deleted');
      setDeleteId(null);
      // Reload diagrams
      setLoading(true);
      try {
        const targetId = selectedSubsection || selectedSection;
        const res = await api.get(`/admin/diagrams?harvester_id=${selectedHarvester}&section_id=${targetId}`);
        setDiagrams(res.image ? [res.image] : []);
      } catch (err) {
        toast.error(err.message);
      } finally {
        setLoading(false);
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  // Determine which ID to use for diagram upload
  const targetSectionId = selectedSubsection || selectedSection;

  return (
    <div>
      <h1 className="font-oswald text-2xl font-bold text-brand-navy">Diagrams</h1>
      <p className="mt-1 text-sm text-text-gray">Upload exploded-view diagrams for sections and sub-sections.</p>

      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        <div>
          <label className="mb-2 block text-sm font-medium text-brand-navy">Harvester</label>
          <select
            value={selectedHarvester}
            onChange={(e) => setSelectedHarvester(e.target.value)}
            className="h-9 w-full rounded-md border border-border-subtle bg-white px-3 text-sm text-text-black focus:outline-none focus:shadow-input-focus"
          >
            <option value="">Select harvester...</option>
            {harvesters.map((h) => <option key={h.id} value={h.id}>{h.name}</option>)}
          </select>
        </div>

        {selectedHarvester && (
          <div>
            <label className="mb-2 block text-sm font-medium text-brand-navy">Section</label>
            <select
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
              className="h-9 w-full rounded-md border border-border-subtle bg-white px-3 text-sm text-text-black focus:outline-none focus:shadow-input-focus"
            >
              <option value="">Select section...</option>
              {sections.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
        )}

        {selectedSection && subsections.length > 0 && (
          <div>
            <label className="mb-2 block text-sm font-medium text-brand-navy">Sub-section</label>
            <select
              value={selectedSubsection}
              onChange={(e) => setSelectedSubsection(e.target.value)}
              className="h-9 w-full rounded-md border border-border-subtle bg-white px-3 text-sm text-text-black focus:outline-none focus:shadow-input-focus"
            >
              <option value="">Select target...</option>
              <option value="">⭐ Overview (Main Section)</option>
              {subsections.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
        )}

        {selectedSection && subsections.length === 0 && (
          <div>
            <label className="mb-2 block text-sm font-medium text-brand-navy">Sub-section</label>
            <div className="h-9 rounded-md border border-border-subtle bg-gray-100 px-3 text-sm text-text-gray flex items-center">
              No sub-sections
            </div>
          </div>
        )}
      </div>

      {selectedSection && (
        <div className="mt-6">
          <DiagramUpload sectionId={targetSectionId} onUploaded={() => {
            // Reload diagrams after upload
            (async () => {
              setLoading(true);
              try {
                const res = await api.get(`/admin/diagrams?harvester_id=${selectedHarvester}&section_id=${targetSectionId}`);
                setDiagrams(res.image ? [res.image] : []);
              } catch (err) {
                toast.error(err.message);
              } finally {
                setLoading(false);
              }
            })();
          }} />
        </div>
      )}

      {selectedSection && loading && <p className="mt-4 text-sm text-text-gray">Loading diagrams...</p>}

      {selectedSection && !loading && diagrams.length === 0 && (
        <div className="mt-6">
          <EmptyState icon={Image} title="No diagrams yet" message="Upload a diagram for this section." />
        </div>
      )}

      {selectedSection && !loading && diagrams.length > 0 && (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {diagrams.map((d) => (
            <div key={d.id} className="overflow-hidden rounded-lg border border-border-subtle bg-white shadow-card">
              <div className="aspect-video overflow-hidden bg-bg-light">
                <img src={imageUrl(d.image_path)} alt="Diagram" className="h-full w-full object-contain" />
              </div>
              <div className="flex items-center justify-between p-3">
                <span className="text-xs text-text-gray">{new Date(d.created_at).toLocaleDateString()}</span>
                <button
                  onClick={() => setDeleteId(d.id)}
                  className="rounded-md p-1.5 text-text-gray hover:bg-brand-red/10 hover:text-brand-red"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Diagram"
        message="This will also delete all hotspots and parts associated with this diagram."
      />
    </div>
  );
}