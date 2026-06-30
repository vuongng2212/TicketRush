'use client';

import { motion, useReducedMotion } from 'framer-motion';
import ELECTRIC_RUSH from '@/lib/design-tokens';
import { Zap } from 'lucide-react';

// ============================================================
// TYPES & INTERFACES
// ============================================================

export interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  fullScreen?: boolean;
  message?: string;
}

interface SizeConfig {
  spinner: number;
  icon: number;
  strokeWidth: number;
}

// ============================================================
// SPINNER CONTENT COMPONENT (extracted to avoid static-components error)
// ============================================================

const SpinnerContent = ({ 
  config, 
  prefersReducedMotion 
}: { 
  config: SizeConfig; 
  prefersReducedMotion: boolean | null;
}) => (
  <div
    style={{
      position: 'relative',
      width: config.spinner,
      height: config.spinner,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}
  >
    {/* Outer rotating ring */}
    {!prefersReducedMotion ? (
      <motion.div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '50%',
          border: `${config.strokeWidth}px solid transparent`,
          borderTopColor: ELECTRIC_RUSH.colors.electricBlue,
          borderRightColor: ELECTRIC_RUSH.colors.hotMagenta,
          borderBottomColor: ELECTRIC_RUSH.colors.limeRush,
        }}
        animate={{
          rotate: 360,
          transition: { duration: 1.2, repeat: Infinity, ease: 'linear' as const },
        }}
      />
    ) : (
      <motion.div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '50%',
          border: `${config.strokeWidth}px solid transparent`,
          borderTopColor: ELECTRIC_RUSH.colors.electricBlue,
          borderRightColor: ELECTRIC_RUSH.colors.hotMagenta,
          borderBottomColor: ELECTRIC_RUSH.colors.limeRush,
        }}
        animate={{
          opacity: [1, 0.6, 1],
          transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' as const },
        }}
      />
    )}

    {/* Inner glow pulse */}
    <motion.div
      style={{
        position: 'absolute',
        inset: config.strokeWidth * 2,
        borderRadius: '50%',
        background: `radial-gradient(circle, ${ELECTRIC_RUSH.colors.electricBlue}40, transparent 70%)`,
        filter: 'blur(4px)',
      }}
      animate={{
        scale: [1, 1.3, 1],
        opacity: [0.5, 0.8, 0.5],
        transition: { duration: 1.8, repeat: Infinity, ease: 'easeInOut' as const },
      }}
    />

    {/* Center icon */}
    <motion.div
      style={{
        position: 'relative',
        zIndex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      animate={
        prefersReducedMotion
          ? {}
          : {
              scale: [1, 0.9, 1],
              transition: {
                duration: 1.5,
                repeat: Infinity,
                ease: 'easeInOut' as const,
              },
            }
      }
    >
      <Zap
        size={config.icon}
        style={{
          color: ELECTRIC_RUSH.colors.limeRush,
          filter: `drop-shadow(0 0 8px ${ELECTRIC_RUSH.colors.glowLime})`,
        }}
      />
    </motion.div>
  </div>
);

// ============================================================
// MAIN LOADING SPINNER COMPONENT
// ============================================================

export const LoadingSpinner = ({ 
  size = 'md', 
  fullScreen = false,
  message
}: LoadingSpinnerProps) => {
  const prefersReducedMotion = useReducedMotion();

  // ============================================================
  // SIZE CONFIGURATIONS
  // ============================================================

  const sizeConfig = {
    sm: {
      spinner: 32,
      icon: 16,
      strokeWidth: 3,
    },
    md: {
      spinner: 48,
      icon: 24,
      strokeWidth: 4,
    },
    lg: {
      spinner: 64,
      icon: 32,
      strokeWidth: 5,
    },
  };

  const config = sizeConfig[size];

  // ============================================================
  // RENDER: INLINE SPINNER
  // ============================================================

  if (!fullScreen) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '16px',
        }}
      >
        <SpinnerContent config={config} prefersReducedMotion={prefersReducedMotion} />
        {message && (
          <motion.p
            style={{
              fontSize: '14px',
              fontWeight: 600,
              color: ELECTRIC_RUSH.colors.textSecondary,
              textAlign: 'center',
            }}
            animate={{
              opacity: [0.7, 1, 0.7],
              transition: {
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut' as const,
              },
            }}
          >
            {message}
          </motion.p>
        )}
      </div>
    );
  }

  // ============================================================
  // RENDER: FULLSCREEN SPINNER
  // ============================================================

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      style={{
        position: 'fixed',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '24px',
        background: 'rgba(2, 6, 23, 0.95)',
        backdropFilter: 'blur(8px)',
        zIndex: 9999,
      }}
    >
      {/* Animated gradient background */}
      <motion.div
        style={{
          position: 'absolute',
          inset: 0,
          opacity: 0.1,
          background: `radial-gradient(circle at 50% 50%, ${ELECTRIC_RUSH.colors.electricBlue}, transparent 50%)`,
        }}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.05, 0.15, 0.05],
          transition: {
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut' as const,
          },
        }}
      />

      <SpinnerContent config={config} prefersReducedMotion={prefersReducedMotion} />

      {message && (
        <motion.p
          style={{
            fontSize: '16px',
            fontWeight: 700,
            color: ELECTRIC_RUSH.colors.textPrimary,
            textAlign: 'center',
            maxWidth: '300px',
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
            fontFamily: ELECTRIC_RUSH.typography.display,
          }}
          animate={{
            opacity: [0.7, 1, 0.7],
            transition: {
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut' as const,
            },
          }}
        >
          {message}
        </motion.p>
      )}
    </motion.div>
  );
};
