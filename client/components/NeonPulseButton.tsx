'use client';

import { motion, useReducedMotion } from 'framer-motion';
import ELECTRIC_RUSH, { GRADIENTS } from '@/lib/design-tokens';
import { Loader2 } from 'lucide-react';
import { forwardRef, ButtonHTMLAttributes } from 'react';

// ============================================================
// TYPES & INTERFACES
// ============================================================

export interface NeonPulseButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'size'> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  children: React.ReactNode;
}

// ============================================================
// LOADING SPINNER COMPONENT
// ============================================================

const ElectricSpinner = ({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) => {
  const prefersReducedMotion = useReducedMotion();

  const sizeMap = {
    sm: 14,
    md: 18,
    lg: 22,
  };

  if (prefersReducedMotion) {
    return (
      <Loader2 
        className="animate-pulse" 
        size={sizeMap[size]} 
        style={{ color: 'currentColor' }}
      />
    );
  }

  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{
        duration: 1,
        repeat: Infinity,
        ease: 'linear' as const,
      }}
    >
      <Loader2 size={sizeMap[size]} style={{ color: 'currentColor' }} />
    </motion.div>
  );
};

// ============================================================
// MAIN NEON PULSE BUTTON COMPONENT
// ============================================================

export const NeonPulseButton = forwardRef<HTMLButtonElement, NeonPulseButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      isLoading = false,
      disabled = false,
      icon,
      iconPosition = 'left',
      fullWidth = false,
      children,
      className = '',
      onClick,
      ...props
    },
    ref
  ) => {
    const prefersReducedMotion = useReducedMotion();
    const isDisabled = disabled || isLoading;

    // ============================================================
    // VARIANT STYLES
    // ============================================================

    const variantStyles = {
      primary: {
        base: {
          background: GRADIENTS.buttonPrimary,
          color: ELECTRIC_RUSH.colors.offBlack,
          border: 'none',
        },
        hover: {
          background: GRADIENTS.buttonHover,
          boxShadow: `0 0 30px ${ELECTRIC_RUSH.colors.glowLime}`,
        },
        disabled: {
          background: `${ELECTRIC_RUSH.colors.surfaceLight}50`,
          color: ELECTRIC_RUSH.colors.textTertiary,
          boxShadow: 'none',
        },
      },
      secondary: {
        base: {
          background: 'transparent',
          color: ELECTRIC_RUSH.colors.electricBlue,
          border: `2px solid ${ELECTRIC_RUSH.colors.electricBlue}60`,
        },
        hover: {
          background: `${ELECTRIC_RUSH.colors.electricBlue}15`,
          borderColor: ELECTRIC_RUSH.colors.electricBlue,
          boxShadow: `0 0 20px ${ELECTRIC_RUSH.colors.glowCyan}`,
        },
        disabled: {
          background: 'transparent',
          color: ELECTRIC_RUSH.colors.textTertiary,
          borderColor: `${ELECTRIC_RUSH.colors.textTertiary}30`,
          boxShadow: 'none',
        },
      },
      ghost: {
        base: {
          background: 'transparent',
          color: ELECTRIC_RUSH.colors.textSecondary,
          border: 'none',
        },
        hover: {
          background: `${ELECTRIC_RUSH.colors.surfaceLight}80`,
          color: ELECTRIC_RUSH.colors.electricBlue,
        },
        disabled: {
          background: 'transparent',
          color: ELECTRIC_RUSH.colors.textTertiary,
        },
      },
    };

    // ============================================================
    // SIZE STYLES
    // ============================================================

    const sizeStyles = {
      sm: {
        padding: '8px 16px',
        fontSize: '12px',
        height: '36px',
        gap: '6px',
        borderRadius: ELECTRIC_RUSH.borderRadius.md,
      },
      md: {
        padding: '12px 24px',
        fontSize: '14px',
        height: '44px',
        gap: '8px',
        borderRadius: ELECTRIC_RUSH.borderRadius.lg,
      },
      lg: {
        padding: '16px 32px',
        fontSize: '16px',
        height: '52px',
        gap: '10px',
        borderRadius: ELECTRIC_RUSH.borderRadius.lg,
      },
    };

    const currentVariant = variantStyles[variant];
    const currentSize = sizeStyles[size];

    // ============================================================
    // ANIMATION VARIANTS
    // ============================================================

    const buttonVariants = {
      hover: prefersReducedMotion
        ? {}
        : {
            scale: 1.03,
            transition: ELECTRIC_RUSH.spring.kinetic,
          },
      tap: prefersReducedMotion
        ? {}
        : {
            scale: 0.97,
            transition: ELECTRIC_RUSH.spring.kinetic,
          },
    };

    // ============================================================
    // BASE STYLES
    // ============================================================

    const baseStyles = {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: 700,
      letterSpacing: '0.05em',
      textTransform: 'uppercase' as const,
      cursor: isDisabled ? 'not-allowed' : 'pointer',
      transition: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)',
      position: 'relative' as const,
      overflow: 'hidden' as const,
      fontFamily: ELECTRIC_RUSH.typography.display,
      width: fullWidth ? '100%' : 'auto',
      outline: 'none',
      WebkitTapHighlightColor: 'transparent',
      ...currentSize,
      ...(isDisabled ? currentVariant.disabled : currentVariant.base),
    };

    // ============================================================
    // FOCUS VISIBLE STYLES (for accessibility)
    // ============================================================

    const focusVisibleStyles = {
      boxShadow: `0 0 0 3px ${ELECTRIC_RUSH.colors.electricBlue}40, 0 0 20px ${ELECTRIC_RUSH.colors.glowCyan}`,
      outline: `2px solid ${ELECTRIC_RUSH.colors.electricBlue}`,
      outlineOffset: '2px',
    };

    // ============================================================
    // RENDER
    // ============================================================

    return (
      <motion.button
        ref={ref}
        className={`neon-pulse-button ${className}`}
        style={baseStyles as React.CSSProperties}
        variants={buttonVariants}
        whileHover={isDisabled ? {} : 'hover'}
        whileTap={isDisabled ? {} : 'tap'}
        disabled={isDisabled}
        onClick={isDisabled ? undefined : onClick}
        aria-busy={isLoading}
        aria-disabled={isDisabled}
        {...props}
      >
        {/* Shine effect on hover (primary variant only) */}
        {variant === 'primary' && !isDisabled && (
          <motion.div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
              transform: 'translateX(-100%)',
            }}
            whileHover={{
              transform: 'translateX(100%)',
              transition: { duration: 0.6 },
            }}
          />
        )}

        {/* Content Container */}
        <span
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: currentSize.gap,
            position: 'relative',
            zIndex: 1,
          }}
        >
          {/* Loading Spinner */}
          {isLoading && <ElectricSpinner size={size} />}

          {/* Icon (left position) */}
          {!isLoading && icon && iconPosition === 'left' && (
            <span style={{ display: 'flex', alignItems: 'center' }}>{icon}</span>
          )}

          {/* Button Text */}
          {!isLoading && <span>{children}</span>}

          {/* Icon (right position) */}
          {!isLoading && icon && iconPosition === 'right' && (
            <span style={{ display: 'flex', alignItems: 'center' }}>{icon}</span>
          )}
        </span>

        {/* Focus ring (keyboard navigation) */}
        <style jsx>{`
          .neon-pulse-button:focus-visible {
            box-shadow: ${focusVisibleStyles.boxShadow};
            outline: ${focusVisibleStyles.outline};
            outline-offset: ${focusVisibleStyles.outlineOffset};
          }
        `}</style>
      </motion.button>
    );
  }
);

NeonPulseButton.displayName = 'NeonPulseButton';

export default NeonPulseButton;
