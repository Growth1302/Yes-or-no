import type {
  DailyState,
  SpinRecord,
  StreakData,
  WheelConfig,
} from '../types/spinverse';

const KEYS = {
  CUSTOM_WHEELS: 'spinverse_custom_wheels_v1',
  FAVORITES: 'spinverse_favorites_v1',
  RECENT: 'spinverse_recent_v1',
  HISTORY: 'spinverse_history_v1',
  THEME: 'spinverse_theme',
  MUTED: 'spinverse_muted_v1',
  DAILY: 'spinverse_daily_v1',
  STREAK: 'spinverse_streak_v1',
};

export function getTodayDateKey(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function getYesterdayDateKey(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function safeRead<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function safeWrite<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage quota exceeded or disabled
  }
}

export function loadCustomWheels(): WheelConfig[] {
  return safeRead<WheelConfig[]>(KEYS.CUSTOM_WHEELS, []);
}

export function saveCustomWheels(wheels: WheelConfig[]): void {
  safeWrite(KEYS.CUSTOM_WHEELS, wheels);
}

export function loadFavorites(): string[] {
  return safeRead<string[]>(KEYS.FAVORITES, []);
}

export function saveFavorites(ids: string[]): void {
  safeWrite(KEYS.FAVORITES, ids);
}

export function loadRecentWheelIds(): string[] {
  return safeRead<string[]>(KEYS.RECENT, []);
}

export function saveRecentWheelIds(ids: string[]): void {
  safeWrite(KEYS.RECENT, ids.slice(0, 12));
}

export function loadSpinHistory(): SpinRecord[] {
  return safeRead<SpinRecord[]>(KEYS.HISTORY, []);
}

export function saveSpinHistory(records: SpinRecord[]): void {
  safeWrite(KEYS.HISTORY, records.slice(0, 150));
}

export function loadMuted(): boolean {
  return safeRead<boolean>(KEYS.MUTED, false);
}

export function saveMuted(muted: boolean): void {
  safeWrite(KEYS.MUTED, muted);
}

export function loadTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light';
  try {
    const stored = window.localStorage.getItem(KEYS.THEME);
    if (stored === 'dark' || stored === 'light') return stored;
    if (
      window.matchMedia &&
      window.matchMedia('(prefers-color-scheme: dark)').matches
    ) {
      return 'dark';
    }
  } catch {
    // ignore
  }
  return 'light';
}

export function saveTheme(theme: 'light' | 'dark'): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(KEYS.THEME, theme);
  } catch {
    // ignore
  }
}

export function loadDailyState(): DailyState {
  const today = getTodayDateKey();
  const saved = safeRead<DailyState | null>(KEYS.DAILY, null);
  if (saved && saved.dateKey === today) {
    return saved;
  }
  const fresh: DailyState = {
    dateKey: today,
    completedChallenge: false,
    completedMission: false,
    luckyChoiceSpun: false,
  };
  safeWrite(KEYS.DAILY, fresh);
  return fresh;
}

export function saveDailyState(state: DailyState): void {
  safeWrite(KEYS.DAILY, state);
}

export function loadStreak(): StreakData {
  const today = getTodayDateKey();
  const yesterday = getYesterdayDateKey();
  const saved = safeRead<StreakData>(KEYS.STREAK, {
    count: 0,
    lastSpinDate: null,
  });
  if (
    saved.lastSpinDate &&
    saved.lastSpinDate !== today &&
    saved.lastSpinDate !== yesterday
  ) {
    const reset: StreakData = { count: 0, lastSpinDate: saved.lastSpinDate };
    return reset;
  }
  return saved;
}

export function recordSpinForStreak(): StreakData {
  const today = getTodayDateKey();
  const yesterday = getYesterdayDateKey();
  const current = safeRead<StreakData>(KEYS.STREAK, {
    count: 0,
    lastSpinDate: null,
  });

  if (current.lastSpinDate === today) {
    return current;
  }

  let nextCount = 1;
  if (current.lastSpinDate === yesterday) {
    nextCount = current.count + 1;
  }

  const updated: StreakData = { count: nextCount, lastSpinDate: today };
  safeWrite(KEYS.STREAK, updated);
  return updated;
}

/**
 * Encodes a custom wheel into a compact URL-safe string for sharing.
 */
export function encodeWheelToShareParam(wheel: WheelConfig): string {
  const payload = {
    t: wheel.title,
    s: wheel.subtitle,
    w: Boolean(wheel.weightedMode),
    o: wheel.options.map((opt) => ({
      l: opt.label,
      c: opt.color,
      w: opt.weight ?? 1,
    })),
  };
  const json = JSON.stringify(payload);
  const bytes = new TextEncoder().encode(json);
  let binary = '';
  bytes.forEach((b) => {
    binary += String.fromCharCode(b);
  });
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function decodeWheelFromShareParam(param: string): WheelConfig | null {
  try {
    const base64 = param.replace(/-/g, '+').replace(/_/g, '/');
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    const json = new TextDecoder().decode(bytes);
    const parsed = JSON.parse(json) as {
      t?: string;
      s?: string;
      w?: boolean;
      o?: Array<{ l?: string; c?: string; w?: number }>;
    };

    if (!parsed || !parsed.t || !Array.isArray(parsed.o) || parsed.o.length < 2) {
      return null;
    }

    return {
      id: `shared-${Date.now()}`,
      title: String(parsed.t).slice(0, 80),
      subtitle: parsed.s
        ? String(parsed.s).slice(0, 140)
        : 'Shared custom wheel ready to spin.',
      category: 'custom',
      weightedMode: Boolean(parsed.w),
      keywords: ['custom', 'shared'],
      relatedIds: ['yes-no', 'what-to-eat', 'daily-motivation'],
      celebrationStyle: 'party',
      isCustom: true,
      createdAt: Date.now(),
      options: parsed.o.slice(0, 30).map((opt, idx) => ({
        id: `opt-shared-${idx}-${Math.random().toString(36).slice(2, 6)}`,
        label: String(opt.l || `Option ${idx + 1}`).slice(0, 50),
        color: /^#[0-9a-fA-F]{6}$/.test(String(opt.c))
          ? String(opt.c)
          : '#3B82F6',
        weight: typeof opt.w === 'number' && opt.w > 0 ? opt.w : 1,
      })),
    };
  } catch {
    return null;
  }
}
