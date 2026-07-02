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
import { LoadingState } from './components/LoadingState';
import { ErrorState } from './components/ErrorState';
import { EmptyState } from './components/EmptyState';

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

// FALLBACK_EVENTS removed - using empty state UI

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
  const { data, loading, error } = useQuery(GET_CONCERTS, {
    variables: { limit: 12 },
    skip: !token,
  });

  // Map GraphQL → EditorialEvent
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
    if (!concerts || concerts.length === 0) return [];
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
    return null;
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

  // Loading state
  if (loading) {
    return <LoadingState />;
  }

  // Error state
  if (error) {
    return <ErrorState message={error.message} />;
  }

  // Empty state
  if (allEvents.length === 0) {
    return <EmptyState message="Chưa có sự kiện nào" />;
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
        onCityChange={setSelectedCity}
      />
      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        user={user}
        onLogoutClick={logout}
        onCityChange={setSelectedCity}
      />

      <main className="flex-1">
        <HeroSection
          city={selectedCity}
          timeBucket="TỐI NAY"
          eventCount={buckets.tonight.length + buckets.weekend.length + buckets.onSale.length}
          photoUrl={featuredEvent?.imageUrl}
          onCityChange={setSelectedCity}
        />

        {featuredEvent && (
          <FeaturedEvent
            event={featuredEvent}
            onSelect={setBookingEventId}
          />
        )}

        <div id="tonight">
          <TimeBucket
            title="TỐI NAY"
            events={buckets.tonight}
            onEventSelect={setBookingEventId}
          />
        </div>
        <div id="weekend">
          <TimeBucket
            title="CUỐI TUẦN"
            events={buckets.weekend}
            onEventSelect={setBookingEventId}
          />
        </div>
        <div id="onsale">
          <TimeBucket
            title="ĐANG MỞ BÁN"
            events={buckets.onSale}
            onEventSelect={setBookingEventId}
          />
        </div>
      </main>

      <Footer />
    </div>
  );
}
