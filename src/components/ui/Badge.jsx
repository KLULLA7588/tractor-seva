const variantStyles = {
  default: 'bg-brand-navy text-white',
  success: 'bg-green-600 text-white',
  warning: 'bg-amber-500 text-white',
  destructive: 'bg-brand-red text-white',
  outline: 'border border-border-light text-text-black bg-white',
};

/**
 * Badge / status pill component.
 */
export default function Badge({ variant = 'default', children, className = '' }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
