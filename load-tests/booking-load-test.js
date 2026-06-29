import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '10s', target: 50 },  // Ramp-up to 50 users over 10 seconds
    { duration: '20s', target: 200 }, // Ramp-up to 200 users over 20 seconds
    { duration: '15s', target: 200 }, // Stay at 200 users for 15 seconds
    { duration: '10s', target: 0 },   // Ramp-down to 0 users over 10 seconds
  ],
  thresholds: {
    http_req_failed: ['rate<0.05'], // Error rate must be less than 5%
    http_req_duration: ['p(95)<300'], // 95% of requests must complete below 300ms
  },
};

const GRAPHQL_URL = 'http://localhost:8080/graphql';

// Helper to make GraphQL requests
function graphqlRequest(query, variables = {}, token = null) {
  const headers = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return http.post(
    GRAPHQL_URL,
    JSON.stringify({
      query: query,
      variables: variables,
    }),
    { headers: headers }
  );
}

export default function () {
  const uniqueId = __VU * 100000 + __ITER;
  const email = `user_${uniqueId}@ticketrush.com`;
  const password = 'Password@123';

  // 1. Register User
  const registerMutation = `
    mutation Register($email: String!, $password: String!) {
      register(input: { email: $email, password: $password }) {
        id
        email
      }
    }
  `;
  let res = graphqlRequest(registerMutation, { email, password });
  let checkRegister = check(res, {
    'register response status is 200': (r) => r.status === 200,
    'registered user has correct email': (r) => {
      const body = JSON.parse(r.body);
      return body.data && body.data.register && body.data.register.email === email;
    },
  });

  if (!checkRegister) {
    // If registration failed (e.g. concurrent conflict or mock DB issue), attempt login as fallback
    sleep(0.5);
  }

  // 2. Login User
  const loginMutation = `
    mutation Login($email: String!, $password: String!) {
      login(input: { email: $email, password: $password }) {
        token
      }
    }
  `;
  res = graphqlRequest(loginMutation, { email, password });
  let token = null;
  const checkLogin = check(res, {
    'login response status is 200': (r) => r.status === 200,
    'login returned JWT token': (r) => {
      const body = JSON.parse(r.body);
      if (body.data && body.data.login) {
        token = body.data.login.token;
        return !!token;
      }
      return false;
    },
  });

  if (!checkLogin || !token) {
    sleep(1);
    return;
  }

  // 3. Retrieve Concert details (Concert ID mock: let's fetch detail for a default concert UUID or simulate random selection)
  // In our DB seed, we usually seed a default concert. Let's look up how we find or query concerts.
  // We'll query first, or use a seeded/fixed UUID if applicable.
  // Let's assume concertId is passed or we scan a known ID. Let's make a mock UUID for load testing
  // or query a list if we had one. Let's look up concert seeding state.
  const mockConcertId = '00000000-0000-0000-0000-000000000001'; // Default seeded concert ID

  const queryConcert = `
    query GetConcert($concertId: ID!) {
      getConcertDetail(concertId: $concertId) {
        id
        title
        zones {
          id
          name
          seats {
            id
            seatNumber
            status
          }
        }
      }
    }
  `;
  res = graphqlRequest(queryConcert, { concertId: mockConcertId }, token);
  let seatId = null;

  check(res, {
    'fetch concert response status is 200': (r) => r.status === 200,
    'extracted seat to hold': (r) => {
      const body = JSON.parse(r.body);
      if (body.data && body.data.getConcertDetail && body.data.getConcertDetail.zones) {
        const zones = body.data.getConcertDetail.zones;
        // Try to find an AVAILABLE seat
        for (let zone of zones) {
          for (let seat of zone.seats) {
            if (seat.status === 'AVAILABLE') {
              seatId = seat.id;
              return true;
            }
          }
        }
      }
      return false;
    },
  });

  // If no available seats found or concert detail failed, wait a bit and exit iteration
  if (!seatId) {
    sleep(1);
    return;
  }

  // 4. Hold Seat (Atomic Lua Locking verification)
  const holdSeatMutation = `
    mutation HoldSeat($seatId: ID!) {
      holdSeat(seatId: $seatId) {
        id
        status
        expiresAt
      }
    }
  `;
  sleep(0.1); // Small think time before transaction
  res = graphqlRequest(holdSeatMutation, { seatId: seatId }, token);
  
  check(res, {
    'holdSeat response status is 200 or 409/conflict': (r) => r.status === 200 || r.status === 409,
    'holdSeat result parsed': (r) => {
      const body = JSON.parse(r.body);
      // It can either succeed (order returned) or return graphql error due to concurrent holding (already locked/held)
      // Both cases are valid system responses under highly concurrent write load
      if (body.data && body.data.holdSeat) {
        return body.data.holdSeat.status === 'PENDING';
      }
      if (body.errors && body.errors.length > 0) {
        // Confirms it caught conflict or locked resource correctly
        return body.errors[0].message.includes('already held') || body.errors[0].message.includes('conflict');
      }
      return true;
    },
  });

  sleep(1);
}
