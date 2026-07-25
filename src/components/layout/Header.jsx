import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Tractor, LogOut, Menu, Globe, ChevronDown } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import LanguageSelector from '../common/LanguageSelector';

export default function Header({ isAdmin = false, onMenuClick }) {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40 flex h-20 items-center justify-between bg-gradient-to-r from-brand-navy-dark to-brand-navy px-4 border-b border-white/5 md:px-8">
      {/* Logo */}
      <div className="flex items-center gap-3">
        {isAdmin && (
          <button
            onClick={onMenuClick}
            className="mr-1 flex h-9 w-9 items-center justify-center rounded-full hover:bg-white/10 transition-colors md:hidden"
          >
            <Menu className="h-5 w-5 text-white" />
          </button>
        )}
        <Link to="/" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-red shadow-button">
            <Tractor className="h-5 w-5 text-white" strokeWidth={2} />
          </div>
          <div className="flex flex-col leading-none">
            <span className="font-oswald text-sm font-bold uppercase tracking-wide text-white">
              Tractor
            </span>
            <span className="font-oswald text-sm font-bold uppercase tracking-wide text-brand-red">
              Seva
            </span>
          </div>
        </Link>
      </div>

      {/* Nav links */}
      {!isAdmin && (
        <nav className="hidden items-center gap-8 md:flex">
          <NavLink to="/catalog">Catalog</NavLink>
          
          <NavLink to="/#support">Support</NavLink>
        </nav>
      )}

      {/* Right side */}
      <div className="flex items-center gap-3">
        {!isAdmin && (
          <>
            <LanguageSelector dark />
            <Link
              to="/catalog"
              className="hidden items-center gap-1.5 rounded-full bg-brand-red px-5 py-2.5 text-sm font-semibold text-white shadow-button transition-all duration-150 hover:-translate-y-0.5 hover:brightness-110 sm:flex"
            >
              OPEN CATALOG
              <span className="text-base leading-none">→</span>
            </Link>
          </>
        )}
        {/* Logout button - ONLY shown on admin pages */}
        {isAdmin && isAuthenticated && (
          <button
            onClick={() => {
              logout();
              navigate('/');
            }}
            className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-white/20"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        )}
      </div>
    </header>
  );
}

function NavLink({ to, children }) {
  return (
    <Link
      to={to}
      className="relative py-1 text-sm font-medium text-white/80 transition-colors hover:text-white group"
    >
      {children}
      <span className="absolute -bottom-1 left-0 h-px w-0 bg-brand-red transition-all duration-200 group-hover:w-full" />
    </Link>
  );
}