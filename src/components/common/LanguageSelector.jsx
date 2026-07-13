import { useState, useRef, useEffect } from 'react';
import { Globe, ChevronDown, Check } from 'lucide-react';
import { changeLanguage, getCurrentLanguage, LANGUAGES } from '../../lib/googleTranslate.js';

export default function LanguageSelector({ dark = false }) {
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState('en');
  const [search, setSearch] = useState('');
  const ref = useRef(null);

  useEffect(() => {
    const checkLang = () => setCurrent(getCurrentLanguage());
    checkLang();
    const interval = setInterval(checkLang, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
        setSearch('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const filtered = LANGUAGES.filter((l) =>
    l.label.toLowerCase().includes(search.toLowerCase())
  );

  const currentLang = LANGUAGES.find((l) => l.code === current);

  const handleSelect = (code) => {
    changeLanguage(code);
    setCurrent(code);
    setOpen(false);
    setSearch('');
  };

  const triggerClass = dark
    ? 'flex items-center gap-1.5 rounded-full border border-white/25 px-3 py-1.5 text-sm font-medium text-white hover:bg-white/10 transition-colors'
    : 'flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium text-text-black hover:bg-bg-light transition-colors';

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen(!open)} className={triggerClass}>
        <Globe className="h-4 w-4" />
        <span className="uppercase">{currentLang?.code?.slice(0, 2) || 'EN'}</span>
        <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-64 rounded-lg border border-border-subtle bg-white shadow-panel z-50 animate-scale-in overflow-hidden">
          <div className="border-b border-border-subtle p-2">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search language..."
              className="h-8 w-full rounded-md border border-border-subtle px-3 text-sm focus:outline-none focus:shadow-input-focus"
              autoFocus
            />
          </div>
          <div className="max-h-64 overflow-y-auto">
            {filtered.length === 0 ? (
              <p className="p-3 text-sm text-text-gray text-center">No languages found</p>
            ) : (
              filtered.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => handleSelect(lang.code)}
                  className={`flex w-full items-center justify-between px-3 py-2 text-sm transition-colors hover:bg-bg-light ${
                    current === lang.code ? 'text-brand-navy font-medium' : 'text-text-black'
                  }`}
                >
                  {lang.label}
                  {current === lang.code && <Check className="h-4 w-4 text-brand-navy" />}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
