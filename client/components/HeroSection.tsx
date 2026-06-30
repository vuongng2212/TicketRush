'use client';

import { useState } from 'react';
import Image from 'next/image';
import EDITORIAL from '@/lib/design-tokens';

interface HeroSectionProps {
  city: string;
  photoUrl?: string;
  timeBucket: string; // "TỐI NAY" | "CUỐI TUẦN"
  eventCount?: number;
  onCityChange?: (city: 'Hà Nội' | 'Sài Gòn' | 'Đà Nẵng') => void;
}

const CITIES: Array<'Hà Nội' | 'Sài Gòn' | 'Đà Nẵng'> = ['Hà Nội', 'Sài Gòn', 'Đà Nẵng'];

/**
 * Editorial Music Discovery Hero
 * - 200px H1 in Bebas Neue coral on near-black
 * - Right column full-bleed photo (placeholder if no URL)
 * - Time bucket label + city filter
 * - NO motion, NO rounded, NO glow
 */
export const HeroSection = ({
  city,
  photoUrl,
  timeBucket,
  eventCount = 0,
  onCityChange,
}: HeroSectionProps) => {
  const [activeCity, setActiveCity] = useState<'Hà Nội' | 'Sài Gòn' | 'Đà Nẵng'>(
    city as 'Hà Nội' | 'Sài Gòn' | 'Đà Nẵng',
  );

  const handleCityClick = (c: 'Hà Nội' | 'Sài Gòn' | 'Đà Nẵng') => {
    setActiveCity(c);
    onCityChange?.(c);
  };

  return (
    <header
      className="w-full bg-ink border-b border-hairline"
      aria-label="Hero"
    >
      <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-0">
        {/* LEFT: Massive H1 + time bucket */}
        <div className="px-8 lg:px-16 py-16 lg:py-24 flex flex-col justify-between min-h-[600px] lg:min-h-[720px]">
          <div>
            {/* Date stamp top-left */}
            <p className="font-mono text-label uppercase tracking-[0.2em] text-muted mb-8">
              {new Date().toLocaleDateString('vi-VN', {
                weekday: 'short',
                day: '2-digit',
                month: 'short',
                year: 'numeric',
              }).toUpperCase()}
            </p>

            {/* Massive H1 — Bebas Neue coral, 200px */}
            <h1
              className="font-display text-coral uppercase leading-[0.85] tracking-[-0.02em]"
              style={{
                fontSize: 'clamp(80px, 14vw, 200px)',
                fontWeight: 400,
              }}
            >
              Âm nhạc
              <br />
              {activeCity}
            </h1>

            {/* Time bucket label */}
            <div className="mt-12 flex items-baseline gap-4">
              <span
                className="font-label uppercase text-paper tracking-[0.15em]"
                style={{ fontSize: '32px', fontWeight: 600 }}
              >
                {timeBucket}
              </span>
              <span className="font-mono text-muted text-small">
                {eventCount > 0 ? `${eventCount} sự kiện` : 'đang cập nhật'}
              </span>
            </div>
          </div>

          {/* City filter — underlined, not pills */}
          <nav className="mt-16" aria-label="City filter">
            <p className="font-mono text-label uppercase text-muted mb-4">
              Chọn thành phố
            </p>
            <ul className="flex flex-wrap gap-x-8 gap-y-2">
              {CITIES.map((c) => (
                <li key={c}>
                  <button
                    type="button"
                    onClick={() => handleCityClick(c)}
                    className={[
                      'font-display uppercase tracking-[-0.01em] text-[32px] lg:text-[40px] leading-none pb-1',
                      'transition-none',
                      activeCity === c
                        ? 'text-coral border-b-2 border-coral'
                        : 'text-paper hover:text-coral',
                    ].join(' ')}
                    aria-pressed={activeCity === c}
                  >
                    {c}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* RIGHT: Full-bleed concert photo */}
        <div className="relative bg-ink-2 min-h-[400px] lg:min-h-[720px] overflow-hidden">
          {photoUrl ? (
            <Image
              src={photoUrl}
              alt={`Concert in ${activeCity}`}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          ) : (
            // Placeholder — dark with subtle grain, no AI-generated imagery
            <div
              className="absolute inset-0 flex items-end p-8 lg:p-12"
              style={{
                background: `linear-gradient(135deg, ${EDITORIAL.colors.inkAlt} 0%, ${EDITORIAL.colors.ink} 100%)`,
              }}
              aria-label="Concert photo placeholder"
            >
              <p className="font-mono text-label uppercase text-muted tracking-[0.2em]">
                [ảnh concert sẽ hiển thị tại đây]
              </p>
            </div>
          )}

          {/* Photo credit — bottom right, mono small */}
          {photoUrl && (
            <p className="absolute bottom-4 right-4 font-mono text-[10px] uppercase text-paper/60 bg-ink/60 px-2 py-1 tracking-wider">
              ảnh: archive
            </p>
          )}
        </div>
      </div>
    </header>
  );
};

export default HeroSection;
