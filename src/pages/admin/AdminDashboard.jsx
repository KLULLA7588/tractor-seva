import { Tractor, Layers, Wrench, Mail } from 'lucide-react';
import { useApi } from '../../hooks/useApi';

export default function AdminDashboard() {
  const { data, loading } = useApi('/admin/stats');

  const stats = data?.stats || { harvesters: 0, sections: 0, parts: 0, inquiries: 0 };

  const cards = [
    { label: 'Harvesters', value: stats.harvesters, icon: Tractor, color: 'text-brand-navy' },
    { label: 'Sections', value: stats.sections, icon: Layers, color: 'text-brand-navy' },
    { label: 'Parts', value: stats.parts, icon: Wrench, color: 'text-brand-navy' },
    { label: 'Inquiries', value: stats.inquiries, icon: Mail, color: 'text-brand-red' },
  ];

  return (
    <div>
      <h1 className="font-oswald text-2xl font-bold text-brand-navy">Dashboard</h1>
      <p className="mt-1 text-sm text-text-gray">Overview of your parts catalog</p>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <div key={card.label} className="rounded-lg border border-border-subtle bg-white p-5 shadow-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-gray">{card.label}</p>
                <p className="mt-1 font-oswald text-3xl font-bold text-brand-navy">
                  {loading ? '...' : card.value}
                </p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-md border border-brand-navy/20 bg-white">
                <card.icon className={`h-5 w-5 ${card.color}`} strokeWidth={1.5} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
