import { Link } from 'react-router-dom';
import { Tractor, ArrowRight } from 'lucide-react';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import { StepIndicator, Breadcrumb } from '../../components/common/StepIndicator';
import { CardSkeleton, EmptyState } from '../../components/common/Skeleton';
import { useApi } from '../../hooks/useApi';
import { imageUrl } from '../../lib/utils';

export default function CatalogPage() {
  const { data, loading, error } = useApi('/harvesters');

  return (
    <div className="min-h-screen flex flex-col bg-bg-light">
      <Header />

      <main className="flex-1">
        <div className="w-full bg-bg-light py-8 md:py-12">
          <div className="mx-auto w-full max-w-6xl px-4 md:px-6">
            {/* Step Indicator */}
            <StepIndicator step="1" label="Select Model" />

            {/* Breadcrumb */}
            <Breadcrumb
              items={[
                { label: 'Tractor Seva', path: '/' },
                { label: 'Catalog' },
              ]}
            />

            {/* Page Title */}
            <h1 className="mt-6 font-oswald text-2xl md:text-3xl lg:text-4xl font-bold text-text-black">
              Harvester Catalog
            </h1>
            <p className="mt-3 text-sm md:text-base text-text-gray max-w-2xl">
              Select a harvester model to browse its parts diagrams
            </p>

            {/* Loading State */}
            {loading && (
              <div className="mt-10">
                <CardSkeleton count={3} />
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="mt-10 rounded-lg border border-brand-red/20 bg-brand-red-light p-6 text-center">
                <p className="text-sm text-brand-red">
                  {error}
                </p>
              </div>
            )}

            {/* Empty State */}
            {data && data.harvesters?.length === 0 && (
              <EmptyState
                icon={Tractor}
                title="No harvesters available"
                message="Check back soon as we add more models to our catalog."
              />
            )}

            {/* Harvesters Grid */}
            {data && data.harvesters?.length > 0 && (
              <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {data.harvesters.map((harvester) => (
                  <Link
                    key={harvester.id}
                    to={`/harvester/${harvester.id}`}
                    className="group flex flex-col h-full overflow-hidden rounded-lg border border-border-subtle bg-white shadow-card transition-all duration-200 hover:border-l-4 hover:border-l-brand-navy hover:shadow-card-hover"
                  >
                    {/* Image Container */}
                    <div className="aspect-video overflow-hidden bg-bg-light">
                      {harvester.image_url ? (
                        <img
                          src={imageUrl(harvester.image_url)}
                          alt={harvester.name}
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <Tractor className="h-12 w-12 text-text-gray/30" />
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 p-5 md:p-6 flex flex-col justify-between">
                      <div>
                        <h2 className="font-oswald text-lg md:text-xl font-semibold text-text-black">
                          {harvester.name}
                        </h2>
                        <p className="mt-2 text-sm text-text-gray leading-relaxed">
                          View parts diagrams and details
                        </p>
                      </div>

                      {/* CTA Link */}
                      <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-brand-red transition-all group-hover:gap-2">
                        View Details
                        <ArrowRight className="h-4 w-4" />
                      </span>
                    </div>
                  </Link>
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