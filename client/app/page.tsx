'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { gql } from '@apollo/client';
import { useQuery, useMutation, useSubscription } from '@apollo/client/react';
import { useAuth } from './context/AuthContext';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import {
  EventDetail,
  CheckoutFlow,
  Navigation,
  AlertManager,
} from './components';
import { EventCarousel } from '@/components/EventCarousel';
import { HeroSection } from '@/components/HeroSection';
import { Navbar } from '@/components/Navbar';
import { MobileMenu } from '@/components/MobileMenu';
import { NeonPulseButton } from '@/components/NeonPulseButton';
import { ElectricInput } from '@/components/ElectricInput';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import ELECTRIC_RUSH, { GRADIENTS } from '@/lib/design-tokens';

// Type definitions
interface Seat {
  id: string;
  seatNumber: string;
  status: string;
  heldByUserId?: string;
  heldUntil?: string;
  zoneName?: string;
  price?: number;
}

interface Zone {
  id: string;
  name: string;
  price: number;
  totalSeats: number;
  seats: Seat[];
}

interface Concert {
  id: string;
  title: string;
  description?: string;
  venue?: string;
  startTime?: string;
  imageUrl?: string;
  ticketsSold?: number;
  totalTickets?: number;
  status?: string;
  zones?: Zone[];
}

interface ConcertDetail {
  getConcertDetail?: Concert;
}

interface GraphQLData {
  [key: string]: unknown;
}

// GraphQL Queries & Mutations

// Simple hash function for deterministic pseudo-random values (avoids Math.random in render)
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash) / 2147483647;
}
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

// Get list of concerts (replaces MOCK_EVENTS)
const GET_CONCERTS = gql`
  query GetConcerts($status: String, $limit: Int) {
    getConcerts(status: $status, limit: $limit) {
      id
      title
      description
      venue
      startTime
      status
      availableSeats
      minPrice
      maxPrice
      zoneCount
      imageUrl
    }
    getFeaturedConcerts(limit: 8) {
      id
      title
      description
      venue
      startTime
      status
      availableSeats
      minPrice
      maxPrice
      zoneCount
      imageUrl
    }
  }
`;

// Real payment mutation (replaces handleSimulatePayment fake)
const CONFIRM_PAYMENT = gql`
  mutation ConfirmPayment($orderId: ID!, $paymentMethod: PaymentMethod!) {
    confirmPayment(orderId: $orderId, paymentMethod: $paymentMethod) {
      order {
        id
        status
        totalPrice
        expiresAt
      }
      ticket {
        id
        ticketCode
      }
      paymentReference
      paymentMethod
      paidAt
      totalPrice
    }
  }
`;

// Cancel order mutation
const CANCEL_ORDER = gql`
  mutation CancelOrder($orderId: ID!) {
    cancelOrder(orderId: $orderId) {
      id
      status
    }
  }
`;

// Mock Concert ID for testing
// Must match seeded DB concert UUID: 00000000-0000-0000-0000-000000000001
const MOCK_CONCERT_ID = "00000000-0000-0000-0000-000000000001";

// Mock Events Data
const MOCK_EVENTS = [
  {
    id: 'evt-001',
    title: 'BlackPink World Tour',
    venue: 'My Dinh National Stadium',
    date: '2026-08-15',
    price: 2500000,
    rating: 4.9,
    reviewsCount: 3847,
    ticketsAvailable: 42,
    imageUrl: 'https://picsum.photos/seed/blackpink/800/600',
    category: 'concert' as const,
  },
  {
    id: 'evt-002',
    title: 'Ho Tram Music Festival',
    venue: 'Ho Tram Beach',
    date: '2026-07-20',
    price: 1800000,
    rating: 4.7,
    reviewsCount: 2156,
    ticketsAvailable: 156,
    imageUrl: 'https://picsum.photos/seed/festival/800/600',
    category: 'festival' as const,
  },
  {
    id: 'evt-003',
    title: 'Hoai Linh Comedy Show',
    venue: 'Saigon Opera House',
    date: '2026-07-05',
    price: 800000,
    rating: 4.8,
    reviewsCount: 1523,
    ticketsAvailable: 234,
    imageUrl: 'https://picsum.photos/seed/comedy/800/600',
    category: 'comedy' as const,
  },
  {
    id: 'evt-004',
    title: 'Son Tung M-TP Sky Tour',
    venue: 'Hanoi Indoor Games Gymnasium',
    date: '2026-08-28',
    price: 3200000,
    rating: 4.9,
    reviewsCount: 5682,
    ticketsAvailable: 18,
    imageUrl: 'https://picsum.photos/seed/sontung/800/600',
    category: 'concert' as const,
  },
  {
    id: 'evt-005',
    title: 'Vietnam vs Thailand',
    venue: 'Thong Nhat Stadium',
    date: '2026-09-12',
    price: 500000,
    rating: 4.6,
    reviewsCount: 892,
    ticketsAvailable: 450,
    imageUrl: 'https://picsum.photos/seed/football/800/600',
    category: 'sports' as const,
  },
  {
    id: 'evt-006',
    title: 'Monsoon Music Festival',
    venue: 'Hanoi Opera House',
    date: '2026-10-03',
    price: 1500000,
    rating: 4.8,
    reviewsCount: 2341,
    ticketsAvailable: 89,
    imageUrl: 'https://picsum.photos/seed/monsoon/800/600',
    category: 'festival' as const,
  },
  {
    id: 'evt-007',
    title: 'Den Vau Live in Saigon',
    venue: 'The Reverie Saigon',
    date: '2026-07-18',
    price: 1200000,
    rating: 4.7,
    reviewsCount: 1678,
    ticketsAvailable: 112,
    imageUrl: 'https://picsum.photos/seed/denvau/800/600',
    category: 'concert' as const,
  },
  {
    id: 'evt-008',
    title: 'Hoa Minzy Solo Concert',
    venue: 'Phu Tho Stadium',
    date: '2026-09-25',
    price: 950000,
    rating: 4.5,
    reviewsCount: 987,
    ticketsAvailable: 276,
    imageUrl: 'https://picsum.photos/seed/hoaminzy/800/600',
    category: 'concert' as const,
  },
];

export default function Home() {
  const { token, user, login, logout } = useAuth();

  // Mobile menu state
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Auth Form State
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authSuccess, setAuthSuccess] = useState('');

  // Selected seat state
  const [selectedSeat, setSelectedSeat] = useState<Seat | null>(null);
  const [localSeatsMap, setLocalSeatsMap] = useState<Record<string, Seat>>({});
  const [currentZoneId, setCurrentZoneId] = useState<string | null>(null);

  // Payment flow state
  const [paymentStep, setPaymentStep] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  // Alerts (in-app notifications)
  const [alerts, setAlerts] = useState<Array<{ id: string; type: 'success' | 'error' | 'info'; message: string }>>([]);

  // GraphQL operations
  const { data, loading, error, refetch } = useQuery(GET_CONCERT_DETAIL, {
    variables: { concertId: MOCK_CONCERT_ID },
    skip: !token,
  });

  // Fetch list of concerts for the carousel (replaces MOCK_EVENTS)
  const { data: concertsData, loading: concertsLoading } = useQuery(GET_CONCERTS, {
    variables: { limit: 8 },
    skip: !token,
  });

  // Transform ConcertSummary → EventCard event format
  const liveEvents = useMemo(() => {
    const concerts = (concertsData as GraphQLData)?.getFeaturedConcerts || [];
    return concerts.map((c: Concert) => ({
      id: c.id,
      title: c.title,
      venue: c.venue,
      date: c.startTime,
      price: c.minPrice,
      rating: 4.5 + hashString(c.id) * 0.5, // Simulated — not in ConcertSummary yet
      reviewsCount: Math.floor(500 + hashString(c.id + 'reviews') * 5000), // Simulated
      ticketsAvailable: c.availableSeats,
      imageUrl: c.imageUrl || `https://picsum.photos/seed/${c.id}/800/600`,
      category: 'concert' as const,
    }));
  }, [concertsData]);

  const [holdSeatMutation, { loading: holdingLoading }] = useMutation(HOLD_SEAT);
  const [registerMutation, { loading: registerLoading }] = useMutation(REGISTER);
  const [loginMutation, { loading: loginLoading }] = useMutation(LOGIN);
  const [confirmPaymentMutation, { loading: paymentLoading }] = useMutation(CONFIRM_PAYMENT);
  const [cancelOrderMutation] = useMutation(CANCEL_ORDER);

  const { data: subscriptionData } = useSubscription(SEAT_STATUS_UPDATED, {
    variables: { concertId: MOCK_CONCERT_ID },
    skip: !token,
  });

  // Initialize local seats map from GraphQL data
  useEffect(() => {
    const detail = (data as GraphQLData)?.getConcertDetail;
    if (detail?.zones) {
      const seatsMap: Record<string, Seat> = {};
      detail.zones.forEach((zone: Zone) => {
        zone.seats.forEach((seat: Seat) => {
          seatsMap[seat.id] = { ...seat, zoneId: zone.id, zoneName: zone.name, price: zone.price };
        });
      });
      setLocalSeatsMap(seatsMap);
    }
  }, [data]);

  // Handle real-time seat updates
  useEffect(() => {
    const update = (subscriptionData as GraphQLData)?.seatStatusUpdated;
    if (update) {
      setLocalSeatsMap((prev) => ({
        ...prev,
        [update.seatId]: { ...prev[update.seatId], status: update.status, heldByUserId: update.heldByUserId },
      }));
    }
  }, [subscriptionData]);

  // Alert management
  const addAlert = (type: 'success' | 'error' | 'info', message: string) => {
    const id = Math.random().toString(36);
    setAlerts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setAlerts((prev) => prev.filter((a) => a.id !== id));
    }, 4000);
  };

  // Auth handlers
  const handleAuth = async () => {
    setAuthError('');
    setAuthSuccess('');

    try {
      if (isRegister) {
        const { data } = await registerMutation({ variables: { email, password } });
        if ((data as GraphQLData)?.register) {
          setAuthSuccess('Registration successful! Please login.');
          setIsRegister(false);
        }
      } else {
        const { data } = await loginMutation({ variables: { email, password } });
        const result = (data as GraphQLData)?.login;
        if (result) {
          login(result.token, result.user);
          setAuthSuccess('Login successful!');
        }
      }
    } catch (err: unknown) {
      setAuthError(err.message || 'Authentication failed');
    }
  };

  // Seat booking handlers
  const handleHoldSeat = async (seatId: string, zoneId: string) => {
    try {
      const { data } = await holdSeatMutation({ variables: { seatId } });
      const result = (data as GraphQLData)?.holdSeat;
      if (result) {
        setSelectedSeat({ ...localSeatsMap[seatId], bookingId: result.id, expiresAt: result.expiresAt });
        setCurrentZoneId(zoneId);
        addAlert('success', 'Seat held successfully!');
      }
    } catch (err: unknown) {
      addAlert('error', err.message || 'Failed to hold seat');
    }
  };

  const handleProceedToPayment = () => {
    if (selectedSeat) {
      setPaymentStep(true);
      addAlert('info', 'Proceeding to payment...');
    }
  };

  // Real payment handler — calls confirmPayment mutation
  const handleSimulatePayment = async () => {
    if (!selectedSeat?.bookingId || !selectedPaymentMethod) {
      addAlert('error', 'Missing order ID or payment method');
      return;
    }

    try {
      const { data: result } = await confirmPaymentMutation({
        variables: {
          orderId: selectedSeat.bookingId,
          paymentMethod: selectedPaymentMethod.toUpperCase().replace('-', '_'),
        },
      });

      const paymentResult = (result as GraphQLData)?.confirmPayment;
      if (paymentResult) {
        setPaymentSuccess(true);
        addAlert('success', `Payment successful! Ref: ${paymentResult.paymentReference}`);
      }
    } catch (err: unknown) {
      addAlert('error', err.message || 'Payment failed. Please try again.');
    }
  };

  const handleCancelOrder = async () => {
    if (!selectedSeat?.bookingId) return;
    try {
      await cancelOrderMutation({ variables: { orderId: selectedSeat.bookingId } });
      addAlert('info', 'Order cancelled. Seat released.');
      setSelectedSeat(null);
      setPaymentStep(false);
      setSelectedPaymentMethod(null);
      refetch();
    } catch (err: unknown) {
      addAlert('error', err.message || 'Failed to cancel order');
    }
  };

  const handleReset = () => {
    setSelectedSeat(null);
    setPaymentStep(false);
    setPaymentSuccess(false);
    setSelectedPaymentMethod(null);
    refetch();
  };

  // ============================================================
  // AUTH SCREEN (if not logged in)
  // ============================================================

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={{ background: ELECTRIC_RUSH.colors.offBlack }}>
        {(registerLoading || loginLoading) && <LoadingSpinner fullScreen message="Authenticating..." />}
        
        <motion.div
          className="w-full max-w-md rounded-2xl p-8"
          style={{
            background: `linear-gradient(135deg, ${ELECTRIC_RUSH.colors.surfaceDark}95, ${ELECTRIC_RUSH.colors.offBlack}90)`,
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: `1px solid ${ELECTRIC_RUSH.colors.electricBlue}30`,
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1
            className="text-3xl font-black tracking-tighter text-center mb-2"
            style={{
              background: GRADIENTS.textElectric,
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontFamily: ELECTRIC_RUSH.typography.display,
            }}
          >
            TICKETRUSH
          </h1>
          <p className="text-center text-sm mb-8" style={{ color: ELECTRIC_RUSH.colors.textSecondary }}>
            {isRegister ? 'Create your account' : 'Welcome back'}
          </p>

          <div className="space-y-4">
            <ElectricInput
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={authError && authError.includes('email') ? authError : undefined}
            />
            <ElectricInput
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={authError && authError.includes('password') ? authError : undefined}
            />

            {authError && !authError.includes('email') && !authError.includes('password') && (
              <div className="flex items-center gap-2 p-3 rounded-lg" style={{ background: `${ELECTRIC_RUSH.colors.error}10` }}>
                <AlertCircle size={16} style={{ color: ELECTRIC_RUSH.colors.error }} />
                <span className="text-sm" style={{ color: ELECTRIC_RUSH.colors.error }}>{authError}</span>
              </div>
            )}

            {authSuccess && (
              <div className="flex items-center gap-2 p-3 rounded-lg" style={{ background: `${ELECTRIC_RUSH.colors.success}10` }}>
                <CheckCircle size={16} style={{ color: ELECTRIC_RUSH.colors.success }} />
                <span className="text-sm" style={{ color: ELECTRIC_RUSH.colors.success }}>{authSuccess}</span>
              </div>
            )}

            <NeonPulseButton
              variant="primary"
              size="lg"
              fullWidth
              onClick={handleAuth}
              isLoading={registerLoading || loginLoading}
            >
              {isRegister ? 'Register' : 'Login'}
            </NeonPulseButton>

            <NeonPulseButton
              variant="ghost"
              size="md"
              fullWidth
              onClick={() => {
                setIsRegister(!isRegister);
                setAuthError('');
                setAuthSuccess('');
              }}
            >
              {isRegister ? 'Already have an account? Login' : "Don't have an account? Register"}
            </NeonPulseButton>
          </div>
        </motion.div>
      </div>
    );
  }

  // ============================================================
  // MAIN APP (logged in)
  // ============================================================

  return (
    <div className="min-h-screen" style={{ background: ELECTRIC_RUSH.colors.offBlack }}>
      {/* Navbar */}
      <Navbar
        user={user}
        onLogout={logout}
        onMobileMenuToggle={setIsMobileMenuOpen}
      />

      {/* Mobile Menu */}
      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        user={user}
        onLogout={logout}
      />

      {/* Alert Manager */}
      <AlertManager alerts={alerts} onDismiss={(id) => setAlerts((prev) => prev.filter((a) => a.id !== id))} />

      {/* Hero Section */}
      <HeroSection
        onDiscoverClick={() => addAlert('info', 'Scrolling to events...')}
        onWishlistClick={() => addAlert('info', 'Wishlist feature coming soon!')}
      />

      {/* Event Carousel */}
      <EventCarousel
        events={liveEvents.length > 0 ? liveEvents : MOCK_EVENTS}
        onEventSelect={(eventId: string) => addAlert('info', `Viewing event: ${eventId}`)}
        onEventWishlist={(eventId: string) => addAlert('info', `Added event ${eventId} to wishlist`)}
      />

      {/* Main Content - Seat Booking & Checkout */}
      <motion.div
        className="max-w-7xl mx-auto px-6 py-20"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
      >
        {loading && <LoadingSpinner size="lg" message="Loading concert details..." />}
        
        {error && (
          <div className="flex items-center justify-center gap-3 p-6 rounded-xl" style={{ background: `${ELECTRIC_RUSH.colors.error}10` }}>
            <AlertCircle size={24} style={{ color: ELECTRIC_RUSH.colors.error }} />
            <span style={{ color: ELECTRIC_RUSH.colors.error }}>Error: {error.message}</span>
          </div>
        )}

        {!paymentSuccess && !paymentStep && data && (
          <EventDetail
            eventTitle={(data as GraphQLData)?.getConcertDetail?.title || 'Live Concert'}
            venue={(data as GraphQLData)?.getConcertDetail?.venue}
            date={(data as GraphQLData)?.getConcertDetail?.startTime}
            seats={Object.values(localSeatsMap)}
            selectedSeat={selectedSeat}
            currentUserId={user?.id}
            onSeatSelect={(seatId: string) => handleHoldSeat(seatId, '')}
            onSeatUnselect={() => setSelectedSeat(null)}
          />
        )}

        {paymentStep && selectedSeat && (
          <CheckoutFlow
            selectedSeat={selectedSeat}
            orderTotal={selectedSeat.price}
            onPaymentMethodSelect={setSelectedPaymentMethod}
            onConfirmPayment={handleSimulatePayment}
            isLoading={paymentLoading}
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
              <NeonPulseButton
                variant="primary"
                size="lg"
                onClick={handleReset}
              >
                Book Another Ticket
              </NeonPulseButton>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Footer */}
      <footer className="relative border-t border-zinc-800/60 mt-20 py-16 overflow-hidden">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[400px] h-[200px] bg-gradient-to-b from-electric-blue/5 to-transparent blur-[80px] pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-6">
          <div className="mb-10">
            <h3 className="font-display text-4xl sm:text-5xl font-black tracking-tighter leading-[0.9]">
              <span className="bg-gradient-to-r from-electric-blue via-hot-magenta to-lime-rush bg-clip-text text-transparent">
                SEE YOU IN THE PIT
              </span>
            </h3>
          </div>

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
