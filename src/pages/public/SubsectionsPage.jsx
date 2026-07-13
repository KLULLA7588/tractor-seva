import { Link, useParams } from 'react-router-dom';
import { Layers, ArrowRight } from 'lucide-react';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import { StepIndicator, Breadcrumb, SectionIconBadge } from '../../components/common/StepIndicator';
import { RowListSkeleton, EmptyState } from '../../components/common/Skeleton';
import { useApi } from '../../hooks/useApi';

export default function SubsectionsPage() {
  const { harvesterId, sectionId } = useParams();
  const { data, loading, error } = useApi(`/sections/${sectionId}/subsections`);

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
            { label: 'Subsections' },
          ]}
        />

        <h1 className="mt-3 font-oswald text-3xl font-bold text-brand-navy">
          Subsections
        </h1>

        {loading && <RowListSkeleton count={4} />}

        {error && (
          <div className="mt-8 rounded-lg border border-brand-red/20 bg-brand-red-light p-4 text-sm text-brand-red">
            {error}
          </div>
        )}

        {data && data.subsections?.length === 0 && (
          <EmptyState
            icon={Layers}
            title="No subsections available"
            message="This section doesn't have any subsections yet."
          />
        )}

        {data && data.subsections?.length > 0 && (
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.subsections.map((sub) => (
              <Link
                key={sub.id}
                to={`/harvester/${harvesterId}/section/${sectionId}/sub/${sub.id}`}
                className="group flex items-center gap-3 rounded-lg border border-border-subtle bg-white p-5 shadow-card transition-all duration-200 hover:border-l-4 hover:border-l-brand-navy hover:shadow-card-hover"
              >
                <SectionIconBadge name={sub.name} size="sm" />
                <div className="flex-1">
                  <h2 className="font-oswald text-lg font-semibold text-brand-navy">
                    {sub.name}
                  </h2>
                  <p className="mt-0.5 text-sm text-text-gray">View diagram & parts</p>
                </div>
                <ArrowRight className="h-5 w-5 text-brand-red transition-transform group-hover:translate-x-1" />
              </Link>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
