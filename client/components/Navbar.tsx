'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';

interface NavbarProps {
  onMenuClick?: () => void;
  user?: { email: string } | null;
  onLoginClick?: () => void;
  onLogoutClick?: () => void;
  onCityChange?: (city: 'Hà Nội' | 'Sài Gòn' | 'Đà Nẵng') => void;
}

const CITIES: Array<'Hà Nội' | 'Sài Gòn' | 'Đà Nẵng'> = ['Hà Nội', 'Sài Gòn', 'Đà Nẵng'];

/**
 * Editorial Navbar — minimal, sharp, no glow
 * - Logo left (Bebas Neue coral)
 * - Links center (mono uppercase, underline hover)
 * - Auth right
 */
export const Navbar = ({ onMenuClick, user, onLoginClick, onLogoutClick, onCityChange }: NavbarProps) => {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCityDropdownOpen, setIsCityDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLLIElement>(null);

  const handleMenu = () => {
    setIsMenuOpen((v) => !v);
    onMenuClick?.();
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleCitySelect = (city: 'Hà Nội' | 'Sài Gòn' | 'Đà Nẵng') => {
    onCityChange?.(city);
    setIsCityDropdownOpen(false);
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsCityDropdownOpen(false);
      }
    };
    if (isCityDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isCityDropdownOpen]);

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
          <li>
            <button
              type="button"
              onClick={() => scrollToSection('tonight')}
              className="font-mono text-small uppercase text-paper hover:text-coral tracking-[0.1em]"
            >
              Hôm nay
            </button>
          </li>
          <li>
            <button
              type="button"
              onClick={() => scrollToSection('weekend')}
              className="font-mono text-small uppercase text-paper hover:text-coral tracking-[0.1em]"
            >
              Cuối tuần
            </button>
          </li>
          <li className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setIsCityDropdownOpen((v) => !v)}
              className="font-mono text-small uppercase text-paper hover:text-coral tracking-[0.1em]"
              aria-expanded={isCityDropdownOpen}
            >
              Thành phố {isCityDropdownOpen ? '▴' : '▾'}
            </button>
            {isCityDropdownOpen && (
              <div className="absolute top-full left-0 mt-2 bg-ink border border-hairline min-w-[160px]">
                {CITIES.map((city) => (
                  <button
                    key={city}
                    type="button"
                    onClick={() => handleCitySelect(city)}
                    className="w-full text-left px-4 py-2 font-mono text-small uppercase text-paper hover:bg-ink-2 hover:text-coral tracking-[0.1em]"
                  >
                    {city}
                  </button>
                ))}
              </div>
            )}
          </li>
          <li>
            <button
              type="button"
              onClick={() => router.push('/search')}
              className="font-mono text-small uppercase text-paper hover:text-coral tracking-[0.1em]"
            >
              Nghệ sĩ
            </button>
          </li>
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
