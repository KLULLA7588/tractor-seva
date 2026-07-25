import { useState, useEffect, useMemo } from 'react';
import { Wrench, Plus, Pencil, Trash2, Move, Upload, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import { useApi } from '../../hooks/useApi';
import { api } from '../../lib/api-client';
import PartForm from '../../components/forms/PartForm';
import BulkImportModal from '../../components/forms/BulkImportModal';
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
  const [diagrams, setDiagrams] = useState([]);
  const [selectedDiagramIndex, setSelectedDiagramIndex] = useState(0);
  const [diagram, setDiagram] = useState(null);
  const [parts, setParts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showPartForm, setShowPartForm] = useState(false);
  const [showBulkImport, setShowBulkImport] = useState(false);
  const [editPart, setEditPart] = useState(null);
  const [newPart, setNewPart] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [deleteAllMode, setDeleteAllMode] = useState(false);
  const [hotspotMode, setHotspotMode] = useState(false);
  const [hotspotPart, setHotspotPart] = useState(null);
  const [extraMode, setExtraMode] = useState(false); // true = "Add Extra Part" flow

  // --- NEW: Separate / Combined view mode (mirrors public SectionDetailPage/SubsectionDetailPage) ---
  const [viewMode, setViewMode] = useState('separate'); // 'separate' | 'combined'
  const [diagramPartsMap, setDiagramPartsMap] = useState({}); // { [diagramId]: parts[] } — cache per diagram, used to build the merged list

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
    if (!selectedSection) return;
    (async () => {
      setLoading(true);
      try {
        const targetId = selectedSubsection || selectedSection;
        const imgRes = await api.get(`/admin/diagrams?harvester_id=${selectedHarvester}&section_id=${targetId}`);
        const diagramList =
          imgRes.diagrams && imgRes.diagrams.length > 0
            ? imgRes.diagrams
            : imgRes.image
            ? [imgRes.image]
            : [];
        setDiagrams(diagramList);
        setSelectedDiagramIndex(0);
        // NEW: reset view mode + parts cache whenever we move to a different section/subsection
        setViewMode('separate');
        setDiagramPartsMap({});
        const activeDiagram = diagramList[0] || null;
        setDiagram(activeDiagram);
        if (activeDiagram) {
          const partsRes = await api.get(`/admin/parts?image_id=${activeDiagram.id}`);
          const fetchedParts = partsRes.parts || [];
          setParts(fetchedParts);
          setDiagramPartsMap((prev) => ({ ...prev, [activeDiagram.id]: fetchedParts })); // NEW
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

  // When admin switches which diagram is active (only relevant if multiple diagrams exist)
  useEffect(() => {
    if (diagrams.length === 0) return;
    const activeDiagram = diagrams[selectedDiagramIndex] || diagrams[0];
    setDiagram(activeDiagram);
    (async () => {
      if (!activeDiagram) {
        setParts([]);
        return;
      }
      try {
        const partsRes = await api.get(`/admin/parts?image_id=${activeDiagram.id}`);
        const fetchedParts = partsRes.parts || [];
        setParts(fetchedParts);
        setDiagramPartsMap((prev) => ({ ...prev, [activeDiagram.id]: fetchedParts })); // NEW
      } catch (err) {
        toast.error(err.message);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDiagramIndex]);

  // NEW: when Combined mode is selected, make sure every diagram in this section has its parts loaded
  // (the effects above only ever fetch the *active* diagram's parts, so on first switch to Combined
  // any diagram the admin hasn't visited yet would be missing from the merged list otherwise).
  useEffect(() => {
    if (viewMode !== 'combined' || diagrams.length === 0) return;
    const missing = diagrams.filter((d) => !(d.id in diagramPartsMap));
    if (missing.length === 0) return;
    (async () => {
      try {
        const results = await Promise.all(
          missing.map((d) => api.get(`/admin/parts?image_id=${d.id}`))
        );
        setDiagramPartsMap((prev) => {
          const next = { ...prev };
          missing.forEach((d, i) => {
            next[d.id] = results[i].parts || [];
          });
          return next;
        });
      } catch (err) {
        toast.error(err.message);
      }
    })();
  }, [viewMode, diagrams, diagramPartsMap]);

  const refreshData = async () => {
    if (diagram) {
      try {
        const partsRes = await api.get(`/admin/parts?image_id=${diagram.id}`);
        const fetchedParts = partsRes.parts || [];
        setParts(fetchedParts);
        setDiagramPartsMap((prev) => ({ ...prev, [diagram.id]: fetchedParts })); // NEW
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

  const handleDeleteAll = async () => {
    try {
      const res = await api.delete(`/admin/parts?image_id=${diagram.id}`);
      toast.success(`Deleted ${res.deleted} part(s)`);
      setDeleteAllMode(false);
      refreshData();
    } catch (err) {
      toast.error(err.message);
    }
  };

  // Only parts that actually have a hotspot position get rendered as a dot on the diagram.
  // Extra parts (coordinate === null) are simply skipped here — everything else unchanged.
  // NOTE: this always reflects the ACTIVE diagram (via `parts`), in both Separate and Combined mode —
  // the diagram viewer only ever shows dots for the diagram that's currently on screen.
  const hotspots = parts
    .filter((p) => p.coordinate?.x_coordinate != null && p.coordinate?.y_coordinate != null)
    .map((p) => ({
      id: p.coordinate.id,
      x_coordinate: p.coordinate.x_coordinate,
      y_coordinate: p.coordinate.y_coordinate,
      radius: p.coordinate.radius,
      label: p.serial_no,
      part: p,
    }));

  // NEW: merged, de-duplicated parts list across every diagram in this section (Combined mode only)
  const combinedParts = useMemo(() => {
    const seen = new Map();
    diagrams.forEach((d) => {
      const list = diagramPartsMap[d.id] || [];
      list.forEach((p) => {
        if (!seen.has(p.id)) seen.set(p.id, p);
      });
    });
    return Array.from(seen.values());
  }, [diagrams, diagramPartsMap]);

  // NEW: which list drives the table on screen
  const displayedParts = viewMode === 'combined' ? combinedParts : parts;

  // NEW: for a part in the merged Combined list, is it already placed on the diagram currently shown?
  const isPlacedOnActiveDiagram = (part) => {
    if (!diagram) return false;
    const activeList = diagramPartsMap[diagram.id] || [];
    const match = activeList.find((p) => p.id === part.id);
    return !!(match && match.coordinate?.x_coordinate != null && match.coordinate?.y_coordinate != null);
  };

  // Label for the currently selected subsection/section, used to name multiple diagrams
  const currentTargetName =
    subsections.find((s) => s.id === selectedSubsection)?.name ||
    sections.find((s) => s.id === selectedSection)?.name ||
    'Diagram';

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-oswald text-2xl font-bold text-brand-navy">Parts & Hotspots</h1>
          <p className="mt-1 text-sm text-text-gray">Manage parts and their positions on diagrams</p>
        </div>
        {diagram && (
          <div className="flex gap-2">
            <button
              onClick={() => { setEditPart(null); setExtraMode(false); setShowPartForm(true); }}
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-b from-[#1B2870] to-[#172263] px-4 py-2 text-sm font-semibold text-white shadow-button transition-all duration-150 hover:-translate-y-0.5 hover:brightness-110"
            >
              <Plus className="h-4 w-4" />
              Add Part
            </button>
            <button
              onClick={() => { setEditPart(null); setExtraMode(true); setShowPartForm(true); }}
              className="inline-flex items-center gap-2 rounded-full border border-brand-navy px-4 py-2 text-sm font-semibold text-brand-navy transition-all duration-150 hover:bg-bg-light"
              title="Add a part that has no hotspot on the diagram"
            >
              <Plus className="h-4 w-4" />
              Add Extra Part
            </button>
            <button
              onClick={() => setShowBulkImport(true)}
              className="inline-flex items-center gap-2 rounded-full border border-brand-navy px-4 py-2 text-sm font-semibold text-brand-navy transition-all duration-150 hover:bg-bg-light"
              title="Paste spreadsheet data to add many parts at once"
            >
              <Upload className="h-4 w-4" />
              Bulk Upload
            </button>
          </div>
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

      {/* NEW: Separate/Combined toggle — only shown when this section/subsection has more than one diagram */}
      {!loading && diagrams.length > 1 && !hotspotMode && (
        <div className="mt-4 inline-flex rounded-md border border-border-subtle bg-white p-1">
          <button
            onClick={() => setViewMode('separate')}
            className={`rounded px-4 py-1.5 text-sm font-medium transition-colors ${
              viewMode === 'separate' ? 'bg-brand-navy text-white' : 'text-text-gray hover:text-brand-navy'
            }`}
          >
            Separate
          </button>
          <button
            onClick={() => setViewMode('combined')}
            className={`rounded px-4 py-1.5 text-sm font-medium transition-colors ${
              viewMode === 'combined' ? 'bg-brand-navy text-white' : 'text-text-gray hover:text-brand-navy'
            }`}
          >
            Combined
          </button>
        </div>
      )}

      {/* Diagram selector — only shown in Separate mode. In Combined mode the stacked diagram
          images themselves are clickable to set which one is "active" for placing hotspots. */}
      {!loading && diagrams.length > 1 && !hotspotMode && viewMode === 'separate' && (
        <div className="mt-4 flex flex-wrap gap-2">
          {diagrams.map((d, idx) => (
            <button
              key={d.id}
              onClick={() => setSelectedDiagramIndex(idx)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                idx === selectedDiagramIndex
                  ? 'bg-brand-navy text-white'
                  : 'bg-bg-light text-text-gray hover:bg-border-subtle'
              }`}
            >
              {currentTargetName}{idx > 0 ? ` ${idx + 1}` : ''}
            </button>
          ))}
        </div>
      )}

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
              // Editing always targets the single active diagram, in either view mode.
              <HotspotEditor
                imagePath={diagram.image_path}
                imageId={diagram.id}
                part={hotspotPart}
                existingCoordinate={hotspotPart.coordinate}
                coordinateId={hotspotPart.coordinate_id}
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
            ) : viewMode === 'combined' && diagrams.length > 1 ? (
              // NEW: Combined mode shows every diagram in this section stacked, each with its own
              // hotspots. Click a diagram to make it "active" (highlighted) — that's the one
              // new placements from the table on the right will land on.
              <div className="space-y-4">
                {diagrams.map((d, idx) => {
                  const dParts = diagramPartsMap[d.id] || [];
                  const dHotspots = dParts
                    .filter((p) => p.coordinate?.x_coordinate != null && p.coordinate?.y_coordinate != null)
                    .map((p) => ({
                      id: p.coordinate.id,
                      x_coordinate: p.coordinate.x_coordinate,
                      y_coordinate: p.coordinate.y_coordinate,
                      radius: p.coordinate.radius,
                      label: p.serial_no,
                      part: p,
                    }));
                  const isActive = idx === selectedDiagramIndex;
                  return (
                    <div
                      key={d.id}
                      onClick={() => setSelectedDiagramIndex(idx)}
                      className={`cursor-pointer rounded-lg border-2 transition-colors ${
                        isActive ? 'border-brand-navy' : 'border-transparent hover:border-border-subtle'
                      }`}
                    >
                      <div className="flex items-center justify-between px-1 pb-1">
                        <p className={`text-xs font-medium ${isActive ? 'text-brand-navy' : 'text-text-gray'}`}>
                          {currentTargetName}{idx > 0 ? ` ${idx + 1}` : ''}
                        </p>
                        {isActive && (
                          <span className="text-xs font-medium text-brand-navy">Placing here</span>
                        )}
                      </div>
                      <DiagramViewer src={d.image_path} hotspots={dHotspots} className="w-full" interactive />
                    </div>
                  );
                })}
              </div>
            ) : (
              <DiagramViewer src={diagram.image_path} hotspots={hotspots} className="w-full" interactive />
            )}
          </div>

          <div>
            <div className="flex items-center justify-between">
              <h2 className="font-oswald text-lg font-semibold text-brand-navy">
                Parts ({displayedParts.length})
                {viewMode === 'combined' && (
                  <span className="ml-2 align-middle text-xs font-normal text-text-gray">
                    across all diagrams — placing targets {currentTargetName}{selectedDiagramIndex > 0 ? ` ${selectedDiagramIndex + 1}` : ''}
                  </span>
                )}
              </h2>
              {viewMode === 'separate' && parts.length > 0 && (
                <button
                  onClick={() => setDeleteAllMode(true)}
                  className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-brand-red hover:bg-brand-red/10"
                  title="Delete all parts on this diagram"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete All
                </button>
              )}
            </div>
            {displayedParts.length === 0 ? (
              <p className="mt-2 text-sm text-text-gray">No parts yet. Add your first part.</p>
            ) : (
              <div className="mt-2 overflow-hidden rounded-lg border border-border-subtle bg-white shadow-card">
                <table className="w-full">
                  <thead className="border-b border-border-subtle bg-bg-light">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-semibold uppercase text-text-gray">#</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold uppercase text-text-gray">Part No</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold uppercase text-text-gray">Type</th>
                      <th className="px-3 py-2 text-right text-xs font-semibold uppercase text-text-gray">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-subtle">
                    {displayedParts.map((part, i) => {
                      // In Separate mode this is identical to before. In Combined mode, "placed" is
                      // evaluated against whichever diagram tab is currently active, since the same
                      // part can have a hotspot on one diagram and not another.
                      const placedOnActive = viewMode === 'combined'
                        ? isPlacedOnActiveDiagram(part)
                        : !!part.coordinate?.id;

                      return (
                        <tr key={part.id} className="hover:bg-bg-light">
                          <td className="px-3 py-2 text-sm font-medium text-brand-navy">{part.serial_no || i + 1}</td>
                          <td className="px-3 py-2 text-sm font-mono-code text-text-black">{part.part_no}</td>
                          <td className="px-3 py-2 text-xs text-text-gray">
                            {placedOnActive
                              ? 'Hotspot'
                              : viewMode === 'combined'
                              ? 'Not placed here'
                              : part.serial_no && part.coordinate_id
                              ? 'Hotspot (unplaced)'
                              : 'Extra (no hotspot)'}
                          </td>
                          <td className="px-3 py-2">
                            <div className="flex justify-end gap-1.5">
                              {placedOnActive ? (
                                <button
                                  onClick={() => {
                                    const activePartRecord = viewMode === 'combined'
                                      ? (diagramPartsMap[diagram.id] || []).find((p) => p.id === part.id) || part
                                      : part;
                                    setHotspotPart(activePartRecord);
                                    setHotspotMode(true);
                                  }}
                                  className="rounded-md p-1 text-text-gray hover:text-brand-navy" title="Move hotspot">
                                  <Move className="h-3.5 w-3.5" />
                                </button>
                              ) : viewMode === 'combined' ? (
                                <button
                                  onClick={() => {
                                    // Place this existing part onto the currently active diagram —
                                    // no existing coordinate on THIS diagram yet, so HotspotEditor creates a new one.
                                    setHotspotPart({ ...part, coordinate: null, coordinate_id: null });
                                    setHotspotMode(true);
                                  }}
                                  className="rounded-md p-1 text-text-gray hover:text-brand-navy" title="Place on this diagram">
                                  <MapPin className="h-3.5 w-3.5" />
                                </button>
                              ) : part.serial_no && part.coordinate_id ? (
                                <button onClick={() => { setHotspotPart(part); setHotspotMode(true); }}
                                  className="rounded-md p-1 text-text-gray hover:text-brand-navy" title="Place on diagram">
                                  <MapPin className="h-3.5 w-3.5" />
                                </button>
                              ) : null}
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
                      );
                    })}
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
          if (!open) {
            setNewPart(null);
            setExtraMode(false);
          }
          setShowPartForm(open);
        }}
        part={editPart}
        imageId={diagram?.id}
        partsCount={parts.length}
        extraMode={extraMode}
        onSuccess={(createdPartOrData, alreadyCreated) => {
          if (alreadyCreated) {
            // Extra part — already saved via API, no hotspot step needed.
            setExtraMode(false);
            refreshData();
          } else if (createdPartOrData && !editPart) {
            // New part with hotspot — data passed, not created yet.
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
      <BulkImportModal
        open={showBulkImport}
        onOpenChange={setShowBulkImport}
        imageId={diagram?.id}
        onSuccess={() => {
          setShowBulkImport(false);
          refreshData();
        }}
      />
      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Part"
        message="This will also delete the hotspot for this part (if it has one)."
      />
      <ConfirmDialog
        open={deleteAllMode}
        onClose={() => setDeleteAllMode(false)}
        onConfirm={handleDeleteAll}
        title="Delete All Parts"
        message={`This will permanently delete all ${parts.length} part(s) on this diagram, including their hotspots. This cannot be undone.`}
      />
    </div>
  );
}