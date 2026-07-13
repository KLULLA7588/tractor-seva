import { forwardRef } from 'react';

const variants = {
  default:
    'text-white shadow-button hover:-translate-y-0.5 hover:brightness-110 active:translate-y-0 active:shadow-none',
  destructive:
    'bg-brand-red text-white shadow-button hover:-translate-y-0.5 hover:bg-brand-red-dark active:translate-y-0 active:shadow-none',
  outline:
    'border border-brand-navy/24 text-brand-navy bg-white hover:border-brand-navy/40 hover:bg-brand-navy/3',
  secondary:
    'bg-bg-inset text-brand-navy hover:bg-brand-navy/8',
  ghost: 'text-brand-navy hover:bg-bg-light',
  link: 'text-brand-navy underline hover:text-brand-navy-dark',
};

const baseGradient = 'bg-gradient-to-b from-[#1B2870] to-[#172263]';

const sizes = {
  sm: 'h-8 px-3 text-sm',
  default: 'h-9 px-4 text-sm',
  lg: 'h-10 px-6 text-base',
};

const Button = forwardRef(function Button(
  { variant = 'default', size = 'default', className = '', disabled = false, children, ...props },
  ref
) {
  const gradientClass = variant === 'default' ? baseGradient : '';
  return (
    <button
      ref={ref}
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 rounded-full font-medium transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-brand-red/30 disabled:opacity-50 disabled:cursor-not-allowed ${gradientClass} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
});

export default Button;
