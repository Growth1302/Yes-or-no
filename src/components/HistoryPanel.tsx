import React, { useMemo, useState } from 'react';
import {
  Clock,
  Heart,
  Play,
  Search,
  Trash2,
} from 'lucide-react';
import type { SpinRecord, WheelConfig } from '../types/spinverse';
import { CATEGORY_META } from '../data/wheels';

interface HistoryPanelProps {
  history: SpinRecord[];
  favorites: WheelConfig[];
  recentWheels: WheelConfig[];
  allWheels: WheelConfig[];
  onSelectWheel: (wheel: WheelConfig) => void;
  onDeleteHistoryItem: (id: string) => void;
  onClearHistory: () => void;
}

export const HistoryPanel: React.FC<HistoryPanelProps> = ({
  history,
  favorites,
  recentWheels,
  allWheels,
  onSelectWheel,
  onDeleteHistoryItem,
  onClearHistory,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredHistory = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return history;
    return history.filter(
      (item) =>
        item.wheelTitle.toLowerCase().includes(q) ||
        item.resultLabel.toLowerCase().includes(q)
    );
  }, [history, searchQuery]);

  const formatTime = (ts: number) => {
    try {
      return new Intl.DateTimeFormat(undefined, {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      }).format(new Date(ts));
    } catch {
      return '';
    }
  };

  return (
    <div className="space-y-8">
      {/* Favorites & Recently Used Quick Strip */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Favorite Wheels */}
        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Heart className="w-4 h-4 text-pink-500 fill-current" />
              <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">
                Favorite Wheels
              </h3>
            </div>
            <span className="text-xs font-mono-nums text-slate-500 dark:text-slate-400">
              {favorites.length}
            </span>
          </div>

          {favorites.length === 0 ? (
            <p className="text-sm text-slate-500 dark:text-slate-400 py-4">
              Tap the heart icon on any wheel card to save your favorites here for instant access.
            </p>
          ) : (
            <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
              {favorites.map((w) => (
                <button
                  key={w.id}
                  type="button"
                  onClick={() => onSelectWheel(w)}
                  className="w-full flex items-center justify-between gap-3 p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 hover:border-blue-400 bg-slate-50/70 dark:bg-slate-950/60 text-left transition-colors cursor-pointer"
                >
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                      {w.title}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      {CATEGORY_META[w.category].shortName} · {w.options.length}{' '}
                      options
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400 shrink-0">
                    <Play className="w-3 h-3 fill-current" />
                    Spin
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Recently Used Wheels */}
        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-500" />
              <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">
                Recently Used Wheels
              </h3>
            </div>
            <span className="text-xs font-mono-nums text-slate-500 dark:text-slate-400">
              {recentWheels.length}
            </span>
          </div>

          {recentWheels.length === 0 ? (
            <p className="text-sm text-slate-500 dark:text-slate-400 py-4">
              Wheels you spin will appear here so you can jump right back into your recent picks.
            </p>
          ) : (
            <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
              {recentWheels.map((w) => (
                <button
                  key={w.id}
                  type="button"
                  onClick={() => onSelectWheel(w)}
                  className="w-full flex items-center justify-between gap-3 p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 hover:border-blue-400 bg-slate-50/70 dark:bg-slate-950/60 text-left transition-colors cursor-pointer"
                >
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                      {w.title}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      {CATEGORY_META[w.category].shortName} · {w.options.length}{' '}
                      options
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400 shrink-0">
                    <Play className="w-3 h-3 fill-current" />
                    Spin
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Full Personal Spin History Log */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 sm:p-7">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="font-display text-xl font-bold text-slate-900 dark:text-white">
              Personal Spin History
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Stored privately in your browser's localStorage—no account required.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter history..."
                aria-label="Filter spin history"
                className="pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            {history.length > 0 && (
              <button
                type="button"
                onClick={onClearHistory}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-rose-200 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear All</span>
              </button>
            )}
          </div>
        </div>

        {filteredHistory.length === 0 ? (
          <div className="py-10 text-center text-sm text-slate-500 dark:text-slate-400">
            {history.length === 0
              ? 'No spins recorded yet. Spin any wheel to see your results and messages here.'
              : 'No history entries match your filter.'}
          </div>
        ) : (
          <div className="mt-4 divide-y divide-slate-100 dark:divide-slate-800">
            {filteredHistory.map((item) => {
              const targetWheel = allWheels.find((w) => w.id === item.wheelId);
              return (
                <div
                  key={item.id}
                  className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <span
                      className="w-3 h-3 rounded-full mt-1.5 shrink-0"
                      style={{ backgroundColor: item.resultColor }}
                    />
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                        <span className="font-display font-bold text-base text-slate-900 dark:text-white">
                          {item.resultLabel}
                        </span>
                        <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">
                          ·
                        </span>
                        <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
                          {item.wheelTitle}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                        {item.message}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                    <span className="text-xs font-mono-nums text-slate-400 dark:text-slate-500">
                      {formatTime(item.timestamp)}
                    </span>
                    {targetWheel && (
                      <button
                        type="button"
                        onClick={() => onSelectWheel(targetWheel)}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-blue-600 hover:text-white text-slate-700 dark:text-slate-200 text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap"
                      >
                        Load
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => onDeleteHistoryItem(item.id)}
                      aria-label="Delete spin history item"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
