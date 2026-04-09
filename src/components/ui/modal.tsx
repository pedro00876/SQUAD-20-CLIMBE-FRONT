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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className={cn('bg-white dark:bg-slate-900 p-6 rounded-lg w-full max-w-md', className)}>
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400">&times;</button>
        {children}
      </div>
    </div>
  );
}
