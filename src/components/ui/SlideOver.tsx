import { useEffect } from 'react';
import { X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { clsx } from 'clsx';

interface SlideOverProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  width?: 'sm' | 'md' | 'lg';
}

const WIDTH_CLASSES = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
};

export function SlideOver({ isOpen, onClose, title, children, width = 'md' }: SlideOverProps) {
  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-[80] backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            className={clsx(
              'fixed right-0 top-0 bottom-0 z-[90] bg-white dark:bg-zinc-950 border-l border-gray-100 dark:border-zinc-800/80 shadow-2xl flex flex-col w-full text-slate-800 dark:text-white',
              WIDTH_CLASSES[width],
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 dark:border-zinc-800/80">
              <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">{title}</h2>
              <button
                onClick={onClose}
                className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-zinc-800 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                aria-label="Fechar"
              >
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-6">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
