import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import Header from './Header';
import Sidebar from './Sidebar';

export default function MainLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-bg-light">
      <Header isAdmin onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      <div className="flex">
        {/* Desktop sidebar */}
        <div className="hidden md:block">
          <Sidebar />
        </div>
        {/* Mobile sidebar drawer */}
        {sidebarOpen && (
          <>
            <div
              className="fixed inset-0 z-40 bg-black/50 md:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <div className="fixed left-0 top-16 z-50 md:hidden animate-slide-in-right">
              <Sidebar onNavigate={() => setSidebarOpen(false)} />
            </div>
          </>
        )}
        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-x-hidden">{children}</main>
      </div>
    </div>
  );
}
