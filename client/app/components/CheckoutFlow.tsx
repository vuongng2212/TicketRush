'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { CreditCard, Wallet, Smartphone, Shield, CheckCircle, Zap } from 'lucide-react';
import { useState } from 'react';

interface Seat {
  id: string;
  seatNumber: string;
  status: string;
  zoneName?: string;
  price?: number;
}

interface CheckoutFlowProps {
  selectedSeat: Seat | null;
  orderTotal: number;
  onPaymentMethodSelect: (method: string) => void;
  onConfirmPayment: () => void;
  isLoading: boolean;
  paymentSuccess: boolean;
}

const PAYMENT_METHODS = [
  { id: 'credit-card', label: 'Credit Card', icon: CreditCard, gradient: 'from-electric-blue to-electric-cyan' },
  { id: 'digital-wallet', label: 'Digital Wallet', icon: Wallet, gradient: 'from-hot-magenta to-hot-pink' },
  { id: 'ewallet', label: 'E-Wallet', icon: Smartphone, gradient: 'from-lime-rush to-electric-blue' },
];

// Generate particles at module level to avoid purity issues
const CONFETTI_PARTICLES = Array.from({ length: 30 }).map((_, i) => ({
  id: i,
  left: Math.random() * 100,
  xOffset: (Math.random() - 0.5) * 200,
  rotation: Math.random() * 720,
  duration: 1.5 + Math.random() * 2,
  delay: Math.random() * 0.5,
  color: ['#00d4ff', '#ff2d7b', '#39ff14', '#eaff00', '#0affed'][i % 5],
}));

function ConfettiEffect() {
  const reduce = useReducedMotion();
  

  if (reduce) return null;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {CONFETTI_PARTICLES.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute w-2 h-2 rounded-full"
          style={{
            background: particle.color,
            left: `${particle.left}%`,
            top: '-10%',
          }}
          animate={{
            y: ['0vh', '110vh'],
            x: [0, particle.xOffset],
            rotate: [0, particle.rotation],
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            ease: 'easeIn',
          }}
        />
      ))}
    </div>
  );
}

export function CheckoutFlow({
  selectedSeat,
  orderTotal,
  onPaymentMethodSelect,
  onConfirmPayment,
  isLoading,
  paymentSuccess,
}: CheckoutFlowProps) {
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const reduce = useReducedMotion();

  if (!selectedSeat) return null;

  const confirmDisabled = !selectedMethod || isLoading;

  if (paymentSuccess) {
    return (
      <section className="relative py-20">
        <div className="max-w-lg mx-auto px-6">
          <motion.div
            className="relative glass-electric rounded-3xl p-8 text-center overflow-hidden"
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          >
            <ConfettiEffect />

            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 300 }}
            >
              <CheckCircle className="w-16 h-16 text-lime-rush mx-auto mb-4" />
            </motion.div>

            <h2 className="font-display text-3xl font-black text-white mb-2">YOU&apos;RE IN</h2>
            <p className="text-zinc-500 mb-6">See you in the pit.</p>

            {/* Ticket stub */}
            <div className="bg-dark-bg-2 rounded-xl p-4 border border-zinc-800 max-w-xs mx-auto ticket-stub-edge">
              <div className="text-left space-y-1">
                <p className="text-electric-blue text-xs font-semibold uppercase tracking-wider">TicketRush</p>
                <p className="text-white font-bold">Seat {selectedSeat.seatNumber}</p>
                <p className="text-zinc-500 text-sm">Zone: {selectedSeat.zoneName || 'General'}</p>
                <div className="h-px bg-zinc-800 my-2 bg-dashed" style={{ backgroundImage: 'repeating-linear-gradient(90deg, #222 0, #222 6px, transparent 6px, transparent 12px)' }} />
                <p className="text-lime-rush font-bold text-lg">${orderTotal}</p>
                <p className="text-zinc-700 text-[10px] uppercase tracking-wider mt-1">Paid</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative py-20 overflow-hidden">
      {/* Background flare */}
      <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-gradient-to-tr from-hot-magenta/5 to-transparent blur-[80px] pointer-events-none" />

      <div className="max-w-4xl mx-auto px-6">
        {/* Header — NO EYEBROW */}
        <motion.h2
          className="font-display text-4xl sm:text-5xl font-black tracking-tighter text-white mb-10"
          initial={reduce ? false : { opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          Lock It <span className="bg-gradient-to-r from-hot-magenta via-electric-blue to-lime-rush bg-clip-text text-transparent">In</span>
        </motion.h2>

        {/* Layout: payment methods stacked, summary below on mobile, side on desktop */}
        <div className="grid lg:grid-cols-5 gap-8">
          {/* Left — payment methods */}
          <motion.div
            className="lg:col-span-3 space-y-3"
            initial={reduce ? false : { opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <p className="text-zinc-600 text-xs font-mono uppercase tracking-wider mb-4">Pay With</p>

            {PAYMENT_METHODS.map((method) => {
              const isSelected = selectedMethod === method.id;
              const Icon = method.icon;
              return (
                <motion.button
                  key={method.id}
                  onClick={() => {
                    setSelectedMethod(method.id);
                    onPaymentMethodSelect(method.id);
                  }}
                  className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all ${
                    isSelected
                      ? 'border-lime-rush/50 bg-lime-rush/5'
                      : 'border-zinc-800 bg-dark-surface hover:border-zinc-600'
                  }`}
                  whileHover={reduce ? {} : { scale: 1.01, x: 4 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${method.gradient} flex items-center justify-center`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <span className="flex-1 text-left text-white font-semibold">{method.label}</span>
                  {isSelected && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-5 h-5 rounded-full bg-lime-rush flex items-center justify-center"
                    >
                      <CheckCircle className="w-3.5 h-3.5 text-dark-bg" />
                    </motion.div>
                  )}
                </motion.button>
              );
            })}
          </motion.div>

          {/* Right — order summary */}
          <motion.div
            className="lg:col-span-2"
            initial={reduce ? false : { opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <div className="glass-electric rounded-2xl p-6 sticky top-24">
              <h3 className="text-white font-bold text-lg mb-4">Order</h3>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500">Seat</span>
                  <span className="text-white">{selectedSeat.seatNumber}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500">Zone</span>
                  <span className="text-electric-blue">{selectedSeat.zoneName || 'General'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500">Ticket</span>
                  <span className="text-white">${orderTotal}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500">Service Fee</span>
                  <span className="text-lime-rush">FREE</span>
                </div>
              </div>

              <div className="h-px bg-gradient-to-r from-electric-blue/40 via-hot-magenta/40 to-lime-rush/40 mb-4" />

              <div className="flex justify-between items-center mb-6">
                <span className="text-white font-bold">Total</span>
                <span className="font-display text-2xl font-black bg-gradient-to-r from-hot-magenta to-electric-blue bg-clip-text text-transparent">
                  ${orderTotal}
                </span>
              </div>

              <motion.button
                disabled={confirmDisabled}
                className={`w-full py-3 rounded-full font-bold text-base transition-all ${
                  confirmDisabled
                    ? 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
                    : 'bg-lime-rush text-dark-bg hover:shadow-glow-lime'
                }`}
                whileHover={reduce || confirmDisabled ? {} : { scale: 1.03 }}
                whileTap={confirmDisabled ? {} : { scale: 0.97 }}
                onClick={onConfirmPayment}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Zap className="w-4 h-4 animate-pulse" />
                    Processing...
                  </span>
                ) : (
                  'Lock It In'
                )}
              </motion.button>

              <div className="flex items-center justify-center gap-2 mt-4 text-zinc-700 text-xs">
                <Shield className="w-3.5 h-3.5" />
                256-bit encrypted
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
