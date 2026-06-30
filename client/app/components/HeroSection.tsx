'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { Play, ArrowUpRight } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useState } from 'react';

interface Event {
  id: string;
  title: string;
  artist: string;
  venue: string;
  date: string;
  image?: string;
  price: number;
}

interface HeroSectionProps {
  events?: Event[];
  onEventSelect?: (eventId: string) => void;
}

const SCRAMBLE_CHARS = '!<>-_\\/[]{}—=+*^?#________';

function useScrambleText(finalText: string, delay = 0) {
  const [display, setDisplay] = useState('');
  const shouldReduce = useReducedMotion();

  useEffect(() => {
    if (shouldReduce) {
      return;
    }
    let frame = 0;
    const totalFrames = 28;
    const timeout = setTimeout(() => {
      const interval = setInterval(() => {
        frame++;
        if (frame >= totalFrames) {
          setDisplay(finalText);
          clearInterval(interval);
          return;
        }
        const progress = frame / totalFrames;
        const charsToReveal = Math.floor(progress * finalText.length);
        let result = '';
        for (let i = 0; i < finalText.length; i++) {
          if (i < charsToReveal && Math.random() < 0.85) {
            result += finalText[i];
          } else if (i < charsToReveal) {
            result += SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
          } else {
            result += SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
          }
        }
        setDisplay(result);
      }, 40);
      return () => clearInterval(interval);
    }, delay);
    return () => clearTimeout(timeout);
  }, [finalText, delay, shouldReduce]);

  return display;
}

function ScrambleText({ text, className, delay = 0 }: { text: string; className?: string; delay?: number }) {
  const display = useScrambleText(text, delay);
  return <span className={className}>{display}</span>;
}


// Pre-compute visualizer bars at module level to avoid purity issues
const VISUALIZER_BARS = Array.from({ length: 36 }).map((_, i) => ({
  id: i,
  heights: [4 + Math.random() * 28, 4 + Math.random() * 48, 4 + Math.random() * 28],
  duration: 0.6 + Math.random() * 0.5,
  color: i % 4 === 0 ? '#ff2d7b' : i % 3 === 0 ? '#39ff14' : '#00d4ff',
}));
export function HeroSection({ events = [], onEventSelect }: HeroSectionProps) {
  const reduce = useReducedMotion();
  const featuredEvent = events[0];


  return (
    <section className="relative w-full min-h-[100dvh] bg-dark-bg overflow-hidden">
      {/* Background — gritty gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-dark-bg via-dark-bg-2 to-dark-bg pointer-events-none" />

      {/* Morphing energy orbs — asymmetrical placement */}
      <motion.div
        className="absolute -top-40 -right-40 w-[600px] h-[600px] pointer-events-none"
        animate={reduce ? {} : { scale: [1, 1.1, 0.95, 1.05, 1], rotate: [0, 15, -10, 5, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          background: 'radial-gradient(circle, rgba(0,212,255,0.18) 0%, transparent 70%)',
        }}
      />
      <motion.div
        className="absolute -bottom-32 -left-24 w-[400px] h-[400px] pointer-events-none"
        animate={reduce ? {} : { scale: [1, 1.12, 0.98, 1.06, 1] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        style={{
          background: 'radial-gradient(circle, rgba(255,45,123,0.15) 0%, transparent 70%)',
        }}
      />

      {/* Grid overlay — very subtle */}
      <div className="absolute inset-0 bg-[length:48px_48px] opacity-[0.03] pointer-events-none"
        style={{ backgroundImage: 'linear-gradient(rgba(0,212,255,0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,255,0.12) 1px, transparent 1px)' }}
      />

      <div className="relative z-10 max-w-[1400px] mx-auto px-6 pt-24 pb-16 min-h-[100dvh] flex flex-col lg:flex-row items-center gap-12 lg:gap-0">
        {/* LEFT: Content — no eyebrow, no "Live Concerts" label, just raw copy */}
        <motion.div
          className="w-full lg:w-1/2 lg:pr-12"
          initial={reduce ? false : { opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Main headline — kinetic scramble, 3 lines max */}
          <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-black tracking-tighter leading-[1.05] mb-6">
            <ScrambleText text="Feel the" delay={300} className="bg-gradient-to-r from-electric-blue to-electric-cyan bg-clip-text text-transparent" />
            <br />
            <ScrambleText text="Energy" delay={600} className="bg-gradient-to-r from-hot-magenta to-lime-rush bg-clip-text text-transparent" />
            <br />
            <ScrambleText text="Live" delay={900} className="text-white" />
          </h1>

          {/* Subtext — raw, not generic */}
          <motion.p
            className="text-zinc-500 text-lg leading-relaxed max-w-[65ch] mb-10 font-[425]"
            initial={reduce ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            No queues. No browser wars. Just you, the beat, and a seat that&apos;s yours the second you click.
          </motion.p>

          {/* CTAs */}
          <motion.div
            className="flex flex-wrap items-center gap-4"
            initial={reduce ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
          >
            {/* Primary — lime rush */}
            <motion.button
              className="relative group inline-flex items-center gap-2 px-8 py-4 bg-lime-rush text-dark-bg font-bold text-lg rounded-full overflow-hidden transition-all"
              whileHover={reduce ? {} : { scale: 1.04, boxShadow: '0 0 40px rgba(57,255,20,0.6)' }}
              whileTap={{ scale: 0.96 }}
              onClick={() => onEventSelect?.('featured')}
            >
              <span className="relative z-10">Get Tickets</span>
              <Play className="relative z-10 w-5 h-5 fill-dark-bg" />
              <motion.span
                className="absolute inset-0 bg-lime-rush"
                animate={reduce ? {} : { boxShadow: ['0 0 20px rgba(57,255,20,0.3)', '0 0 60px rgba(57,255,20,0.7)', '0 0 20px rgba(57,255,20,0.3)'] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </motion.button>

            {/* Secondary — ghost */}
            <motion.button
              className="group inline-flex items-center gap-2 px-6 py-3 rounded-full border border-zinc-700 text-zinc-500 font-semibold hover:border-electric-blue hover:text-electric-blue transition-all"
              whileHover={reduce ? {} : { scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Browse Events
              <ArrowUpRight className="w-4 h-4" />
            </motion.button>
          </motion.div>
        </motion.div>

        {/* RIGHT: Visual — real event image, not abstract gradient */}
        <motion.div
          className="w-full lg:w-1/2 relative"
          initial={reduce ? false : { opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="relative group">
            {/* Glow ring behind */}
            <motion.div
              className="absolute -inset-6 rounded-[42%] opacity-40 mix-blend-screen"
              animate={reduce ? {} : { scale: [1, 1.06, 0.98, 1.04, 1], rotate: [0, 5, -3, 2, 0] }}
              transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
              style={{ background: 'linear-gradient(135deg, #00d4ff, #ff2d7b, #39ff14)', filter: 'blur(40px)' }}
            />

            {/* Main card — real image background */}
            <motion.div
              className="relative w-full aspect-[4/5] sm:aspect-[3/4] rounded-2xl overflow-hidden border border-zinc-800"
              initial={reduce ? false : { rotateY: 10, rotateX: -5 }}
              animate={{ rotateY: 0, rotateX: 0 }}
              transition={{ duration: 1, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
              whileHover={reduce ? {} : { rotateY: -4, rotateX: 4, scale: 1.02 }}
              style={{ perspective: 1000 }}
            >
              {/* Real image from picsum */}
              <div className="absolute inset-0 bg-dark-bg">
                <Image
                  src="https://picsum.photos/seed/concert-hero-electric/800/1000"
                  alt="Concert crowd"
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover opacity-60 group-hover:opacity-80 transition-opacity duration-700"
                  priority
                />
              </div>

              {/* Gradient overlay bottom */}
              <div className="absolute inset-0 bg-gradient-to-t from-dark-bg via-dark-bg/40 to-transparent" />

              {/* Sound-wave visualizer */}
              <div className="absolute bottom-0 left-0 right-0 h-24 flex items-end gap-[3px] px-6 pb-5">
                {VISUALIZER_BARS.map((bar, i) => (
                  <motion.div
                    key={i}
                    className="w-[3px] rounded-full"
                    style={{
                      background: `linear-gradient(to top, ${i % 4 === 0 ? '#ff2d7b' : i % 3 === 0 ? '#39ff14' : '#00d4ff'}, transparent)`,
                    }}
                    animate={reduce ? {} : { height: bar.heights }}
                    transition={{ duration: bar.duration, repeat: Infinity, delay: i * 0.04 }}
                  />
                ))}
              </div>

              {/* Overlay text */}
              <div className="absolute bottom-6 left-6 right-6">
                <p className="text-white font-bold text-2xl font-display tracking-tight">{featuredEvent?.title || 'Electric Nights Festival'}</p>
                <p className="text-zinc-400 text-sm mt-1">{featuredEvent?.venue || 'Madison Square Garden'} · {featuredEvent?.date || 'Jul 15'}</p>
              </div>
            </motion.div>

            {/* Offset "second card" peeking */}
            <div className="absolute -bottom-4 -right-4 w-full h-full rounded-2xl border border-hot-magenta/10 bg-dark-surface/10 -z-10" />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
