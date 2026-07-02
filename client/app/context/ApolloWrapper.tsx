'use client';

import React, { useMemo } from 'react';
import { ApolloProvider } from '@apollo/client/react';
import { useAuth } from '../context/AuthContext';
import { createApolloClient } from '../lib/apollo-client';

export function ApolloWrapper({ children }: { children: React.ReactNode }) {
  const { loading } = useAuth();

  // Re-create Apollo Client when token changes so connectionParams (WS Link) will get updated token
  const client = useMemo(() => {
    return createApolloClient(() => localStorage.getItem('ticketrush_token'));
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ink">
        <p className="font-mono text-label uppercase text-muted tracking-[0.2em]">ĐANG TẢI...</p>
      </div>
    );
  }

  return <ApolloProvider client={client}>{children}</ApolloProvider>;
}
