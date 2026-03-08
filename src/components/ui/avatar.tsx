import React from 'react';

export function Avatar({ initials }: { initials: string }) {
  return <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-sm font-medium">{initials}</div>;
}
