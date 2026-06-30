'use client';

import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion';
import ELECTRIC_RUSH, { GRADIENTS } from '@/lib/design-tokens';
import { Menu, X, Zap, User, Ticket, Heart, LogOut, Settings } from 'lucide-react';
import { useState, useEffect } from 'react';

// ============================================================
// TYPES & INTERFACES
// ============================================================

export interface NavbarProps {
  user?: {
    id: string;
    email: string;
    roles?: string[];
  } | null;
  onLogout?: () => void;
  onMobileMenuToggle?: (isOpen: boolean) => void;
}

interface NavLinkProps {
  href: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
  onClick?: () => void;
}

// ============================================================
// NAV LINK COMPONENT
// ============================================================

const NavLink = ({ href, children, icon, onClick }: NavLinkProps) => {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.a
      href={href}
      className="relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold tracking-wide transition-colors group"
      style={{
        color: ELECTRIC_RUSH.colors.textSecondary,
      }}
      whileHover={
        prefersReducedMotion
          ? {}
          : {
              scale: 1.05,
              color: ELECTRIC_RUSH.colors.electricBlue,
            }
      }
      whileTap={{ scale: 0.98 }}
      onClick={(e) => {
        e.preventDefault();
        onClick?.();
      }}
    >
      {icon && <span className="w-4 h-4">{icon}</span>}
      <span>{children}</span>
      
      {/* Underline effect */}
      <motion.span
        className="absolute bottom-0 left-0 h-[2px] rounded-full"
        style={{
          background: GRADIENTS.buttonPrimary,
        }}
        initial={{ width: 0 }}
        whileHover={{ width: '100%' }}
        transition={ELECTRIC_RUSH.spring.smooth}
      />
    </motion.a>
  );
};

// ============================================================
// PROFILE DROPDOWN COMPONENT
// ============================================================

interface ProfileDropdownProps {
  user: {
    id: string;
    email: string;
    roles?: string[];
  };
  onLogout?: () => void;
}

const ProfileDropdown = ({ user, onLogout }: ProfileDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('[data-dropdown]')) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const dropdownVariants = {
    hidden: {
      opacity: 0,
      scale: 0.95,
      y: -10,
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: prefersReducedMotion
        ? { duration: 0 }
        : ELECTRIC_RUSH.spring.kinetic,
    },
  };

  return (
    <div className="relative" data-dropdown>
      {/* Profile Button */}
      <motion.button
        className="flex items-center gap-2 px-4 py-2 rounded-lg"
        style={{
          background: `linear-gradient(135deg, ${ELECTRIC_RUSH.colors.surfaceDark}95, ${ELECTRIC_RUSH.colors.surfaceLight}90)`,
          border: `1px solid ${ELECTRIC_RUSH.colors.electricBlue}30`,
        }}
        whileHover={{
          scale: 1.05,
          borderColor: ELECTRIC_RUSH.colors.electricBlue,
        }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label="User profile menu"
      >
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center"
          style={{
            background: GRADIENTS.buttonPrimary,
          }}
        >
          <User className="w-4 h-4" style={{ color: ELECTRIC_RUSH.colors.offBlack }} />
        </div>
        <span
          className="text-sm font-semibold hidden md:block"
          style={{ color: ELECTRIC_RUSH.colors.textPrimary }}
        >
          {user.email.split('@')[0]}
        </span>
      </motion.button>

      {/* Dropdown Menu */}
      {isOpen && (
        <motion.div
          className="absolute right-0 top-full mt-2 w-64 rounded-xl overflow-hidden shadow-lg"
          style={{
            background: `linear-gradient(135deg, ${ELECTRIC_RUSH.colors.surfaceDark}98, ${ELECTRIC_RUSH.colors.offBlack}95)`,
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: `1px solid ${ELECTRIC_RUSH.colors.electricBlue}30`,
            zIndex: ELECTRIC_RUSH.zIndex.dropdown,
          }}
          variants={dropdownVariants}
          initial="hidden"
          animate="visible"
        >
          {/* User Info */}
          <div className="px-4 py-3 border-b" style={{ borderColor: `${ELECTRIC_RUSH.colors.electricBlue}20` }}>
            <p className="text-sm font-semibold" style={{ color: ELECTRIC_RUSH.colors.textPrimary }}>
              {user.email}
            </p>
            <p className="text-xs mt-1" style={{ color: ELECTRIC_RUSH.colors.textTertiary }}>
              {user.roles?.join(', ') || 'User'}
            </p>
          </div>

          {/* Menu Items */}
          <div className="py-2">
            <DropdownItem
              icon={<Ticket className="w-4 h-4" />}
              label="My Tickets"
              onClick={() => {
                setIsOpen(false);
                // Navigate to my tickets
              }}
            />
            <DropdownItem
              icon={<Heart className="w-4 h-4" />}
              label="Wishlist"
              onClick={() => {
                setIsOpen(false);
                // Navigate to wishlist
              }}
            />
            <DropdownItem
              icon={<Settings className="w-4 h-4" />}
              label="Settings"
              onClick={() => {
                setIsOpen(false);
                // Navigate to settings
              }}
            />
          </div>

          {/* Logout */}
          <div className="border-t" style={{ borderColor: `${ELECTRIC_RUSH.colors.electricBlue}20` }}>
            <DropdownItem
              icon={<LogOut className="w-4 h-4" />}
              label="Logout"
              onClick={() => {
                setIsOpen(false);
                onLogout?.();
              }}
              variant="danger"
            />
          </div>
        </motion.div>
      )}
    </div>
  );
};

// ============================================================
// DROPDOWN ITEM COMPONENT
// ============================================================

interface DropdownItemProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  variant?: 'default' | 'danger';
}

const DropdownItem = ({ icon, label, onClick, variant = 'default' }: DropdownItemProps) => {
  const prefersReducedMotion = useReducedMotion();

  const colors = {
    default: {
      text: ELECTRIC_RUSH.colors.textSecondary,
      hover: ELECTRIC_RUSH.colors.electricBlue,
    },
    danger: {
      text: ELECTRIC_RUSH.colors.textSecondary,
      hover: ELECTRIC_RUSH.colors.hotMagenta,
    },
  };

  return (
    <motion.button
      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors"
      style={{ color: colors[variant].text }}
      whileHover={
        prefersReducedMotion
          ? {}
          : {
              backgroundColor: `${colors[variant].hover}10`,
              color: colors[variant].hover,
            }
      }
      onClick={onClick}
    >
      {icon}
      <span>{label}</span>
    </motion.button>
  );
};

// ============================================================
// MAIN NAVBAR COMPONENT
// ============================================================

export const Navbar = ({ user, onLogout, onMobileMenuToggle }: NavbarProps) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { scrollY } = useScroll();

  // Transform scroll position to navbar effects
  const navbarBackground = useTransform(
    scrollY,
    [0, 100],
    [
      `linear-gradient(135deg, ${ELECTRIC_RUSH.colors.surfaceDark}00, ${ELECTRIC_RUSH.colors.offBlack}00)`,
      `linear-gradient(135deg, ${ELECTRIC_RUSH.colors.surfaceDark}95, ${ELECTRIC_RUSH.colors.offBlack}98)`,
    ]
  );

  const navbarBorder = useTransform(
    scrollY,
    [0, 100],
    [`${ELECTRIC_RUSH.colors.electricBlue}00`, `${ELECTRIC_RUSH.colors.electricBlue}60`]
  );

  const navbarShadow = useTransform(scrollY, [0, 100], [
    '0 0 0 rgba(0, 212, 255, 0)',
    `0 4px 24px ${ELECTRIC_RUSH.colors.glowCyan}`,
  ]);

  // Handle mobile menu toggle
  const handleMobileMenuToggle = () => {
    const newState = !isMobileMenuOpen;
    setIsMobileMenuOpen(newState);
    onMobileMenuToggle?.(newState);

    // Prevent body scroll when menu is open
    if (newState) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  const navigation = [
    { href: '#home', label: 'Home', icon: <Zap className="w-4 h-4" /> },
    { href: '#events', label: 'Events', icon: <Ticket className="w-4 h-4" /> },
    { href: '#tickets', label: 'My Tickets', icon: <Ticket className="w-4 h-4" /> },
    { href: '#wishlist', label: 'Wishlist', icon: <Heart className="w-4 h-4" /> },
  ];

  return (
    <motion.nav
      className="fixed top-0 left-0 right-0 z-50 px-6 py-4"
      style={{
        background: navbarBackground,
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: `1px solid`,
        borderColor: navbarBorder,
        boxShadow: navbarShadow,
      }}
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <motion.a
          href="#home"
          className="flex items-center gap-2"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.98 }}
          aria-label="TicketRush home"
        >
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{
              background: GRADIENTS.buttonPrimary,
            }}
          >
            <Zap className="w-6 h-6" style={{ color: ELECTRIC_RUSH.colors.offBlack }} />
          </div>
          <div className="hidden sm:block">
            <h1
              className="text-xl font-black tracking-tighter leading-none"
              style={{
                background: GRADIENTS.textElectric,
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontFamily: ELECTRIC_RUSH.typography.display,
              }}
            >
              TICKETRUSH
            </h1>
          </div>
        </motion.a>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center gap-2">
          {navigation.map((item) => (
            <NavLink key={item.href} href={item.href} icon={item.icon}>
              {item.label}
            </NavLink>
          ))}
        </div>

        {/* Right Side: Profile or Mobile Menu */}
        <div className="flex items-center gap-4">
          {/* Profile Dropdown (Desktop) */}
          {user && (
            <div className="hidden lg:block">
              <ProfileDropdown user={user} onLogout={onLogout} />
            </div>
          )}

          {/* Mobile Menu Button */}
          <motion.button
            className="lg:hidden flex items-center justify-center w-10 h-10 rounded-lg"
            style={{
              background: `linear-gradient(135deg, ${ELECTRIC_RUSH.colors.surfaceDark}95, ${ELECTRIC_RUSH.colors.surfaceLight}90)`,
              border: `1px solid ${ELECTRIC_RUSH.colors.electricBlue}30`,
            }}
            whileHover={{
              scale: 1.05,
              borderColor: ELECTRIC_RUSH.colors.electricBlue,
            }}
            whileTap={{ scale: 0.98 }}
            onClick={handleMobileMenuToggle}
            aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? (
              <X className="w-5 h-5" style={{ color: ELECTRIC_RUSH.colors.electricBlue }} />
            ) : (
              <Menu className="w-5 h-5" style={{ color: ELECTRIC_RUSH.colors.electricBlue }} />
            )}
          </motion.button>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
