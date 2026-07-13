/**
 * Card container component.
 */
export default function Card({ children, className = '' }) {
  return (
    <div
      className={`rounded-lg border border-border-subtle bg-white shadow-card ${className}`}
    >
      {children}
    </div>
  );
}
