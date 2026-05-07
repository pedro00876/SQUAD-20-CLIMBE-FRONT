import React, { createContext } from 'react';

const PermissionContext = createContext<{ permissions: string[] }>({ permissions: [] });

export const PermissionProvider = ({ children }: { children: React.ReactNode }) => {
  const permissions: string[] = []; // fetch from API or User
  return <PermissionContext.Provider value={{ permissions }}>{children}</PermissionContext.Provider>;
};
