import { Loader2 } from 'lucide-react';

const sizeMap = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-8 w-8',
};

const colorMap = {
  navy: 'text-brand-navy',
  red: 'text-brand-red',
  gray: 'text-text-gray',
};

/**
 * Spinner / loading indicator.
 */
export default function Spinner({ size = 'md', color = 'navy' }) {
  return (
    <Loader2
      className={`animate-spin ${sizeMap[size]} ${colorMap[color]}`}
    />
  );
}
