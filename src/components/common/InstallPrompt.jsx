import { useState, useEffect } from 'react';
import { Download, X, Smartphone, Wifi, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const DISMISS_KEY = 'pwa_prompt_dismissed_at';
const PROMPT_DELAY = 3000;

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      const dismissed = sessionStorage.getItem(DISMISS_KEY);
      if (!dismissed) {
        setTimeout(() => setShow(true), PROMPT_DELAY);
      }
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      await deferredPrompt.userChoice;
      setDeferredPrompt(null);
    }
    setShow(false);
  };

  const handleDismiss = () => {
    sessionStorage.setItem(DISMISS_KEY, Date.now().toString());
    setShow(false);
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="fixed bottom-4 right-4 z-50 w-full max-w-sm overflow-hidden rounded-xl border border-border-subtle bg-white shadow-panel"
        >
          <div className="flex items-center justify-between bg-brand-navy px-5 py-3 text-white">
            <div className="flex items-center gap-2">
              <Smartphone className="h-5 w-5 text-brand-red" />
              <div>
                <h3 className="font-oswald text-base font-semibold">Install Tractor Seva</h3>
                <p className="text-xs text-white/70">Get the full app experience</p>
              </div>
            </div>
            <button onClick={handleDismiss} className="rounded p-1 hover:bg-white/10 transition-colors">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="px-5 py-4">
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-navy/10 text-xs font-bold text-brand-navy">1</span>
                <span className="text-sm text-text-black">Quick access from your home screen</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-navy/10 text-xs font-bold text-brand-navy">2</span>
                <span className="text-sm text-text-black">Works offline with cached content</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-navy/10 text-xs font-bold text-brand-navy">3</span>
                <span className="text-sm text-text-black">Faster, native-like experience</span>
              </li>
            </ul>

            <div className="mt-5 flex gap-3">
              <button
                onClick={handleDismiss}
                className="flex-1 rounded-full border border-border-light px-4 py-2.5 text-sm font-medium text-brand-navy transition-colors hover:bg-bg-light"
              >
                Not now
              </button>
              <button
                onClick={handleInstall}
                className="flex flex-1 items-center justify-center gap-2 rounded-full bg-brand-navy px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-navy-dark"
              >
                <Download className="h-4 w-4" />
                Install
              </button>
            </div>
            <p className="mt-3 text-center text-xs text-text-gray">
              You can always install later from your browser menu
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
