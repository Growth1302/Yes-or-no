import React from 'react';
import { Heart, Play } from 'lucide-react';
import type { WheelConfig } from '../types/spinverse';
import { CATEGORY_META } from '../data/wheels';

interface WheelCardProps {
  wheel: WheelConfig;
  isActive: boolean;
  isFavorite: boolean;
  onSelect: (wheel: WheelConfig) => void;
  onToggleFavorite: (wheelId: string, e: React.MouseEvent) => void;
}

export const WheelCard: React.FC<WheelCardProps> = ({
  wheel,
  isActive,
  isFavorite,
  onSelect,
  onToggleFavorite,
}) => {
  const category = CATEGORY_META[wheel.category];
  const previewOptions = wheel.options.slice(0, 8);
  const step = 360 / previewOptions.length;
  const conicStops = previewOptions
    .map((opt, i) => `${opt.color} ${i * step}deg ${(i + 1) * step}deg`)
    .join(', ');

  return (
    <div
      className={`group relative rounded-2xl border transition-all duration-200 flex flex-col justify-between p-5 bg-white dark:bg-slate-900 ${
        isActive
          ? 'border-blue-500 ring-2 ring-blue-500/20 shadow-md'
          : 'border-slate-200/90 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:-translate-y-0.5 hover:shadow-md'
      }`}
    >
      <div>
        <div className="flex items-start justify-between gap-3">
          {/* Mini Wheel Color Emblem */}
          <div className="flex items-center gap-3 min-w-0">
            <div
              aria-hidden="true"
              className="w-11 h-11 rounded-full shrink-0 border-2 border-white dark:border-slate-800 shadow-sm relative flex items-center justify-center"
              style={{ background: `conic-gradient(${conicStops})` }}
            >
              <div className="w-3.5 h-3.5 rounded-full bg-white dark:bg-slate-900 shadow-xs" />
            </div>
            <div className="min-w-0">
              <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
                <span>{category.shortName}</span>
                <span aria-hidden="true" className="mx-1.5">
                  ·
                </span>
                <span className="tabular-nums">{wheel.options.length} options</span>
              </div>
              <h3 className="font-display font-semibold text-base text-slate-900 dark:text-white leading-snug truncate">
                {wheel.title}
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={(e) => onToggleFavorite(wheel.id, e)}
            aria-label={
              isFavorite
                ? `Remove ${wheel.title} from favorites`
                : `Add ${wheel.title} to favorites`
            }
            className={`p-2 rounded-lg transition-colors cursor-pointer shrink-0 ${
              isFavorite
                ? 'text-pink-500 bg-pink-50 dark:bg-pink-950/30'
                : 'text-slate-400 hover:text-pink-500 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Heart
              className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`}
            />
          </button>
        </div>

        <p className="mt-3 text-sm text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
          {wheel.subtitle}
        </p>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2">
        <span className="text-xs text-slate-400 dark:text-slate-500 truncate">
          {wheel.options
            .slice(0, 3)
            .map((o) => o.label)
            .join(', ')}
          {wheel.options.length > 3 ? '…' : ''}
        </span>
        <button
          type="button"
          onClick={() => onSelect(wheel)}
          className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
            isActive
              ? 'bg-blue-600 text-white'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 group-hover:bg-blue-600 group-hover:text-white'
          }`}
        >
          <Play className="w-3 h-3 fill-current" />
          <span>{isActive ? 'Selected' : 'Load Wheel'}</span>
        </button>
      </div>
    </div>
  );
};
