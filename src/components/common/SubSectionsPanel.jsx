import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function SubSectionsPanel({ subsections, harvesterId, sectionId }) {
  return (
    <div className="mb-4">
      <AnimatePresence>
        {subsections.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="rounded-lg border border-border-light bg-white p-4 shadow-sm">
              <h3 className="mb-3 font-oswald text-sm font-semibold uppercase tracking-wide text-brand-navy/70">
                Sub-sections
              </h3>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {subsections.map((sub) => (
                  <Link
                    key={sub.id}
                    to={`/harvester/${harvesterId}/section/${sectionId}/sub/${sub.id}`}
                    className="group flex items-center justify-between rounded-full border border-border-light bg-white px-4 py-2.5 text-sm font-medium text-brand-navy transition-all hover:border-brand-navy hover:bg-bg-light"
                  >
                    {sub.name}
                    <ArrowRight className="h-4 w-4 text-brand-red transition-transform group-hover:translate-x-1" />
                  </Link>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
