import React from 'react';
import { cn } from '@/utils/cn';

export function Modal({
  children,
  isOpen,
  onClose,
  className,
}: {
  children: React.ReactNode;
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className={cn('relative w-full max-w-md rounded-lg bg-white p-6 dark:bg-slate-900', className)}>
        <button onClick={onClose} className="absolute right-4 top-4 text-gray-400">&times;</button>
        {children}
      </div>
    </div>
  );
}
