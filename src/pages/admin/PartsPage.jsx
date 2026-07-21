import { useState, useEffect } from 'react';
import { Wrench, Plus, Pencil, Trash2, Move } from 'lucide-react';
import { toast } from 'sonner';
import { useApi } from '../../hooks/useApi';
import { api } from '../../lib/api-client';
import PartForm from '../../components/forms/PartForm';
import HotspotEditor from '../../components/forms/HotspotEditor';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { EmptyState } from '../../components/common/Skeleton';
import DiagramViewer from '../../components/common/DiagramViewer';

export default function PartsPage() {
  const { data: harvData } = useApi('/admin/harvesters');
  const [selectedHarvester, setSelectedHarvester] = useState('');
  const [sections, setSections] = useState([]);
  const [selectedSection, setSelectedSection] = useState('');
  const [subsections, setSubsections] = useState([]);
  const [selectedSubsection, setSelectedSubsection] = useState('');
  const [diagram, setDiagram] = useState(null);
  const [parts, setParts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showPartForm, setShowPartForm] = useState(false);
  const [editPart, setEditPart] = useState(null);
  const [newPart, setNewPart] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [hotspotMode, setHotspotMode] = useState(false);
  const [hotspotPart, setHotspotPart] = useState(null);

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

  // Load diagram and parts when section or subsection changes
  useEffect(() => {
    if (!selectedSection) return;
    (async () => {
      setLoading(true);
      try {
        const targetId = selectedSubsection || selectedSection;
        const imgRes = await api.get(`/admin/diagrams?harvester_id=${selectedHarvester}&section_id=${targetId}`);
        const latestDiagram = imgRes.image || imgRes.diagrams?.[0] || null;
        setDiagram(latestDiagram);
        if (latestDiagram) {
          const partsRes = await api.get(`/admin/parts?image_id=${latestDiagram.id}`);
          setParts(partsRes.parts || []);
        } else {
          setParts([]);
        }
      } catch (err) {
        toast.error(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [selectedSection, selectedSubsection, selectedHarvester]);

  const refreshData = async () => {
    if (diagram) {
      try {
        const partsRes = await api.get(`/admin/parts?image_id=${diagram.id}`);
        setParts(partsRes.parts || []);
      } catch (err) {
        toast.error(err.message);
      }
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/admin/parts/${deleteId}`);
      toast.success('Part deleted');
      setDeleteId(null);
      refreshData();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const hotspots = parts.map((p) => ({
    id: p.coordinate?.id || p.id,
    x_coordinate: p.coordinate?.x_coordinate || 0,
    y_coordinate: p.coordinate?.y_coordinate || 0,
    radius: p.coordinate?.radius || 14,
    label: p.serial_no,
    part: p,
  }));

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-oswald text-2xl font-bold text-brand-navy">Parts & Hotspots</h1>
          <p className="mt-1 text-sm text-text-gray">Manage parts and their positions on diagrams</p>
        </div>
        {diagram && (
          <button
            onClick={() => { setEditPart(null); setShowPartForm(true); }}
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-b from-[#1B2870] to-[#172263] px-4 py-2 text-sm font-semibold text-white shadow-button transition-all duration-150 hover:-translate-y-0.5 hover:brightness-110"
          >
            <Plus className="h-4 w-4" />
            Add Part
          </button>
        )}
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        <select value={selectedHarvester} onChange={(e) => setSelectedHarvester(e.target.value)}
          className="h-9 rounded-md border border-border-subtle bg-white px-3 text-sm text-text-black focus:outline-none focus:shadow-input-focus">
          <option value="">Select harvester...</option>
          {harvesters.map((h) => <option key={h.id} value={h.id}>{h.name}</option>)}
        </select>
        {selectedHarvester && (
          <select value={selectedSection} onChange={(e) => setSelectedSection(e.target.value)}
            className="h-9 rounded-md border border-border-subtle bg-white px-3 text-sm text-text-black focus:outline-none focus:shadow-input-focus">
            <option value="">Select section...</option>
            {sections.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        )}
        {selectedSection && subsections.length > 0 && (
          <select value={selectedSubsection} onChange={(e) => setSelectedSubsection(e.target.value)}
            className="h-9 rounded-md border border-border-subtle bg-white px-3 text-sm text-text-black focus:outline-none focus:shadow-input-focus">
            <option value="">Select target...</option>
            <option value="">⭐ Main Section</option>
            {subsections.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        )}
      </div>

      {loading && <p className="mt-4 text-sm text-text-gray">Loading...</p>}

      {!loading && selectedSection && !diagram && (
        <div className="mt-6">
          <EmptyState icon={Wrench} title="No diagram" message="Upload a diagram for this section first." />
        </div>
      )}

      {!loading && diagram && (
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div>
            {hotspotMode && hotspotPart ? (
              <HotspotEditor
                imagePath={diagram.image_path}
                imageId={diagram.id}
                part={hotspotPart}
                existingCoordinate={hotspotPart.coordinate}
                onSaved={() => {
                  setHotspotMode(false);
                  setHotspotPart(null);
                  refreshData();
                }}
                onCancel={() => {
                  setHotspotMode(false);
                  setHotspotPart(null);
                }}
              />
            ) : (
              <DiagramViewer src={diagram.image_path} hotspots={hotspots} className="w-full" interactive />
            )}
          </div>

          <div>
            <h2 className="font-oswald text-lg font-semibold text-brand-navy">Parts ({parts.length})</h2>
            {parts.length === 0 ? (
              <p className="mt-2 text-sm text-text-gray">No parts yet. Add your first part.</p>
            ) : (
              <div className="mt-2 overflow-hidden rounded-lg border border-border-subtle bg-white shadow-card">
                <table className="w-full">
                  <thead className="border-b border-border-subtle bg-bg-light">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-semibold uppercase text-text-gray">#</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold uppercase text-text-gray">Part No</th>
                      <th className="px-3 py-2 text-right text-xs font-semibold uppercase text-text-gray">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-subtle">
                    {parts.map((part, i) => (
                      <tr key={part.id} className="hover:bg-bg-light">
                        <td className="px-3 py-2 text-sm font-medium text-brand-navy">{part.serial_no || i + 1}</td>
                        <td className="px-3 py-2 text-sm font-mono-code text-text-black">{part.part_no}</td>
                        <td className="px-3 py-2">
                          <div className="flex justify-end gap-1.5">
                            <button onClick={() => { 
                              if (part.coordinate?.id) {
                                setHotspotPart(part); 
                                setHotspotMode(true);
                              } else {
                                toast.error('Hotspot coordinate not found');
                              }
                            }}
                              className="rounded-md p-1 text-text-gray hover:text-brand-navy" title="Move hotspot">
                              <Move className="h-3.5 w-3.5" />
                            </button>
                            <button onClick={() => { setEditPart(part); setShowPartForm(true); }}
                              className="rounded-md p-1 text-text-gray hover:text-brand-navy">
                              <Pencil className="h-3.5 w-3.5" />
                            </button>
                            <button onClick={() => setDeleteId(part.id)}
                              className="rounded-md p-1 text-text-gray hover:text-brand-red">
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      <PartForm
        open={showPartForm}
        onOpenChange={(open) => {
          if (!open) setNewPart(null);
          setShowPartForm(open);
        }}
        part={editPart}
        imageId={diagram?.id}
        partsCount={parts.length}
        onSuccess={(createdPartOrData) => {
          if (createdPartOrData && !editPart) {
            // New part - data passed, not created yet
            // Now show hotspot editor to place it with coordinates
            setNewPart(createdPartOrData);
            setHotspotPart(createdPartOrData);
            setHotspotMode(true);
          } else if (editPart) {
            // Part was edited
            setEditPart(null);
            refreshData();
          }
        }}
      />
      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Part"
        message="This will also delete the hotspot for this part."
      />
    </div>
  );
}