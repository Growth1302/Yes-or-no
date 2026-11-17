import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Maximize2,
  Minimize2,
  RotateCcw,
  Shuffle,
  Volume2,
  VolumeX,
  Trash2,
} from 'lucide-react';
import type { WheelConfig, WheelOption } from '../types/spinverse';
import { soundEngine } from '../utils/sound';

interface SpinningWheelProps {
  wheel: WheelConfig;
  activeOptions: WheelOption[];
  removedCount: number;
  isMuted: boolean;
  onToggleMute: () => void;
  onSpinComplete: (winner: WheelOption) => void;
  onRemoveOption?: (optionId: string) => void;
  onResetRemoved?: () => void;
  onShuffleOptions?: () => void;
  compact?: boolean;
  showControls?: boolean;
  externalSpinTrigger?: number;
}

interface ComputedSlice {
  option: WheelOption;
  startAngle: number;
  endAngle: number;
  span: number;
  midAngle: number;
}

function polarToCartesian(
  cx: number,
  cy: number,
  r: number,
  angleDeg: number
): { x: number; y: number } {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return {
    x: cx + r * Math.cos(rad),
    y: cy + r * Math.sin(rad),
  };
}

function describeSector(
  cx: number,
  cy: number,
  r: number,
  startAngle: number,
  endAngle: number
): string {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const largeArc = endAngle - startAngle <= 180 ? '0' : '1';
  return [
    'M',
    cx,
    cy,
    'L',
    start.x,
    start.y,
    'A',
    r,
    r,
    0,
    largeArc,
    0,
    end.x,
    end.y,
    'Z',
  ].join(' ');
}

function getContrastTextColor(hex: string): string {
  const clean = hex.replace('#', '');
  if (clean.length !== 6) return '#FFFFFF';
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.66 ? '#0F172A' : '#FFFFFF';
}

export const SpinningWheel: React.FC<SpinningWheelProps> = ({
  wheel,
  activeOptions,
  removedCount,
  isMuted,
  onToggleMute,
  onSpinComplete,
  onRemoveOption,
  onResetRemoved,
  onShuffleOptions,
  compact = false,
  showControls = true,
  externalSpinTrigger = 0,
}) => {
  const [rotation, setRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  const [pointerKick, setPointerKick] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [lastWinner, setLastWinner] = useState<WheelOption | null>(null);

  const rotationRef = useRef(0);
  const isSpinningRef = useRef(false);
  const rafRef = useRef<number | null>(null);
  const lastSliceIdxRef = useRef<number>(-1);
  const prevTriggerRef = useRef(externalSpinTrigger);

  // Compute exact slices from weights (or equal weights when weightedMode is off)
  const slices = useMemo<ComputedSlice[]>(() => {
    const opts =
      activeOptions.length >= 2
        ? activeOptions
        : [
            { id: 'fallback-1', label: 'YES', color: '#10B981', weight: 1 },
            { id: 'fallback-2', label: 'NO', color: '#F43F5E', weight: 1 },
          ];

    const weights = opts.map((o) =>
      wheel.weightedMode ? Math.max(0.1, Number(o.weight) || 1) : 1
    );
    const totalWeight = weights.reduce((acc, w) => acc + w, 0);

    let cursor = 0;
    return opts.map((option, idx) => {
      const span = (weights[idx] / totalWeight) * 360;
      const startAngle = cursor;
      const endAngle = idx === opts.length - 1 ? 360 : cursor + span;
      cursor = endAngle;
      return {
        option,
        startAngle,
        endAngle,
        span,
        midAngle: startAngle + span / 2,
      };
    });
  }, [activeOptions, wheel.weightedMode]);

  const findSliceIndexAtRotation = useCallback(
    (deg: number): number => {
      const wheelAngle = ((360 - (deg % 360)) + 360) % 360;
      for (let i = 0; i < slices.length; i++) {
        if (
          wheelAngle >= slices[i].startAngle &&
          wheelAngle < slices[i].endAngle
        ) {
          return i;
        }
      }
      return 0;
    },
    [slices]
  );

  // Reset highlighted slice when switching wheels
  useEffect(() => {
    setHighlightedId(null);
    setLastWinner(null);
  }, [wheel.id]);

  useEffect(() => {
    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  // Close fullscreen on Escape
  useEffect(() => {
    if (!isFullscreen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsFullscreen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isFullscreen]);

  const spin = useCallback(() => {
    if (isSpinningRef.current || slices.length < 2) return;

    isSpinningRef.current = true;
    setIsSpinning(true);
    setHighlightedId(null);
    setLastWinner(null);

    // Weighted random selection
    const weights = slices.map((s) =>
      wheel.weightedMode ? Math.max(0.1, Number(s.option.weight) || 1) : 1
    );
    const total = weights.reduce((a, b) => a + b, 0);
    let r = Math.random() * total;
    let chosenIdx = slices.length - 1;
    for (let i = 0; i < weights.length; i++) {
      r -= weights[i];
      if (r <= 0) {
        chosenIdx = i;
        break;
      }
    }

    const chosenSlice = slices[chosenIdx];
    // Pick a clean safe spot inside the chosen slice (away from border lines)
    const safeOffset = 0.18 + Math.random() * 0.64;
    const targetWheelAngle =
      chosenSlice.startAngle + chosenSlice.span * safeOffset;

    const desiredMod = (360 - targetWheelAngle + 360) % 360;
    const startRot = rotationRef.current;
    const currentMod = ((startRot % 360) + 360) % 360;
    const deltaMod = (desiredMod - currentMod + 360) % 360;

    const extraTurns = 6 + Math.floor(Math.random() * 4); // 6 to 9 full turns
    const totalDelta = extraTurns * 360 + deltaMod;
    const finalRot = startRot + totalDelta;

    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const duration = prefersReduced ? 320 : 4500;
    const startTime = performance.now();
    lastSliceIdxRef.current = findSliceIndexAtRotation(startRot);

    const easeOutQuartic = (t: number) => 1 - Math.pow(1 - t, 4.2);

    const frame = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);
      const eased = easeOutQuartic(progress);
      const currentRot = startRot + totalDelta * eased;

      rotationRef.current = currentRot;
      setRotation(currentRot);

      const currentIdx = findSliceIndexAtRotation(currentRot);
      if (currentIdx !== lastSliceIdxRef.current && !prefersReduced) {
        lastSliceIdxRef.current = currentIdx;
        const velocityFactor = 1 - progress;
        soundEngine.playTick(velocityFactor);
        setPointerKick(true);
        setTimeout(() => setPointerKick(false), 75);
      }

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(frame);
      } else {
        rotationRef.current = finalRot;
        setRotation(finalRot);
        isSpinningRef.current = false;
        setIsSpinning(false);

        // Verify pointer alignment against final rotation
        const verifiedIdx = findSliceIndexAtRotation(finalRot);
        const winner = slices[verifiedIdx].option;
        setHighlightedId(winner.id);
        setLastWinner(winner);
        soundEngine.playWin(wheel.category);

        // Brief pause so user sees the pointer resting on the glowing segment
        setTimeout(() => {
          onSpinComplete(winner);
        }, prefersReduced ? 80 : 380);
      }
    };

    rafRef.current = requestAnimationFrame(frame);
  }, [
    slices,
    wheel.weightedMode,
    wheel.category,
    findSliceIndexAtRotation,
    onSpinComplete,
  ]);

  // Allow parent buttons (e.g. Hero SPIN NOW or Modal Spin Again) to trigger spin
  useEffect(() => {
    if (externalSpinTrigger !== prevTriggerRef.current) {
      prevTriggerRef.current = externalSpinTrigger;
      if (externalSpinTrigger > 0) {
        spin();
      }
    }
  }, [externalSpinTrigger, spin]);

  const handleResetWheel = () => {
    if (isSpinning) return;
    soundEngine.playClick();
    setHighlightedId(null);
    setLastWinner(null);
    if (onResetRemoved) onResetRemoved();
  };

  const count = slices.length;

  const fitSliceLabel = (
    rawLabel: string,
    spanDeg: number
  ): { lines: string[]; fontSize: number; lineHeight: number } => {
    const clean = rawLabel.trim();
    const safeRadialWidth = 108; // Strictly inside r=54..166 (hub=38, rim=184)
    const midRadius = 110;
    const effectiveSpan = Math.min(spanDeg, 120);
    const chordAtMid =
      2 * midRadius * Math.sin((effectiveSpan * Math.PI) / 360);
    const maxStackHeight = chordAtMid * 0.72;

    const baseMaxFont =
      count <= 4 ? 17 : count <= 6 ? 14.5 : count <= 10 ? 13 : count <= 16 ? 11 : 9;

    // Split into 2 balanced lines when slice is wide enough and label has multiple words
    const words = clean.split(/\s+/).filter(Boolean);
    let lines: string[] = [clean];

    if (spanDeg >= 30 && words.length >= 2 && clean.length > 10) {
      let bestSplitIdx = 1;
      let bestDiff = Infinity;
      for (let i = 1; i < words.length; i++) {
        const l1 = words.slice(0, i).join(' ');
        const l2 = words.slice(i).join(' ');
        const diff = Math.abs(l1.length - l2.length);
        if (diff < bestDiff) {
          bestDiff = diff;
          bestSplitIdx = i;
        }
      }
      const line1 = words.slice(0, bestSplitIdx).join(' ');
      const line2 = words.slice(bestSplitIdx).join(' ');
      lines = [line1, line2];
    }

    const longestLen = Math.max(...lines.map((l) => l.length), 1);
    // Conservative bold display glyph width factor (~0.60 * fontSize)
    const maxFontByWidth = safeRadialWidth / (longestLen * 0.6);
    const maxFontByHeight =
      lines.length === 2 ? maxStackHeight / 2.35 : maxStackHeight / 1.2;

    let fontSize = Math.min(baseMaxFont, maxFontByWidth, maxFontByHeight);
    fontSize = Math.max(7.2, Math.min(18, fontSize));

    // If still slightly wider than safeRadialWidth at minimum fontSize, trim cleanly
    const maxCharsAtMinFont = Math.floor(safeRadialWidth / (fontSize * 0.58));
    lines = lines.map((line) =>
      line.length > maxCharsAtMinFont
        ? `${line.slice(0, Math.max(3, maxCharsAtMinFont - 1))}…`
        : line
    );

    return {
      lines,
      fontSize: Number(fontSize.toFixed(1)),
      lineHeight: Number((fontSize * 1.18).toFixed(1)),
    };
  };

  const wheelGraphic = (fullscreenView: boolean) => (
    <div
      className={`relative flex items-center justify-center select-none aspect-square mt-3.5 ${
        fullscreenView
          ? 'w-[min(86vw,520px)]'
          : compact
          ? 'w-[min(100%,320px)] sm:w-[410px]'
          : 'w-[min(100%,330px)] sm:w-[450px]'
      }`}
    >
      {/* Subtle Ambient Glow Ring */}
      <div
        aria-hidden="true"
        className="absolute inset-2 rounded-full bg-gradient-to-tr from-blue-500/20 via-purple-500/20 to-pink-500/20 blur-xl pointer-events-none"
      />

      {/* Top Pointer (Fixed at 12 o'clock / 0 deg) */}
      <div
        aria-hidden="true"
        className={`absolute -top-3.5 left-1/2 -translate-x-1/2 z-30 transition-transform duration-75 ${
          pointerKick ? '-rotate-12 scale-105' : 'rotate-0'
        }`}
      >
        <svg
          width="42"
          height="46"
          viewBox="0 0 42 46"
          fill="none"
          className="drop-shadow-md"
        >
          <path
            d="M21 44L5 14C3.5 11.2 5.2 4 21 4C36.8 4 38.5 11.2 37 14L21 44Z"
            fill="#F97316"
            stroke="#FFFFFF"
            strokeWidth="3"
          />
          <circle cx="21" cy="14" r="4.5" fill="#FFFFFF" />
        </svg>
      </div>

      {/* Rotating Wheel SVG */}
      <svg
        viewBox="0 0 400 400"
        role="img"
        aria-label={`${wheel.title} spinning wheel with ${slices.length} options`}
        className="w-full h-full drop-shadow-xl"
      >
        {/* Outer Metallic Rim */}
        <circle
          cx="200"
          cy="200"
          r="196"
          className="fill-slate-900 dark:fill-slate-800"
        />
        <circle
          cx="200"
          cy="200"
          r="192"
          fill="none"
          stroke="url(#wheelRimGrad)"
          strokeWidth="4"
        />
        <defs>
          <linearGradient id="wheelRimGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3B82F6" />
            <stop offset="50%" stopColor="#A855F7" />
            <stop offset="100%" stopColor="#EC4899" />
          </linearGradient>
          <clipPath id="wheelSafeTextClip">
            <circle cx="200" cy="200" r="176" />
          </clipPath>
        </defs>

        {/* Rotating Group */}
        <g transform={`rotate(${rotation} 200 200)`}>
          {slices.map((slice) => {
            const pathData = describeSector(
              200,
              200,
              184,
              slice.startAngle,
              slice.endAngle
            );
            const isWinner = highlightedId === slice.option.id;
            const textColor = getContrastTextColor(slice.option.color);
            const { lines, fontSize, lineHeight } = fitSliceLabel(
              slice.option.label,
              slice.span
            );

            // Keep left-half labels upright and centered strictly inside [54..166]
            const flip = slice.midAngle > 180;
            const textRotate = flip
              ? slice.midAngle + 90
              : slice.midAngle - 90;
            const labelRadius = flip ? -111 : 111;

            return (
              <g key={slice.option.id}>
                <path
                  d={pathData}
                  fill={slice.option.color}
                  stroke="#FFFFFF"
                  strokeWidth={isWinner ? 3.5 : 1.75}
                  opacity={highlightedId && !isWinner ? 0.58 : 1}
                />
                <g clipPath="url(#wheelSafeTextClip)">
                  <g
                    transform={`translate(200, 200) rotate(${textRotate}) translate(${labelRadius}, 0)`}
                  >
                    <text
                      x="0"
                      y="0"
                      fill={textColor}
                      fontSize={fontSize}
                      fontWeight="700"
                      textAnchor="middle"
                      dominantBaseline="central"
                      style={{
                        fontFamily: 'var(--font-display)',
                        letterSpacing: '-0.01em',
                      }}
                    >
                      {lines.length === 1 ? (
                        lines[0]
                      ) : (
                        <>
                          <tspan x="0" dy={-lineHeight * 0.5}>
                            {lines[0]}
                          </tspan>
                          <tspan x="0" dy={lineHeight}>
                            {lines[1]}
                          </tspan>
                        </>
                      )}
                    </text>
                  </g>
                </g>
              </g>
            );
          })}

          {/* Rim Peg Dots at Segment Boundaries */}
          {slices.map((slice) => {
            const peg = polarToCartesian(200, 200, 186, slice.startAngle);
            return (
              <circle
                key={`peg-${slice.option.id}`}
                cx={peg.x}
                cy={peg.y}
                r="3.2"
                fill="#FFFFFF"
                opacity="0.92"
              />
            );
          })}
        </g>

        {/* Inner Hub Ring */}
        <circle
          cx="200"
          cy="200"
          r="38"
          className="fill-white dark:fill-slate-900"
          stroke="#E2E8F0"
          strokeWidth="3"
        />
      </svg>

      {/* Interactive Center SPIN Button */}
      <button
        type="button"
        onClick={spin}
        disabled={isSpinning}
        aria-label={isSpinning ? 'Wheel is spinning' : 'Spin the wheel'}
        className="absolute z-20 w-[18.5%] h-[18.5%] min-w-[46px] min-h-[46px] rounded-full bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 text-white font-display font-bold text-xs sm:text-sm md:text-base tracking-wide shadow-lg hover:scale-105 active:scale-95 disabled:opacity-80 disabled:cursor-not-allowed transition-transform focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-500 cursor-pointer flex items-center justify-center"
      >
        {isSpinning ? '•••' : 'SPIN'}
      </button>
    </div>
  );

  return (
    <div className="flex flex-col items-center w-full">
      {wheelGraphic(false)}

      {showControls && (
        <div className="mt-4 sm:mt-6 w-full max-w-md flex flex-col items-center gap-2.5 sm:gap-3">
          {/* Primary Spin CTA */}
          <button
            type="button"
            onClick={spin}
            disabled={isSpinning}
            className="w-full sm:w-auto min-w-[210px] px-7 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-display font-semibold text-base shadow-md hover:shadow-lg active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed transition-all cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 whitespace-nowrap"
          >
            {isSpinning ? 'Spinning...' : 'Spin Wheel'}
          </button>

          {/* Secondary Utility Controls */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
            <button
              type="button"
              onClick={onToggleMute}
              aria-label={isMuted ? 'Unmute wheel sounds' : 'Mute wheel sounds'}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer whitespace-nowrap"
            >
              {isMuted ? (
                <VolumeX className="w-3.5 h-3.5 text-rose-500" />
              ) : (
                <Volume2 className="w-3.5 h-3.5 text-emerald-500" />
              )}
              <span>{isMuted ? 'Sound Off' : 'Sound On'}</span>
            </button>

            {onShuffleOptions && (
              <button
                type="button"
                onClick={() => {
                  soundEngine.playClick();
                  onShuffleOptions();
                }}
                disabled={isSpinning}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 transition-colors cursor-pointer whitespace-nowrap"
              >
                <Shuffle className="w-3.5 h-3.5" />
                <span>Shuffle</span>
              </button>
            )}

            {lastWinner && onRemoveOption && activeOptions.length > 2 && (
              <button
                type="button"
                onClick={() => {
                  soundEngine.playClick();
                  onRemoveOption(lastWinner.id);
                  setLastWinner(null);
                  setHighlightedId(null);
                }}
                disabled={isSpinning}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 disabled:opacity-50 transition-colors cursor-pointer whitespace-nowrap"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Remove Winner</span>
              </button>
            )}

            {removedCount > 0 && (
              <button
                type="button"
                onClick={handleResetWheel}
                disabled={isSpinning}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30 disabled:opacity-50 transition-colors cursor-pointer whitespace-nowrap"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset ({removedCount} hidden)</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                soundEngine.playClick();
                setIsFullscreen(true);
              }}
              aria-label="Open full-screen wheel mode"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer whitespace-nowrap"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span>Full Screen</span>
            </button>
          </div>
        </div>
      )}

      {/* Fullscreen Wheel Modal */}
      {isFullscreen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${wheel.title} Fullscreen Mode`}
          className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-md flex flex-col items-center justify-center p-4 sm:p-8"
        >
          <div className="w-full max-w-2xl flex items-center justify-between mb-4 text-white">
            <div>
              <h2 className="font-display text-xl sm:text-2xl font-bold tracking-tight">
                {wheel.title}
              </h2>
              <p className="text-xs sm:text-sm text-slate-300">
                {activeOptions.length} active options
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onToggleMute}
                aria-label={isMuted ? 'Unmute sounds' : 'Mute sounds'}
                className="p-2.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
              >
                {isMuted ? (
                  <VolumeX className="w-5 h-5" />
                ) : (
                  <Volume2 className="w-5 h-5" />
                )}
              </button>
              <button
                type="button"
                onClick={() => setIsFullscreen(false)}
                aria-label="Exit full-screen mode"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm font-medium transition-colors cursor-pointer whitespace-nowrap"
              >
                <Minimize2 className="w-4 h-4" />
                <span>Exit</span>
              </button>
            </div>
          </div>

          {wheelGraphic(true)}

          <div className="mt-6 flex items-center gap-3">
            <button
              type="button"
              onClick={spin}
              disabled={isSpinning}
              className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white font-display font-semibold text-base shadow-lg hover:brightness-110 disabled:opacity-70 transition-all cursor-pointer whitespace-nowrap"
            >
              {isSpinning ? 'Spinning...' : 'Spin Wheel'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
