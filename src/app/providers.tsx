import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider, useTheme } from '@/contexts/ThemeContext';
import { PermissionProvider } from '@/contexts/PermissionContext';
import { Toaster } from 'sonner';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function ThemedToaster() {
  const { theme } = useTheme();
  return <Toaster richColors position="top-right" theme={theme} />;
}

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <PermissionProvider>
          {children}
          <ThemedToaster />
        </PermissionProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
