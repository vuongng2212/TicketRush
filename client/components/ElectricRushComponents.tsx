'use client';

import { motion } from 'framer-motion';
import { useReducedMotion } from 'framer-motion';
import ELECTRIC_RUSH, { GRADIENTS } from '@/lib/design-tokens';
import Image from 'next/image';

/**
 * TicketRush - Electric Rush Component Examples
 * Showcasing the new phá cách UI design
 */

// ============================================================
// 1. HERO SECTION WITH KINETIC SCRAMBLE
// ============================================================

// Letter animation variants - generated at module level to avoid purity issues
const letterVariants = {
  hidden: {
    x: Math.random() * 100 - 50,
    y: Math.random() * 100 - 50,
    opacity: 0,
    rotate: Math.random() * 360,
  },
  visible: {
    x: 0,
    y: 0,
    opacity: 1,
    rotate: 0,
    transition: {
      type: 'spring' as const,
      stiffness: 300,
      damping: 20,
    },
  },
};

const HeroHeadline = () => {
  const text = 'ELECTRIC PULSE';
  const letters = text.split('');

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.2,
      },
    },
  };


  return (
    <motion.h1
      className="text-7xl md:text-8xl font-bold tracking-tighter"
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
      {letters.map((letter, i) => (
        <motion.span key={i} variants={letterVariants}>
          {letter}
        </motion.span>
      ))}
    </motion.h1>
  );
};

// ============================================================
// 2. ANIMATED HERO SECTION
// ============================================================

export const HeroSection = () => {
  const prefersReducedMotion = useReducedMotion();

  // Morphing orbs animation
  const orbVariants = {
    animate: {
      scale: [1, 1.2, 1],
      opacity: [0.3, 0.6, 0.3],
      x: [0, 40, 0],
      y: [0, -40, 0],
      transition: {
        duration: 8,
        repeat: Infinity,
        ease: 'easeInOut' as const,
      },
    },
  };

  return (
    <section className="relative w-full min-h-screen bg-dark-bg overflow-hidden flex items-center justify-center">
      {/* Background Gradient Mesh */}
      <div
        className="absolute inset-0 opacity-40"
        style={{
          background: GRADIENTS.heroPulse,
          backgroundSize: '400% 400%',
          animation: 'gradient-mesh 8s ease infinite',
        }}
      />

      {/* Morphing Orbs */}
      {!prefersReducedMotion && (
        <>
          <motion.div
            className="absolute w-96 h-96 rounded-full"
            style={{
              background: `radial-gradient(circle, ${ELECTRIC_RUSH.colors.electricBlue}40, transparent)`,
              top: '20%',
              left: '10%',
            }}
            variants={orbVariants}
            animate="animate"
          />
          <motion.div
            className="absolute w-80 h-80 rounded-full"
            style={{
              background: `radial-gradient(circle, ${ELECTRIC_RUSH.colors.hotMagenta}40, transparent)`,
              top: '50%',
              right: '10%',
            }}
            variants={orbVariants}
            animate="animate"
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: 'easeInOut' as const,
            }}
          />
        </>
      )}

      {/* Content */}
      <div className="relative z-10 text-center space-y-8 max-w-4xl px-4">
        <HeroHeadline />

        <p
          className="text-lg md:text-xl tracking-wide opacity-90"
          style={{ color: ELECTRIC_RUSH.colors.textSecondary }}
        >
          REAL-TIME TICKETING. HIGH-THROUGHPUT BOOKING.
          <br />
          NO QUEUES. NO BOTS. JUST PURE ELECTRIC ENERGY.
        </p>

        {/* CTA Buttons */}
        <div className="flex gap-4 justify-center flex-wrap">
          <PrimaryButton>DISCOVER EVENTS</PrimaryButton>
          <SecondaryButton>MY WISHLIST</SecondaryButton>
        </div>
      </div>

      {/* Sweep Line Animation */}
      {!prefersReducedMotion && (
        <motion.div
          className="absolute inset-x-0 top-0 h-1"
          style={{
            background: GRADIENTS.cardBorder,
          }}
          animate={{
            opacity: [0, 1, 0],
            y: ['0%', '100vh', '0%'],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
          }}
        />
      )}
    </section>
  );
};

// ============================================================
// 3. ELECTRIC EVENT CARD
// ============================================================

interface EventCardProps {
  title: string;
  venue: string;
  time: string;
  price: string;
  image: string;
  isTrending?: boolean;
}

export const EventCard = ({
  title,
  venue,
  time,
  price,
  image,
  isTrending = false,
}: EventCardProps) => {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      className="relative w-80 rounded-lg overflow-hidden group cursor-pointer"
      whileHover={
        prefersReducedMotion
          ? {}
          : {
              scale: 1.05,
              y: -8,
            }
      }
      transition={{
        type: 'spring' as const,
        stiffness: 300,
        damping: 20,
      }}
    >
      {/* Card Background with Glass Effect */}
      <div
        className="absolute inset-0"
        style={{
          background: `rgba(26, 31, 58, 0.6)`,
          backdropFilter: 'blur(14px)',
          border: `1px solid ${ELECTRIC_RUSH.colors.glowCyan}`,
        }}
      />

      {/* Gradient Border Glow */}
      <motion.div
        className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
        style={{
          boxShadow: `0 0 20px ${ELECTRIC_RUSH.colors.glowCyan}, 0 0 40px ${ELECTRIC_RUSH.colors.glowMagenta}`,
        }}
      />

      {/* Content */}
      <div className="relative z-10 p-6 space-y-4">
        {/* Event Image */}
        <div className="relative w-full h-48 rounded-lg overflow-hidden">
          <Image src={image} alt={title} fill sizes="300px" className="w-full h-full object-cover opacity-80" />
          <div className="absolute inset-0 bg-gradient-to-t from-dark-bg via-transparent to-transparent" />

          {/* Trending Badge */}
          {isTrending && (
            <motion.div
              className="absolute top-3 right-3 px-3 py-1 rounded-full text-sm font-bold"
              style={{
                background: ELECTRIC_RUSH.colors.limeRush,
                color: ELECTRIC_RUSH.colors.offBlack,
              }}
              animate={{
                boxShadow: [
                  `0 0 10px ${ELECTRIC_RUSH.colors.glowLime}`,
                  `0 0 20px ${ELECTRIC_RUSH.colors.glowLime}`,
                  `0 0 10px ${ELECTRIC_RUSH.colors.glowLime}`,
                ],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
              }}
            >
              🔥 GOING FAST
            </motion.div>
          )}
        </div>

        {/* Event Info */}
        <div>
          <h3
            className="text-2xl font-bold tracking-tight mb-2"
            style={{
              fontFamily: ELECTRIC_RUSH.typography.display,
              color: ELECTRIC_RUSH.colors.textPrimary,
            }}
          >
            {title}
          </h3>

          <div className="space-y-1 text-sm" style={{ color: ELECTRIC_RUSH.colors.textSecondary }}>
            <p>📍 {venue}</p>
            <p>🕐 {time}</p>
          </div>
        </div>

        {/* Price & Button */}
        <div className="flex items-center justify-between pt-4 border-t border-electric-blue/20">
          <span className="text-lg font-bold" style={{ color: ELECTRIC_RUSH.colors.limeRush }}>
            Starting {price}
          </span>
          <PrimaryButton>GRAB</PrimaryButton>
        </div>

        {/* Rating */}
        <div className="flex items-center justify-between text-sm">
          <span style={{ color: ELECTRIC_RUSH.colors.acidYellow }}>⭐⭐⭐⭐⭐ (5.0)</span>
          <span style={{ color: ELECTRIC_RUSH.colors.textTertiary }}>1,234 bought</span>
        </div>
      </div>
    </motion.div>
  );
};

// ============================================================
// 4. PRIMARY BUTTON (NEON PULSE)
// ============================================================

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

export const PrimaryButton = ({ children, onClick, className = '' }: ButtonProps) => {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.button
      onClick={onClick}
      className={`relative px-8 py-3 rounded-lg font-bold tracking-widest text-sm overflow-hidden group ${className}`}
      style={{
        background: GRADIENTS.buttonPrimary,
        color: ELECTRIC_RUSH.colors.offBlack,
      }}
      whileHover={
        prefersReducedMotion
          ? {}
          : {
              boxShadow: [
                `0 0 20px ${ELECTRIC_RUSH.colors.glowLime}`,
                `0 0 40px ${ELECTRIC_RUSH.colors.glowCyan}`,
              ],
            }
      }
      whileTap={
        prefersReducedMotion
          ? {}
          : {
              scale: 0.98,
            }
      }
      transition={{
        type: 'spring' as const,
        stiffness: 300,
        damping: 20,
      }}
    >
      {/* Shine Effect */}
      {!prefersReducedMotion && (
        <motion.div
          className="absolute inset-0 opacity-0 group-hover:opacity-100"
          style={{
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
            animation: 'shine 3s infinite',
          }}
        />
      )}
      <span className="relative z-10">{children}</span>
    </motion.button>
  );
};

// ============================================================
// 5. SECONDARY BUTTON
// ============================================================

export const SecondaryButton = ({ children, onClick, className = '' }: ButtonProps) => {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.button
      onClick={onClick}
      className={`relative px-8 py-3 rounded-lg font-bold tracking-widest text-sm ${className}`}
      style={{
        background: 'transparent',
        border: `2px solid ${ELECTRIC_RUSH.colors.electricBlue}`,
        color: ELECTRIC_RUSH.colors.electricBlue,
      }}
      whileHover={
        prefersReducedMotion
          ? {}
          : {
              background: `${ELECTRIC_RUSH.colors.glowCyan}`,
              color: ELECTRIC_RUSH.colors.textPrimary,
              boxShadow: `0 0 15px ${ELECTRIC_RUSH.colors.glowCyan}`,
            }
      }
      whileTap={
        prefersReducedMotion
          ? {}
          : {
              scale: 0.98,
            }
      }
      transition={{
        type: 'spring' as const,
        stiffness: 300,
        damping: 20,
      }}
    >
      {children}
    </motion.button>
  );
};

// ============================================================
// 6. GLASSMORPHIC SEARCH BAR
// ============================================================

export const SearchBar = () => {
  return (
    <div
      className="flex items-center gap-3 px-4 py-3 rounded-lg max-w-md w-full"
      style={{
        background: `rgba(26, 31, 58, 0.5)`,
        backdropFilter: 'blur(14px)',
        border: `1px solid ${ELECTRIC_RUSH.colors.glowCyan}`,
      }}
    >
      <span style={{ color: ELECTRIC_RUSH.colors.electricBlue }}>🔍</span>
      <input
        type="text"
        placeholder="Search events, artists..."
        className="bg-transparent text-white outline-none flex-1 placeholder-gray-500"
        style={{
          fontFamily: ELECTRIC_RUSH.typography.body,
          fontSize: '16px',
        }}
      />
    </div>
  );
};

// ============================================================
// 7. EVENT CAROUSEL (STAGGERED DECK)
// ============================================================

export const EventCarousel = () => {
  const events = [
    {
      title: 'The Weeknd',
      venue: 'Madison Square Garden',
      time: 'Jul 15, 2026 • 8:00 PM',
      price: '$89',
      image: 'https://via.placeholder.com/400x300?text=The+Weeknd',
      isTrending: true,
    },
    {
      title: 'Taylor Swift',
      venue: 'MetLife Stadium',
      time: 'Jul 20, 2026 • 7:30 PM',
      price: '$129',
      image: 'https://via.placeholder.com/400x300?text=Taylor+Swift',
      isTrending: true,
    },
    {
      title: 'Coldplay',
      venue: 'Barclays Center',
      time: 'Jul 25, 2026 • 8:00 PM',
      price: '$75',
      image: 'https://via.placeholder.com/400x300?text=Coldplay',
      isTrending: false,
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring' as const,
        stiffness: 200,
        damping: 25,
      },
    },
  };

  return (
    <section className="py-16 px-4">
      <h2
        className="text-4xl font-bold mb-12 tracking-tight"
        style={{
          fontFamily: ELECTRIC_RUSH.typography.display,
          color: ELECTRIC_RUSH.colors.textPrimary,
        }}
      >
        🔥 HOTTEST SHOWS THIS WEEK
      </h2>

      <motion.div
        className="flex gap-6 overflow-x-auto pb-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {events.map((event, i) => (
          <motion.div key={i} variants={cardVariants}>
            <EventCard {...event} />
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
};

export default HeroSection;
