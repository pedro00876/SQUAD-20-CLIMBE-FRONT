import React, { useEffect } from 'react';
import { cn } from '@/utils/cn';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function Modal({
  children,
  isOpen,
  onClose,
  className,
  size = 'md',
}: {
  children: React.ReactNode;
  isOpen: boolean;
  onClose: () => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}) {
  // Prevent scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop Blur Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-[4px]"
          />

          {/* Modal Card Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className={cn(
              'relative w-full rounded-[28px] bg-white p-8 dark:bg-slate-900 shadow-2xl border border-gray-100/10 z-10 max-h-[90vh] overflow-y-auto custom-scrollbar flex flex-col gap-4 text-slate-800 dark:text-white',
              {
                'max-w-sm': size === 'sm',
                'max-w-md': size === 'md',
                'max-w-lg': size === 'lg',
                'max-w-xl': size === 'xl',
                'max-w-2xl': size === '2xl',
              },
              className
            )}
          >
            {/* Close Button - adapts color automatically using text-current */}
            <button
              type="button"
              aria-label="Fechar modal"
              onClick={onClose}
              className="absolute right-6 top-6 p-2 text-current opacity-50 hover:opacity-90 hover:bg-gray-100/10 rounded-xl transition-all"
            >
              <X size={18} />
            </button>
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
