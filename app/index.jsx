// App.jsx
import React from 'react';
import { RootNavigator } from './services/rootNavigator';
import { AuthProvider } from './auth/authprovider';
import { QueryClient } from '@tanstack/react-query';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Configure QueryClient
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      cacheTime: 1000 * 60 * 60 * 24, // 24 hours
      refetchOnMount: true,
      refetchOnWindowFocus: true,
      retry: 2,
    },
  },
});

// Create AsyncStorage persister
const asyncStoragePersister = createAsyncStoragePersister({
  storage: AsyncStorage,
  key: 'TENANT_APP_CACHE',
});

const App = () => {
  return (
    <AuthProvider>
      <PersistQueryClientProvider
        client={queryClient}
        persistOptions={{ persister: asyncStoragePersister }}
      >
        <RootNavigator />
      </PersistQueryClientProvider>
    </AuthProvider>
  );
};

export default App;
