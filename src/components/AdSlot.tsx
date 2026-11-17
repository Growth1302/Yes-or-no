import React, { useEffect, useRef } from 'react';
import {
  AD_CONFIG,
  AD_SLOTS,
  ensureAdNetworkInitialized,
  isAdPlacementActive,
  type AdPlacementId,
} from '../config/ads';

interface AdSlotProps {
  placement: AdPlacementId;
  className?: string;
}

export const AdSlot: React.FC<AdSlotProps> = ({ placement, className = '' }) => {
  const slot = AD_SLOTS[placement];
  const containerRef = useRef<HTMLDivElement>(null);
  const initializedRef = useRef(false);
  const isActive = isAdPlacementActive(placement);

  useEffect(() => {
    if (!isActive) return;
    ensureAdNetworkInitialized();

    if (
      AD_CONFIG.provider === 'adsense' &&
      AD_CONFIG.adsensePublisherId &&
      slot.adSlotCode &&
      !initializedRef.current
    ) {
      initializedRef.current = true;
      try {
        const w = window as unknown as { adsbygoogle?: unknown[] };
        w.adsbygoogle = w.adsbygoogle || [];
        w.adsbygoogle.push({});
      } catch {
        // Ignore if AdSense script hasn't finished hydrating yet
      }
    }
  }, [isActive, placement, slot.adSlotCode]);

  if (!isActive) return null;

  return (
    <aside
      ref={containerRef}
      aria-label={`Advertisement space: ${slot.label}`}
      data-ad-placement={placement}
      className={`w-full flex flex-col items-center justify-center my-4 ${className}`}
    >
      <div
        className={`w-full rounded-xl border border-dashed border-slate-300/80 dark:border-slate-700/80 bg-slate-100/70 dark:bg-slate-900/50 px-4 py-3 flex flex-col items-center justify-center text-center transition-colors ${slot.minHeightClass}`}
      >
        {AD_CONFIG.provider === 'adsense' &&
        AD_CONFIG.adsensePublisherId &&
        slot.adSlotCode ? (
          <ins
            className="adsbygoogle block w-full"
            style={{ display: 'block' }}
            data-ad-client={AD_CONFIG.adsensePublisherId}
            data-ad-slot={slot.adSlotCode}
            data-ad-format="auto"
            data-full-width-responsive="true"
          />
        ) : (
          <div className="flex flex-col sm:flex-row items-center justify-center gap-1.5 sm:gap-3 text-xs text-slate-500 dark:text-slate-400">
            <span className="font-medium tracking-wide text-slate-400 dark:text-slate-500">
              Advertisement
            </span>
            <span aria-hidden="true" className="hidden sm:inline text-slate-300 dark:text-slate-700">
              ·
            </span>
            <span className="font-medium text-slate-600 dark:text-slate-300">
              {slot.label}
            </span>
            <span aria-hidden="true" className="hidden sm:inline text-slate-300 dark:text-slate-700">
              ·
            </span>
            <span className="font-mono-nums text-[11px] text-slate-400 dark:text-slate-500">
              <span className="hidden md:inline">{slot.desktopSize}</span>
              <span className="md:hidden">{slot.mobileSize}</span>
            </span>
          </div>
        )}
      </div>
    </aside>
  );
};
