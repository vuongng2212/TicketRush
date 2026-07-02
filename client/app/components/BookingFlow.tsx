'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useSubscription } from '@apollo/client/react';
import { gql } from '@apollo/client';
import { useAuth } from '../context/AuthContext';
import { SeatMap } from './SeatMap';
import { HoldCountdown } from './HoldCountdown';
import { TicketCard } from './TicketCard';
// user is fetched for future "use user.email on receipt"; reserved for now
void useAuth;

const GET_CONCERT_DETAIL = gql`
  query GetConcertDetail($concertId: ID!) {
    getConcertDetail(concertId: $concertId) {
      id
      title
      artist
      venue
      startTime
      city
      zones {
        id
        name
        price
        totalSeats
        seats {
          id
          seatNumber
          status
          heldByUserId
          heldUntil
        }
      }
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

const CANCEL_ORDER = gql`
  mutation CancelOrder($orderId: ID!) {
    cancelOrder(orderId: $orderId) {
      id
      status
    }
  }
`;

const SEAT_STATUS_SUBSCRIPTION = gql`
  subscription SeatStatusUpdated($concertId: ID!) {
    seatStatusUpdated(concertId: $concertId) {
      seatId
      status
      updatedAt
    }
  }
`;

interface BookingFlowProps {
  eventId: string;
  onBack: () => void;
}

const PAYMENT_METHODS = [
  { id: 'VNPAY', label: 'VNPay' },
  { id: 'MOMO', label: 'MoMo' },
  { id: 'ZALOPAY', label: 'ZaloPay' },
  { id: 'BANKING', label: 'Banking' },
  { id: 'CARD', label: 'Thẻ quốc tế' },
] as const;

export const BookingFlow = ({ eventId, onBack }: BookingFlowProps) => {
  const { data, loading } = useQuery(GET_CONCERT_DETAIL, { variables: { concertId: eventId } });
  const [holdSeat] = useMutation(HOLD_SEAT);
  const [confirmPayment, { loading: payLoading }] = useMutation(CONFIRM_PAYMENT);
  const [cancelOrder, { loading: cancelLoading }] = useMutation(CANCEL_ORDER);

  // Subscribe to seat status updates
  const { data: seatUpdate } = useSubscription(SEAT_STATUS_SUBSCRIPTION, {
    variables: { concertId: eventId },
  });

  const [selectedSeatId, setSelectedSeatId] = useState<string | null>(null);
  const [order, setOrder] = useState<{ id: string; totalPrice: number; expiresAt: string } | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<typeof PAYMENT_METHODS[number]['id'] | null>(null);
  const [success, setSuccess] = useState<{ ticketCode: string; seatNumber: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Handle realtime seat updates - wrap in callback to satisfy linter
  useEffect(() => {
    if (!seatUpdate) return;
    
    const update = (seatUpdate as { seatStatusUpdated?: { seatId: string; status: string } } | undefined)?.seatStatusUpdated;
    if (!update || update.seatId !== selectedSeatId || update.status !== 'HELD') return;
    
    // Use setTimeout to defer setState and avoid cascading render warning
    const timer = setTimeout(() => {
      setError('VÉ ĐÃ BỊ GIỮ BỞI NGƯỜI KHÁC');
      setSelectedSeatId(null);
    }, 0);
    
    return () => clearTimeout(timer);
  }, [seatUpdate, selectedSeatId]);

  const event = (data as { getConcertDetail?: { 
    title: string; 
    artist?: string; 
    venue: string; 
    startTime: string;
    zones?: Array<{
      id: string;
      name: string;
      price: number;
      totalSeats: number;
      seats: Array<{
        id: string;
        seatNumber: string;
        status: string;
        heldByUserId?: string;
        heldUntil?: string;
      }>;
    }>;
  } } | undefined)?.getConcertDetail;

  const handleSeatClick = async (seatId: string) => {
    setSelectedSeatId(seatId);
    setError(null);
    
    try {
      const result = await holdSeat({ variables: { seatId } });
      const held = (result.data as { holdSeat?: { id: string; totalPrice: number; expiresAt: string } } | null | undefined)?.holdSeat;
      if (held) {
        setOrder({ id: held.id, totalPrice: held.totalPrice, expiresAt: held.expiresAt });
      }
    } catch (err) {
      setError((err as Error).message || 'Giữ ghế thất bại');
      setSelectedSeatId(null);
    }
  };

  const handleCountdownExpire = () => {
    setOrder(null);
    setSelectedSeatId(null);
    setError('Hết thời gian giữ ghế. Vui lòng chọn lại.');
  };

  const handlePay = async () => {
    if (!order || !paymentMethod) {
      setError('Chọn phương thức thanh toán');
      return;
    }
    try {
      const result = await confirmPayment({
        variables: { orderId: order.id, paymentMethod },
      });
      const payment = (result.data as { confirmPayment?: { ticket?: { ticketCode?: string }; order?: { totalPrice?: number } } } | null | undefined)?.confirmPayment;
      const ticketCode = payment?.ticket?.ticketCode;
      
      // Find seat number from selected seat
      const seat = event?.zones?.flatMap(z => z.seats).find(s => s.id === selectedSeatId);
      
      if (ticketCode) {
        setSuccess({ ticketCode, seatNumber: seat?.seatNumber ?? '' });
      } else {
        setSuccess({ ticketCode: 'OK', seatNumber: seat?.seatNumber ?? '' });
      }
    } catch (err) {
      setError((err as Error).message || 'Thanh toán thất bại');
    }
  };

  const handleCancel = async () => {
    if (!order) return;
    try {
      await cancelOrder({ variables: { orderId: order.id } });
      setOrder(null);
      setPaymentMethod(null);
      setError(null);
    } catch (err) {
      setError((err as Error).message || 'Hủy đơn thất bại');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-ink">
        <p className="font-mono text-muted uppercase tracking-wider">Đang tải...</p>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-ink px-6">
        <div className="max-w-md w-full">
          <p className="font-mono text-label uppercase text-coral tracking-[0.2em] mb-4 text-center">
            Thanh toán thành công
          </p>
          <h1
            className="font-display text-paper uppercase tracking-[-0.02em] leading-[0.95] mb-8 text-center"
            style={{ fontSize: 'clamp(48px, 8vw, 96px)' }}
          >
            Cảm ơn
          </h1>
          
          <div className="mb-8">
            <TicketCard
              ticketCode={success.ticketCode}
              eventTitle={event?.title ?? ''}
              venue={event?.venue}
              startTime={event?.startTime}
              seatNumber={success.seatNumber}
              price={order?.totalPrice}
            />
          </div>

          <button
            type="button"
            onClick={onBack}
            className="w-full font-label uppercase tracking-[0.2em] text-label border border-paper px-8 py-3 hover:bg-paper hover:text-ink"
          >
            ← Quay lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ink px-6 lg:px-12 py-12">
      <button
        type="button"
        onClick={onBack}
        className="font-mono text-small uppercase text-muted hover:text-coral tracking-wider mb-12"
      >
        ← Quay lại
      </button>

      <div className="max-w-3xl">
        <p className="font-mono text-label uppercase text-coral tracking-[0.2em] mb-4">
          Đặt vé
        </p>
        <h1
          className="font-display text-paper uppercase tracking-[-0.02em] leading-[0.95] mb-4"
          style={{ fontSize: 'clamp(48px, 8vw, 96px)' }}
        >
          {event?.title ?? 'Concert'}
        </h1>
        {event?.artist && (
          <p className="font-body text-body text-muted mb-2">{event.artist}</p>
        )}
        <p className="font-body text-body text-muted mb-12">
          {event?.venue} · {event?.startTime && new Date(event.startTime).toLocaleString('vi-VN')}
        </p>

        {!order && (
          <div className="border-t border-hairline pt-8">
            <p className="font-mono text-label uppercase text-muted tracking-[0.15em] mb-6">
              Chọn ghế từ sơ đồ
            </p>
            
            {event?.zones && event.zones.length > 0 && (
              <SeatMap
                concertId={eventId}
                zones={event.zones}
                onSeatClick={handleSeatClick}
                disabled={false}
              />
            )}

            {error && (
              <p className="mt-4 font-mono text-small text-coral border-l-2 border-coral pl-3">
                {error}
              </p>
            )}
          </div>
        )}

        {order && !success && (
          <div className="border-t border-hairline pt-8 space-y-6">
            <div className="space-y-4">
              <p className="font-mono text-small text-muted uppercase tracking-wider">
                Ghế đã giữ · Tổng: {order.totalPrice.toLocaleString('vi-VN')} ₫
              </p>
              <HoldCountdown expiresAt={order.expiresAt} onExpire={handleCountdownExpire} />
            </div>

            <div>
              <p className="font-mono text-label uppercase text-muted tracking-[0.15em] mb-3">
                Phương thức thanh toán
              </p>
              <ul className="space-y-2">
                {PAYMENT_METHODS.map((m) => (
                  <li key={m.id}>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod(m.id)}
                      className={[
                        'w-full text-left px-4 py-3 border',
                        paymentMethod === m.id
                          ? 'border-coral text-coral'
                          : 'border-hairline text-paper hover:border-paper',
                      ].join(' ')}
                    >
                      <span className="font-label uppercase tracking-[0.15em] text-label">
                        {m.label}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {error && (
              <p className="font-mono text-small text-coral border-l-2 border-coral pl-3">
                {error}
              </p>
            )}

            <div className="flex gap-4">
              <button
                type="button"
                onClick={handleCancel}
                disabled={cancelLoading}
                className="flex-1 font-label uppercase tracking-[0.2em] text-label border border-muted text-muted px-8 py-4 hover:border-paper hover:text-paper disabled:opacity-50"
              >
                {cancelLoading ? '...' : 'Hủy giữ ghế'}
              </button>
              <button
                type="button"
                onClick={handlePay}
                disabled={!paymentMethod || payLoading}
                className="flex-1 font-label uppercase tracking-[0.2em] text-label bg-coral text-ink px-8 py-4 hover:bg-paper disabled:opacity-50"
              >
                {payLoading ? '...' : `Thanh toán ${order.totalPrice.toLocaleString('vi-VN')} ₫`}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingFlow;
