'use client';

import { useEffect } from 'react';
import Link from 'next/link';

interface TicketPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticketCount: number;
}

export const TicketPreviewModal = ({
  isOpen,
  onClose,
  ticketCount,
}: TicketPreviewModalProps) => {
  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Prevent scroll when open
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
      className="fixed inset-0 z-[300] flex items-center justify-center bg-ink/90"
      onClick={onClose}
    >
      <div
        className="bg-ink-2 border border-hairline p-8 max-w-md w-full mx-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="space-y-6">
          <div>
            <p className="font-mono text-label uppercase text-coral tracking-[0.2em] mb-2">
              Vé của tôi
            </p>
            <h2 className="font-display text-paper uppercase text-[48px] leading-[0.95]">
              {ticketCount} vé
            </h2>
          </div>

          <p className="font-body text-body text-muted">
            {ticketCount === 0
              ? 'Bạn chưa có vé nào. Đặt vé ngay để không bỏ lỡ những sự kiện tuyệt vời!'
              : 'Xem tất cả vé đã mua và mã QR để check-in tại cổng.'}
          </p>

          <div className="flex gap-4">
            <Link
              href="/my-tickets"
              className="flex-1 text-center font-label uppercase tracking-[0.2em] text-label bg-coral text-ink px-6 py-3 hover:bg-paper"
            >
              Xem vé
            </Link>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 font-label uppercase tracking-[0.2em] text-label border border-paper text-paper px-6 py-3 hover:bg-paper hover:text-ink"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketPreviewModal;
