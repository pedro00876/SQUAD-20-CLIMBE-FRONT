import React from 'react';

export function Table({ children }: { children: React.ReactNode }) {
  return <div className="w-full overflow-auto"><table className="w-full text-left border-collapse">{children}</table></div>;
}
