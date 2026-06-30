'use client';

import { useEffect } from 'react';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  user?: { email: string } | null;
  onLoginClick?: () => void;
  onLogoutClick?: () => void;
}

/**
 * Editorial Mobile Menu — full-screen black panel, no rounded, no animation
 */
export const MobileMenu = ({ isOpen, onClose, user, onLoginClick, onLogoutClick }: MobileMenuProps) => {
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

  if (!isOpen) return null;

  return (
    <div
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
