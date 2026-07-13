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
import Button from '../../components/ui/Button';
import { Wrench } from 'lucide-react';
import { api } from '../../lib/api-client';

export default function SectionDetailPage() {
  const { harvesterId, sectionId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [section, setSection] = useState(null);
  const [image, setImage] = useState(null);
  const [parts, setParts] = useState([]);
  const [subsections, setSubsections] = useState([]);
  const [selectedPart, setSelectedPart] = useState(null);
  const [showDrawer, setShowDrawer] = useState(false);
  const [showInquiryForm, setShowInquiryForm] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // Load section details
        const secRes = await api.get(`/sections/${sectionId}?harvester_id=${harvesterId}`);
        setSection(secRes.section);

        // Load diagram for this section
        const imgRes = await api.get(`/diagrams?section_id=${sectionId}`);
        setImage(imgRes.image);

        // Load parts (hotspots) for this diagram
        if (imgRes.image) {
          const partsRes = await api.get(`/diagrams/${imgRes.image.id}/parts`);
          setParts(partsRes.parts || []);
        }

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

  const hotspots = parts.map((p) => ({
    id: p.coordinate?.id || p.id,
    x_coordinate: p.coordinate?.x_coordinate || 0,
    y_coordinate: p.coordinate?.y_coordinate || 0,
    label: p.serial_no,
    part: p,
  }));

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-light">
        <Header />
        <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
          <DiagramSkeleton />
        </div>
      </div>
    );
  }

  if (!section) {
    return (
      <div className="min-h-screen bg-bg-light">
        <Header />
        <div className="mx-auto max-w-7xl px-4 py-8 md:px-6 text-center">
          <p className="text-text-gray">Section not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-light">
      <Header />

      <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
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
          <h1 className="font-oswald text-3xl font-bold text-brand-navy">
            {section.name}
          </h1>
          {subsections.length > 0 && (
            <Button
              onClick={() => navigate(`/harvester/${harvesterId}/section/${sectionId}/subsections`)}
              variant="outline"
              className="inline-flex items-center gap-2"
            >
              View Sub-parts
              <ChevronDown className="h-4 w-4" />
            </Button>
          )}
        </div>

        <p className="mt-2 text-text-gray">Click a numbered hotspot to view part info</p>

        <div className="mt-8">
          {image ? (
            <DiagramViewer
              src={image?.image_path}
              hotspots={hotspots}
              onHotspotClick={handleHotspotClick}
              interactive
            />
          ) : (
            <EmptyState
              icon={Wrench}
              title="No diagram available"
              message="This section doesn't have a diagram yet."
            />
          )}
        </div>

        {parts.length > 0 && (
          <p className="mt-4 text-sm text-text-gray">
            {parts.length} part{parts.length > 1 ? 's' : ''} on this diagram
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