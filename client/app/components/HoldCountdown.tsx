'use client';

import { useEffect, useState } from 'react';

interface HoldCountdownProps {
  expiresAt: string;
  onExpire?: () => void;
}

export const HoldCountdown = ({ expiresAt, onExpire }: HoldCountdownProps) => {
  const [timeLeft, setTimeLeft] = useState<number>(0);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = Date.now();
      const expiry = new Date(expiresAt).getTime();
      const diff = expiry - now;
      return Math.max(0, Math.floor(diff / 1000));
    };

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTimeLeft(calculateTimeLeft());

    const interval = setInterval(() => {
      const remaining = calculateTimeLeft();
      setTimeLeft(remaining);

      if (remaining === 0) {
        clearInterval(interval);
        onExpire?.();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [expiresAt, onExpire]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="flex items-center gap-3 border-l-2 border-coral pl-4">
      <span className="font-mono text-small uppercase text-muted tracking-wider">
        Thời gian giữ ghế:
      </span>
      <span
        className="font-mono text-body text-coral tabular-nums"
        aria-live="polite"
        aria-atomic="true"
      >
        {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
      </span>
    </div>
  );
};

export default HoldCountdown;
