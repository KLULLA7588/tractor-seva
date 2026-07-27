import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import { StepIndicator, Breadcrumb } from '../../components/common/StepIndicator';
import { DiagramSkeleton, EmptyState } from '../../components/common/Skeleton';
import DiagramViewer from '../../components/common/DiagramViewer';
import PartDetailsDrawer from '../../components/common/PartDetailsDrawer';
import InquiryForm from '../../components/forms/InquiryForm';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table';
import Button from '../../components/ui/Button';
import { Wrench } from 'lucide-react';
import { api } from '../../lib/api-client';

export default function SectionDetailPage() {
  const { harvesterId, sectionId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [section, setSection] = useState(null);
  const [diagramEntries, setDiagramEntries] = useState([]); // [{ image, parts }]
  const [noDiagramParts, setNoDiagramParts] = useState([]); // parts linked directly to the section, no diagram yet
  const [subsections, setSubsections] = useState([]);
  const [selectedPart, setSelectedPart] = useState(null);
  const [showDrawer, setShowDrawer] = useState(false);
  const [showInquiryForm, setShowInquiryForm] = useState(false);
  const [viewMode, setViewMode] = useState('combined'); // 'separate' | 'combined'
  const [activeDiagramIndex, setActiveDiagramIndex] = useState(0);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // Load section details
        const secRes = await api.get(`/sections/${sectionId}?harvester_id=${harvesterId}`);
        setSection(secRes.section);

        // Load all diagrams for this section
        const imgRes = await api.get(`/diagrams?section_id=${sectionId}`);
        const diagramList =
          imgRes.diagrams && imgRes.diagrams.length > 0
            ? imgRes.diagrams
            : imgRes.image
            ? [imgRes.image]
            : [];

        // Load parts (hotspots) for each diagram
        const entries = [];
        for (const img of diagramList) {
          const partsRes = await api.get(`/diagrams/${img.id}/parts`);
          entries.push({ image: img, parts: partsRes.parts || [] });
        }
        setDiagramEntries(entries);
        setActiveDiagramIndex(0);

        // Load parts linked directly to this section (no diagram uploaded yet for them)
        const noDiagramRes = await api.get(`/sections/${sectionId}/parts-no-diagram`);
        setNoDiagramParts(noDiagramRes.parts || []);

        // Load subsections
        const subRes = await api.get(`/sections?harvester_id=${harvesterId}&parent_id=${sectionId}`);
        setSubsections(subRes.sections || []);
      } catch (err) {
        console.error('Failed to load section:', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [sectionId]);

  const handleHotspotClick = (hotspot) => {
    setSelectedPart(hotspot.part || hotspot);
    setShowDrawer(true);
  };

  const handleInquiry = (part) => {
    setSelectedPart(part);
    setShowDrawer(false);
    setShowInquiryForm(true);
  };

  const buildHotspots = (parts) =>
  parts
    .filter((p) => p.coordinate && p.coordinate.x_coordinate !== null && p.coordinate.y_coordinate !== null) // skip "extra parts" with no hotspot position
    .map((p) => ({
      id: p.coordinate.id,
      x_coordinate: p.coordinate.x_coordinate,
      y_coordinate: p.coordinate.y_coordinate,
      radius: p.coordinate.radius || 14,
      label: p.serial_no,
      part: p,
    }));

  // Combined parts list: everything linked to a diagram, plus anything
  // linked directly to the section with no diagram yet. De-duped by id in
  // case a part somehow appears in both (shouldn't normally happen, but
  // this keeps the table safe either way).
  const diagramLinkedParts = diagramEntries.flatMap((e) => e.parts);
  const seenIds = new Set(diagramLinkedParts.map((p) => p.id));
  const allParts = [...diagramLinkedParts, ...noDiagramParts.filter((p) => !seenIds.has(p.id))];
  const totalParts = allParts.length;

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-light">
        <Header />
        <div className="mx-auto max-w-7xl px-4 py-10 md:px-6">
          <DiagramSkeleton />
        </div>
      </div>
    );
  }

  if (!section) {
    return (
      <div className="min-h-screen bg-bg-light">
        <Header />
        <div className="mx-auto max-w-7xl px-4 py-10 md:px-6 text-center">
          <p className="text-text-gray">Section not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-light">
      <Header />

      <div className="w-full bg-gradient-to-b from-brand-navy-50 to-bg-light pb-4 pt-8 md:pt-10">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <StepIndicator step="3" label="Identify Part" />
          <Breadcrumb
            items={[
              { label: 'Tractor Seva', path: '/' },
              { label: 'Catalog', path: '/catalog' },
              { label: 'Harvester', path: `/harvester/${harvesterId}` },
              { label: section.name },
            ]}
          />

          <div className="mt-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-brand-navy/50">
                Step Three
              </p>
              <h1 className="mt-1 font-oswald text-3xl md:text-4xl font-bold text-text-black">
                {section.name}
              </h1>
              <p className="mt-2 text-text-gray">Click a numbered hotspot to view part info</p>
            </div>
            {subsections.length > 0 && (
              <Button
                onClick={() => navigate(`/harvester/${harvesterId}/section/${sectionId}/subsections`)}
                variant="outline"
                className="inline-flex items-center gap-2 self-start md:self-auto"
              >
                View Sub-parts
                <ChevronDown className="h-4 w-4" />
              </Button>
            )}
          </div>

          {diagramEntries.length > 1 && (
            <div className="mt-6 inline-flex rounded-full bg-white p-1 shadow-card">
              <button
                onClick={() => setViewMode('separate')}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                  viewMode === 'separate' ? 'bg-brand-navy text-white' : 'text-text-gray hover:text-brand-navy'
                }`}
              >
                Separate
              </button>
              <button
                onClick={() => setViewMode('combined')}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                  viewMode === 'combined' ? 'bg-brand-navy text-white' : 'text-text-gray hover:text-brand-navy'
                }`}
              >
                Combined
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
        <div>
          {diagramEntries.length === 0 && allParts.length === 0 ? (
            <EmptyState
              icon={Wrench}
              title="No diagram available"
              message="This section doesn't have a diagram yet."
            />
          ) : diagramEntries.length === 0 ? null : viewMode === 'separate' && diagramEntries.length > 1 ? (
            <div>
              <div className="mb-4 flex flex-wrap gap-2">
                {diagramEntries.map((entry, idx) => (
                  <button
                    key={entry.image.id}
                    onClick={() => setActiveDiagramIndex(idx)}
                    className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                      activeDiagramIndex === idx
                        ? 'bg-brand-navy text-white shadow-button'
                        : 'bg-white text-text-gray shadow-card hover:text-brand-navy'
                    }`}
                  >
                    {section.name}{idx > 0 ? ` ${idx + 1}` : ''}
                  </button>
                ))}
              </div>
              <div className="overflow-hidden rounded-2xl shadow-panel">
                <DiagramViewer
                  src={diagramEntries[activeDiagramIndex]?.image?.image_path}
                  hotspots={buildHotspots(diagramEntries[activeDiagramIndex]?.parts || [])}
                  onHotspotClick={handleHotspotClick}
                  interactive
                />
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              {diagramEntries.map((entry, idx) => (
                <div key={entry.image.id}>
                  {diagramEntries.length > 1 && (
                    <p className="mb-2 text-sm font-medium text-brand-navy">
                      {section.name}{idx > 0 ? ` ${idx + 1}` : ''}
                    </p>
                  )}
                  <div className="overflow-hidden rounded-2xl shadow-panel">
                    <DiagramViewer
                      src={entry.image?.image_path}
                      hotspots={buildHotspots(entry.parts)}
                      onHotspotClick={handleHotspotClick}
                      interactive
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Parts table — includes diagram-linked parts and parts with no diagram yet */}
        {allParts.length > 0 && (
          <div className="mt-12">
            <h2 className="font-oswald text-2xl md:text-3xl font-bold text-text-black">
              Parts
            </h2>
            <div className="mt-6 overflow-hidden rounded-2xl bg-white shadow-card">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>#</TableHead>
                    <TableHead>Serial No</TableHead>
                    <TableHead>Part No</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Qty</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allParts.map((part, index) => (
                    <TableRow key={part.id}>
                      <TableCell className="font-medium text-brand-navy">
                        {index + 1}
                      </TableCell>
                      <TableCell className="font-mono-code text-text-black">
                        {part.serial_no || '-'}
                      </TableCell>
                      <TableCell className="font-mono-code font-medium text-brand-navy">
                        {part.part_no}
                      </TableCell>
                      <TableCell className="max-w-xs truncate text-text-gray">
                        {part.description || '-'}
                      </TableCell>
                      <TableCell>{part.quantity}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedPart(part);
                              setShowDrawer(true);
                            }}
                          >
                            Details
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleInquiry(part)}
                          >
                            Inquire
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        {totalParts > 0 && (
          <p className="mt-4 text-sm text-text-gray">
            {totalParts} part{totalParts > 1 ? 's' : ''} total
          </p>
        )}
      </div>

      <PartDetailsDrawer
        open={showDrawer}
        onClose={() => setShowDrawer(false)}
        part={selectedPart}
        onInquiry={handleInquiry}
      />
      <InquiryForm
        open={showInquiryForm}
        onOpenChange={setShowInquiryForm}
        part={selectedPart}
      />
      <Footer />
    </div>
  );
}