import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layers, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import { StepIndicator, Breadcrumb, SectionIconBadge } from '../../components/common/StepIndicator';
import { DiagramSkeleton, EmptyState } from '../../components/common/Skeleton';
import { api } from '../../lib/api-client';
import { imageUrl } from '../../lib/utils';

export default function HarvesterDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [harvester, setHarvester] = useState(null);
  const [sections, setSections] = useState([]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const hRes = await api.get(`/harvesters/${id}`);
        setHarvester(hRes.harvester);
        // Load only parent sections (main sections, not subsections)
        const sRes = await api.get(`/admin/sections?harvester_id=${id}&parent_only=true`);
        setSections(sRes.sections || []);
      } catch (err) {
        console.error('Failed to load harvester:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleSectionClick = (sectionId) => {
    navigate(`/harvester/${id}/section/${sectionId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-bg-light">
        <Header />
        <main className="flex-1">
          <div className="w-full bg-bg-light py-8 md:py-12">
            <div className="mx-auto w-full max-w-6xl px-4 md:px-6">
              <DiagramSkeleton />
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!harvester) {
    return (
      <div className="min-h-screen flex flex-col bg-bg-light">
        <Header />
        <main className="flex-1">
          <div className="w-full bg-bg-light py-8 md:py-12">
            <div className="mx-auto w-full max-w-6xl px-4 text-center md:px-6">
              <p className="text-text-gray">Harvester not found</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-bg-light">
      <Header />

      <main className="flex-1">
        <div className="w-full bg-bg-light py-8 md:py-12">
          <div className="mx-auto w-full max-w-6xl px-4 md:px-6">
            {/* Step Indicator */}
            <StepIndicator step="2" label="Select Section" />

            {/* Breadcrumb */}
            <Breadcrumb
              items={[
                { label: 'Tractor Seva', path: '/' },
                { label: 'Catalog', path: '/catalog' },
                { label: harvester?.name || 'Harvester' },
              ]}
            />

            {/* Title and Description */}
            <div className="mt-8">
              <h1 className="font-oswald text-3xl md:text-4xl font-bold text-text-black">
                {harvester?.name}
              </h1>
              <p className="mt-3 text-sm md:text-base text-text-gray max-w-2xl">
                Select a section to open its exploded diagram and identify spare parts.
              </p>
            </div>

            {/* Sections Title */}
            <div className="mt-10 md:mt-12">
              <h2 className="font-oswald text-2xl md:text-3xl font-bold text-text-black">
                Sections
              </h2>
            </div>

            {/* Sections Grid */}
            {sections.length === 0 ? (
              <div className="mt-10">
                <EmptyState
                  icon={Layers}
                  title="No sections available"
                  message="This harvester doesn't have any sections configured yet."
                />
              </div>
            ) : (
              <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {sections.map((section, index) => (
                  <motion.button
                    key={section.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ y: -4 }}
                    onClick={() => handleSectionClick(section.id)}
                    className="group relative overflow-hidden rounded-lg border border-border-subtle bg-white p-6 shadow-card transition-all duration-200 hover:border-brand-navy hover:shadow-card-hover active:scale-95 text-left"
                  >
                    {/* Icon Badge */}
                    <div className="mb-5 flex items-center justify-center w-12 h-12 rounded-lg bg-brand-navy/10">
                      <SectionIconBadge name={section.name} size="md" />
                    </div>

                    {/* Section Name */}
                    <h3 className="font-oswald text-lg md:text-xl font-semibold text-text-black">
                      {section.name}
                    </h3>

                    {/* Description */}
                    {section.description && (
                      <p className="mt-2 line-clamp-2 text-sm text-text-gray leading-relaxed">
                        {section.description}
                      </p>
                    )}

                    {/* CTA */}
                    <div className="mt-4 flex items-center text-sm font-medium text-brand-navy transition-all group-hover:gap-1">
                      View Details
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </div>
                  </motion.button>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}