/**
 * Table components for consistent table styling.
 */
export function Table({ children, className = '' }) {
  return (
    <div className="w-full overflow-x-auto">
      <table className={`w-full text-sm ${className}`}>{children}</table>
    </div>
  );
}

export function TableHeader({ children }) {
  return (
    <thead className="border-b border-border-light bg-brand-navy/5">
      {children}
    </thead>
  );
}

export function TableBody({ children }) {
  return <tbody className="divide-y divide-border-light">{children}</tbody>;
}

export function TableRow({ children, className = '', onClick }) {
  return (
    <tr
      onClick={onClick}
      className={`transition-colors hover:bg-bg-light/60 ${className}`}
    >
      {children}
    </tr>
  );
}

export function TableHead({ children, className = '' }) {
  return (
    <th
      className={`px-4 py-3 text-left font-semibold text-brand-navy ${className}`}
    >
      {children}
    </th>
  );
}

export function TableCell({ children, className = '' }) {
  return (
    <td className={`px-4 py-3 text-text-black ${className}`}>{children}</td>
  );
}
