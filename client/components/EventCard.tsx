'use client';

import { motion, useReducedMotion } from 'framer-motion';
import ELECTRIC_RUSH, { GRADIENTS } from '@/lib/design-tokens';
import { Calendar, MapPin, Star, Ticket, Heart, TrendingUp } from 'lucide-react';
import { useState } from 'react';

// ============================================================
// TYPES & INTERFACES
// ============================================================

export interface EventCardProps {
  event: {
    id: string;
    title: string;
    venue: string;
    date: string;
    price: number;
    rating: number;
    reviewsCount: number;
    ticketsAvailable: number;
    imageUrl: string;
    category: 'concert' | 'festival' | 'comedy' | 'sports';
  };
  onSelect?: (eventId: string) => void;
  onWishlist?: (eventId: string) => void;
  variant?: 'default' | 'featured' | 'compact';
  animationDelay?: number;
}

// ============================================================
// CATEGORY BADGE COMPONENT
// ============================================================

const CategoryBadge = ({ category }: { category: string }) => {
  const categoryColors = {
    concert: { bg: ELECTRIC_RUSH.colors.electricBlue, text: ELECTRIC_RUSH.colors.offBlack },
    festival: { bg: ELECTRIC_RUSH.colors.hotMagenta, text: ELECTRIC_RUSH.colors.textPrimary },
    comedy: { bg: ELECTRIC_RUSH.colors.acidYellow, text: ELECTRIC_RUSH.colors.offBlack },
    sports: { bg: ELECTRIC_RUSH.colors.limeRush, text: ELECTRIC_RUSH.colors.offBlack },
  };

  const colors = categoryColors[category as keyof typeof categoryColors];

  return (
    <div
      className="absolute top-4 left-4 z-10 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider"
      style={{
        backgroundColor: colors.bg,
        color: colors.text,
      }}
    >
      {category}
    </div>
  );
};

// ============================================================
// MAIN EVENT CARD COMPONENT
// ============================================================

export const EventCard = ({
  event,
  onSelect,
  onWishlist,
  animationDelay = 0,
}: EventCardProps) => {
  const prefersReducedMotion = useReducedMotion();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const handleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsWishlisted(!isWishlisted);
    onWishlist?.(event.id);
  };

  const handleSelect = () => {
    onSelect?.(event.id);
  };

  // Animation variants
  const cardVariants = {
    hidden: {
      opacity: 0,
      y: 40,
      scale: 0.95,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: prefersReducedMotion
        ? { duration: 0 }
        : {
            ...ELECTRIC_RUSH.spring.kinetic,
            delay: animationDelay,
          },
    },
  };

  const imageVariants = {
    hover: prefersReducedMotion
      ? {}
      : {
          scale: 1.05,
          transition: ELECTRIC_RUSH.spring.smooth,
        },
  };

  const buttonVariants = {
    hover: prefersReducedMotion
      ? {}
      : {
          scale: 1.05,
          boxShadow: `0 0 30px ${ELECTRIC_RUSH.colors.glowLime}`,
        },
    tap: {
      scale: 0.98,
    },
  };

  // Format price
  const formattedPrice = new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(event.price);

  // Format date
  const formattedDate = new Date(event.date).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  // Low tickets warning
  const isLowTickets = event.ticketsAvailable < 50;

  return (
    <motion.article
      className="group relative flex flex-col rounded-xl overflow-hidden cursor-pointer"
      style={{
        background: `linear-gradient(135deg, ${ELECTRIC_RUSH.colors.surfaceDark}95 0%, ${ELECTRIC_RUSH.colors.offBlack}98 100%)`,
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        border: `1px solid transparent`,
        backgroundImage: GRADIENTS.cardBorder,
        backgroundOrigin: 'border-box',
        backgroundClip: 'padding-box, border-box',
      }}
      variants={cardVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-50px' }}
      whileHover={
        prefersReducedMotion
          ? {}
          : {
              scale: 1.03,
              boxShadow: `0 8px 32px ${ELECTRIC_RUSH.colors.glowCyan}, 0 0 0 1px ${ELECTRIC_RUSH.colors.electricBlue}40`,
              transition: ELECTRIC_RUSH.spring.kinetic,
            }
      }
      onClick={handleSelect}
      role="button"
      tabIndex={0}
      aria-label={`Event: ${event.title} at ${event.venue}`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleSelect();
        }
      }}
    >
      {/* Category Badge */}
      <CategoryBadge category={event.category} />

      {/* Wishlist Button */}
      <motion.button
        className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full flex items-center justify-center"
        style={{
          background: `${ELECTRIC_RUSH.colors.surfaceDark}90`,
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          border: `1px solid ${ELECTRIC_RUSH.colors.electricBlue}30`,
        }}
        whileHover={
          prefersReducedMotion
            ? {}
            : {
                scale: 1.1,
                boxShadow: `0 0 20px ${isWishlisted ? ELECTRIC_RUSH.colors.glowMagenta : ELECTRIC_RUSH.colors.glowCyan}`,
              }
        }
        whileTap={{ scale: 0.9 }}
        onClick={handleWishlist}
        aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
      >
        <Heart
          className="w-5 h-5"
          style={{
            color: isWishlisted ? ELECTRIC_RUSH.colors.hotMagenta : ELECTRIC_RUSH.colors.textSecondary,
            fill: isWishlisted ? ELECTRIC_RUSH.colors.hotMagenta : 'none',
          }}
        />
      </motion.button>

      {/* Event Image */}
      <div className="relative w-full h-48 overflow-hidden">
        <motion.div
          className="w-full h-full"
          variants={imageVariants}
          whileHover="hover"
        >
          <img
            src={event.imageUrl}
            alt={event.title}
            className={`w-full h-full object-cover transition-opacity duration-300 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            onLoad={() => setImageLoaded(true)}
          />
          {!imageLoaded && (
            <div
              className="absolute inset-0"
              style={{
                background: `linear-gradient(135deg, ${ELECTRIC_RUSH.colors.surfaceDark} 0%, ${ELECTRIC_RUSH.colors.surfaceLight} 100%)`,
              }}
            />
          )}
        </motion.div>

        {/* Gradient overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `linear-gradient(180deg, transparent 0%, ${ELECTRIC_RUSH.colors.offBlack}60 100%)`,
          }}
        />

        {/* Trending Badge (if high rating) */}
        {event.rating >= 4.8 && (
          <div
            className="absolute bottom-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold"
            style={{
              background: `${ELECTRIC_RUSH.colors.limeRush}20`,
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              border: `1px solid ${ELECTRIC_RUSH.colors.limeRush}40`,
              color: ELECTRIC_RUSH.colors.limeRush,
            }}
          >
            <TrendingUp className="w-3 h-3" />
            <span>HOT</span>
          </div>
        )}
      </div>

      {/* Card Content */}
      <div className="flex flex-col gap-3 p-4">
        {/* Title */}
        <h3
          className="text-xl font-bold tracking-tight line-clamp-2 group-hover:text-opacity-90 transition-opacity"
          style={{
            color: ELECTRIC_RUSH.colors.electricBlue,
            fontFamily: ELECTRIC_RUSH.typography.display,
          }}
        >
          {event.title}
        </h3>

        {/* Venue */}
        <div className="flex items-center gap-2">
          <MapPin
            className="w-4 h-4 flex-shrink-0"
            style={{ color: ELECTRIC_RUSH.colors.textTertiary }}
          />
          <span
            className="text-sm line-clamp-1"
            style={{ color: ELECTRIC_RUSH.colors.textSecondary }}
          >
            {event.venue}
          </span>
        </div>

        {/* Divider */}
        <div
          className="w-full h-px"
          style={{
            background: `linear-gradient(90deg, transparent 0%, ${ELECTRIC_RUSH.colors.electricBlue}20 50%, transparent 100%)`,
          }}
        />

        {/* Meta Info Grid */}
        <div className="grid grid-cols-2 gap-3">
          {/* Date */}
          <div className="flex items-center gap-2">
            <Calendar
              className="w-4 h-4 flex-shrink-0"
              style={{ color: ELECTRIC_RUSH.colors.electricBlue }}
            />
            <div className="flex flex-col">
              <span
                className="text-xs uppercase tracking-wider"
                style={{ color: ELECTRIC_RUSH.colors.textTertiary }}
              >
                Date
              </span>
              <span
                className="text-sm font-semibold"
                style={{ color: ELECTRIC_RUSH.colors.textPrimary }}
              >
                {formattedDate}
              </span>
            </div>
          </div>

          {/* Price */}
          <div className="flex items-center gap-2 justify-end">
            <div className="flex flex-col items-end">
              <span
                className="text-xs uppercase tracking-wider"
                style={{ color: ELECTRIC_RUSH.colors.textTertiary }}
              >
                From
              </span>
              <span
                className="text-sm font-bold"
                style={{
                  background: GRADIENTS.textElectric,
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                {formattedPrice}
              </span>
            </div>
          </div>

          {/* Rating */}
          <div className="flex items-center gap-2">
            <Star
              className="w-4 h-4 flex-shrink-0"
              style={{
                color: ELECTRIC_RUSH.colors.acidYellow,
                fill: ELECTRIC_RUSH.colors.acidYellow,
              }}
            />
            <div className="flex flex-col">
              <span
                className="text-xs uppercase tracking-wider"
                style={{ color: ELECTRIC_RUSH.colors.textTertiary }}
              >
                Rating
              </span>
              <span
                className="text-sm font-semibold"
                style={{ color: ELECTRIC_RUSH.colors.textPrimary }}
              >
                {event.rating} ({event.reviewsCount})
              </span>
            </div>
          </div>

          {/* Tickets Available */}
          <div className="flex items-center gap-2 justify-end">
            <Ticket
              className="w-4 h-4 flex-shrink-0"
              style={{
                color: isLowTickets
                  ? ELECTRIC_RUSH.colors.hotMagenta
                  : ELECTRIC_RUSH.colors.limeRush,
              }}
            />
            <div className="flex flex-col items-end">
              <span
                className="text-xs uppercase tracking-wider"
                style={{ color: ELECTRIC_RUSH.colors.textTertiary }}
              >
                Available
              </span>
              <span
                className="text-sm font-semibold"
                style={{
                  color: isLowTickets
                    ? ELECTRIC_RUSH.colors.hotMagenta
                    : ELECTRIC_RUSH.colors.limeRush,
                }}
              >
                {event.ticketsAvailable}
              </span>
            </div>
          </div>
        </div>

        {/* GET TICKETS Button */}
        <motion.button
          className="w-full px-6 py-3 rounded-lg font-bold text-sm uppercase tracking-wider mt-2"
          style={{
            background: GRADIENTS.buttonPrimary,
            color: ELECTRIC_RUSH.colors.offBlack,
            boxShadow: `0 0 20px ${ELECTRIC_RUSH.colors.glowLime}`,
          }}
          variants={buttonVariants}
          whileHover="hover"
          whileTap="tap"
          onClick={(e) => {
            e.stopPropagation();
            handleSelect();
          }}
        >
          Get Tickets
        </motion.button>
      </div>
    </motion.article>
  );
};

export default EventCard;
