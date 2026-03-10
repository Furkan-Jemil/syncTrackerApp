import React from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import queryClient from '@/lib/queryClient';
import { SocketProvider } from './SocketProvider';

interface AppProvidersProps {
  children: React.ReactNode;
}

// Inner wrapper — all real app providers live here
export default function AppProviders({ children }: AppProvidersProps) {
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <SocketProvider>
          {children}
        </SocketProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
