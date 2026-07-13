import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

export function StepIndicator({ step, label }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-wider text-brand-navy/60">
      Step {step} — {label}
    </p>
  );
}

export function Breadcrumb({ items }) {
  return (
    <nav className="flex flex-wrap items-center gap-1.5 text-sm">
      {items.map((item, index) => (
        <span key={index} className="flex items-center gap-1.5">
          {index > 0 && <ChevronRight className="h-3 w-3 text-text-gray" />}
          {item.path ? (
            <Link to={item.path} className="text-text-gray hover:text-brand-navy transition-colors">
              {item.label}
            </Link>
          ) : (
            <span className="font-medium text-brand-navy">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}

export function SectionIconBadge({ name, size = 'md' }) {
  const sizes = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12',
  };
  const iconSizes = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  };

  return (
    <div className={`flex ${sizes[size]} items-center justify-center rounded-md border border-brand-navy/20 bg-white`}>
      <SectionIcon name={name} className={iconSizes[size]} />
    </div>
  );
}

import { getSectionIcon } from '../../lib/sectionIcons.js';

function SectionIcon({ name, className }) {
  const Icon = getSectionIcon(name);
  return <Icon className={className} strokeWidth={1.5} />;
}
