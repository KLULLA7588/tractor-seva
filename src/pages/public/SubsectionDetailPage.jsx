import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Wrench, ArrowRight } from 'lucide-react';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import { StepIndicator, Breadcrumb } from '../../components/common/StepIndicator';
import { DiagramSkeleton, EmptyState } from '../../components/common/Skeleton';
import DiagramViewer from '../../components/common/DiagramViewer';
import PartDetailsDrawer from '../../components/common/PartDetailsDrawer';
import InquiryForm from '../../components/forms/InquiryForm';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table';
import Button from '../../components/ui/Button';
import { api } from '../../lib/api-client';

export default function SubsectionDetailPage() {
  const { harvesterId, sectionId, subId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [diagramEntries, setDiagramEntries] = useState([]); // [{ image, parts }]
  const [selectedPart, setSelectedPart] = useState(null);
  const [showDrawer, setShowDrawer] = useState(false);
  const [showInquiryForm, setShowInquiryForm] = useState(false);
  const [section, setSection] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // Load section info
        const secRes = await api.get(`/sections/${sectionId}`);
        setSection(secRes.section);

        // Load all diagrams for this subsection
        const imgRes = await api.get(`/sections/${subId}/diagram`);
        const diagramList =
          imgRes.diagrams && imgRes.diagrams.length > 0
            ? imgRes.diagrams
            : imgRes.image
            ? [imgRes.image]
            : [];

        // Load parts for each diagram
        const entries = [];
        for (const img of diagramList) {
          const partsRes = await api.get(`/diagrams/${img.id}/parts`);
          entries.push({ image: img, parts: partsRes.parts || [] });
        }
        setDiagramEntries(entries);
      } catch (err) {
        console.error('Failed to load data:', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [subId, sectionId]);

  const handleHotspotClick = (hotspot) => {
    setSelectedPart(hotspot.part || hotspot);
    setShowDrawer(true);
  };

  const handleInquiry = (part) => {
    setSelectedPart(part);
    setShowDrawer(false);
    setShowInquiryForm(true);
  };

  const handleViewSubsections = () => {
    navigate(`/harvester/${harvesterId}/section/${sectionId}/subsections`);
  };

  const buildHotspots = (parts) =>
    parts
      .filter((p) => p.coordinate) // skip "extra parts" with no hotspot position
      .map((p) => ({
        id: p.coordinate.id,
        x_coordinate: p.coordinate.x_coordinate,
        y_coordinate: p.coordinate.y_coordinate,
        radius: p.coordinate.radius || 14,
        label: p.serial_no,
        part: p,
      }));

  // Combined parts list across all diagrams, for the Parts table below
  const allParts = diagramEntries.flatMap((e) => e.parts);

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-bg-light">
        <Header />
        <main className="flex-1 w-full bg-bg-light py-8 md:py-12">
          <div className="mx-auto w-full max-w-6xl px-4 md:px-6">
            <DiagramSkeleton />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-bg-light">
      <Header />

      <main className="flex-1 w-full bg-bg-light py-8 md:py-12">
        <div className="mx-auto w-full max-w-6xl px-4 md:px-6">
            {/* Step Indicator */}
            <StepIndicator step="3" label="Identify Part" />

            {/* Breadcrumb */}
            <Breadcrumb
              items={[
                { label: 'Tractor Seva', path: '/' },
                { label: 'Catalog', path: '/catalog' },
                { label: 'Harvester', path: `/harvester/${harvesterId}` },
                { label: section?.name || 'Section', path: `/harvester/${harvesterId}/section/${sectionId}/subsections` },
                { label: 'Detail' },
              ]}
            />

            {/* Header Section */}
            <div className="mt-8 flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="font-oswald text-3xl md:text-4xl font-bold text-text-black">
                  {section?.name}
                </h1>
                <p className="mt-2 text-sm md:text-base text-text-gray">
                  Click a numbered hotspot to view part info
                </p>
              </div>
              <Button
                onClick={handleViewSubsections}
                variant="outline"
                className="mt-4 md:mt-0"
              >
                <span className="flex items-center gap-2">
                  View Sub-parts
                  <ArrowRight className="h-4 w-4" />
                </span>
              </Button>
            </div>

            {/* Diagram Viewer(s) — one per uploaded diagram */}
            <div className="mt-8 space-y-6">
              {diagramEntries.length > 0 ? (
                diagramEntries.map((entry, idx) => (
                  <div key={entry.image.id} className="overflow-hidden rounded-lg border border-border-subtle bg-black shadow-card">
                    {diagramEntries.length > 1 && (
                      <p className="px-4 pt-3 text-sm font-medium text-white">
                        {section?.name}{idx > 0 ? ` ${idx + 1}` : ''}
                      </p>
                    )}
                    <DiagramViewer
                      src={entry.image?.image_path}
                      hotspots={buildHotspots(entry.parts)}
                      onHotspotClick={handleHotspotClick}
                      interactive
                    />
                  </div>
                ))
              ) : (
                <EmptyState
                  icon={Wrench}
                  title="No diagram available"
                  message="This section doesn't have a diagram yet."
                />
              )}
            </div>

            {/* Sub-sections Panel */}
            {section?.subsections && section.subsections.length > 0 && (
              <div className="mt-10">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-oswald text-2xl md:text-3xl font-bold text-text-black">
                    Sub-sections
                  </h2>
                  <button
                    onClick={() => document.getElementById('subsections-panel')?.classList.toggle('hidden')}
                    className="text-sm font-medium text-brand-navy hover:text-brand-navy/70 transition-colors"
                  >
                    Hide
                  </button>
                </div>
                <div id="subsections-panel" className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {section.subsections.map((subsection) => (
                    <button
                      key={subsection.id}
                      onClick={() => navigate(`/harvester/${harvesterId}/section/${sectionId}/${subsection.id}`)}
                      className="group overflow-hidden rounded-lg border border-border-subtle bg-white p-5 shadow-card transition-all duration-200 hover:border-brand-navy hover:shadow-card-hover text-left"
                    >
                      <h3 className="font-oswald text-lg font-semibold text-text-black">
                        {subsection.name}
                      </h3>
                      <div className="mt-3 flex items-center text-sm font-medium text-brand-navy transition-all group-hover:gap-1">
                        View Details
                        <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Parts Section */}
            {allParts.length > 0 && (
              <div className="mt-10">
                <h2 className="font-oswald text-2xl md:text-3xl font-bold text-text-black">
                  Parts
                </h2>
                <div className="mt-6 overflow-hidden rounded-lg border border-border-subtle bg-white shadow-card">
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

            {allParts.length === 0 && (
              <div className="mt-10">
                <EmptyState
                  icon={Wrench}
                  title="No parts available"
                  message="This section doesn't have any parts configured yet."
                />
              </div>
            )}
        </div>
      </main>

      {/* Drawers and Modals */}
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