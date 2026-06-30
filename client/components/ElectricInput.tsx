'use client';

import { motion, useReducedMotion } from 'framer-motion';
import ELECTRIC_RUSH from '@/lib/design-tokens';
import { Search, AlertCircle } from 'lucide-react';
import { forwardRef, InputHTMLAttributes, useState } from 'react';

// ============================================================
// TYPES & INTERFACES
// ============================================================

export interface ElectricInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  variant?: 'default' | 'search';
  fullWidth?: boolean;
}

// ============================================================
// MAIN ELECTRIC INPUT COMPONENT
// ============================================================

export const ElectricInput = forwardRef<HTMLInputElement, ElectricInputProps>(
  (
    {
      label,
      error,
      icon,
      variant = 'default',
      fullWidth = true,
      disabled = false,
      className = '',
      id,
      ...props
    },
    ref
  ) => {
    const prefersReducedMotion = useReducedMotion();
    const [isFocused, setIsFocused] = useState(false);
    
    // Generate unique ID for accessibility
    const inputId = id || `electric-input-${Math.random().toString(36).substr(2, 9)}`;
    const errorId = `${inputId}-error`;
    const hasError = !!error;

    // ============================================================
    // STYLES
    // ============================================================

    const containerStyles = {
      width: fullWidth ? '100%' : 'auto',
      position: 'relative' as const,
    };

    const inputWrapperStyles = {
      position: 'relative' as const,
      display: 'flex',
      alignItems: 'center',
      background: `linear-gradient(135deg, ${ELECTRIC_RUSH.colors.surfaceDark}50, ${ELECTRIC_RUSH.colors.offBlack}80)`,
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      borderRadius: ELECTRIC_RUSH.borderRadius.lg,
      border: `2px solid ${
        hasError
          ? ELECTRIC_RUSH.colors.error
          : isFocused
          ? ELECTRIC_RUSH.colors.electricBlue
          : `${ELECTRIC_RUSH.colors.electricBlue}30`
      }`,
      transition: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)',
      overflow: 'hidden' as const,
    };

    const inputStyles = {
      width: '100%',
      padding: icon ? '14px 16px 14px 48px' : '14px 16px',
      background: 'transparent',
      border: 'none',
      outline: 'none',
      fontSize: '16px',
      fontWeight: 500,
      color: disabled ? ELECTRIC_RUSH.colors.textTertiary : ELECTRIC_RUSH.colors.textPrimary,
      fontFamily: ELECTRIC_RUSH.typography.body,
      WebkitTapHighlightColor: 'transparent',
    };

    const iconStyles = {
      position: 'absolute' as const,
      left: '16px',
      display: 'flex',
      alignItems: 'center',
      color: hasError
        ? ELECTRIC_RUSH.colors.error
        : isFocused
        ? ELECTRIC_RUSH.colors.electricBlue
        : ELECTRIC_RUSH.colors.textTertiary,
      transition: 'color 300ms cubic-bezier(0.4, 0, 0.2, 1)',
    };

    const labelStyles = {
      display: 'block',
      marginBottom: '8px',
      fontSize: '14px',
      fontWeight: 600,
      letterSpacing: '0.05em',
      color: hasError ? ELECTRIC_RUSH.colors.error : ELECTRIC_RUSH.colors.textSecondary,
      fontFamily: ELECTRIC_RUSH.typography.body,
    };

    const errorStyles = {
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      marginTop: '6px',
      fontSize: '12px',
      fontWeight: 500,
      color: ELECTRIC_RUSH.colors.error,
      fontFamily: ELECTRIC_RUSH.typography.body,
    };

    // ============================================================
    // ANIMATION VARIANTS
    // ============================================================


    const errorVariants = {
      hidden: {
        opacity: 0,
        y: -10,
        height: 0,
      },
      visible: {
        opacity: 1,
        y: 0,
        height: 'auto',
        transition: prefersReducedMotion
          ? { duration: 0 }
          : ELECTRIC_RUSH.spring.kinetic,
      },
    };

    // ============================================================
    // RENDER
    // ============================================================

    // Determine icon to show
    const displayIcon = variant === 'search' && !icon ? <Search size={20} /> : icon;

    return (
      <div style={containerStyles} className={className}>
        {/* Label */}
        {label && (
          <label htmlFor={inputId} style={labelStyles}>
            {label}
          </label>
        )}

        {/* Input Wrapper */}
        <motion.div
          style={inputWrapperStyles}
          animate={
            isFocused && !hasError
              ? {
                  boxShadow: `0 0 0 3px ${ELECTRIC_RUSH.colors.electricBlue}20, 0 0 20px ${ELECTRIC_RUSH.colors.glowCyan}`,
                }
              : hasError
              ? {
                  boxShadow: `0 0 0 3px ${ELECTRIC_RUSH.colors.error}20`,
                }
              : {}
          }
        >
          {/* Icon */}
          {displayIcon && (
            <motion.div
              style={iconStyles}
              animate={
                isFocused
                  ? { scale: 1.1 }
                  : { scale: 1 }
              }
              transition={ELECTRIC_RUSH.spring.kinetic}
            >
              {displayIcon}
            </motion.div>
          )}

          {/* Input */}
          <input
            ref={ref}
            id={inputId}
            style={inputStyles}
            disabled={disabled}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            aria-invalid={hasError}
            aria-describedby={hasError ? errorId : undefined}
            {...props}
          />

          {/* Animated focus ring glow */}
          {isFocused && !hasError && !prefersReducedMotion && (
            <motion.div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: `linear-gradient(90deg, transparent, ${ELECTRIC_RUSH.colors.electricBlue}20, transparent)`,
                transform: 'translateX(-100%)',
              }}
              animate={{
                transform: 'translateX(100%)',
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: 'linear' as const,
              }}
            />
          )}
        </motion.div>

        {/* Error Message */}
        {hasError && (
          <motion.div
            style={errorStyles}
            variants={errorVariants}
            initial="hidden"
            animate="visible"
            id={errorId}
            role="alert"
          >
            <AlertCircle size={14} />
            <span>{error}</span>
          </motion.div>
        )}

        {/* Placeholder styles */}
        <style jsx>{`
          input::placeholder {
            color: ${ELECTRIC_RUSH.colors.textTertiary};
            opacity: 0.6;
          }
          
          input:disabled {
            cursor: not-allowed;
            opacity: 0.6;
          }

          input:focus::placeholder {
            color: ${ELECTRIC_RUSH.colors.textTertiary};
            opacity: 0.4;
          }

          /* Remove autofill background */
          input:-webkit-autofill,
          input:-webkit-autofill:hover,
          input:-webkit-autofill:focus {
            -webkit-text-fill-color: ${ELECTRIC_RUSH.colors.textPrimary};
            -webkit-box-shadow: 0 0 0px 1000px ${ELECTRIC_RUSH.colors.surfaceDark} inset;
            transition: background-color 5000s ease-in-out 0s;
          }
        `}</style>
      </div>
    );
  }
);

ElectricInput.displayName = 'ElectricInput';

export default ElectricInput;
