import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X } from 'lucide-react';

const STORAGE_KEY = 'pwa_install_dismissed';

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isDismissed, setIsDismissed] = useState(true);
  const [isInstalled, setIsInstalled] = useState(false);
  const [scrolledPastHero, setScrolledPastHero] = useState(false);

  // Initialize dismissed state from localStorage and check standalone mode
  useEffect(() => {
    try {
      const dismissed = localStorage.getItem(STORAGE_KEY) === 'true';
      setIsDismissed(dismissed);
    } catch {
      setIsDismissed(false);
    }

    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true;

    if (isStandalone) {
      setIsInstalled(true);
    }
  }, []);

  // Listen for beforeinstallprompt and appinstalled events
  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      try {
        localStorage.setItem(STORAGE_KEY, 'true');
      } catch {
        // Ignore storage errors
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  // Track scroll position past hero section
  useEffect(() => {
    const handleScroll = () => {
      const heroElement = document.getElementById('hero') || document.querySelector('section');
      if (heroElement) {
        const heroBottom = heroElement.getBoundingClientRect().bottom;
        if (heroBottom <= 120) {
          setScrolledPastHero(true);
        }
      } else if (window.scrollY > 300) {
        setScrolledPastHero(true);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleInstallClick = useCallback(async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    try {
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        setIsInstalled(true);
      }
    } catch (err) {
      console.error('PWA install prompt error:', err);
    } finally {
      setDeferredPrompt(null);
    }
  }, [deferredPrompt]);

  const handleDismiss = useCallback(() => {
    try {
      localStorage.setItem(STORAGE_KEY, 'true');
    } catch {
      // Ignore storage errors
    }
    setIsDismissed(true);
  }, []);

  const shouldShow =
    !isDismissed && !isInstalled && scrolledPastHero && Boolean(deferredPrompt);

  return (
    <AnimatePresence>
      {shouldShow && (
        <motion.aside
          role="dialog"
          aria-label="Add portfolio to homescreen"
          aria-modal="false"
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 30, scale: 0.95 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="fixed bottom-6 right-6 z-50 max-w-sm w-[calc(100vw-3rem)] rounded-2xl p-4 bg-[#080A0E]/95 backdrop-blur-xl border border-[#FF4D00]/30 shadow-[0_12px_40px_rgba(255,77,0,0.18)] flex items-center gap-3.5"
        >
          {/* App Icon preview */}
          <div className="relative shrink-0 w-11 h-11 rounded-xl overflow-hidden shadow-inner border border-white/10 bg-[#FF4D00] flex items-center justify-center">
            <img
              src="/icons/icon-192.png"
              alt="Esubalew Portfolio"
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>

          {/* Banner Text */}
          <div className="flex-1 min-w-0 pr-1">
            <h3 className="text-sm font-semibold text-white tracking-tight leading-snug">
              Add to homescreen
            </h3>
            <p className="text-xs text-white/70 line-clamp-1 font-mono">
              Fast, offline-ready portfolio
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={handleInstallClick}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#FF4D00] hover:bg-[#ff621e] active:scale-95 text-white text-xs font-semibold tracking-wide transition-all shadow-[0_2px_12px_rgba(255,77,0,0.4)] cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Install</span>
            </button>

            <button
              onClick={handleDismiss}
              aria-label="Dismiss installation prompt"
              className="p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/10 active:scale-90 transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}

export default PWAInstallPrompt;
