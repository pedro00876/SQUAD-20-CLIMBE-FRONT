import React from 'react';

export function Modal({ children, isOpen, onClose }: { children: React.ReactNode; isOpen: boolean; onClose: () => void }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white dark:bg-slate-900 p-6 rounded-lg w-full max-w-md">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400">&times;</button>
        {children}
      </div>
    </div>
  );
}
