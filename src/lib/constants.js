export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
export const API_TIMEOUT =
  import.meta.env.VITE_API_TIMEOUT ? parseInt(import.meta.env.VITE_API_TIMEOUT) : 10000;

export const INQUIRY_STATUSES = ['New', 'Contacted', 'Resolved'];

export const STATUS_COLORS = {
  New: { bg: 'bg-brand-red', text: 'text-white', badge: 'danger' },
  Contacted: { bg: 'bg-amber-500', text: 'text-white', badge: 'warning' },
  Resolved: { bg: 'bg-green-600', text: 'text-white', badge: 'success' },
};

export const ADMIN_NAV_ITEMS = [
  { label: 'Dashboard', path: '/admin', icon: 'LayoutGrid' },
  { label: 'Harvesters', path: '/admin/harvesters', icon: 'Tractor' },
  { label: 'Sections', path: '/admin/sections', icon: 'Layers' },
  { label: 'Diagrams', path: '/admin/diagrams', icon: 'Image' },
  { label: 'Parts & Hotspots', path: '/admin/parts', icon: 'Wrench' },
  { label: 'Inquiries', path: '/admin/inquiries', icon: 'Mail' },
];

export const FILE_UPLOAD = {
  maxSize: 10 * 1024 * 1024,
  allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
};
