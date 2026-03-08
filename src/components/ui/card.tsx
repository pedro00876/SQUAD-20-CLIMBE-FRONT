import React from 'react';

export function Card({ children }: { children: React.ReactNode }) {
  return <div className="border rounded-lg shadow-sm bg-white dark:bg-slate-900 p-4">{children}</div>;
}
