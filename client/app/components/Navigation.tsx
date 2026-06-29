'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { Ticket, LogOut, Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';

interface NavigationProps {
  userEmail?: string;
  onLogout?: () => void;
  onNavigate?: (section: string) => void;
}

export function Navigation({ userEmail, onLogout, onNavigate }: NavigationProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const reduce = useReducedMotion();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'Events', section: 'events' },
    { label: 'Seats', section: 'seats' },
    { label: 'Checkout', section: 'checkout' },
  ];

  return (
    <motion.nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-dark-bg/85 backdrop-blur-xl border-b border-zinc-800/50'
          : 'bg-transparent'
      }`}
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="max-w-[1400px] mx-auto px-6 h-14 flex items-center justify-between">
        {/* Logo — raw, no fuss */}
        <motion.a
          href="/"
          className="flex items-center gap-2 group"
          whileHover={reduce ? {} : { scale: 1.02 }}
        >
          <div className="w-7 h-7 rounded-lg bg-electric-blue flex items-center justify-center">
            <Ticket className="w-3.5 h-3.5 text-dark-bg" />
          </div>
          <span className="font-display font-black text-base text-white tracking-tight">
            Ticket<span className="text-hot-magenta">Rush</span>
          </span>
        </motion.a>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <button
              key={link.section}
              onClick={() => onNavigate?.(link.section)}
              className="relative px-3 py-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors font-mono uppercase tracking-wider"
            >
              {link.label}
            </button>
          ))}
        </div>

        {/* User info / Logout */}
        <div className="flex items-center gap-3">
          {userEmail && (
            <span className="hidden sm:block text-[11px] text-zinc-700 font-mono">{userEmail}</span>
          )}
          {onLogout && (
            <motion.button
              onClick={onLogout}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded text-[11px] font-mono text-zinc-600 hover:text-hot-magenta border border-zinc-800 hover:border-hot-magenta/20 transition-all uppercase tracking-wider"
              whileHover={reduce ? {} : { scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
            >
              <LogOut className="w-3 h-3" />
              Exit
            </motion.button>
          )}

          {/* Mobile toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 text-zinc-500"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <motion.div
          className="md:hidden border-t border-zinc-800 bg-dark-bg/95 backdrop-blur-xl"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
        >
          <div className="px-6 py-4 space-y-2">
            {navLinks.map((link) => (
              <button
                key={link.section}
                onClick={() => { onNavigate?.(link.section); setMobileOpen(false); }}
                className="block w-full text-left py-2 text-zinc-500 hover:text-zinc-300 font-mono text-xs uppercase tracking-wider transition-colors"
              >
                {link.label}
              </button>
            ))}
          </div>
        </motion.div>
      )}
    </motion.nav>
  );
}
