'use client';

import { useEffect, useRef } from 'react';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  user?: { email: string } | null;
  onLoginClick?: () => void;
  onLogoutClick?: () => void;
  onCityChange?: (city: 'Hà Nội' | 'Sài Gòn' | 'Đà Nẵng') => void;
}

/**
 * Editorial Mobile Menu — full-screen black panel, no rounded, no animation
 * A11y: focus trap, ESC closes, restore focus on close
 */
export const MobileMenu = ({ isOpen, onClose, user, onLoginClick, onLogoutClick, onCityChange }: MobileMenuProps) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      // Save current focus
      previousFocusRef.current = document.activeElement as HTMLElement;
      
      // Lock body scroll
      document.body.style.overflow = 'hidden';
      
      // Focus first interactive element
      setTimeout(() => {
        const firstButton = menuRef.current?.querySelector('button, a') as HTMLElement;
        firstButton?.focus();
      }, 0);
    } else {
      // Restore body scroll
      document.body.style.overflow = '';
      
      // Restore previous focus
      if (previousFocusRef.current) {
        previousFocusRef.current.focus();
      }
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // ESC key handler
  useEffect(() => {
    if (!isOpen) return;
    
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  // Focus trap
  useEffect(() => {
    if (!isOpen || !menuRef.current) return;

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      
      const focusableElements = menuRef.current?.querySelectorAll(
        'button, a[href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      
      if (!focusableElements || focusableElements.length === 0) return;
      
      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;
      
      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      } else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    };
    
    document.addEventListener('keydown', handleTab);
    return () => document.removeEventListener('keydown', handleTab);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      ref={menuRef}
      className="fixed inset-0 z-[200] bg-ink flex flex-col"
      role="dialog"
      aria-modal="true"
      aria-label="Mobile menu"
    >
      <div className="flex items-center justify-between px-6 h-16 border-b border-hairline">
        <span className="font-display text-coral text-[24px] uppercase tracking-[-0.02em]">
          TICKETRUSH
        </span>
        <button
          type="button"
          onClick={onClose}
          className="font-mono text-small uppercase text-paper tracking-wider"
          aria-label="Close menu"
        >
          Đóng ✕
        </button>
      </div>

      <nav className="flex-1 px-6 py-12 overflow-y-auto">
        <ul className="space-y-8">
          {['Hôm nay', 'Cuối tuần', 'Hà Nội', 'Sài Gòn', 'Đà Nẵng', 'Nghệ sĩ', 'Về chúng tôi'].map(
            (label) => (
              <li key={label}>
                <a
                  href="#"
                  onClick={onClose}
                  className="font-display uppercase text-paper hover:text-coral text-[40px] leading-none tracking-[-0.02em] block"
                >
                  {label}
                </a>
              </li>
            ),
          )}
        </ul>
      </nav>

      <div className="px-6 py-8 border-t border-hairline">
        {user ? (
          <button
            type="button"
            onClick={() => {
              onLogoutClick?.();
              onClose();
            }}
            className="w-full font-label uppercase text-coral border border-coral py-3 text-label tracking-[0.2em] hover:bg-coral hover:text-ink"
          >
            Đăng xuất
          </button>
        ) : (
          <button
            type="button"
            onClick={() => {
              onLoginClick?.();
              onClose();
            }}
            className="w-full font-label uppercase text-coral border border-coral py-3 text-label tracking-[0.2em] hover:bg-coral hover:text-ink"
          >
            Đăng nhập
          </button>
        )}
      </div>
    </div>
  );
};

export default MobileMenu;
