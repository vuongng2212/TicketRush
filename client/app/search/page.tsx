'use client';

import React, { useState, useMemo, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQuery } from '@apollo/client/react';
import { gql } from '@apollo/client';
import { useAuth } from '../context/AuthContext';
import { Navbar } from '@/components/Navbar';
import { MobileMenu } from '@/components/MobileMenu';
import { EventRow } from '@/components/EventRow';
import { Footer } from '@/components/Footer';
import { AuthScreen } from '../components/AuthScreen';

import type { EditorialEvent } from '@/components/EventRow';

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
  }
`;

function SearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { token, user, logout } = useAuth();

  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [debouncedQuery, setDebouncedQuery] = useState(searchQuery);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Debounce search input (300ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // GraphQL
  const { data, loading } = useQuery(GET_CONCERTS, {
    variables: { limit: 50 },
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

  // Client-side filter by artist or title
  const filteredEvents = useMemo(() => {
    if (!debouncedQuery.trim()) return allEvents;
    const q = debouncedQuery.toLowerCase();
    return allEvents.filter(
      (e) =>
        e.artist.toLowerCase().includes(q) ||
        e.title.toLowerCase().includes(q),
    );
  }, [allEvents, debouncedQuery]);

  // Auth gate
  if (!token) {
    return <AuthScreen />;
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

      <main className="flex-1 px-6 lg:px-12 py-12">
        {/* Back button */}
        <button
          type="button"
          onClick={() => router.push('/')}
          className="font-mono text-small uppercase text-muted hover:text-coral tracking-[0.1em] mb-8"
        >
          ← Trang chủ
        </button>

        {/* Search header */}
        <div className="mb-12">
          <h1
            className="font-display uppercase text-coral leading-[0.85] tracking-[-0.02em] mb-6"
            style={{
              fontSize: 'clamp(60px, 10vw, 120px)',
              fontWeight: 400,
            }}
          >
            Tìm nghệ sĩ
          </h1>

          {/* Search input */}
          <div className="max-w-2xl">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Nhập tên nghệ sĩ hoặc concert..."
              className="w-full bg-transparent text-paper placeholder:text-muted font-body text-body py-4 px-0 border-b border-paper focus:outline-none focus:border-coral"
              aria-label="Tìm kiếm nghệ sĩ hoặc concert"
            />
          </div>

          {/* Result count */}
          <p className="mt-4 font-mono text-small text-muted uppercase tracking-[0.15em]">
            {loading
              ? 'Đang tải...'
              : `${filteredEvents.length} kết quả${debouncedQuery.trim() ? ` cho "${debouncedQuery}"` : ''}`}
          </p>
        </div>

        {/* Results grid */}
        {filteredEvents.length > 0 ? (
          <div className="space-y-4">
            {filteredEvents.map((event, index) => (
              <EventRow
                key={event.id}
                event={event}
                index={index}
                onSelect={() => {
                  // Navigate back to home and trigger booking
                  router.push(`/?booking=${event.id}`);
                }}
              />
            ))}
          </div>
        ) : (
          !loading && (
            <div className="py-24 text-center">
              <p className="font-body text-body text-muted">
                {debouncedQuery.trim()
                  ? 'Không tìm thấy kết quả phù hợp'
                  : 'Nhập tên nghệ sĩ hoặc concert để tìm kiếm'}
              </p>
            </div>
          )
        )}
      </main>

      <Footer />
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-ink" />}>
      <SearchContent />
    </Suspense>
  );
}
