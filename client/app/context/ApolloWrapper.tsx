'use client';

import React, { useMemo } from 'react';
import { ApolloProvider } from '@apollo/client/react';
import { useAuth } from '../context/AuthContext';
import { createApolloClient } from '../lib/apollo-client';

export function ApolloWrapper({ children }: { children: React.ReactNode }) {
  const { token, loading } = useAuth();

  // Re-create Apollo Client when token changes so connectionParams (WS Link) will get updated token
  const client = useMemo(() => {
    return createApolloClient(() => localStorage.getItem('ticketrush_token'));
  }, [token]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-white font-sans">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-700 border-t-indigo-500"></div>
          <span className="text-zinc-400 text-sm tracking-widest uppercase">Loading TicketRush...</span>
        </div>
      </div>
    );
  }

  return <ApolloProvider client={client}>{children}</ApolloProvider>;
}
