'use client';

import Link from 'next/link';
import { useState } from 'react';

interface NavbarProps {
  onMenuClick?: () => void;
  user?: { email: string } | null;
  onLoginClick?: () => void;
  onLogoutClick?: () => void;
}

/**
 * Editorial Navbar — minimal, sharp, no glow
 * - Logo left (Bebas Neue coral)
 * - Links center (mono uppercase, underline hover)
 * - Auth right
 */
export const Navbar = ({ onMenuClick, user, onLoginClick, onLogoutClick }: NavbarProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleMenu = () => {
    setIsMenuOpen((v) => !v);
    onMenuClick?.();
  };

  return (
    <>
      <nav
        className="w-full bg-ink border-b border-hairline sticky top-0 z-[100]"
        aria-label="Main navigation"
      >
        <div className="flex items-center justify-between px-6 lg:px-12 h-16">
          {/* Logo */}
          <Link
            href="/"
            className="font-display text-coral text-[24px] uppercase tracking-[-0.02em] leading-none"
          >
            TICKETRUSH
          </Link>

          {/* Center links — desktop only */}
          <ul className="hidden md:flex items-center gap-8">
            {['Hôm nay', 'Cuối tuần', 'Thành phố', 'Nghệ sĩ'].map((label) => (
              <li key={label}>
                <a
                  href="#"
                  className="font-mono text-small uppercase text-paper hover:text-coral tracking-[0.1em]"
                >
                  {label}
                </a>
              </li>
            ))}
            {user && (
              <li>
                <Link
                  href="/my-tickets"
                  className="font-mono text-small uppercase text-paper hover:text-coral tracking-[0.1em]"
                >
                  Vé của tôi
                </Link>
              </li>
            )}
          </ul>

          {/* Auth + mobile menu */}
          <div className="flex items-center gap-4">
            {user ? (
              <>
                <span className="hidden md:inline font-mono text-small text-muted uppercase tracking-wider">
                  {user.email}
                </span>
                <button
                  type="button"
                  onClick={onLogoutClick}
                  className="font-mono text-small uppercase text-coral hover:text-paper tracking-wider border-b border-coral"
                >
                  Đăng xuất
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={onLoginClick}
                className="font-mono text-small uppercase text-coral hover:text-paper tracking-wider border-b border-coral"
              >
                Đăng nhập
              </button>
            )}

            {/* Mobile menu button */}
            <button
              type="button"
              onClick={handleMenu}
              className="md:hidden font-mono text-small uppercase text-paper tracking-wider"
              aria-label="Toggle menu"
              aria-expanded={isMenuOpen}
            >
              {isMenuOpen ? 'Đóng' : 'Menu'}
            </button>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar;
