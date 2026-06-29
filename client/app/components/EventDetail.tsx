'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { MapPin, Clock, Volume2, ArmchairIcon } from 'lucide-react';
import { useMemo } from 'react';

interface Seat {
  id: string;
  seatNumber: string;
  status: string;
  zoneName?: string;
  price?: number;
  heldByUserId?: string;
}

interface EventDetailProps {
  eventTitle?: string;
  venue?: string;
  date?: string;
  seats?: Seat[];
  selectedSeat?: Seat | null;
  currentUserId?: string;
  onSeatSelect?: (seatId: string) => void;
  onSeatUnselect?: () => void;
}

const ZONE_COLORS: Record<string, { border: string; bg: string; glow: string; label: string }> = {
  VIP: { border: 'border-electric-blue', bg: 'bg-electric-blue/8', glow: 'shadow-glow-blue', label: 'Electric Blue' },
  STANDARD: { border: 'border-lime-rush', bg: 'bg-lime-rush/8', glow: 'shadow-glow-lime', label: 'Lime Rush' },
  ECONOMY: { border: 'border-hot-magenta', bg: 'bg-hot-magenta/8', glow: 'shadow-glow-magenta', label: 'Hot Magenta' },
};

export function EventDetail({
  eventTitle = 'Live Concert',
  venue,
  date,
  seats = [],
  selectedSeat,
  currentUserId,
  onSeatSelect,
  onSeatUnselect,
}: EventDetailProps) {
  const reduce = useReducedMotion();

  // Group seats by zone
  const zones = useMemo(() => {
    const map: Record<string, { name: string; seats: Seat[] }> = {};
    seats.forEach((seat) => {
      const zoneName = seat.zoneName || 'GENERAL';
      if (!map[zoneName]) map[zoneName] = { name: zoneName, seats: [] };
      map[zoneName].seats.push(seat);
    });
    return Object.values(map);
  }, [seats]);

  const getSeatColor = (status: string, isSelected: boolean) => {
    if (isSelected) return 'bg-lime-rush border-lime-rush text-dark-bg shadow-glow-lime';
    switch (status) {
      case 'AVAILABLE': return 'bg-dark-surface-2 border-zinc-700 hover:border-lime-rush hover:shadow-glow-lime text-zinc-400';
      case 'HELD': return 'bg-acid-yellow/15 border-acid-yellow/40 text-acid-yellow';
      case 'SOLD': return 'bg-hot-magenta/10 border-hot-magenta/30 text-hot-magenta/50';
      default: return 'bg-dark-surface-2 border-zinc-700 text-zinc-400';
    }
  };

  return (
    <section className="relative py-24 overflow-hidden">
      {/* Background flare */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-gradient-to-bl from-electric-blue/5 to-transparent blur-[100px] pointer-events-none" />

      <div className="max-w-[1400px] mx-auto px-6">
        {/* Section header — NO EYEBROW, just a raw headline + details */}
        <motion.div
          className="mb-12"
          initial={reduce ? false : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="font-display text-4xl sm:text-5xl font-black tracking-tighter text-white">
            Pick a <span className="bg-gradient-to-r from-lime-rush via-electric-blue to-hot-magenta bg-clip-text text-transparent">Seat</span>
          </h2>

          <div className="flex flex-wrap gap-6 mt-4 text-sm text-zinc-500">
            {venue && (
              <span className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-electric-blue" />
                {venue}
              </span>
            )}
            {date && (
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-hot-magenta" />
                {date}
              </span>
            )}
            <span className="flex items-center gap-1.5">
              <Volume2 className="w-4 h-4 text-lime-rush" />
              {eventTitle}
            </span>
          </div>
        </motion.div>

        {/* Layout: full-width seat map, sidebar floats on top-right */}
        <div className="relative">
          {/* Seat map — full width */}
          <motion.div
            className="w-full"
            initial={reduce ? false : { opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            {/* Stage indicator */}
            <div className="relative mb-10 max-w-2xl mx-auto">
              <div className="h-3 rounded-full bg-gradient-to-r from-electric-blue via-hot-magenta to-electric-blue opacity-60" />
              <div className="text-center mt-1 text-zinc-700 text-xs uppercase tracking-[0.15em] font-semibold">Stage</div>
              <motion.div
                className="absolute -top-6 left-1/2 -translate-x-1/2 w-1 h-6 rounded-full bg-gradient-to-b from-electric-blue to-transparent"
                animate={reduce ? {} : { height: [6, 24, 6], opacity: [0.6, 1, 0.6] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </div>

            {zones.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-zinc-700">
                <ArmchairIcon className="w-12 h-12 mb-4" />
                <p className="text-lg font-semibold">No seats available</p>
                <p className="text-sm">Check back later for new shows</p>
              </div>
            ) : (
              <div className="space-y-10 max-w-4xl mx-auto">
                {zones.map((zone) => {
                  const zoneColor = ZONE_COLORS[zone.name.toUpperCase()] || ZONE_COLORS.STANDARD;
                  const rows = chunk(zone.seats, Math.ceil(zone.seats.length / 4));

                  return (
                    <div key={zone.name} className="relative">
                      {/* Zone label */}
                      <div className="flex items-center gap-3 mb-4">
                        <span className={`inline-block w-3 h-3 rounded-full ${zoneColor.border} ${zoneColor.bg} border`} />
                        <span className="text-white font-semibold text-sm uppercase tracking-wider">{zone.name}</span>
                        <span className="text-zinc-600 text-xs">
                          {zone.seats.filter((s) => s.status === 'AVAILABLE').length} available
                        </span>
                      </div>

                      {/* Seat grid */}
                      <div className="space-y-2">
                        {rows.map((row, ri) => (
                          <div key={ri} className="flex flex-wrap gap-2">
                            {row.map((seat) => {
                              const isSelected = selectedSeat?.id === seat.id;
                              return (
                                <motion.button
                                  key={seat.id}
                                  disabled={seat.status === 'SOLD'}
                                  className={`w-9 h-9 rounded-lg text-[10px] font-bold border transition-all ${getSeatColor(seat.status, isSelected)}`}
                                  whileHover={
                                    reduce || seat.status === 'SOLD'
                                      ? {}
                                      : { scale: 1.15, zIndex: 10 }
                                  }
                                  whileTap={seat.status === 'SOLD' ? {} : { scale: 0.9 }}
                                  onClick={() => {
                                    if (seat.status === 'AVAILABLE') onSeatSelect?.(seat.id);
                                    else if (isSelected) onSeatUnselect?.();
                                  }}
                                  title={`Seat ${seat.seatNumber} - ${seat.status}${seat.price ? ` ($${seat.price})` : ''}`}
                                >
                                  {seat.seatNumber}
                                </motion.button>
                              );
                            })}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Legend */}
            <div className="flex flex-wrap gap-4 mt-8 pt-6 border-t border-zinc-800/60 max-w-4xl mx-auto">
              <LegendItem color="bg-dark-surface-2 border-zinc-700" label="Available" />
              <LegendItem color="bg-acid-yellow/15 border-acid-yellow/40" label="Held" />
              <LegendItem color="bg-hot-magenta/10 border-hot-magenta/30" label="Sold" />
              <LegendItem color="bg-lime-rush border-lime-rush" label="Selected" />
            </div>
          </motion.div>

          {/* Sidebar — floats right when seat selected */}
          {selectedSeat && (
            <motion.div
              className="lg:absolute lg:top-0 lg:right-0 lg:w-80 z-10 mt-8 lg:mt-0"
              initial={reduce ? false : { opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <div className="glass-electric rounded-2xl p-6">
                <h3 className="text-white font-bold text-lg mb-4">Your Selection</h3>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-500">Seat</span>
                    <span className="text-white font-semibold">{selectedSeat.seatNumber}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-500">Zone</span>
                    <span className="text-electric-blue font-semibold">{selectedSeat.zoneName}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-500">Price</span>
                    <span className="text-lime-rush font-bold text-lg">${selectedSeat.price}</span>
                  </div>
                </div>

                <div className="h-px bg-gradient-to-r from-electric-blue/40 via-hot-magenta/40 to-lime-rush/40 mb-6" />

                <motion.button
                  className="w-full py-3 bg-lime-rush text-dark-bg font-bold rounded-full transition-all"
                  whileHover={reduce ? {} : { scale: 1.03, boxShadow: '0 0 30px rgba(57,255,20,0.5)' }}
                  whileTap={{ scale: 0.97 }}
                >
                  Proceed to Checkout
                </motion.button>

                <motion.button
                  className="w-full mt-2 py-2 text-zinc-600 text-sm hover:text-zinc-400 transition-colors"
                  onClick={onSeatUnselect}
                  whileHover={reduce ? {} : { x: -2 }}
                >
                  Cancel Selection
                </motion.button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-2 text-xs text-zinc-600">
      <span className={`w-4 h-4 rounded border ${color}`} />
      {label}
    </div>
  );
}

function chunk<T>(arr: T[], size: number): T[][] {
  const result: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size));
  }
  return result;
}
