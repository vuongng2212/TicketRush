'use client';

import { motion } from 'framer-motion';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

interface Alert {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
}

interface AlertManagerProps {
  alerts: Alert[];
  onDismiss: (id: string) => void;
}

const ALERT_CONFIG = {
  success: { icon: CheckCircle, color: 'border-lime-rush/40 bg-lime-rush/5 text-lime-rush' },
  error: { icon: AlertCircle, color: 'border-hot-magenta/40 bg-hot-magenta/5 text-hot-magenta' },
  info: { icon: Info, color: 'border-electric-blue/40 bg-electric-blue/5 text-electric-blue' },
  warning: { icon: AlertTriangle, color: 'border-acid-yellow/40 bg-acid-yellow/5 text-acid-yellow' },
};

export function AlertManager({ alerts, onDismiss }: AlertManagerProps) {
  if (alerts.length === 0) return null;

  return (
    <div className="fixed top-20 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {alerts.map((alert) => {
        const config = ALERT_CONFIG[alert.type];
        const Icon = config.icon;

        return (
          <motion.div
            key={alert.id}
            className={`pointer-events-auto flex items-start gap-3 px-4 py-3 rounded-xl border backdrop-blur-md ${config.color}`}
            initial={{ opacity: 0, x: 60, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 60, scale: 0.95 }}
            layout
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          >
            <Icon className="w-4 h-4 mt-0.5 shrink-0" />
            <p className="flex-1 text-sm font-medium">{alert.message}</p>
            <button
              onClick={() => onDismiss(alert.id)}
              className="shrink-0 opacity-60 hover:opacity-100 transition-opacity"
              aria-label="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        );
      })}
    </div>
  );
}
