'use client';

import { ApolloClient, InMemoryCache, HttpLink, split } from '@apollo/client';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { createClient } from 'graphql-ws';
import { getMainDefinition } from '@apollo/client/utilities';

export function createApolloClient(getToken: () => string | null) {
  const httpUri = process.env.NEXT_PUBLIC_GRAPHQL_HTTP_URL || 'http://localhost:8080/graphql';
  const wsUri = process.env.NEXT_PUBLIC_GRAPHQL_WS_URL || 'ws://localhost:8080/graphql';

  const httpLink = new HttpLink({
    uri: httpUri,
    fetch: (uri, options) => {
      const token = getToken();
      if (token && options) {
        options.headers = {
          ...options.headers,
          Authorization: `Bearer ${token}`,
        };
      }
      return fetch(uri, options);
    },
  });

  const wsLink = new GraphQLWsLink(
    createClient({
      url: wsUri,
      connectionParams: () => {
        const token = getToken();
        return token
          ? { Authorization: `Bearer ${token}` }
          : {};
      },
      keepAlive: 30000,
    })
  );

  const splitLink = split(
    ({ query }) => {
      const definition = getMainDefinition(query);
      return (
        definition.kind === 'OperationDefinition' &&
        definition.operation === 'subscription'
      );
    },
    wsLink,
    httpLink
  );

  return new ApolloClient({
    link: splitLink,
    cache: new InMemoryCache({
      typePolicies: {
        SeatDetail: {
          keyFields: ['id'],
        },
      },
    }),
  });
}
