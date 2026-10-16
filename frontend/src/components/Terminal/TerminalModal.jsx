import { useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Terminal from './Terminal';

export const TerminalModal = ({ isOpen, onClose }) => {
  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    },
    [onClose]
  );

  useEffect(() => {
    if (!isOpen) return;
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleKeyDown]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-[2000] flex items-center justify-center p-3 sm:p-6 md:p-8"
          role="dialog"
          aria-modal="true"
          aria-label="Developer Terminal Window"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm cursor-pointer"
            aria-hidden="true"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ type: 'spring', stiffness: 320, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
            className="relative z-10 w-full max-w-4xl"
          >
            <Terminal isEmbedded={false} onClose={onClose} />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default TerminalModal;
