'use client';

import { motion } from 'framer-motion';

interface AnimatedCardProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  glass?: boolean;
}

export function AnimatedCard({ children, className = '', delay = 0, glass = false }: AnimatedCardProps) {
  return (
    <motion.div
      className={`rounded-xl ${glass ? 'glass-electric' : 'bg-dark-surface border border-zinc-800'} ${className}`}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{
        duration: 0.5,
        delay,
        ease: [0.16, 1, 0.3, 1],
      }}
      whileHover={{
        y: -4,
        boxShadow: '0 0 24px rgba(0, 212, 255, 0.15)',
        transition: { duration: 0.2 },
      }}
    >
      {children}
    </motion.div>
  );
}
