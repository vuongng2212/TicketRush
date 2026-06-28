'use client';

import React, { useState, useEffect } from 'react';
import { gql } from '@apollo/client';
import { useQuery, useMutation, useSubscription } from '@apollo/client/react';
import { useAuth } from './context/AuthContext';
import { LogOut, User as UserIcon, Ticket, RefreshCw, AlertCircle, CheckCircle, Clock } from 'lucide-react';

const GET_CONCERT_DETAIL = gql`
  query GetConcertDetail($concertId: ID!) {
    getConcertDetail(concertId: $concertId) {
      id
      title
      venue
      startTime
      status
      zones {
        id
        name
        price
        totalSeats
        seats {
          id
          seatNumber
          status
          heldByUserId
          heldUntil
        }
      }
    }
  }
`;

const HOLD_SEAT = gql`
  mutation HoldSeat($seatId: ID!) {
    holdSeat(seatId: $seatId) {
      id
      status
      totalPrice
      expiresAt
    }
  }
`;

const SEAT_STATUS_UPDATED = gql`
  subscription OnSeatStatusUpdated($concertId: ID!) {
    seatStatusUpdated(concertId: $concertId) {
      seatId
      concertId
      status
      heldByUserId
    }
  }
`;

const REGISTER = gql`
  mutation Register($email: String!, $password: String!) {
    register(input: { email: $email, password: $password, roles: ["ROLE_USER"] }) {
      id
      email
    }
  }
`;

const LOGIN = gql`
  mutation Login($email: String!, $password: String!) {
    login(input: { email: $email, password: $password }) {
      token
      user {
        id
        email
        roles
      }
    }
  }
`;

// Simple Concert ID for mock testing
const MOCK_CONCERT_ID = "00000000-0000-0000-0000-000000000000";

export default function Home() {
  const { token, user, login, logout } = useAuth();
  
  // Auth Form State
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authSuccess, setAuthSuccess] = useState('');

  // Selected seat state
  const [selectedSeat, setSelectedSeat] = useState<any>(null);
  const [localSeatsMap, setLocalSeatsMap] = useState<Record<string, any>>({});
  const [currentOrder, setCurrentOrder] = useState<any>(null);
  const [paymentStep, setPaymentStep] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  // Mutations
  const [registerMutate, { loading: registerLoading }] = useMutation(REGISTER);
  const [loginMutate, { loading: loginLoading }] = useMutation(LOGIN);
  const [holdSeatMutate, { loading: holdLoading }] = useMutation(HOLD_SEAT);

  // Fetch Concert data
  const { data, loading: concertLoading, error: concertError, refetch } = useQuery(GET_CONCERT_DETAIL, {
    variables: { concertId: MOCK_CONCERT_ID },
    skip: !token,
  });

  // Keep local seat map synchronized with query updates
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const concert = (data as any)?.getConcertDetail;
    if (concert?.zones) {
      const map: Record<string, any> = {};
      concert.zones.forEach((zone: any) => {
        zone.seats.forEach((seat: any) => {
          map[seat.id] = { ...seat, zoneName: zone.name, price: zone.price };
        });
      });
      setLocalSeatsMap(map);
    }
  }, [data]);

  // Subscription for Real-time Seat updates
  useSubscription(SEAT_STATUS_UPDATED, {
    variables: { concertId: MOCK_CONCERT_ID },
    skip: !token,
    onData: ({ data: subData }) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const updatedSeat = (subData?.data as any)?.seatStatusUpdated;
      if (updatedSeat) {
        setLocalSeatsMap((prev) => {
          const existing = prev[updatedSeat.seatId];
          if (!existing) return prev;
          return {
            ...prev,
            [updatedSeat.seatId]: {
              ...existing,
              status: updatedSeat.status,
              heldByUserId: updatedSeat.heldByUserId,
            },
          };
        });

        // If the seat held by us was expired/released by the server, clear order
        if (selectedSeat?.id === updatedSeat.seatId && updatedSeat.status === 'AVAILABLE') {
          setSelectedSeat(null);
          setCurrentOrder(null);
          setPaymentStep(false);
        }
      }
    },
  });

  // Handle Auth submission
  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccess('');

    try {
      if (isRegister) {
        await registerMutate({ variables: { email, password } });
        setAuthSuccess('Registration successful! Please login.');
        setIsRegister(false);
      } else {
        const { data: res } = await loginMutate({ variables: { email, password } });
        if (res?.login) {
          login(res.login.token, res.login.user);
        }
      }
    } catch (err: any) {
      setAuthError(err.message || 'Authentication failed');
    }
  };

  // Click hold seat trigger
  const handleHoldSeat = async (seatId: string) => {
    if (!token) return;
    try {
      const { data: holdRes } = await holdSeatMutate({ variables: { seatId } });
      if (holdRes?.holdSeat) {
        const order = holdRes.holdSeat;
        setCurrentOrder(order);
        setSelectedSeat(localSeatsMap[seatId]);
        setPaymentStep(true);
      }
    } catch (err: any) {
      alert(err.message || 'Seat holding failed! Someone might have taken it.');
    }
  };

  // Mock Payment triggers
  const handleSimulatePayment = () => {
    setPaymentSuccess(true);
    setPaymentStep(false);
    // In production a webhook or subscription on orders would push this update
  };

  const handleReset = () => {
    setSelectedSeat(null);
    setCurrentOrder(null);
    setPaymentStep(false);
    setPaymentSuccess(false);
    refetch();
  };

  // Auth screen
  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 font-sans p-6">
        <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl p-8 shadow-2xl">
          <div className="flex flex-col items-center gap-2 mb-8">
            <Ticket className="h-12 w-12 text-indigo-500 animate-pulse" />
            <h1 className="text-2xl font-bold tracking-tight text-white">TicketRush Engine</h1>
            <p className="text-zinc-400 text-sm">High-Throughput Seat Booking System</p>
          </div>

          <form onSubmit={handleAuth} className="space-y-4">
            <div>
              <label className="block text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-2">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-500 transition-colors"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="block text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-2">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-500 transition-colors"
                placeholder="••••••••"
              />
            </div>

            {authError && (
              <div className="flex items-center gap-2 text-red-400 bg-red-950/30 border border-red-900/50 rounded-lg p-3 text-sm">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            {authSuccess && (
              <div className="flex items-center gap-2 text-green-400 bg-green-950/30 border border-green-900/50 rounded-lg p-3 text-sm">
                <CheckCircle className="h-4 w-4 shrink-0" />
                <span>{authSuccess}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loginLoading || registerLoading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold py-3 rounded-lg transition-colors cursor-pointer"
            >
              {isRegister ? 'Create Account' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setIsRegister(!isRegister);
                setAuthError('');
                setAuthSuccess('');
              }}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-medium"
            >
              {isRegister ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-zinc-950 text-zinc-100 font-sans">
      {/* Top Navbar */}
      <header className="border-b border-zinc-900 bg-zinc-900/40 backdrop-blur px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <Ticket className="h-6 w-6 text-indigo-500" />
          <span className="font-bold tracking-tight text-white text-lg">TicketRush</span>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-sm text-zinc-400">
            <UserIcon className="h-4 w-4" />
            <span>{user?.email}</span>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-2 text-sm text-red-400 hover:text-red-300 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            <span>Log out</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left/Middle: SVG Seat Map */}
        <section className="lg:col-span-2 bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col min-h-[500px]">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-white">{data?.getConcertDetail?.title || 'Concert Seat Booking'}</h2>
              <p className="text-zinc-400 text-xs mt-1">{data?.getConcertDetail?.venue} • Live Status</p>
            </div>
            <button
              onClick={() => refetch()}
              className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-all"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>

          {concertLoading ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-800 border-t-indigo-500"></div>
            </div>
          ) : (
            <div className="flex-grow flex items-center justify-center border border-zinc-800/40 rounded-xl bg-zinc-950/50 p-6">
              {/* Interactive SVG Seat Map */}
              <div className="w-full max-w-lg">
                <div className="w-full text-center py-2 bg-zinc-800 text-zinc-400 font-bold text-xs uppercase tracking-widest rounded-lg mb-12 shadow-inner">
                  STAGE
                </div>
                
                <svg viewBox="0 0 500 300" className="w-full h-auto">
                  {/* VIP Zone (Row 1-2) */}
                  <g>
                    {/* VIP A */}
                    {Object.values(localSeatsMap)
                      .filter((s: any) => s.zoneName === 'VIP A')
                      .map((seat: any, index: number) => {
                        const x = 70 + index * 80;
                        const y = 80;
                        const isHeld = seat.status === 'HELD';
                        const isSold = seat.status === 'SOLD';
                        const isMe = isHeld && seat.heldByUserId === user?.id;
                        
                        let fill = '#06b6d4'; // Cyan for VIP AVAILABLE
                        if (isSold) fill = '#3f3f46'; // Zinc 700 for SOLD
                        else if (isHeld) fill = isMe ? '#6366f1' : '#f97316'; // Indigo for US, Orange for OTHER HOLD

                        return (
                          <g key={seat.id}>
                            <rect
                              x={x}
                              y={y}
                              width="50"
                              height="40"
                              rx="6"
                              fill={fill}
                              className={`cursor-pointer transition-all duration-300 ${!isSold && !isHeld ? 'hover:scale-105 active:scale-95' : ''}`}
                              onClick={() => !isSold && !isHeld && handleHoldSeat(seat.id)}
                            />
                            <text
                              x={x + 25}
                              y={y + 24}
                              fill="#fff"
                              fontSize="10"
                              fontWeight="bold"
                              textAnchor="middle"
                              className="pointer-events-none select-none"
                            >
                              {seat.seatNumber}
                            </text>
                          </g>
                        );
                      })}
                  </g>

                  {/* Standard Zone (Row 3-4) */}
                  <g>
                    {Object.values(localSeatsMap)
                      .filter((s: any) => s.zoneName === 'Standard')
                      .map((seat: any, index: number) => {
                        const cols = 5;
                        const col = index % cols;
                        const row = Math.floor(index / cols);
                        const x = 60 + col * 85;
                        const y = 160 + row * 60;
                        const isHeld = seat.status === 'HELD';
                        const isSold = seat.status === 'SOLD';
                        const isMe = isHeld && seat.heldByUserId === user?.id;

                        let fill = '#10b981'; // Green for Standard AVAILABLE
                        if (isSold) fill = '#3f3f46';
                        else if (isHeld) fill = isMe ? '#6366f1' : '#f97316';

                        return (
                          <g key={seat.id}>
                            <rect
                              x={x}
                              y={y}
                              width="55"
                              height="40"
                              rx="6"
                              fill={fill}
                              className={`cursor-pointer transition-all duration-300 ${!isSold && !isHeld ? 'hover:scale-105 active:scale-95' : ''}`}
                              onClick={() => !isSold && !isHeld && handleHoldSeat(seat.id)}
                            />
                            <text
                              x={x + 27}
                              y={y + 24}
                              fill="#fff"
                              fontSize="10"
                              fontWeight="bold"
                              textAnchor="middle"
                              className="pointer-events-none select-none"
                            >
                              {seat.seatNumber}
                            </text>
                          </g>
                        );
                      })}
                  </g>
                </svg>

                {/* Legend */}
                <div className="flex flex-wrap items-center justify-center gap-6 mt-12 pt-6 border-t border-zinc-900 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="h-3.5 w-3.5 bg-cyan-500 rounded"></div>
                    <span className="text-zinc-400">VIP Available ($250)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-3.5 w-3.5 bg-emerald-500 rounded"></div>
                    <span className="text-zinc-400">Standard Available ($100)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-3.5 w-3.5 bg-orange-500 rounded animate-pulse"></div>
                    <span className="text-zinc-400">Held by others</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-3.5 w-3.5 bg-indigo-500 rounded"></div>
                    <span className="text-zinc-400">Your selection</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-3.5 w-3.5 bg-zinc-700 rounded"></div>
                    <span className="text-zinc-400">Sold</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Right Panel: Booking State & Payment */}
        <section className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col">
          <h3 className="text-lg font-bold text-white mb-6 pb-4 border-b border-zinc-800">Reservation Details</h3>

          {!selectedSeat && !paymentSuccess && (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-zinc-500">
              <Ticket className="h-12 w-12 mb-4 text-zinc-700" />
              <p className="font-semibold text-zinc-400">No seat selected</p>
              <p className="text-xs text-zinc-500 mt-2">Select an available seat from the interactive map to begin holding and payment reservation.</p>
            </div>
          )}

          {/* Payment step flow */}
          {paymentStep && selectedSeat && currentOrder && (
            <div className="flex-grow flex flex-col gap-6">
              <div className="bg-zinc-950 rounded-xl p-4 border border-zinc-800">
                <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">Held Seat</span>
                <h4 className="text-xl font-bold text-white mt-1">{selectedSeat.seatNumber} ({selectedSeat.zoneName})</h4>
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-zinc-900">
                  <span className="text-zinc-400 text-sm">Ticket Price</span>
                  <span className="text-white font-bold">${selectedSeat.price}</span>
                </div>
              </div>

              {/* Countdown Timer simulation */}
              <div className="bg-orange-500/10 border border-orange-500/30 text-orange-400 rounded-xl p-4 flex items-center gap-3">
                <Clock className="h-5 w-5 animate-spin" style={{ animationDuration: '6s' }} />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider">Holding Expiration</p>
                  <p className="text-sm mt-0.5">Expires in 10 minutes (RabbitMQ tracking)</p>
                </div>
              </div>

              <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-6 text-center flex flex-col items-center gap-4">
                <p className="text-sm text-zinc-400">Scan QR Code below or click simulated pay button to settle payment</p>
                
                {/* Visual Fake QR Code */}
                <div className="h-44 w-44 bg-white p-2 rounded-xl border border-zinc-800 flex items-center justify-center">
                  <svg className="h-full w-full" viewBox="0 0 100 100">
                    <rect width="100" height="100" fill="white" />
                    {/* Mock QR dots */}
                    <rect x="10" y="10" width="20" height="20" fill="black" />
                    <rect x="15" y="15" width="10" height="10" fill="white" />
                    <rect x="70" y="10" width="20" height="20" fill="black" />
                    <rect x="75" y="15" width="10" height="10" fill="white" />
                    <rect x="10" y="70" width="20" height="20" fill="black" />
                    <rect x="15" y="75" width="10" height="10" fill="white" />
                    <rect x="40" y="40" width="20" height="20" fill="black" />
                    <rect x="45" y="45" width="10" height="10" fill="white" />
                    <rect x="50" y="70" width="10" height="10" fill="black" />
                    <rect x="70" y="50" width="10" height="10" fill="black" />
                  </svg>
                </div>

                <div className="flex gap-3 w-full">
                  <button
                    onClick={handleReset}
                    className="flex-grow bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold py-3 rounded-lg transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSimulatePayment}
                    className="flex-grow bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-lg transition-colors cursor-pointer"
                  >
                    Confirm Payment
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Payment Success state */}
          {paymentSuccess && selectedSeat && (
            <div className="flex-grow flex flex-col gap-6 text-center">
              <div className="flex flex-col items-center justify-center gap-2 py-6">
                <div className="h-16 w-16 bg-green-500/10 border border-green-500/30 text-green-400 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle className="h-8 w-8" />
                </div>
                <h4 className="text-xl font-bold text-white">Payment Confirmed!</h4>
                <p className="text-zinc-400 text-sm">Your seat reservation is now secured.</p>
              </div>

              {/* Generate Virtual Ticket */}
              <div className="bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden relative shadow-2xl">
                {/* Ticket header */}
                <div className="bg-indigo-600 px-6 py-4 text-left">
                  <span className="text-[10px] font-bold text-indigo-200 uppercase tracking-widest">TICKETPASS</span>
                  <h5 className="text-lg font-bold text-white truncate">{data?.getConcertDetail?.title}</h5>
                </div>
                
                {/* Ticket body */}
                <div className="p-6 text-left space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-zinc-500 text-xs">Seat Number</span>
                      <p className="font-bold text-white mt-0.5">{selectedSeat.seatNumber}</p>
                    </div>
                    <div>
                      <span className="text-zinc-500 text-xs">Zone</span>
                      <p className="font-bold text-white mt-0.5">{selectedSeat.zoneName}</p>
                    </div>
                  </div>
                  <div>
                    <span className="text-zinc-500 text-xs">Venue</span>
                    <p className="font-semibold text-zinc-300 mt-0.5">{data?.getConcertDetail?.venue}</p>
                  </div>
                </div>

                {/* Ticket divider */}
                <div className="border-t-2 border-dashed border-zinc-800 relative mx-6 my-2">
                  <div className="absolute -left-[30px] -top-[10px] h-5 w-5 bg-zinc-900 rounded-full border-r border-zinc-800"></div>
                  <div className="absolute -right-[30px] -top-[10px] h-5 w-5 bg-zinc-900 rounded-full border-l border-zinc-800"></div>
                </div>

                {/* Ticket QR scan */}
                <div className="p-6 flex flex-col items-center gap-4 bg-zinc-950/60">
                  <div className="h-32 w-32 bg-white p-2 rounded-lg">
                    <svg className="h-full w-full" viewBox="0 0 100 100">
                      <rect width="100" height="100" fill="white" />
                      {/* Unique Ticket QR dots representation */}
                      <rect x="10" y="10" width="20" height="20" fill="black" />
                      <rect x="15" y="15" width="10" height="10" fill="white" />
                      <rect x="70" y="10" width="20" height="20" fill="black" />
                      <rect x="75" y="15" width="10" height="10" fill="white" />
                      <rect x="10" y="70" width="20" height="20" fill="black" />
                      <rect x="15" y="75" width="10" height="10" fill="white" />
                      {/* Ticket unique code pattern */}
                      <rect x="40" y="40" width="15" height="15" fill="black" />
                      <rect x="55" y="55" width="15" height="15" fill="black" />
                      <rect x="70" y="70" width="10" height="10" fill="black" />
                    </svg>
                  </div>
                  <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">{currentOrder?.id?.slice(0, 18)}...</span>
                </div>
              </div>

              <button
                onClick={handleReset}
                className="w-full bg-zinc-800 hover:bg-zinc-700 text-white font-semibold py-3 rounded-lg transition-colors cursor-pointer"
              >
                Book another ticket
              </button>
            </div>
          )}
        </section>

      </main>
    </div>
  );
}
