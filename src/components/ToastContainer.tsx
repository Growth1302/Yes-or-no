import React from 'react';
import { CheckCircle2, Info } from 'lucide-react';
import type { ToastItem } from '../types/spinverse';

interface ToastContainerProps {
  toasts: ToastItem[];
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts }) => {
  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-[80] flex flex-col gap-2 w-[min(92vw,380px)] pointer-events-none"
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          className="pointer-events-auto flex items-center gap-2.5 px-4 py-3 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-lg text-xs sm:text-sm font-medium border border-slate-800 dark:border-slate-200"
        >
          {t.type === 'warning' ? (
            <Info className="w-4 h-4 text-amber-400 dark:text-amber-600 shrink-0" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 dark:text-emerald-600 shrink-0" />
          )}
          <span>{t.message}</span>
        </div>
      ))}
    </div>
  );
};
