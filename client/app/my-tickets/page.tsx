'use client';

import { useAuth } from '../context/AuthContext';
import { useQuery } from '@apollo/client/react';
import { gql } from '@apollo/client';
import { LoadingState } from '../components/LoadingState';
import { ErrorState } from '../components/ErrorState';
import { EmptyState } from '../components/EmptyState';

const GET_MY_TICKETS = gql`
  query GetMyTickets {
    getMyTickets {
      id
      ticketCode
      concertTitle
      venue
      startTime
      endTime
      seatSection
      seatRow
      seatNumber
      price
      orderStatus
      orderId
    }
  }
`;

interface MyTicketDetail {
  id: string;
  ticketCode: string;
  concertTitle: string;
  venue: string;
  startTime: string;
  endTime: string;
  seatSection: string;
  seatRow: string;
  seatNumber: string;
  price: number;
  orderStatus: string;
  orderId: string;
}

interface GetMyTicketsData {
  getMyTickets: MyTicketDetail[];
}

export default function MyTicketsPage() {
  const { token, user } = useAuth();
  const { data, loading, error } = useQuery<GetMyTicketsData>(GET_MY_TICKETS, {
    skip: !token,
  });

  if (!token || !user) {
    return (
      <div className="min-h-screen bg-ink flex items-center justify-center px-6">
        <p className="font-mono text-muted">Vui lòng đăng nhập</p>
      </div>
    );
  }

  if (loading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState message={error.message} />;
  }

  const tickets: MyTicketDetail[] = data?.getMyTickets || [];

  if (tickets.length === 0) {
    return <EmptyState message="Bạn chưa có vé nào" />;
  }

  return (
    <div className="min-h-screen bg-ink px-6 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="font-display text-display text-paper mb-8">Vé của tôi</h1>
        
        <div className="space-y-6">
          {tickets.map((ticket) => (
            <div
              key={ticket.id}
              className="border border-hairline bg-ink-light p-6 hover:border-muted transition-colors"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="font-heading text-heading text-paper mb-2">
                    {ticket.concertTitle}
                  </h2>
                  <p className="font-mono text-small text-muted uppercase tracking-wider">
                    {ticket.venue}
                  </p>
                </div>
                <span
                  className={`font-mono text-small uppercase tracking-wider px-3 py-1 ${
                    ticket.orderStatus === 'CONFIRMED'
                      ? 'bg-coral/20 text-coral'
                      : ticket.orderStatus === 'PENDING'
                      ? 'bg-muted/20 text-muted'
                      : 'bg-hairline/20 text-hairline'
                  }`}
                >
                  {ticket.orderStatus}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="font-mono text-small text-muted uppercase tracking-wider mb-1">
                    Thời gian
                  </p>
                  <p className="font-body text-body text-paper">
                    {new Date(ticket.startTime).toLocaleString('vi-VN')}
                  </p>
                </div>
                <div>
                  <p className="font-mono text-small text-muted uppercase tracking-wider mb-1">
                    Ghế
                  </p>
                  <p className="font-body text-body text-paper">
                    {ticket.seatSection} - Hàng {ticket.seatRow} - Số {ticket.seatNumber}
                  </p>
                </div>
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-hairline">
                <div>
                  <p className="font-mono text-small text-muted uppercase tracking-wider mb-1">
                    Mã vé
                  </p>
                  <p className="font-mono text-body text-coral">
                    {ticket.ticketCode}
                  </p>
                </div>
                <p className="font-heading text-heading text-paper">
                  {ticket.price.toLocaleString('vi-VN')} ₫
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
