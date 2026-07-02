'use client';

import { EventRow } from './EventRow';
import type { EditorialEvent } from './EventRow';

interface TimeBucketProps {
  title: 'TỐI NAY' | 'CUỐI TUẦN' | 'ĐANG MỞ BÁN';
  events: EditorialEvent[];
  onEventSelect?: (eventId: string) => void;
}

/**
 * Editorial TimeBucket
 * - 80px section header
 * - Vertical list of EventRow
 * - Top + bottom hairline, no chrome
 */
export const TimeBucket = ({ title, events, onEventSelect }: TimeBucketProps) => {
  if (events.length === 0) return null;

  return (
    <section
      className="w-full border-t border-hairline"
      aria-label={title}
    >
      <div className="px-6 lg:px-12 pt-16 lg:pt-24 pb-8">
        {/* 80px section header */}
        <h2
          className="font-display uppercase text-coral leading-[0.95] tracking-[-0.01em]"
          style={{
            fontSize: 'clamp(48px, 8vw, 80px)',
            fontWeight: 400,
          }}
        >
          {title}
        </h2>
        <p className="mt-4 font-mono text-small text-muted uppercase tracking-[0.15em]">
          {events.length} sự kiện
        </p>
      </div>

      <div role="list">
        {events.map((event, idx) => (
          <div role="listitem" key={event.id}>
            <EventRow
              event={event}
              onSelect={onEventSelect}
              index={idx}
            />
          </div>
        ))}
      </div>
    </section>
  );
};

export default TimeBucket;
