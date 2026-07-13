import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutGrid,
  Tractor,
  Layers,
  Image,
  Wrench,
  Mail,
  LogOut,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { ADMIN_NAV_ITEMS } from '../../lib/constants';
import { useAuth } from '../../hooks/useAuth';

const iconMap = {
  LayoutGrid,
  Tractor,
  Layers,
  Image,
  Wrench,
  Mail,
};

export default function Sidebar({ onNavigate }) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  return (
    <aside className="sticky top-16 h-[calc(100vh-64px)] w-64 shrink-0 bg-brand-navy text-white">
      <nav className="flex h-full flex-col p-3">
        <ul className="flex-1 space-y-1">
          {ADMIN_NAV_ITEMS.map((item) => {
            const Icon = iconMap[item.icon];
            return (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  end={item.path === '/admin'}
                  onClick={onNavigate}
                  className={({ isActive }) =>
                    `relative flex items-center gap-3 overflow-hidden rounded-md px-3 py-2.5 text-sm font-medium transition-colors ${
                      isActive
                        ? 'text-white'
                        : 'text-white/80 hover:bg-brand-navy-light hover:text-white'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      {isActive && (
                        <motion.div
                          layoutId="sidebar-active"
                          className="absolute left-0 top-0 h-full w-full bg-brand-navy-light"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.2 }}
                        />
                      )}
                      {isActive && (
                        <motion.div
                          layoutId="sidebar-active-border"
                          className="absolute left-0 top-0 h-full w-[3px] bg-brand-red"
                        />
                      )}
                      <Icon className="relative z-10 h-5 w-5" />
                      <span className="relative z-10">{item.label}</span>
                    </>
                  )}
                </NavLink>
              </li>
            );
          })}
        </ul>

        <button
          onClick={() => {
            logout();
            navigate('/');
          }}
          className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-brand-red hover:bg-brand-navy-light transition-colors"
        >
          <LogOut className="h-5 w-5" />
          Logout
        </button>
      </nav>
    </aside>
  );
}
