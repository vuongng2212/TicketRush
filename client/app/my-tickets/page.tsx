'use client';

import { useAuth } from '../context/AuthContext';
import { useQuery } from '@apollo/client/react';
import { gql } from '@apollo/client';
import { LoadingState } from '../components/LoadingState';
import { ErrorState } from '../components/ErrorState';
import { EmptyState } from '../components/EmptyState';
import { TicketCard } from '../components/TicketCard';

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
            <TicketCard
              key={ticket.id}
              ticketCode={ticket.ticketCode}
              eventTitle={ticket.concertTitle}
              venue={ticket.venue}
              startTime={ticket.startTime}
              seatNumber={`${ticket.seatSection} - Hàng ${ticket.seatRow} - Số ${ticket.seatNumber}`}
              price={ticket.price}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
