import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Tractor, LogOut, Menu, Globe, ChevronDown } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import LanguageSelector from '../common/LanguageSelector';

export default function Header({ isAdmin = false, onMenuClick }) {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between bg-brand-navy-dark px-4 md:px-6">
      {/* Logo block — white background box */}
      <div className="flex items-center gap-0">
        {isAdmin && (
          <button
            onClick={onMenuClick}
            className="mr-2 flex h-9 w-9 items-center justify-center rounded-md hover:bg-white/10 transition-colors md:hidden"
          >
            <Menu className="h-5 w-5 text-white" />
          </button>
        )}
        <Link
          to="/"
          className="flex items-center gap-2 rounded-sm bg-white px-3 py-2 shadow-sm"
        >
          <div className="flex h-8 w-8 items-center justify-center">
            <Tractor className="h-7 w-7 text-brand-red" />
          </div>
          <div className="flex flex-col leading-none">
            <span className="font-oswald text-sm font-bold uppercase tracking-wide text-brand-navy">
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
        <nav className="hidden items-center gap-1 md:flex">
          <NavLink to="/catalog">Catalog</NavLink>
          <NavLink to="/catalog">Models</NavLink>
          <NavLink to="/#support">Support</NavLink>
        </nav>
      )}

      {/* Right side */}
      <div className="flex items-center gap-2">
        {!isAdmin && (
          <>
            <LanguageSelector dark />
            <Link
              to="/catalog"
              className="hidden items-center gap-1.5 rounded-full bg-brand-red px-4 py-2 text-sm font-semibold text-white transition-all duration-150 hover:bg-brand-red-dark sm:flex"
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
      className="rounded-full px-4 py-2 text-sm font-medium text-white/85 transition-colors hover:bg-white/10 hover:text-white"
    >
      {children}
    </Link>
  );
}