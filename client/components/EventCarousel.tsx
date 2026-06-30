'use client';

import { motion, useReducedMotion } from 'framer-motion';
import ELECTRIC_RUSH, { GRADIENTS } from '@/lib/design-tokens';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { EventCard, EventCardProps } from './EventCard';

// ============================================================
// TYPES & INTERFACES
// ============================================================

interface EventCarouselProps {
  title?: string;
  events: EventCardProps['event'][];
  onEventSelect?: (eventId: string) => void;
  onEventWishlist?: (eventId: string) => void;
  showFilters?: boolean;
}

const FILTER_OPTIONS = ['All', 'Today', 'This Week', 'This Month'];

// ============================================================
// FILTER PILLS COMPONENT
// ============================================================

const FilterPills = ({
  activeFilter,
  onFilterChange,
}: {
  activeFilter: string;
  onFilterChange: (filter: string) => void;
}) => {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {FILTER_OPTIONS.map((filter) => {
        const isActive = filter === activeFilter;
        return (
          <motion.button
            key={filter}
            className="px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wider transition-all"
            style={{
              background: isActive
                ? GRADIENTS.buttonPrimary
                : `${ELECTRIC_RUSH.colors.surfaceDark}80`,
              color: isActive
                ? ELECTRIC_RUSH.colors.offBlack
                : ELECTRIC_RUSH.colors.textSecondary,
              border: isActive
                ? 'none'
                : `1px solid ${ELECTRIC_RUSH.colors.electricBlue}20`,
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
            }}
            whileHover={
              prefersReducedMotion
                ? {}
                : {
                    scale: 1.05,
                    boxShadow: isActive
                      ? `0 0 20px ${ELECTRIC_RUSH.colors.glowLime}`
                      : `0 0 15px ${ELECTRIC_RUSH.colors.glowCyan}`,
                  }
            }
            whileTap={{ scale: 0.95 }}
            onClick={() => onFilterChange(filter)}
            aria-pressed={isActive}
          >
            {filter}
          </motion.button>
        );
      })}
    </div>
  );
};

// ============================================================
// NAVIGATION BUTTON COMPONENT
// ============================================================

const NavButton = ({
  direction,
  onClick,
  disabled,
}: {
  direction: 'left' | 'right';
  onClick: () => void;
  disabled: boolean;
}) => {
  const prefersReducedMotion = useReducedMotion();
  const Icon = direction === 'left' ? ChevronLeft : ChevronRight;

  return (
    <motion.button
      className="absolute top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full flex items-center justify-center"
      style={{
        [direction === 'left' ? 'left' : 'right']: '-24px',
        background: `${ELECTRIC_RUSH.colors.surfaceDark}95`,
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        border: `2px solid ${ELECTRIC_RUSH.colors.electricBlue}40`,
        opacity: disabled ? 0.3 : 1,
        pointerEvents: disabled ? 'none' : 'auto',
        boxShadow: disabled ? 'none' : `0 0 20px ${ELECTRIC_RUSH.colors.glowCyan}`,
      }}
      whileHover={
        prefersReducedMotion || disabled
          ? {}
          : {
              scale: 1.1,
              boxShadow: `0 0 30px ${ELECTRIC_RUSH.colors.glowCyan}`,
            }
      }
      whileTap={disabled ? {} : { scale: 0.9 }}
      onClick={onClick}
      disabled={disabled}
      aria-label={direction === 'left' ? 'Previous events' : 'Next events'}
    >
      <Icon
        className="w-6 h-6"
        style={{ color: ELECTRIC_RUSH.colors.electricBlue }}
      />
    </motion.button>
  );
};

// ============================================================
// MAIN EVENT CAROUSEL COMPONENT
// ============================================================

export const EventCarousel = ({
  title = '🔥 Trending Events',
  events,
  onEventSelect,
  onEventWishlist,
  showFilters = false,
}: EventCarouselProps) => {
  const prefersReducedMotion = useReducedMotion();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [activeFilter, setActiveFilter] = useState('All');

  // Update scroll button states
  const updateScrollButtons = () => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const { scrollLeft, scrollWidth, clientWidth } = container;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  };

  // Scroll handlers
  const scrollLeft = () => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const cardWidth = container.querySelector('article')?.clientWidth || 300;
    container.scrollBy({
      left: -(cardWidth + 24), // card width + gap
      behavior: 'smooth',
    });
  };

  const scrollRight = () => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const cardWidth = container.querySelector('article')?.clientWidth || 300;
    container.scrollBy({
      left: cardWidth + 24, // card width + gap
      behavior: 'smooth',
    });
  };

  // Setup scroll listener
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    updateScrollButtons();

    const handleScroll = () => {
      updateScrollButtons();
    };

    container.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', updateScrollButtons);

    return () => {
      container.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', updateScrollButtons);
    };
  }, [events]);

  // Filter events (placeholder logic - can be expanded)
  const filteredEvents = events; // In production, filter based on activeFilter

  if (!events || events.length === 0) {
    return null;
  }

  return (
    <section className="relative py-16 overflow-hidden">
      {/* Header */}
      <div className="max-w-[1600px] mx-auto px-6 mb-8">
        <motion.div
          className="flex flex-col md:flex-row md:items-end md:justify-between gap-4"
          initial={
            prefersReducedMotion
              ? false
              : { opacity: 0, x: -20 }
          }
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          {/* Title */}
          <div>
            <h2
              className="text-4xl md:text-5xl font-black tracking-tight"
              style={{
                background: GRADIENTS.textRainbow,
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontFamily: ELECTRIC_RUSH.typography.display,
              }}
            >
              {title}
            </h2>
          </div>

          {/* View All Link */}
          <motion.a
            href="#"
            className="flex items-center gap-2 group"
            whileHover={
              prefersReducedMotion
                ? {}
                : { x: 5 }
            }
          >
            <span
              className="text-sm font-bold uppercase tracking-wider group-hover:underline"
              style={{ color: ELECTRIC_RUSH.colors.electricBlue }}
            >
              View All
            </span>
            <ArrowRight
              className="w-4 h-4 transition-transform group-hover:translate-x-1"
              style={{ color: ELECTRIC_RUSH.colors.electricBlue }}
            />
          </motion.a>
        </motion.div>

        {/* Filter Pills */}
        {showFilters && (
          <motion.div
            className="mt-6"
            initial={
              prefersReducedMotion
                ? false
                : { opacity: 0, y: 10 }
            }
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1, duration: 0.5 }}
          >
            <FilterPills
              activeFilter={activeFilter}
              onFilterChange={setActiveFilter}
            />
          </motion.div>
        )}
      </div>

      {/* Carousel Container */}
      <div className="relative max-w-[1600px] mx-auto px-6">
        {/* Navigation Buttons */}
        {events.length > 3 && (
          <>
            <NavButton
              direction="left"
              onClick={scrollLeft}
              disabled={!canScrollLeft}
            />
            <NavButton
              direction="right"
              onClick={scrollRight}
              disabled={!canScrollRight}
            />
          </>
        )}

        {/* Scroll Container */}
        <div
          ref={scrollContainerRef}
          className="flex gap-6 overflow-x-auto pb-4"
          style={{
            scrollSnapType: 'x mandatory',
            scrollBehavior: 'smooth',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            WebkitOverflowScrolling: 'touch',
          }}
        >
          <style jsx>{`
            div::-webkit-scrollbar {
              display: none;
            }
          `}</style>

          {filteredEvents.map((event, index) => (
            <div
              key={event.id}
              className="flex-shrink-0"
              style={{
                scrollSnapAlign: 'start',
                width: 'clamp(280px, calc((100vw - 96px) / 1.2), 400px)',
              }}
            >
              <EventCard
                event={event}
                onSelect={onEventSelect}
                onWishlist={onEventWishlist}
                animationDelay={index * 0.08}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Background glow effect */}
      {!prefersReducedMotion && (
        <div
          className="absolute -bottom-32 left-1/2 -translate-x-1/2 w-[600px] h-[300px] pointer-events-none"
          style={{
            background: `radial-gradient(circle, ${ELECTRIC_RUSH.colors.electricBlue}10, transparent 70%)`,
            filter: 'blur(60px)',
          }}
        />
      )}
    </section>
  );
};

export default EventCarousel;
