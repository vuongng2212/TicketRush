'use client';

import { QRCodeSVG } from 'qrcode.react';
import { EDITORIAL } from '@/lib/design-tokens';

interface TicketCardProps {
  ticketCode: string;
  eventTitle: string;
  venue?: string;
  startTime?: string;
  seatNumber?: string;
  price?: number;
}

export const TicketCard = ({
  ticketCode,
  eventTitle,
  venue,
  startTime,
  seatNumber,
  price,
}: TicketCardProps) => {
  return (
    <div className="border border-hairline bg-ink-2 p-6 space-y-6">
      {/* QR Code */}
      <div className="flex justify-center bg-paper p-4">
        <QRCodeSVG
          value={ticketCode}
          size={256}
          level="H"
          includeMargin={false}
          fgColor={EDITORIAL.colors.ink}
          bgColor={EDITORIAL.colors.paper}
        />
      </div>

      {/* Ticket Info */}
      <div className="space-y-3">
        <div>
          <p className="font-mono text-label uppercase text-muted tracking-[0.15em] mb-1">
            Mã vé
          </p>
          <p className="font-mono text-body text-paper">{ticketCode}</p>
        </div>

        <div>
          <p className="font-mono text-label uppercase text-muted tracking-[0.15em] mb-1">
            Sự kiện
          </p>
          <p className="font-body text-body text-paper">{eventTitle}</p>
        </div>

        {venue && (
          <div>
            <p className="font-mono text-label uppercase text-muted tracking-[0.15em] mb-1">
              Địa điểm
            </p>
            <p className="font-body text-body text-paper">{venue}</p>
          </div>
        )}

        {startTime && (
          <div>
            <p className="font-mono text-label uppercase text-muted tracking-[0.15em] mb-1">
              Thời gian
            </p>
            <p className="font-body text-body text-paper">
              {new Date(startTime).toLocaleString('vi-VN')}
            </p>
          </div>
        )}

        {seatNumber && (
          <div>
            <p className="font-mono text-label uppercase text-muted tracking-[0.15em] mb-1">
              Ghế
            </p>
            <p className="font-mono text-body text-paper">{seatNumber}</p>
          </div>
        )}

        {price !== undefined && (
          <div>
            <p className="font-mono text-label uppercase text-muted tracking-[0.15em] mb-1">
              Giá
            </p>
            <p className="font-body text-body text-coral">
              {price.toLocaleString('vi-VN')} ₫
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TicketCard;
