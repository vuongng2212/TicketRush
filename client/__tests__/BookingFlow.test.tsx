import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MockedProvider } from '@apollo/client/testing/react';
import { BookingFlow } from '../app/components/BookingFlow';
import { gql } from '@apollo/client';
import { describe, it, expect, vi } from 'vitest';

const GET_CONCERT_DETAIL = gql`
  query GetConcertDetail($concertId: ID!) {
    getConcertDetail(concertId: $concertId) {
      id
      title
      artist
      venue
      startTime
      city
    }
  }
`;

const HOLD_SEAT = gql`
  mutation HoldSeat($seatId: ID!) {
    holdSeat(seatId: $seatId) { id status totalPrice expiresAt }
  }
`;

const CONFIRM_PAYMENT = gql`
  mutation ConfirmPayment($orderId: ID!, $paymentMethod: PaymentMethod!) {
    confirmPayment(orderId: $orderId, paymentMethod: $paymentMethod) {
      order { id status totalPrice }
      ticket { id ticketCode }
      paymentReference
      paidAt
    }
  }
`;

// Mock AuthContext
vi.mock('../app/context/AuthContext', () => ({
  useAuth: () => ({
    user: { email: 'test@example.com' },
  }),
}));

describe('BookingFlow', () => {
  const mockEventId = 'concert-123';
  const mockOnBack = vi.fn();

  it('renders loading state initially', () => {
    const mocks = [
      {
        request: {
          query: GET_CONCERT_DETAIL,
          variables: { concertId: mockEventId },
        },
        result: {
          data: {
            getConcertDetail: {
              id: mockEventId,
              title: 'Rock Night',
              artist: 'The Band',
              venue: 'Hà Nội Arena',
              startTime: '2026-08-01T19:00:00Z',
              city: 'Hà Nội',
            },
          },
        },
      },
    ];

    render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <BookingFlow eventId={mockEventId} onBack={mockOnBack} />
      </MockedProvider>
    );

    expect(screen.getByText(/Đang tải.../i)).toBeInTheDocument();
  });

  it('displays concert details after loading', async () => {
    const mocks = [
      {
        request: {
          query: GET_CONCERT_DETAIL,
          variables: { concertId: mockEventId },
        },
        result: {
          data: {
            getConcertDetail: {
              id: mockEventId,
              title: 'Rock Night',
              artist: 'The Band',
              venue: 'Hà Nội Arena',
              startTime: '2026-08-01T19:00:00Z',
              city: 'Hà Nội',
            },
          },
        },
      },
    ];

    render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <BookingFlow eventId={mockEventId} onBack={mockOnBack} />
      </MockedProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Rock Night')).toBeInTheDocument();
    });

    expect(screen.getByText('The Band')).toBeInTheDocument();
    expect(screen.getByText(/Hà Nội Arena/i)).toBeInTheDocument();
  });

  it('handles seat hold flow', async () => {
    const user = userEvent.setup();
    const mocks = [
      {
        request: {
          query: GET_CONCERT_DETAIL,
          variables: { concertId: mockEventId },
        },
        result: {
          data: {
            getConcertDetail: {
              id: mockEventId,
              title: 'Rock Night',
              artist: 'The Band',
              venue: 'Hà Nội Arena',
              startTime: '2026-08-01T19:00:00Z',
              city: 'Hà Nội',
            },
          },
        },
      },
      {
        request: {
          query: HOLD_SEAT,
          variables: { seatId: 'A12' },
        },
        result: {
          data: {
            holdSeat: {
              id: 'order-456',
              status: 'HELD',
              totalPrice: 500000,
              expiresAt: '2026-08-01T20:10:00Z',
            },
          },
        },
      },
    ];

    render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <BookingFlow eventId={mockEventId} onBack={mockOnBack} />
      </MockedProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Rock Night')).toBeInTheDocument();
    });

    const seatInput = screen.getByLabelText(/Mã ghế/i);
    await user.type(seatInput, 'A12');
    await user.click(screen.getByRole('button', { name: /Giữ ghế/i }));

    await waitFor(() => {
      expect(screen.getByText(/Ghế đã giữ/i)).toBeInTheDocument();
      expect(screen.getByText(/Tổng: 500.000/i)).toBeInTheDocument();
    });
  });

  it('handles complete payment flow', async () => {
    const user = userEvent.setup();
    const mocks = [
      {
        request: {
          query: GET_CONCERT_DETAIL,
          variables: { concertId: mockEventId },
        },
        result: {
          data: {
            getConcertDetail: {
              id: mockEventId,
              title: 'Rock Night',
              artist: 'The Band',
              venue: 'Hà Nội Arena',
              startTime: '2026-08-01T19:00:00Z',
              city: 'Hà Nội',
            },
          },
        },
      },
      {
        request: {
          query: HOLD_SEAT,
          variables: { seatId: 'A12' },
        },
        result: {
          data: {
            holdSeat: {
              id: 'order-456',
              status: 'HELD',
              totalPrice: 500000,
              expiresAt: '2026-08-01T20:10:00Z',
            },
          },
        },
      },
      {
        request: {
          query: CONFIRM_PAYMENT,
          variables: { orderId: 'order-456', paymentMethod: 'VNPAY' },
        },
        result: {
          data: {
            confirmPayment: {
              order: { id: 'order-456', status: 'CONFIRMED', totalPrice: 500000 },
              ticket: { id: 'ticket-789', ticketCode: 'TKT-ABC123' },
              paymentReference: 'PAY-XYZ',
              paidAt: '2026-08-01T19:15:00Z',
            },
          },
        },
      },
    ];

    render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <BookingFlow eventId={mockEventId} onBack={mockOnBack} />
      </MockedProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Rock Night')).toBeInTheDocument();
    });

    // Hold seat
    const seatInput = screen.getByLabelText(/Mã ghế/i);
    await user.type(seatInput, 'A12');
    await user.click(screen.getByRole('button', { name: /Giữ ghế/i }));

    await waitFor(() => {
      expect(screen.getByText(/Ghế đã giữ/i)).toBeInTheDocument();
    });

    // Select payment method
    await user.click(screen.getByRole('button', { name: /VNPay/i }));

    // Confirm payment
    await user.click(screen.getByRole('button', { name: /Thanh toán/i }));

    await waitFor(() => {
      expect(screen.getByText(/Thanh toán thành công/i)).toBeInTheDocument();
      expect(screen.getByText('TKT-ABC123')).toBeInTheDocument();
    });
  });

  it('handles seat hold error', async () => {
    const user = userEvent.setup();
    const mocks = [
      {
        request: {
          query: GET_CONCERT_DETAIL,
          variables: { concertId: mockEventId },
        },
        result: {
          data: {
            getConcertDetail: {
              id: mockEventId,
              title: 'Rock Night',
              artist: 'The Band',
              venue: 'Hà Nội Arena',
              startTime: '2026-08-01T19:00:00Z',
              city: 'Hà Nội',
            },
          },
        },
      },
      {
        request: {
          query: HOLD_SEAT,
          variables: { seatId: 'A12' },
        },
        error: new Error('Seat already taken'),
      },
    ];

    render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <BookingFlow eventId={mockEventId} onBack={mockOnBack} />
      </MockedProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Rock Night')).toBeInTheDocument();
    });

    const seatInput = screen.getByLabelText(/Mã ghế/i);
    await user.type(seatInput, 'A12');
    await user.click(screen.getByRole('button', { name: /Giữ ghế/i }));

    await waitFor(() => {
      expect(screen.getByText(/Seat already taken/i)).toBeInTheDocument();
    });
  });

  it('calls onBack when back button clicked', async () => {
    const user = userEvent.setup();
    const mocks = [
      {
        request: {
          query: GET_CONCERT_DETAIL,
          variables: { concertId: mockEventId },
        },
        result: {
          data: {
            getConcertDetail: {
              id: mockEventId,
              title: 'Rock Night',
              artist: 'The Band',
              venue: 'Hà Nội Arena',
              startTime: '2026-08-01T19:00:00Z',
              city: 'Hà Nội',
            },
          },
        },
      },
    ];

    render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <BookingFlow eventId={mockEventId} onBack={mockOnBack} />
      </MockedProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Rock Night')).toBeInTheDocument();
    });

    const backButton = screen.getByRole('button', { name: /← Quay lại/i });
    await user.click(backButton);

    expect(mockOnBack).toHaveBeenCalledTimes(1);
  });
});
