import React, { useEffect, useState } from 'react';
import {
  Check,
  Copy,
  RotateCw,
  Share2,
  Trash2,
  X,
  ArrowRight,
  HeartHandshake,
} from 'lucide-react';
import type { WheelConfig, WheelOption } from '../types/spinverse';
import { CATEGORY_META } from '../data/wheels';

interface ResultModalProps {
  isOpen: boolean;
  wheel: WheelConfig;
  winner: WheelOption | null;
  message: string;
  nextStep: string;
  canRemoveWinner: boolean;
  relatedWheels: WheelConfig[];
  onClose: () => void;
  onSpinAgain: () => void;
  onRemoveAndSpinAgain: () => void;
  onSelectRelatedWheel: (wheel: WheelConfig) => void;
  onNotify: (msg: string) => void;
}

export const ResultModal: React.FC<ResultModalProps> = ({
  isOpen,
  wheel,
  winner,
  message,
  nextStep,
  canRemoveWinner,
  relatedWheels,
  onClose,
  onSpinAgain,
  onRemoveAndSpinAgain,
  onSelectRelatedWheel,
  onNotify,
}) => {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setCopied(false);
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !winner) return null;

  const categoryMeta = CATEGORY_META[wheel.category];
  const shareText = `I spun "${wheel.title}" on SPINVERSE and got: ${winner.label}\n\n"${message}"`;

  const handleShare = async () => {
    const shareUrl = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `SPINVERSE · ${wheel.title}`,
          text: shareText,
          url: shareUrl,
        });
        return;
      } catch {
        // Fallback to clipboard if user cancels or native share unavailable
      }
    }

    try {
      await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
      setCopied(true);
      onNotify('Result card copied to clipboard!');
      setTimeout(() => setCopied(false), 2500);
    } catch {
      onNotify('Could not copy automatically—try selecting the text.');
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="spin-result-heading"
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/65 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden max-h-[92vh] overflow-y-auto">
        {/* Top Accent Strip */}
        <div
          className="h-2 w-full"
          style={{
            background: `linear-gradient(90deg, ${winner.color}, ${categoryMeta.accentColor})`,
          }}
        />

        <div className="p-6 sm:p-7">
          <div className="flex items-start justify-between gap-4">
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
              <span>{categoryMeta.shortName}</span>
              <span aria-hidden="true" className="mx-1.5">
                ·
              </span>
              <span>{wheel.title}</span>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close result dialog"
              className="p-1.5 -mt-1 -mr-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Winning Answer Card */}
          <div className="mt-4 rounded-xl p-5 sm:p-6 bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 text-center">
            <div className="inline-flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: winner.color }}
              />
              <span>Selected Result</span>
            </div>
            <h2
              id="spin-result-heading"
              className="font-display text-2xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-white break-words"
              style={{ textWrap: 'balance' }}
            >
              {winner.label}
            </h2>
          </div>

          {/* Positive Message */}
          <p className="mt-5 text-base sm:text-lg font-medium text-slate-800 dark:text-slate-100 text-center leading-relaxed">
            {message}
          </p>

          {/* Next-Step Suggestion */}
          <div className="mt-4 rounded-xl p-4 bg-blue-50/70 dark:bg-blue-950/25 border border-blue-100 dark:border-blue-900/40 text-sm text-slate-700 dark:text-slate-300">
            <span className="font-semibold text-blue-700 dark:text-blue-300">
              Suggested next step:{' '}
            </span>
            <span>{nextStep}</span>
          </div>

          {/* Supportive Guidance Notice for Difficult Decisions */}
          {wheel.supportiveGuidance && (
            <div className="mt-3 rounded-xl p-3.5 bg-purple-50/70 dark:bg-purple-950/25 border border-purple-100 dark:border-purple-900/40 flex items-start gap-2.5 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              <HeartHandshake className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
              <p>
                A wheel helps break overthinking, not replace thoughtful care. For serious medical, financial, legal, or major life decisions, please take time to reflect and consult trusted people or professionals.
              </p>
            </div>
          )}

          {/* Primary Actions */}
          <div className="mt-6 flex flex-col sm:flex-row gap-2.5">
            <button
              type="button"
              onClick={onSpinAgain}
              className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold text-sm shadow-sm transition-all cursor-pointer whitespace-nowrap"
            >
              <RotateCw className="w-4 h-4" />
              <span>Spin Again</span>
            </button>

            <button
              type="button"
              onClick={handleShare}
              className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 font-semibold text-sm transition-colors cursor-pointer whitespace-nowrap"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-500" />
                  <span>Copied Card</span>
                </>
              ) : typeof navigator !== 'undefined' && 'share' in navigator ? (
                <>
                  <Share2 className="w-4 h-4" />
                  <span>Share Result</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copy Result</span>
                </>
              )}
            </button>
          </div>

          {canRemoveWinner && (
            <button
              type="button"
              onClick={onRemoveAndSpinAgain}
              className="mt-2.5 w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/70 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-500" />
              <span>Remove "{winner.label}" &amp; Spin Remaining Options</span>
            </button>
          )}

          {/* Related Wheel Recommendations */}
          {relatedWheels.length > 0 && (
            <div className="mt-6 pt-5 border-t border-slate-200 dark:border-slate-800">
              <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2.5">
                Try Another Wheel
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {relatedWheels.slice(0, 2).map((rw) => (
                  <button
                    key={rw.id}
                    type="button"
                    onClick={() => onSelectRelatedWheel(rw)}
                    className="flex items-center justify-between gap-2 p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-500 bg-slate-50/60 dark:bg-slate-800/40 text-left transition-colors cursor-pointer group"
                  >
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">
                        {rw.title}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
                        {CATEGORY_META[rw.category].shortName} · {rw.options.length} options
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-500 shrink-0 transition-transform group-hover:translate-x-0.5" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
