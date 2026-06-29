'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { useState } from 'react';

interface Event {
  id: string;
  title: string;
  artist: string;
  venue: string;
  date: string;
  price: number;
  rating: number;
  image?: string;
}

interface EventCarouselProps {
  events?: Event[];
  onEventSelect?: (eventId: string) => void;
}

const GENRE_GRADIENTS = [
  'from-electric-blue/20 via-hot-magenta/10 to-dark-bg',
  'from-hot-magenta/20 via-acid-yellow/10 to-dark-bg',
  'from-lime-rush/15 via-electric-blue/10 to-dark-bg',
  'from-electric-cyan/20 via-hot-pink/10 to-dark-bg',
  'from-hot-magenta/15 via-lime-rush/10 to-dark-bg',
];

export function EventCarousel({ events = [], onEventSelect }: EventCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const reduce = useReducedMotion();

  if (events.length === 0) return null;

  const prev = () => setActiveIndex((i) => (i - 1 + events.length) % events.length);
  const next = () => setActiveIndex((i) => (i + 1) % events.length);

  return (
    <section className="relative py-24 overflow-hidden">
      {/* Section header — NO EYEBROW, just headline */}
      <div className="max-w-[1400px] mx-auto px-6 mb-12">
        {/* Removed the "Upcoming Shows" eyebrow */}
        <motion.h2
          className="font-display text-4xl sm:text-5xl font-black tracking-tighter text-white"
          initial={reduce ? false : { opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
        >
          On Stage <span className="bg-gradient-to-r from-hot-magenta via-electric-blue to-lime-rush bg-clip-text text-transparent">Soon</span>
        </motion.h2>
      </div>

      {/* Deck spread */}
      <div className="relative w-full max-w-[1400px] mx-auto px-6">
        <div className="relative flex items-center justify-center min-h-[440px]">
          {/* Previous button */}
          {events.length > 1 && (
            <motion.button
              className="absolute left-0 lg:left-4 z-10 w-12 h-12 rounded-full glass-electric flex items-center justify-center text-electric-blue hover:shadow-glow-blue transition-shadow"
              onClick={prev}
              whileHover={reduce ? {} : { scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              aria-label="Previous event"
            >
              <ChevronLeft className="w-5 h-5" />
            </motion.button>
          )}

          {/* Cards stack */}
          <div className="relative w-full max-w-4xl" style={{ perspective: 1200 }}>
            {events.map((event, index) => {
              const offset = index - activeIndex;
              const isActive = offset === 0;
              const isLeft = offset < 0;
              const isHidden = Math.abs(offset) > 2;

              return (
                <motion.div
                  key={event.id}
                  className="absolute inset-0 cursor-pointer"
                  style={{ transformStyle: 'preserve-3d' }}
                  animate={
                    reduce
                      ? { opacity: isActive ? 1 : 0, zIndex: isActive ? 10 : 0 }
                      : {
                          x: isActive ? 0 : isLeft ? -280 - Math.abs(offset) * 60 : 280 + offset * 60,
                          y: isActive ? 0 : isLeft ? 24 + Math.abs(offset) * 12 : 24 + offset * 8,
                          rotateY: isActive ? 0 : isLeft ? 18 : -18,
                          scale: isActive ? 1 : 0.82 - Math.abs(offset) * 0.06,
                          opacity: isHidden ? 0 : isActive ? 1 : 0.4,
                          zIndex: isActive ? 10 : 10 - Math.abs(offset),
                          filter: isActive ? 'blur(0px)' : 'blur(2px)',
                        }
                  }
                  transition={{ type: 'spring', stiffness: 260, damping: 28, mass: 0.8 }}
                  onClick={() => {
                    if (!isActive) setActiveIndex(index);
                    else onEventSelect?.(event.id);
                  }}
                >
                  <div className={`relative rounded-2xl overflow-hidden border ${isActive ? 'border-electric-blue/30 neon-glow-blue' : 'border-zinc-800'} bg-dark-surface`}>
                    {/* Background gradient + real image */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${GENRE_GRADIENTS[index % GENRE_GRADIENTS.length]} pointer-events-none`} />
                    {event.image && (
                      <div className="absolute inset-0 opacity-[0.08] pointer-events-none">
                        <img src={event.image} alt="" className="w-full h-full object-cover" />
                      </div>
                    )}

                    <div className="relative p-6 sm:p-8">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                        <div className="flex-1">
                          {/* Artist label */}
                          <p className="text-zinc-600 text-xs font-semibold uppercase tracking-[0.15em] mb-1">
                            {event.artist}
                          </p>
                          <h3 className={`font-display font-black tracking-tight ${isActive ? 'text-3xl sm:text-4xl' : 'text-xl'} text-white mb-2`}>
                            {event.title}
                          </h3>

                          {/* Rating */}
                          <div className="flex items-center gap-1.5 mb-4">
                            <Star className="w-4 h-4 text-acid-yellow fill-acid-yellow" />
                            <span className="text-sm text-zinc-500">{event.rating}</span>
                          </div>

                          {/* Details */}
                          <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm">
                            <span className="text-zinc-500">
                              <span className="text-electric-blue font-semibold">Where</span>{' '}
                              {event.venue}
                            </span>
                            <span className="text-zinc-500">
                              <span className="text-hot-magenta font-semibold">When</span>{' '}
                              {event.date}
                            </span>
                          </div>
                        </div>

                        {/* Price */}
                        <div className="flex flex-col items-end gap-2 shrink-0">
                          <span className="text-zinc-600 text-xs uppercase tracking-wider">From</span>
                          <span className="font-display text-3xl font-black bg-gradient-to-r from-hot-magenta to-electric-blue bg-clip-text text-transparent">
                            ${event.price}
                          </span>
                          {isActive && (
                            <motion.button
                              className="px-5 py-2 bg-lime-rush text-dark-bg font-bold text-sm rounded-full"
                              initial={reduce ? false : { opacity: 0, y: 8 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.2 }}
                              whileHover={reduce ? {} : { scale: 1.04, boxShadow: '0 0 24px rgba(57,255,20,0.5)' }}
                              whileTap={{ scale: 0.96 }}
                              onClick={(e) => { e.stopPropagation(); onEventSelect?.(event.id); }}
                            >
                              Buy Now
                            </motion.button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Next button */}
          {events.length > 1 && (
            <motion.button
              className="absolute right-0 lg:right-4 z-10 w-12 h-12 rounded-full glass-electric flex items-center justify-center text-electric-blue hover:shadow-glow-blue transition-shadow"
              onClick={next}
              whileHover={reduce ? {} : { scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              aria-label="Next event"
            >
              <ChevronRight className="w-5 h-5" />
            </motion.button>
          )}
        </div>

        {/* Dots indicator */}
        {events.length > 1 && (
          <div className="flex justify-center gap-2 mt-8">
            {events.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveIndex(i)}
                className={`h-1.5 rounded-full transition-all ${
                  i === activeIndex
                    ? 'w-8 bg-gradient-to-r from-electric-blue to-hot-magenta'
                    : 'w-2 bg-zinc-700 hover:bg-zinc-500'
                }`}
                aria-label={`Go to event ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
