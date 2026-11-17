export type AdProvider = 'placeholder' | 'adsense' | 'adsterra' | 'custom';

export type AdPlacementId =
  | 'top-banner'
  | 'hero-bottom'
  | 'between-categories'
  | 'between-cards'
  | 'above-wheel'
  | 'below-result'
  | 'builder-divider'
  | 'bottom-banner'
  | 'desktop-sidebar'
  | 'mobile-inline';

export interface AdSlotDefinition {
  id: AdPlacementId;
  label: string;
  format: 'leaderboard' | 'rectangle' | 'responsive' | 'skyscraper' | 'mobile-banner';
  desktopSize: string;
  mobileSize: string;
  minHeightClass: string;
  adSlotCode?: string;
}

export interface AdNetworkConfig {
  enabled: boolean;
  provider: AdProvider;
  /** Replace with your Google AdSense publisher ID, e.g. "ca-pub-XXXXXXXXXXXXXXXX" */
  adsensePublisherId: string;
  /** Replace with your Adsterra key or container script base URL when going live */
  adsterraKey: string;
  /** Set to true in production to hide empty slots when no ad fills */
  hideWhenEmpty: boolean;
  /** Show subtle layout preview containers while provider is 'placeholder' */
  showDevelopmentPlaceholders: boolean;
}

export const AD_CONFIG: AdNetworkConfig = {
  enabled: true,
  provider: 'placeholder',
  adsensePublisherId: '',
  adsterraKey: '',
  hideWhenEmpty: true,
  showDevelopmentPlaceholders: false,
};

export const AD_SLOTS: Record<AdPlacementId, AdSlotDefinition> = {
  'top-banner': {
    id: 'top-banner',
    label: 'Top Leaderboard Slot',
    format: 'leaderboard',
    desktopSize: '728x90 / Responsive',
    mobileSize: '320x50',
    minHeightClass: 'min-h-[60px] md:min-h-[90px]',
  },
  'hero-bottom': {
    id: 'hero-bottom',
    label: 'Hero Bottom Horizontal Slot',
    format: 'leaderboard',
    desktopSize: '970x90 / 728x90',
    mobileSize: '320x100',
    minHeightClass: 'min-h-[90px]',
  },
  'between-categories': {
    id: 'between-categories',
    label: 'Category Divider Slot',
    format: 'responsive',
    desktopSize: '728x90 / Fluid',
    mobileSize: '320x100',
    minHeightClass: 'min-h-[90px]',
  },
  'between-cards': {
    id: 'between-cards',
    label: 'In-Feed Discovery Slot',
    format: 'responsive',
    desktopSize: 'Responsive In-Feed',
    mobileSize: '300x250 / Fluid',
    minHeightClass: 'min-h-[100px]',
  },
  'above-wheel': {
    id: 'above-wheel',
    label: 'Pre-Stage Header Slot',
    format: 'leaderboard',
    desktopSize: '728x90',
    mobileSize: '320x50',
    minHeightClass: 'min-h-[60px] md:min-h-[90px]',
  },
  'below-result': {
    id: 'below-result',
    label: 'Post-Spin Discovery Slot',
    format: 'responsive',
    desktopSize: '728x90 / 336x280',
    mobileSize: '300x250',
    minHeightClass: 'min-h-[100px]',
  },
  'builder-divider': {
    id: 'builder-divider',
    label: 'Builder Section Slot',
    format: 'responsive',
    desktopSize: '728x90 / Fluid',
    mobileSize: '320x100',
    minHeightClass: 'min-h-[90px]',
  },
  'bottom-banner': {
    id: 'bottom-banner',
    label: 'Footer Leaderboard Slot',
    format: 'leaderboard',
    desktopSize: '970x90 / 728x90',
    mobileSize: '320x100',
    minHeightClass: 'min-h-[90px]',
  },
  'desktop-sidebar': {
    id: 'desktop-sidebar',
    label: 'Desktop Sidebar Slot',
    format: 'skyscraper',
    desktopSize: '300x250 / 160x600',
    mobileSize: 'Hidden on mobile',
    minHeightClass: 'min-h-[250px]',
  },
  'mobile-inline': {
    id: 'mobile-inline',
    label: 'Mobile Inline Slot',
    format: 'mobile-banner',
    desktopSize: 'Hidden on desktop',
    mobileSize: '320x100 / 300x250',
    minHeightClass: 'min-h-[100px]',
  },
};

let adsenseScriptLoaded = false;

/**
 * Ensures third-party ad network scripts are loaded at most once in the SPA lifecycle.
 */
export function ensureAdNetworkInitialized(): void {
  if (typeof window === 'undefined' || !AD_CONFIG.enabled) return;

  if (
    AD_CONFIG.provider === 'adsense' &&
    AD_CONFIG.adsensePublisherId &&
    !adsenseScriptLoaded
  ) {
    const existing = document.querySelector(
      'script[data-spinverse-adsense="true"]'
    );
    if (!existing) {
      const script = document.createElement('script');
      script.async = true;
      script.crossOrigin = 'anonymous';
      script.dataset.spinverseAdsense = 'true';
      script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(
        AD_CONFIG.adsensePublisherId
      )}`;
      document.head.appendChild(script);
    }
    adsenseScriptLoaded = true;
  }
}

/**
 * Returns true only when an ad placement has a live ad or explicit dev preview enabled.
 */
export function isAdPlacementActive(placement: AdPlacementId): boolean {
  if (!AD_CONFIG.enabled) return false;
  const slot = AD_SLOTS[placement];
  if (AD_CONFIG.provider === 'adsense') {
    return Boolean(AD_CONFIG.adsensePublisherId && slot?.adSlotCode);
  }
  if (AD_CONFIG.provider === 'adsterra') {
    return Boolean(AD_CONFIG.adsterraKey);
  }
  if (AD_CONFIG.provider === 'custom') {
    return true;
  }
  return AD_CONFIG.showDevelopmentPlaceholders && !AD_CONFIG.hideWhenEmpty;
}
