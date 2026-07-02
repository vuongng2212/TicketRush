'use client';

import { useState } from 'react';
import Link from 'next/link';
import { TicketCard } from '../components/TicketCard';

// Mock data for Phase 1 (Phase 2 will wire backend)
const MOCK_TICKETS = [
  {
    id: '1',
    ticketCode: 'TK-2026-001-A12',
    eventTitle: 'Đen Vâu Live in Saigon',
    venue: 'Sân vận động Quân khu 7',
    startTime: '2026-07-15T19:00:00Z',
    seatNumber: 'A12',
    price: 500000,
    status: 'CONFIRMED',
  },
  {
    id: '2',
    ticketCode: 'TK-2026-002-B08',
    eventTitle: 'Sơn Tùng M-TP Concert',
    venue: 'Cung điện văn hóa',
    startTime: '2026-08-20T20:00:00Z',
    seatNumber: 'B08',
    price: 800000,
    status: 'CONFIRMED',
  },
];

export default function MyTicketsPage() {
  const [tickets] = useState(MOCK_TICKETS);

  return (
    <div className="min-h-screen bg-ink text-paper">
      {/* Header */}
      <div className="border-b border-hairline px-6 lg:px-12 py-8">
        <Link
          href="/"
          className="inline-block font-mono text-small uppercase text-muted hover:text-coral tracking-wider mb-6"
        >
          ← Quay lại
        </Link>

        <p className="font-mono text-label uppercase text-coral tracking-[0.2em] mb-4">
          Vé của tôi
        </p>
        <h1
          className="font-display text-paper uppercase tracking-[-0.02em] leading-[0.95]"
          style={{ fontSize: 'clamp(48px, 8vw, 96px)' }}
        >
          {tickets.length} vé
        </h1>
      </div>

      {/* Tickets Grid */}
      <div className="px-6 lg:px-12 py-12">
        {tickets.length === 0 ? (
          <div className="text-center py-20">
            <p className="font-body text-body text-muted mb-6">
              Bạn chưa có vé nào. Đặt vé ngay để không bỏ lỡ những sự kiện tuyệt vời!
            </p>
            <Link
              href="/"
              className="inline-block font-label uppercase tracking-[0.2em] text-label bg-coral text-ink px-8 py-4 hover:bg-paper"
            >
              Khám phá sự kiện
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl">
            {tickets.map((ticket) => (
              <div key={ticket.id}>
                <TicketCard
                  ticketCode={ticket.ticketCode}
                  eventTitle={ticket.eventTitle}
                  venue={ticket.venue}
                  startTime={ticket.startTime}
                  seatNumber={ticket.seatNumber}
                  price={ticket.price}
                />
                <div className="mt-3 flex items-center justify-between">
                  <span className="font-mono text-small uppercase text-muted tracking-wider">
                    {ticket.status === 'CONFIRMED' ? 'Đã xác nhận' : ticket.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
