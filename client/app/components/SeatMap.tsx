'use client';

import { useEffect, useState } from 'react';
import { useSubscription } from '@apollo/client/react';
import { gql } from '@apollo/client';
import { EDITORIAL } from '@/lib/design-tokens';

const SEAT_STATUS_SUBSCRIPTION = gql`
  subscription SeatStatusUpdated($concertId: ID!) {
    seatStatusUpdated(concertId: $concertId) {
      seatId
      status
      heldByUserId
    }
  }
`;

interface Zone {
  id: string;
  name: string;
  price: number;
  totalSeats: number;
  seats: Seat[];
}

interface Seat {
  id: string;
  seatNumber: string;
  status: string;
  heldByUserId?: string;
  heldUntil?: string;
}

interface SeatMapProps {
  concertId: string;
  zones: Zone[];
  onSeatClick: (seatId: string) => void;
  disabled?: boolean;
}

export const SeatMap = ({ concertId, zones, onSeatClick, disabled }: SeatMapProps) => {
  const [seatStatuses, setSeatStatuses] = useState<Record<string, string>>({});

  // Initialize seat statuses from zones prop
  useEffect(() => {
    const statuses: Record<string, string> = {};
    zones.forEach(zone => {
      zone.seats.forEach(seat => {
        statuses[seat.id] = seat.status;
      });
    });
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSeatStatuses(statuses);
  }, [zones]);

  // Subscribe to realtime updates
  const { data: seatUpdate } = useSubscription(SEAT_STATUS_SUBSCRIPTION, {
    variables: { concertId },
  });

  useEffect(() => {
    if (!seatUpdate) return;
    const update = (seatUpdate as { seatStatusUpdated?: { seatId: string; status: string } })?.seatStatusUpdated;
    if (!update) return;

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSeatStatuses(prev => ({
      ...prev,
      [update.seatId]: update.status,
    }));
  }, [seatUpdate]);

  const getSeatColor = (status: string): string => {
    switch (status) {
      case 'AVAILABLE':
        return EDITORIAL.colors.coral;
      case 'HELD':
        return '#FF8C00'; // orange
      case 'SOLD':
        return EDITORIAL.colors.hairline;
      default:
        return EDITORIAL.colors.muted;
    }
  };

  const handleSeatClick = (seat: Seat) => {
    const currentStatus = seatStatuses[seat.id] || seat.status;
    if (disabled || currentStatus !== 'AVAILABLE') return;
    onSeatClick(seat.id);
  };

  // Build SVG: arrange zones vertically, seats in grid within each zone
  const SEAT_SIZE = 20;
  const SEAT_GAP = 6;
  const ZONE_GAP = 40;
  const PADDING = 20;

  let currentY = PADDING;
  const zoneLayouts: Array<{ zone: Zone; startY: number; rows: Seat[][] }> = [];

  zones.forEach(zone => {
    const seatsPerRow = Math.ceil(Math.sqrt(zone.seats.length));
    const rows: Seat[][] = [];
    for (let i = 0; i < zone.seats.length; i += seatsPerRow) {
      rows.push(zone.seats.slice(i, i + seatsPerRow));
    }
    zoneLayouts.push({ zone, startY: currentY, rows });
    currentY += rows.length * (SEAT_SIZE + SEAT_GAP) + ZONE_GAP;
  });

  const maxSeatsPerRow = Math.max(
    ...zoneLayouts.map(z => Math.max(...z.rows.map(r => r.length)))
  );
  const svgWidth = maxSeatsPerRow * (SEAT_SIZE + SEAT_GAP) + PADDING * 2;
  const svgHeight = currentY;

  return (
    <div className="w-full overflow-x-auto">
      <svg
        width={svgWidth}
        height={svgHeight}
        className="mx-auto"
        style={{ maxWidth: '100%' }}
      >
        {zoneLayouts.map(({ zone, startY, rows }) => (
          <g key={zone.id}>
            {/* Zone label */}
            <text
              x={PADDING}
              y={startY - 10}
              fill={EDITORIAL.colors.paper}
              fontSize="14"
              fontFamily={EDITORIAL.typography.mono}
              className="uppercase"
            >
              {zone.name} — {zone.price.toLocaleString('vi-VN')} ₫
            </text>

            {/* Seats */}
            {rows.map((row, rowIndex) => (
              <g key={rowIndex}>
                {row.map((seat, colIndex) => {
                  const x = PADDING + colIndex * (SEAT_SIZE + SEAT_GAP);
                  const y = startY + rowIndex * (SEAT_SIZE + SEAT_GAP);
                  const currentStatus = seatStatuses[seat.id] || seat.status;
                  const color = getSeatColor(currentStatus);
                  const isClickable = !disabled && currentStatus === 'AVAILABLE';

                  return (
                    <g key={seat.id}>
                      <rect
                        x={x}
                        y={y}
                        width={SEAT_SIZE}
                        height={SEAT_SIZE}
                        fill={color}
                        stroke={EDITORIAL.colors.ink}
                        strokeWidth="1"
                        className={isClickable ? 'cursor-pointer' : 'cursor-not-allowed'}
                        onClick={() => handleSeatClick(seat)}
                        style={{ transition: 'none' }}
                      />
                      <text
                        x={x + SEAT_SIZE / 2}
                        y={y + SEAT_SIZE / 2}
                        fill={EDITORIAL.colors.ink}
                        fontSize="8"
                        fontFamily={EDITORIAL.typography.mono}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        pointerEvents="none"
                      >
                        {seat.seatNumber}
                      </text>
                    </g>
                  );
                })}
              </g>
            ))}
          </g>
        ))}

        {/* Legend */}
        <g transform={`translate(${PADDING}, ${svgHeight - 60})`}>
          <text
            x={0}
            y={0}
            fill={EDITORIAL.colors.muted}
            fontSize="12"
            fontFamily={EDITORIAL.typography.mono}
            className="uppercase"
          >
            Chú thích:
          </text>
          {[
            { status: 'AVAILABLE', label: 'Còn trống', color: EDITORIAL.colors.coral },
            { status: 'HELD', label: 'Đang giữ', color: '#FF8C00' },
            { status: 'SOLD', label: 'Đã bán', color: EDITORIAL.colors.hairline },
          ].map((item, idx) => (
            <g key={item.status} transform={`translate(${idx * 120}, 15)`}>
              <rect x={0} y={0} width={12} height={12} fill={item.color} />
              <text
                x={18}
                y={10}
                fill={EDITORIAL.colors.muted}
                fontSize="10"
                fontFamily={EDITORIAL.typography.mono}
              >
                {item.label}
              </text>
            </g>
          ))}
        </g>
      </svg>
    </div>
  );
};

export default SeatMap;
