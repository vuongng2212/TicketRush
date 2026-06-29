'use client';

import React, { useState, useEffect } from 'react';
import { gql } from '@apollo/client';
import { useQuery, useMutation, useSubscription } from '@apollo/client/react';
import { useAuth } from './context/AuthContext';
import { LogOut, User as UserIcon, Ticket, RefreshCw, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { motion } from 'framer-motion'; // legacy import — keep for existing usage
import {
  HeroSection,
  EventDetail,
  CheckoutFlow,
  EventCarousel,
  Navigation,
  AlertManager,
} from './components';

// GraphQL Queries & Mutations
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

// Mock Concert ID for testing
const MOCK_CONCERT_ID = "00000000-0000-0000-0000-000000000000";

// Mock Events Data
const MOCK_EVENTS = [
  {
    id: '1',
    title: 'Electric Nights Festival',
    artist: 'The Midnight Collective',
    venue: 'Madison Square Garden',
    date: 'July 15, 2026',
    price: 89,
    rating: 4.8,
    image: 'https://picsum.photos/seed/electric-nights/800/600',
  },
  {
    id: '2',
    title: 'Summer Vibes',
    artist: 'Luna Echo',
    venue: 'Central Park Amphitheater',
    date: 'July 22, 2026',
    price: 65,
    rating: 4.5,
    image: 'https://picsum.photos/seed/summer-vibes/800/600',
  },
  {
    id: '3',
    title: 'Neon Nights',
    artist: 'Synthwave Dreams',
    venue: 'Barclays Center',
    date: 'August 5, 2026',
    price: 120,
    rating: 4.9,
    image: 'https://picsum.photos/seed/neon-nights/800/600',
  },
  {
    id: '4',
    title: 'Bass & Beats',
    artist: 'DJ Cipher',
    venue: 'Brooklyn Warehouse',
    date: 'August 10, 2026',
    price: 45,
    rating: 4.6,
    image: 'https://picsum.photos/seed/bass-beats/800/600',
  },
];

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
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>(null);
  const [alerts, setAlerts] = useState<Array<{ id: string; type: 'success' | 'error' | 'info'; message: string }>>([]);

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

        if (selectedSeat?.id === updatedSeat.seatId && updatedSeat.status === 'AVAILABLE') {
          setSelectedSeat(null);
          setCurrentOrder(null);
          setPaymentStep(false);
          addAlert('info', 'Your seat hold has expired');
        }
      }
    },
  });

  // Helper function to add alerts
  const addAlert = (type: 'success' | 'error' | 'info', message: string) => {
    const id = Date.now().toString();
    setAlerts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setAlerts((prev) => prev.filter((a) => a.id !== id));
    }, 5000);
  };

  // Handle Auth submission
  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccess('');

    try {
      if (isRegister) {
        await registerMutate({ variables: { email, password } });
        addAlert('success', 'Registration successful! Please login.');
        setIsRegister(false);
        setEmail('');
        setPassword('');
      } else {
        const { data: res } = await loginMutate({ variables: { email, password } });
        if (res?.login) {
          login(res.login.token, res.login.user);
          addAlert('success', `Welcome back, ${res.login.user.email}!`);
        }
      }
    } catch (err: any) {
      addAlert('error', err.message || 'Authentication failed');
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
        addAlert('success', 'Seat held! Proceed to checkout.');
      }
    } catch (err: any) {
      addAlert('error', err.message || 'Seat holding failed! Someone might have taken it.');
    }
  };

  // Mock Payment triggers
  const handleSimulatePayment = () => {
    setPaymentSuccess(true);
    setPaymentStep(false);
    addAlert('success', 'Payment processed successfully!');
  };

  const handleReset = () => {
    setSelectedSeat(null);
    setCurrentOrder(null);
    setPaymentStep(false);
    setPaymentSuccess(false);
    setSelectedPaymentMethod(null);
    refetch();
  };

  // ──────────────────────────────────────────────
  // AUTH SCREEN — CONCERT POSTER VIBE, NOT CARD
  // ──────────────────────────────────────────────
  if (!token) {
    return (
      <div className="relative min-h-screen min-h-[100dvh] bg-dark-bg overflow-hidden crt-scanlines">
        {/* Massive background typography — poster style */}
        <div className="absolute inset-0 flex items-center justify-center overflow-hidden pointer-events-none select-none">
          <h1 className="font-display text-[clamp(6rem,20vw,16rem)] font-black tracking-tighter leading-none text-white/[0.03] whitespace-nowrap">
            TICKET RUSH
          </h1>
        </div>

        {/* Electric energy leaks — 3 flashing bars, asymmetrical */}
        <div className="absolute top-[15%] left-0 w-[40%] h-[2px] bg-gradient-to-r from-transparent via-electric-blue to-transparent opacity-30 animate-pulse" style={{ animationDuration: '3s' }} />
        <div className="absolute bottom-[25%] right-0 w-[55%] h-[1px] bg-gradient-to-r from-transparent via-hot-magenta to-transparent opacity-25 animate-pulse" style={{ animationDuration: '4s', animationDelay: '1s' }} />
        <div className="absolute top-[60%] left-[10%] w-[30%] h-[1px] bg-gradient-to-r from-transparent via-lime-rush to-transparent opacity-20 animate-pulse" style={{ animationDuration: '2.5s', animationDelay: '0.5s' }} />

        {/* Decorative floating elements — rave flyer chaos */}
        <div className="absolute top-8 left-8 w-2 h-2 rounded-full bg-electric-blue animate-ping opacity-20" style={{ animationDuration: '2s' }} />
        <div className="absolute bottom-12 right-12 w-3 h-3 rounded-full bg-hot-magenta animate-ping opacity-15" style={{ animationDuration: '3s', animationDelay: '1.5s' }} />

        {/* Scanline glow streaks */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[200px] h-[600px] bg-gradient-to-b from-electric-blue/5 via-hot-magenta/[0.02] to-transparent blur-3xl -rotate-12 pointer-events-none" />
        <div className="absolute top-3/4 -right-20 w-[300px] h-[300px] bg-gradient-to-b from-lime-rush/5 to-transparent blur-[100px] pointer-events-none" />

        <div className="relative z-10 min-h-[100dvh] flex flex-col lg:flex-row items-stretch">
          {/* LEFT — Poster typography (hidden on mobile, visible lg+) */}
          <div className="hidden lg:flex lg:w-1/2 flex-col justify-center px-10 lg:px-16 py-12 select-none">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            >
              {/* Distorted/stacked text */}
              <div className="relative mb-8">
                <span className="block font-display text-[clamp(3.5rem,5.5vw,6rem)] font-black tracking-tighter leading-[0.85] bg-gradient-to-r from-electric-blue via-electric-cyan to-electric-blue bg-clip-text text-transparent">
                  TICKET
                </span>
                <span className="block font-display text-[clamp(3.5rem,5.5vw,6rem)] font-black tracking-tighter leading-[0.85] bg-gradient-to-r from-hot-magenta via-hot-pink to-hot-magenta bg-clip-text text-transparent ml-[0.15em]">
                  RUSH
                </span>
              </div>

              {/* Zine-style meta line */}
              <p className="font-mono text-xs text-zinc-600 uppercase tracking-[0.25em] mb-3">
                EST. 2026 // NYC
              </p>
              <p className="font-mono text-[11px] text-zinc-700 leading-relaxed max-w-[40ch]">
                REAL-TIME TICKETING. NO BROWSER QUEUES. NO BOTS. JUST YOU AND THE SHOW.
              </p>
            </motion.div>
          </div>

          {/* RIGHT — Auth form */}
          <div className="flex-1 flex items-center justify-center px-6 py-12 lg:pr-16">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="w-full max-w-md"
            >
              {/* Mobile mini-logo */}
              <div className="lg:hidden mb-8 text-center">
                <span className="font-display text-3xl font-black tracking-tighter bg-gradient-to-r from-electric-blue via-hot-magenta to-lime-rush bg-clip-text text-transparent">
                  TICKET RUSH
                </span>
              </div>

              {/* Form card — offset, asymmetrical border treatment */}
              <div className="relative">
                {/* Top-left accent corner */}
                <div className="absolute -top-3 -left-3 w-8 h-8 border-l-2 border-t-2 border-electric-blue/40" />

                <div className="bg-dark-surface/70 backdrop-blur-xl border border-zinc-800/80 rounded-xl p-8">
                  <form onSubmit={handleAuth} className="space-y-5">
                    {/* Mini eyebrow (the ONLY one on this screen) */}
                    <p className="font-mono text-[10px] text-zinc-600 uppercase tracking-[0.2em] mb-6">
                      {isRegister ? 'CREATE ACCOUNT' : 'SIGN IN'}
                    </p>

                    <div>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-dark-bg/80 border border-zinc-800 rounded-lg px-4 py-3.5 text-white text-sm placeholder-zinc-700 focus:outline-none focus:border-electric-blue/50 focus:ring-1 focus:ring-electric-blue/20 transition-all"
                        placeholder="EMAIL"
                      />
                    </div>

                    <div>
                      <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-dark-bg/80 border border-zinc-800 rounded-lg px-4 py-3.5 text-white text-sm placeholder-zinc-700 focus:outline-none focus:border-hot-magenta/50 focus:ring-1 focus:ring-hot-magenta/20 transition-all"
                        placeholder="PASSWORD"
                      />
                    </div>

                    {authError && (
                      <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-2 text-red-400 bg-red-950/30 border border-red-900/40 rounded-lg px-3.5 py-2.5 text-xs"
                      >
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{authError}</span>
                      </motion.div>
                    )}

                    {authSuccess && (
                      <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-2 text-lime-rush bg-lime-rush/5 border border-lime-rush/20 rounded-lg px-3.5 py-2.5 text-xs"
                      >
                        <CheckCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{authSuccess}</span>
                      </motion.div>
                    )}

                    <motion.button
                      type="submit"
                      disabled={loginLoading || registerLoading}
                      className="w-full py-3.5 rounded-lg bg-gradient-to-r from-electric-blue to-electric-cyan text-dark-bg font-bold text-sm tracking-wider uppercase disabled:opacity-40 transition-all"
                      whileHover={{ scale: 1.02, boxShadow: '0 0 30px rgba(0,212,255,0.3)' }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {loginLoading || registerLoading ? (
                        <span className="flex items-center justify-center gap-2">
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          {isRegister ? 'CREATING...' : 'ENTERING...'}
                        </span>
                      ) : (
                        isRegister ? 'CREATE ACCOUNT' : 'ENTER'
                      )}
                    </motion.button>
                  </form>

                  {/* Toggle */}
                  <div className="mt-6 text-center">
                    <button
                      onClick={() => {
                        setIsRegister(!isRegister);
                        setAuthError('');
                        setAuthSuccess('');
                      }}
                      className="font-mono text-[11px] text-zinc-600 hover:text-electric-blue uppercase tracking-[0.15em] transition-colors"
                    >
                      {isRegister
                        ? 'ALREADY IN? SIGN IN →'
                        : 'FIRST TIME? JOIN →'}
                    </button>
                  </div>
                </div>

                {/* Bottom-right accent corner */}
                <div className="absolute -bottom-3 -right-3 w-8 h-8 border-r-2 border-b-2 border-hot-magenta/40" />
              </div>

              {/* Footer text — raw zine style */}
              <p className="mt-8 text-center font-mono text-[10px] text-zinc-800 uppercase tracking-[0.2em]">
                F*CK THE QUEUE. GET THE SEAT.
              </p>
            </motion.div>
          </div>
        </div>

        {/* Alerts */}
        <AlertManager alerts={alerts} onDismiss={(id) => setAlerts((a) => a.filter((x) => x.id !== id))} />
      </div>
    );
  }

  // ──────────────────────────────────────────────
  // MAIN AUTHENTICATED VIEW
  // ──────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-dark-bg text-zinc-100 crt-scanlines">
      {/* Navigation */}
      <Navigation
        userEmail={user?.email}
        onLogout={logout}
        onNavigate={(section) => console.log('Navigate to:', section)}
      />

      {/* Hero Section */}
      <HeroSection
        events={MOCK_EVENTS}
        onEventSelect={(eventId) => addAlert('info', `Selected event: ${eventId}`)}
      />

      {/* Event Carousel */}
      <EventCarousel
        events={MOCK_EVENTS}
        onEventSelect={(eventId) => addAlert('info', `Viewing event: ${eventId}`)}
      />

      {/* Main Content - Seat Booking & Checkout */}
      <motion.div
        className="max-w-7xl mx-auto px-6 py-20"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
      >
        {!paymentSuccess && !paymentStep && (
          <EventDetail
            eventTitle={data?.getConcertDetail?.title || 'Live Concert'}
            venue={data?.getConcertDetail?.venue}
            date={data?.getConcertDetail?.startTime}
            seats={Object.values(localSeatsMap)}
            selectedSeat={selectedSeat}
            currentUserId={user?.id}
            onSeatSelect={handleHoldSeat}
            onSeatUnselect={() => setSelectedSeat(null)}
          />
        )}

        {paymentStep && selectedSeat && (
          <CheckoutFlow
            selectedSeat={selectedSeat}
            orderTotal={selectedSeat.price}
            onPaymentMethodSelect={setSelectedPaymentMethod}
            onConfirmPayment={handleSimulatePayment}
            isLoading={false}
            paymentSuccess={paymentSuccess}
          />
        )}

        {paymentSuccess && (
          <motion.div
            className="text-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="mb-8">
              <button
                onClick={handleReset}
                className="px-8 py-3 bg-lime-rush text-dark-bg font-bold rounded-lg hover:shadow-glow-lime transition-all"
              >
                Book Another Ticket
              </button>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* ────────────────────────────────────────── */}
      {/* FOOTER — RAW, AGGRESSIVE, NOT GENERIC       */}
      {/* ────────────────────────────────────────── */}
      <footer className="relative border-t border-zinc-800/60 mt-20 py-16 overflow-hidden">
        {/* Background flare */}
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[400px] h-[200px] bg-gradient-to-b from-electric-blue/5 to-transparent blur-[80px] pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-6">
          {/* Row 1: bold statement */}
          <div className="mb-10">
            <h3 className="font-display text-4xl sm:text-5xl font-black tracking-tighter leading-[0.9]">
              <span className="bg-gradient-to-r from-electric-blue via-hot-magenta to-lime-rush bg-clip-text text-transparent">
                SEE YOU IN THE PIT
              </span>
            </h3>
          </div>

          {/* Row 2: links + boaster */}
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-8">
            <div className="flex flex-wrap gap-x-8 gap-y-2">
              <a href="#" className="text-zinc-600 hover:text-electric-blue text-sm font-mono uppercase tracking-wider transition-colors">
                Instagram
              </a>
              <a href="#" className="text-zinc-600 hover:text-hot-magenta text-sm font-mono uppercase tracking-wider transition-colors">
                Twitter / X
              </a>
              <a href="#" className="text-zinc-600 hover:text-lime-rush text-sm font-mono uppercase tracking-wider transition-colors">
                Discord
              </a>
              <a href="#" className="text-zinc-600 hover:text-zinc-400 text-sm font-mono uppercase tracking-wider transition-colors">
                Privacy
              </a>
              <a href="#" className="text-zinc-600 hover:text-zinc-400 text-sm font-mono uppercase tracking-wider transition-colors">
                Terms
              </a>
            </div>

            <p className="font-mono text-[10px] text-zinc-800 uppercase tracking-[0.2em] whitespace-nowrap">
              NO SERVICE FEES. NO BOTS. JUST NOISE.
            </p>
          </div>

          {/* Row 3: bottom bar */}
          <div className="mt-10 pt-6 border-t border-zinc-800/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <p className="font-mono text-[10px] text-zinc-800">
              TICKETRUSH // 2026
            </p>
            <p className="font-mono text-[10px] text-zinc-800">
              BUILT WITH SPRING BOOT + NEXT.JS + CAFFEINE
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
