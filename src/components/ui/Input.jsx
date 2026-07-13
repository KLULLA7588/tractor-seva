import { forwardRef } from 'react';

/**
 * Input component with error display.
 */
const Input = forwardRef(function Input(
  { className = '', error = '', ...props },
  ref
) {
  return (
    <div className="w-full">
      <input
        ref={ref}
        className={`h-9 w-full rounded-md border bg-white px-3 text-sm text-text-black placeholder:text-text-gray/60 transition-all focus:outline-none focus:shadow-input-focus focus:border-brand-navy disabled:opacity-50 disabled:cursor-not-allowed ${error ? 'border-brand-red' : 'border-border-subtle'} ${className}`}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-brand-red">{error}</p>}
    </div>
  );
});

export default Input;
