'use client';

import { motion } from 'framer-motion';
import { useReducedMotion } from 'framer-motion';
import { useMemo } from 'react';
import ELECTRIC_RUSH, { GRADIENTS } from '@/lib/design-tokens';
import { ArrowRight, Zap } from 'lucide-react';

/**
 * Enhanced Hero Section - Electric Pulse Design
 * Kinetic scramble headline, morphing orbs, glassmorphic CTA buttons
 */

// ============================================================
// 1. KINETIC HEADLINE WITH LETTER SCRAMBLE
// ============================================================

interface KineticHeadlineProps {
  text: string;
  splitByWord?: boolean;
}

// Simple deterministic pseudo-random for offset values (seed-based, avoids Math.random at render)
function seededRandom(seed: number): number {
  const x = Math.sin(seed * 9301 + 49297) * 49297;
  return x - Math.floor(x);
}

// Pre-compute random offsets at module level to avoid purity issues
const ELEMENT_RANDOM_OFFSETS = {
  x: seededRandom(1) * 120 - 60,
  y: seededRandom(2) * 120 - 60,
  rotate: seededRandom(3) * 360,
};
const KineticHeadline = ({ text, splitByWord = false }: KineticHeadlineProps) => {
  const prefersReducedMotion = useReducedMotion();
  
  // Split into words or letters
  const elements = splitByWord 
    ? text.split(' ')
    : text.split('');

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: splitByWord ? 0.08 : 0.04,
        delayChildren: 0.1,
      },
    },
  };

  const elementVariants = {
    hidden: {
      x: ELEMENT_RANDOM_OFFSETS.x,
      y: ELEMENT_RANDOM_OFFSETS.y,
      opacity: 0,
      rotate: ELEMENT_RANDOM_OFFSETS.rotate,
      scale: 0.5,
    },
    visible: {
      x: 0,
      y: 0,
      opacity: 1,
      rotate: 0,
      scale: 1,
      transition: prefersReducedMotion ? { duration: 0 } : ELECTRIC_RUSH.spring.kinetic,
    },
  };

  return (
    <motion.div
      className="text-6xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-tight"
      style={{
        background: GRADIENTS.textRainbow,
        backgroundClip: 'text',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        fontFamily: ELECTRIC_RUSH.typography.display,
      }}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {elements.map((element, i) => (
        <motion.span key={i} variants={elementVariants} className="inline-block">
          {element}
          {splitByWord && i < elements.length - 1 && ' '}
        </motion.span>
      ))}
    </motion.div>
  );
};

// ============================================================
// 2. MORPHING ORBS BACKGROUND
// ============================================================

const MorphingOrbs = () => {
  const prefersReducedMotion = useReducedMotion();

  const orbVariants = {
    animate: {
      scale: [1, 1.3, 1],
      opacity: [0.25, 0.5, 0.25],
      x: [0, 60, 0],
      y: [0, -60, 0],
      transition: {
        duration: 12,
        repeat: Infinity,
        ease: 'easeInOut' as const,
      },
    },
  };

  const orbVariants2 = {
    animate: {
      scale: [1, 1.1, 1],
      opacity: [0.2, 0.4, 0.2],
      x: [0, -40, 0],
      y: [0, 80, 0],
      transition: {
        duration: 15,
        repeat: Infinity,
        ease: 'easeInOut' as const,
        delay: 1,
      },
    },
  };

  if (prefersReducedMotion) {
    return null;
  }

  return (
    <>
      {/* Cyan Orb - Top Left */}
      <motion.div
        className="absolute w-80 h-80 rounded-full blur-3xl"
        style={{
          background: `radial-gradient(circle, ${ELECTRIC_RUSH.colors.electricBlue}50, transparent 70%)`,
          top: '10%',
          left: '5%',
          filter: 'blur(40px)',
        }}
        variants={orbVariants}
        animate="animate"
      />

      {/* Magenta Orb - Bottom Right */}
      <motion.div
        className="absolute w-96 h-96 rounded-full blur-3xl"
        style={{
          background: `radial-gradient(circle, ${ELECTRIC_RUSH.colors.hotMagenta}40, transparent 70%)`,
          bottom: '-10%',
          right: '0%',
          filter: 'blur(50px)',
        }}
        variants={orbVariants2}
        animate="animate"
      />

      {/* Purple Orb - Center Right */}
      <motion.div
        className="absolute w-72 h-72 rounded-full blur-3xl"
        style={{
          background: `radial-gradient(circle, ${ELECTRIC_RUSH.colors.electricPurple}35, transparent 70%)`,
          top: '40%',
          right: '10%',
          filter: 'blur(45px)',
        }}
        variants={orbVariants}
        animate="animate"
        transition={{
          duration: 14,
          repeat: Infinity,
          ease: 'easeInOut' as const,
          delay: 2,
        }}
      />
    </>
  );
};

// ============================================================
// 3. GRADIENT MESH BACKGROUND
// ============================================================

const GradientMesh = () => {
  return (
    <div
      className="absolute inset-0 opacity-50"
      style={{
        background: GRADIENTS.heroPulse,
        backgroundSize: '400% 400%',
        animation: 'gradient-mesh 15s ease infinite',
      }}
    />
  );
};

// ============================================================
// 4. ELECTRIC CTA BUTTON
// ============================================================

interface ElectricCTAProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary';
  icon?: React.ReactNode;
}

const ElectricCTA = ({ 
  children, 
  onClick, 
  variant = 'primary',
  icon 
}: ElectricCTAProps) => {
  const prefersReducedMotion = useReducedMotion();

  const getPrimaryStyle = () => ({
    background: GRADIENTS.buttonPrimary,
    boxShadow: `0 0 30px ${ELECTRIC_RUSH.colors.glowCyan}`,
  });

  const getSecondaryStyle = () => ({
    background: 'transparent',
    border: `2px solid ${ELECTRIC_RUSH.colors.electricBlue}`,
    boxShadow: `inset 0 0 15px ${ELECTRIC_RUSH.colors.glowCyan}`,
  });

  return (
    <motion.button
      onClick={onClick}
      className={`relative px-8 py-4 rounded-lg font-bold text-sm tracking-wider uppercase transition-all ${
        variant === 'primary'
          ? 'text-dark-bg hover:shadow-lg'
          : 'text-electric-blue hover:bg-electric-blue/5'
      }`}
      style={variant === 'primary' ? getPrimaryStyle() : getSecondaryStyle()}
      whileHover={prefersReducedMotion ? {} : { scale: 1.05 }}
      whileTap={prefersReducedMotion ? {} : { scale: 0.98 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.5 }}
    >
      <span className="flex items-center gap-2 justify-center">
        {children}
        {icon}
      </span>
    </motion.button>
  );
};

// ============================================================
// 5. MAIN HERO SECTION COMPONENT
// ============================================================

export interface HeroSectionProps {
  onDiscoverClick?: () => void;
  onWishlistClick?: () => void;
}

export const HeroSection = ({ 
  onDiscoverClick, 
  onWishlistClick 
}: HeroSectionProps) => {
  const prefersReducedMotion = useReducedMotion();


  // Pre-compute particle positions with deterministic pseudo-random values
  const particles = useMemo(() => {
    return Array.from({ length: 5 }).map((_, i) => ({
      id: i,
      left: seededRandom(i + 10) * 100,
      top: seededRandom(i + 20) * 100,
      color: [ELECTRIC_RUSH.colors.electricBlue, ELECTRIC_RUSH.colors.hotMagenta, ELECTRIC_RUSH.colors.limeRush][i % 3],
    }));
  }, []);
  return (
    <section className="relative w-full min-h-screen overflow-hidden flex items-center justify-center pt-20 pb-12">
      {/* Background Layers */}
      <div className="absolute inset-0 bg-dark-bg" />
      <GradientMesh />
      <MorphingOrbs />

      {/* Animated scan line */}
      {!prefersReducedMotion && (
        <motion.div
          className="absolute inset-x-0 top-0 h-px"
          style={{
            background: GRADIENTS.cardBorder,
          }}
          animate={{
            opacity: [0, 1, 0],
            y: ['0%', '100vh', '0%'],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
          }}
        />
      )}

      {/* Content Container */}
      <motion.div
        className="relative z-10 max-w-5xl mx-auto px-6 lg:px-8 text-center space-y-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        {/* Eye-brow */}
        <motion.div
          className="flex items-center justify-center gap-2"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.6 }}
        >
          <Zap className="w-4 h-4" style={{ color: ELECTRIC_RUSH.colors.limeRush }} />
          <span 
            className="text-xs font-bold tracking-widest uppercase"
            style={{ color: ELECTRIC_RUSH.colors.limeRush }}
          >
            REAL-TIME TICKETING ENGINE
          </span>
        </motion.div>

        {/* Main Headline */}
        <KineticHeadline 
          text="TICKET RUSH"
          splitByWord={false}
        />

        {/* Sub-headline */}
        <motion.p
          className="text-lg md:text-xl tracking-wide opacity-90 max-w-3xl mx-auto"
          style={{ color: ELECTRIC_RUSH.colors.textSecondary }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          NO QUEUES. NO BOTS. NO WAITING.
          <br />
          <span className="font-bold" style={{ color: ELECTRIC_RUSH.colors.electricBlue }}>
            JUST PURE ELECTRIC ENERGY.
          </span>
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          className="flex gap-4 justify-center flex-wrap pt-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
        >
          <ElectricCTA 
            variant="primary"
            onClick={onDiscoverClick}
            icon={<ArrowRight className="w-4 h-4" />}
          >
            DISCOVER EVENTS
          </ElectricCTA>
          <ElectricCTA 
            variant="secondary"
            onClick={onWishlistClick}
          >
            MY WISHLIST
          </ElectricCTA>
        </motion.div>

        {/* Stats Row */}
        <motion.div
          className="flex justify-center gap-8 md:gap-16 pt-8 border-t border-zinc-800/30"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.6 }}
        >
          {[
            { label: 'ACTIVE EVENTS', value: '2,450+' },
            { label: 'INSTANT BOOKINGS', value: '98.7%' },
            { label: 'HAPPY USERS', value: '500K+' },
          ].map((stat, i) => (
            <div key={i} className="text-center">
              <div 
                className="text-2xl md:text-3xl font-black mb-1"
                style={{ color: ELECTRIC_RUSH.colors.electricBlue }}
              >
                {stat.value}
              </div>
              <div 
                className="text-xs font-bold tracking-widest uppercase"
                style={{ color: ELECTRIC_RUSH.colors.textTertiary }}
              >
                {stat.label}
              </div>
            </div>
          ))}
        </motion.div>
      </motion.div>

      {/* Floating particles (optional enhancement) */}
      {!prefersReducedMotion && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {particles.map((particle) => (
            <motion.div
              key={particle.id}
              className="absolute w-1 h-1 rounded-full"
              style={{
                background: particle.color,
                left: `${particle.left}%`,
                top: `${particle.top}%`,
              }}
              animate={{
                y: [0, -100, 0],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 3 + particle.id,
                repeat: Infinity,
                delay: particle.id * 0.5,
              }}
            />
          ))}
        </div>
      )}
    </section>
  );
};

export default HeroSection;
