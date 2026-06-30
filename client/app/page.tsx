'use client';

import React, { useState, useMemo } from 'react';
import { useQuery } from '@apollo/client/react';
import { gql } from '@apollo/client';
import { useAuth } from './context/AuthContext';
import { Navbar } from '@/components/Navbar';
import { MobileMenu } from '@/components/MobileMenu';
import { HeroSection } from '@/components/HeroSection';
import { TimeBucket } from '@/components/TimeBucket';
import { FeaturedEvent } from '@/components/FeaturedEvent';
import { Footer } from '@/components/Footer';
import { AuthScreen } from './components/AuthScreen';
import { BookingFlow } from './components/BookingFlow';

import type { EditorialEvent } from '@/components/EventRow';
import { formatDateBucket } from '@/lib/design-tokens';

// ============================================================
// GRAPHQL
// ============================================================

const GET_CONCERTS = gql`
  query GetConcerts($limit: Int) {
    getConcerts(limit: $limit) {
      id
      title
      artist
      city
      venue
      startTime
      minPrice
      availableSeats
      imageUrl
      ticketStatus
    }
    getFeaturedConcerts(limit: 1) {
      id
      title
      artist
      city
      venue
      startTime
      minPrice
      availableSeats
      imageUrl
      ticketStatus
    }
  }
`;

// ============================================================
// FALLBACK (used when backend offline / dev mode)
// ============================================================

const FALLBACK_EVENTS: EditorialEvent[] = [
  {
    id: 'fb-001',
    title: 'SOÁI NHIỄM',
    artist: 'SOÁI NHIỄM',
    venue: 'Nhà hát Bến Thành',
    startTime: new Date(Date.now() + 4 * 3600 * 1000).toISOString(),
    minPrice: 450000,
    availableSeats: 23,
    imageUrl: undefined,
    ticketStatus: 'ON_SALE',
    city: 'Sài Gòn',
  },
  {
    id: 'fb-002',
    title: 'W/N',
    artist: 'W/N',
    venue: 'Cargo Bar',
    startTime: new Date(Date.now() + 6 * 3600 * 1000).toISOString(),
    minPrice: 350000,
    availableSeats: 89,
    imageUrl: undefined,
    ticketStatus: 'ON_SALE',
    city: 'Sài Gòn',
  },
  {
    id: 'fb-003',
    title: 'ĐEN VÂU',
    artist: 'Đen Vâu',
    venue: 'The Reverie Saigon',
    startTime: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
    minPrice: 1200000,
    availableSeats: 112,
    imageUrl: undefined,
    ticketStatus: 'ON_SALE',
    city: 'Sài Gòn',
  },
  {
    id: 'fb-004',
    title: 'MỸ TÂM',
    artist: 'Mỹ Tâm',
    venue: 'Phú Thọ Indoor',
    startTime: new Date(Date.now() + 36 * 3600 * 1000).toISOString(),
    minPrice: 1800000,
    availableSeats: 0,
    imageUrl: undefined,
    ticketStatus: 'SOLD_OUT',
    city: 'Sài Gòn',
  },
  {
    id: 'fb-005',
    title: 'SON TÙNG M-TP',
    artist: 'Sơn Tùng M-TP',
    venue: 'Hà Nội Indoor Games Gymnasium',
    startTime: new Date(Date.now() + 60 * 3600 * 1000).toISOString(),
    minPrice: 2500000,
    availableSeats: 0,
    imageUrl: undefined,
    ticketStatus: 'SOLD_OUT',
    city: 'Hà Nội',
  },
  {
    id: 'fb-006',
    title: 'HOÀI LINH COMEDY',
    artist: 'Hoài Linh',
    venue: 'Saigon Opera House',
    startTime: new Date(Date.now() + 84 * 3600 * 1000).toISOString(),
    minPrice: 800000,
    availableSeats: 234,
    imageUrl: undefined,
    ticketStatus: 'COMING_SOON',
    city: 'Sài Gòn',
  },
  {
    id: 'fb-007',
    title: 'MONSOON MUSIC',
    artist: 'Monsoon Music Festival',
    venue: 'Hà Nội Opera House',
    startTime: new Date(Date.now() + 96 * 3600 * 1000).toISOString(),
    minPrice: 1500000,
    availableSeats: 89,
    imageUrl: undefined,
    ticketStatus: 'ON_SALE',
    city: 'Hà Nội',
  },
  {
    id: 'fb-008',
    title: 'ĐÀ NẴNG ROCK',
    artist: 'Microwave',
    venue: 'Cocobay Đà Nẵng',
    startTime: new Date(Date.now() + 120 * 3600 * 1000).toISOString(),
    minPrice: 600000,
    availableSeats: 156,
    imageUrl: undefined,
    ticketStatus: 'ON_SALE',
    city: 'Đà Nẵng',
  },
];

// ============================================================
// PAGE
// ============================================================

export default function Home() {
  const { token, user, logout } = useAuth();

  // UI state
  const [selectedCity, setSelectedCity] = useState<'Hà Nội' | 'Sài Gòn' | 'Đà Nẵng'>('Sài Gòn');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [bookingEventId, setBookingEventId] = useState<string | null>(null);

  // GraphQL
  const { data } = useQuery(GET_CONCERTS, {
    variables: { limit: 12 },
    skip: !token,
  });

  // Map GraphQL → EditorialEvent, fallback to FALLBACK_EVENTS
  const allEvents = useMemo<EditorialEvent[]>(() => {
    type Raw = {
      id: string;
      title: string;
      artist?: string;
      city?: string;
      venue: string;
      startTime: string;
      minPrice: number;
      availableSeats: number;
      imageUrl?: string;
      ticketStatus?: 'ON_SALE' | 'SOLD_OUT' | 'COMING_SOON';
    };
    const concerts = (data as { getConcerts?: Raw[] } | undefined)?.getConcerts;
    if (!concerts || concerts.length === 0) return FALLBACK_EVENTS;
    return concerts.map((c) => ({
      id: c.id,
      title: c.title,
      artist: c.artist ?? c.title,
      venue: c.venue,
      startTime: c.startTime,
      minPrice: c.minPrice,
      availableSeats: c.availableSeats,
      imageUrl: c.imageUrl,
      ticketStatus: c.ticketStatus ?? 'ON_SALE',
      city: c.city ?? 'Sài Gòn',
    }));
  }, [data]);

  const featuredEvent = useMemo<EditorialEvent | null>(() => {
    type Raw = {
      id: string;
      title: string;
      artist?: string;
      city?: string;
      venue: string;
      startTime: string;
      minPrice: number;
      availableSeats: number;
      imageUrl?: string;
      ticketStatus?: 'ON_SALE' | 'SOLD_OUT' | 'COMING_SOON';
    };
    const f = (data as { getFeaturedConcerts?: Raw[] } | undefined)?.getFeaturedConcerts?.[0];
    if (f) {
      return {
        id: f.id,
        title: f.title,
        artist: f.artist ?? f.title,
        venue: f.venue,
        startTime: f.startTime,
        minPrice: f.minPrice,
        availableSeats: f.availableSeats,
        imageUrl: f.imageUrl,
        ticketStatus: f.ticketStatus ?? 'ON_SALE',
        city: f.city ?? 'Sài Gòn',
      };
    }
    return FALLBACK_EVENTS[0];
  }, [data]);

  // Filter by city + bucket
  const cityEvents = useMemo(
    () => allEvents.filter((e) => e.city === selectedCity),
    [allEvents, selectedCity],
  );

  const buckets = useMemo(() => {
    const tonight: EditorialEvent[] = [];
    const weekend: EditorialEvent[] = [];
    const onSale: EditorialEvent[] = [];
    for (const e of cityEvents) {
      const b = formatDateBucket(e.startTime);
      if (b === 'TONIGHT') tonight.push(e);
      else if (b === 'WEEKEND') weekend.push(e);
      else onSale.push(e);
    }
    return { tonight, weekend, onSale };
  }, [cityEvents]);

  // Auth gate
  if (!token) {
    return <AuthScreen />;
  }

  // Booking flow overlay
  if (bookingEventId) {
    return (
      <BookingFlow
        eventId={bookingEventId}
        onBack={() => setBookingEventId(null)}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-ink text-paper">
      <Navbar
        user={user}
        onLogoutClick={logout}
        onMenuClick={() => setIsMobileMenuOpen((v) => !v)}
      />
      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        user={user}
        onLogoutClick={logout}
      />

      <main className="flex-1">
        <HeroSection
          city={selectedCity}
          timeBucket="TỐI NAY"
          eventCount={buckets.tonight.length + buckets.weekend.length}
          onCityChange={setSelectedCity}
        />

        {featuredEvent && (
          <FeaturedEvent
            event={featuredEvent}
            onSelect={setBookingEventId}
          />
        )}

        <TimeBucket
          title="TỐI NAY"
          events={buckets.tonight}
          onEventSelect={setBookingEventId}
        />
        <TimeBucket
          title="CUỐI TUẦN"
          events={buckets.weekend}
          onEventSelect={setBookingEventId}
        />
        <TimeBucket
          title="ĐANG MỞ BÁN"
          events={buckets.onSale}
          onEventSelect={setBookingEventId}
        />
      </main>

      <Footer />
    </div>
  );
}
