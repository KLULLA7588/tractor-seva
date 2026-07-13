import { ChevronDown } from 'lucide-react';

/**
 * Select dropdown component.
 */
export default function Select({
  options = [],
  value = '',
  onChange,
  placeholder = 'Select...',
  disabled = false,
  className = '',
  error = '',
}) {
  return (
    <div className="w-full">
      <div className="relative">
        <select
          value={value}
          onChange={onChange}
          disabled={disabled}
          className={`h-9 w-full appearance-none rounded-md border bg-white px-3 pr-9 text-sm text-text-black transition-colors focus:outline-none focus:ring-2 focus:ring-brand-red/30 focus:border-brand-navy disabled:opacity-50 disabled:cursor-not-allowed ${error ? 'border-brand-red' : 'border-border-light'} ${className}`}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-gray" />
      </div>
      {error && <p className="mt-1 text-xs text-brand-red">{error}</p>}
    </div>
  );
}
