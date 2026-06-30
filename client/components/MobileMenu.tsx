'use client';

import { motion, useReducedMotion, AnimatePresence, PanInfo } from 'framer-motion';
import ELECTRIC_RUSH, { GRADIENTS } from '@/lib/design-tokens';
import { X, Zap, Ticket, Heart, User, LogOut, Settings } from 'lucide-react';
import { useEffect } from 'react';

// ============================================================
// TYPES & INTERFACES
// ============================================================

export interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  user?: {
    id: string;
    email: string;
    roles?: string[];
  } | null;
  onLogout?: () => void;
}

interface MobileMenuItemProps {
  icon: React.ReactNode;
  label: string;
  href: string;
  onClick: () => void;
  delay?: number;
}

// ============================================================
// MOBILE MENU ITEM COMPONENT
// ============================================================

const MobileMenuItem = ({ icon, label, href, onClick, delay = 0 }: MobileMenuItemProps) => {
  const prefersReducedMotion = useReducedMotion();

  const itemVariants = {
    hidden: {
      x: -20,
      opacity: 0,
    },
    visible: {
      x: 0,
      opacity: 1,
      transition: prefersReducedMotion
        ? { duration: 0 }
        : {
            ...ELECTRIC_RUSH.spring.kinetic,
            delay,
          },
    },
  };

  return (
    <motion.a
      href={href}
      className="flex items-center gap-4 px-6 py-4 rounded-lg transition-colors group"
      style={{
        color: ELECTRIC_RUSH.colors.textSecondary,
      }}
      variants={itemVariants}
      whileHover={{
        backgroundColor: `${ELECTRIC_RUSH.colors.electricBlue}10`,
        color: ELECTRIC_RUSH.colors.electricBlue,
      }}
      whileTap={{ scale: 0.98 }}
      onClick={(e) => {
        e.preventDefault();
        onClick();
      }}
    >
      <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{
        background: `${ELECTRIC_RUSH.colors.surfaceLight}50`,
      }}>
        {icon}
      </div>
      <span className="text-lg font-semibold">{label}</span>
    </motion.a>
  );
};

// ============================================================
// MAIN MOBILE MENU COMPONENT
// ============================================================

export const MobileMenu = ({ isOpen, onClose, user, onLogout }: MobileMenuProps) => {
  const prefersReducedMotion = useReducedMotion();

  // Lock body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Backdrop animation
  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { duration: 0.2 }
    },
  };

  // Drawer animation
  const drawerVariants = {
    hidden: {
      x: '-100%',
    },
    visible: {
      x: 0,
      transition: prefersReducedMotion
        ? { duration: 0 }
        : ELECTRIC_RUSH.spring.kinetic,
    },
  };

  // Container animation for staggered children
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.1,
      },
    },
  };

  // Handle drag to close
  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (info.offset.x < -100) {
      onClose();
    }
  };

  const menuItems = [
    { href: '#home', label: 'Home', icon: <Zap className="w-5 h-5" /> },
    { href: '#events', label: 'Events', icon: <Ticket className="w-5 h-5" /> },
    { href: '#tickets', label: 'My Tickets', icon: <Ticket className="w-5 h-5" /> },
    { href: '#wishlist', label: 'Wishlist', icon: <Heart className="w-5 h-5" /> },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop Overlay */}
          <motion.div
            className="fixed inset-0 z-40"
            style={{
              background: `linear-gradient(135deg, ${ELECTRIC_RUSH.colors.offBlack}95, ${ELECTRIC_RUSH.colors.surfaceDark}90)`,
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
            }}
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Drawer */}
          <motion.div
            className="fixed top-0 left-0 bottom-0 w-full max-w-sm z-50 overflow-y-auto"
            style={{
              background: `linear-gradient(135deg, ${ELECTRIC_RUSH.colors.surfaceDark}98, ${ELECTRIC_RUSH.colors.offBlack}95)`,
              borderRight: `1px solid ${ELECTRIC_RUSH.colors.electricBlue}40`,
              boxShadow: `0 0 40px ${ELECTRIC_RUSH.colors.glowCyan}`,
            }}
            variants={drawerVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragEnd={handleDragEnd}
            role="dialog"
            aria-modal="true"
            aria-label="Mobile navigation menu"
          >
            {/* Header */}
            <div className="sticky top-0 z-10 px-6 py-6 flex items-center justify-between border-b"
              style={{
                background: `linear-gradient(135deg, ${ELECTRIC_RUSH.colors.surfaceDark}98, ${ELECTRIC_RUSH.colors.offBlack}95)`,
                borderColor: `${ELECTRIC_RUSH.colors.electricBlue}30`,
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
              }}
            >
              {/* Logo */}
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{
                    background: GRADIENTS.buttonPrimary,
                  }}
                >
                  <Zap className="w-6 h-6" style={{ color: ELECTRIC_RUSH.colors.offBlack }} />
                </div>
                <h2
                  className="text-xl font-black tracking-tighter"
                  style={{
                    background: GRADIENTS.textElectric,
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    fontFamily: ELECTRIC_RUSH.typography.display,
                  }}
                >
                  TICKETRUSH
                </h2>
              </div>

              {/* Close Button */}
              <motion.button
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{
                  background: `${ELECTRIC_RUSH.colors.surfaceLight}50`,
                  border: `1px solid ${ELECTRIC_RUSH.colors.electricBlue}30`,
                }}
                whileHover={{
                  scale: 1.1,
                  borderColor: ELECTRIC_RUSH.colors.electricBlue,
                }}
                whileTap={{ scale: 0.95 }}
                onClick={onClose}
                aria-label="Close menu"
              >
                <X className="w-5 h-5" style={{ color: ELECTRIC_RUSH.colors.electricBlue }} />
              </motion.button>
            </div>

            {/* User Profile Section */}
            {user && (
              <motion.div
                className="px-6 py-6 border-b"
                style={{
                  borderColor: `${ELECTRIC_RUSH.colors.electricBlue}20`,
                }}
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                <div className="flex items-center gap-4">
                  <div
                    className="w-14 h-14 rounded-full flex items-center justify-center"
                    style={{
                      background: GRADIENTS.buttonPrimary,
                    }}
                  >
                    <User className="w-7 h-7" style={{ color: ELECTRIC_RUSH.colors.offBlack }} />
                  </div>
                  <div>
                    <p className="text-base font-bold" style={{ color: ELECTRIC_RUSH.colors.textPrimary }}>
                      {user.email.split('@')[0]}
                    </p>
                    <p className="text-sm mt-0.5" style={{ color: ELECTRIC_RUSH.colors.textTertiary }}>
                      {user.email}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Menu Items */}
            <motion.div
              className="px-3 py-6 space-y-2"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {menuItems.map((item, index) => (
                <MobileMenuItem
                  key={item.href}
                  href={item.href}
                  label={item.label}
                  icon={item.icon}
                  onClick={onClose}
                  delay={index * 0.05}
                />
              ))}
            </motion.div>

            {/* Account Actions */}
            {user && (
              <>
                <div className="px-6 my-4">
                  <div className="w-full h-px" style={{
                    background: `linear-gradient(90deg, transparent 0%, ${ELECTRIC_RUSH.colors.electricBlue}30 50%, transparent 100%)`,
                  }} />
                </div>

                <motion.div
                  className="px-3 pb-6 space-y-2"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <MobileMenuItem
                    href="#settings"
                    label="Settings"
                    icon={<Settings className="w-5 h-5" />}
                    onClick={onClose}
                    delay={0.25}
                  />
                  <motion.button
                    className="w-full flex items-center gap-4 px-6 py-4 rounded-lg transition-colors"
                    style={{
                      color: ELECTRIC_RUSH.colors.textSecondary,
                    }}
                    variants={{
                      hidden: { x: -20, opacity: 0 },
                      visible: {
                        x: 0,
                        opacity: 1,
                        transition: prefersReducedMotion
                          ? { duration: 0 }
                          : { ...ELECTRIC_RUSH.spring.kinetic, delay: 0.3 },
                      },
                    }}
                    whileHover={{
                      backgroundColor: `${ELECTRIC_RUSH.colors.hotMagenta}10`,
                      color: ELECTRIC_RUSH.colors.hotMagenta,
                    }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      onClose();
                      onLogout?.();
                    }}
                  >
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{
                      background: `${ELECTRIC_RUSH.colors.surfaceLight}50`,
                    }}>
                      <LogOut className="w-5 h-5" />
                    </div>
                    <span className="text-lg font-semibold">Logout</span>
                  </motion.button>
                </motion.div>
              </>
            )}

            {/* Footer */}
            <div className="px-6 py-6 mt-auto">
              <p
                className="text-xs font-mono uppercase tracking-wider text-center"
                style={{ color: ELECTRIC_RUSH.colors.textTertiary }}
              >
                NO QUEUES. NO BOTS. JUST RUSH.
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default MobileMenu;
