import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Heart,
  Menu,
  Moon,
  PlusCircle,
  Share2,
  Shuffle,
  SlidersHorizontal,
  Sun,
  Volume2,
  VolumeX,
  X,
  Zap,
  ChevronLeft,
  ChevronRight,
  HeartHandshake,
} from 'lucide-react';
import {
  BUILT_IN_WHEELS,
  CATEGORY_META,
} from './data/wheels';
import { getUniquePositiveMessage } from './data/messages';
import type {
  DailyState,
  NavSectionId,
  SpinRecord,
  StreakData,
  ToastItem,
  WheelConfig,
  WheelOption,
} from './types/spinverse';
import {
  decodeWheelFromShareParam,
  loadCustomWheels,
  loadDailyState,
  loadFavorites,
  loadMuted,
  loadRecentWheelIds,
  loadSpinHistory,
  loadStreak,
  loadTheme,
  recordSpinForStreak,
  saveCustomWheels,
  saveDailyState,
  saveFavorites,
  saveMuted,
  saveRecentWheelIds,
  saveSpinHistory,
  saveTheme,
} from './utils/storage';
import { soundEngine } from './utils/sound';
import { SpinningWheel } from './components/SpinningWheel';
import { ResultModal } from './components/ResultModal';
import { ConfettiCanvas } from './components/ConfettiCanvas';
import { WheelCard } from './components/WheelCard';
import { CustomWheelBuilder } from './components/CustomWheelBuilder';
import { DailyExperienceBar } from './components/DailyExperienceBar';
import { HistoryPanel } from './components/HistoryPanel';
import { SmartFinder } from './components/SmartFinder';
import { AdSlot } from './components/AdSlot';
import { isAdPlacementActive } from './config/ads';
import { ToastContainer } from './components/ToastContainer';

const NAV_ITEMS: Array<{ id: NavSectionId; label: string }> = [
  { id: 'home', label: 'Home' },
  { id: 'decision', label: 'Decision Wheels' },
  { id: 'daily', label: 'Daily Life' },
  { id: 'fun', label: 'Fun & Games' },
  { id: 'motivation', label: 'Motivation' },
  { id: 'custom', label: 'Custom Wheel' },
  { id: 'history', label: 'Spin History' },
];

export default function App() {
  // Core Navigation & Theme State
  const [activeSection, setActiveSection] = useState<NavSectionId>('home');
  const [decisionFilter, setDecisionFilter] = useState<
    'all' | 'decision' | 'difficult'
  >('all');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => loadTheme());
  const [isMuted, setIsMuted] = useState<boolean>(() => loadMuted());

  // Persistent User Collections
  const [customWheels, setCustomWheels] = useState<WheelConfig[]>(() =>
    loadCustomWheels()
  );
  const [favorites, setFavorites] = useState<string[]>(() => loadFavorites());
  const [recentIds, setRecentIds] = useState<string[]>(() =>
    loadRecentWheelIds()
  );
  const [history, setHistory] = useState<SpinRecord[]>(() => loadSpinHistory());
  const [dailyState, setDailyState] = useState<DailyState>(() =>
    loadDailyState()
  );
  const [streak, setStreak] = useState<StreakData>(() => loadStreak());

  // Active Wheel State (preserved across section switches)
  const [activeWheel, setActiveWheel] = useState<WheelConfig>(
    () => BUILT_IN_WHEELS[0]
  );
  const [removedOptionIds, setRemovedOptionIds] = useState<string[]>([]);
  const [shuffledOrder, setShuffledOrder] = useState<string[] | null>(null);
  const [spinTrigger, setSpinTrigger] = useState(0);

  // Spin Result & Celebration State
  const [latestResult, setLatestResult] = useState<{
    wheel: WheelConfig;
    winner: WheelOption;
    message: string;
    nextStep: string;
  } | null>(null);
  const [resultModalOpen, setResultModalOpen] = useState(false);
  const [confettiActive, setConfettiActive] = useState(false);
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  // Mobile Swipe Gesture Tracking for Category Carousel
  const touchStartXRef = useRef<number | null>(null);
  const wheelStageRef = useRef<HTMLElement>(null);

  const allWheels = useMemo(
    () => [...customWheels, ...BUILT_IN_WHEELS],
    [customWheels]
  );

  // Sync theme class on <html>
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    saveTheme(theme);
  }, [theme]);

  // Sync mute state
  useEffect(() => {
    soundEngine.setMuted(isMuted);
    saveMuted(isMuted);
  }, [isMuted]);

  const notify = useCallback(
    (message: string, type: ToastItem['type'] = 'success') => {
      const id = `t-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      setToasts((prev) => [...prev.slice(-2), { id, message, type }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 3000);
    },
    []
  );

  // Check URL for shared custom wheel on mount
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const sharedParam = params.get('wheel');
      if (sharedParam) {
        const decoded = decodeWheelFromShareParam(sharedParam);
        if (decoded) {
          setCustomWheels((prev) => {
            const next = [decoded, ...prev];
            saveCustomWheels(next);
            return next;
          });
          setActiveWheel(decoded);
          setRemovedOptionIds([]);
          setShuffledOrder(null);
          notify(`Loaded shared custom wheel "${decoded.title}"!`);
          // Clean query parameter cleanly without reloading
          const cleanUrl = `${window.location.pathname}${window.location.hash}`;
          window.history.replaceState({}, '', cleanUrl);
        }
      }
    } catch {
      // ignore invalid share param
    }
  }, [notify]);

  const activeOptions = useMemo(() => {
    let opts = activeWheel.options.filter(
      (o) => !removedOptionIds.includes(o.id)
    );
    if (shuffledOrder && shuffledOrder.length > 0) {
      const orderMap = new Map(shuffledOrder.map((id, idx) => [id, idx]));
      opts = [...opts].sort(
        (a, b) => (orderMap.get(a.id) ?? 999) - (orderMap.get(b.id) ?? 999)
      );
    }
    return opts;
  }, [activeWheel, removedOptionIds, shuffledOrder]);

  const scrollToWheelStage = useCallback(() => {
    if (wheelStageRef.current) {
      wheelStageRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, []);

  const handleSelectWheel = useCallback(
    (wheel: WheelConfig, autoSpin: boolean = false) => {
      soundEngine.playClick();
      setActiveWheel(wheel);
      setRemovedOptionIds([]);
      setShuffledOrder(null);
      setResultModalOpen(false);
      scrollToWheelStage();
      if (autoSpin) {
        setTimeout(() => {
          setSpinTrigger((n) => n + 1);
        }, 250);
      }
    },
    [scrollToWheelStage]
  );

  const handleNavigate = (section: NavSectionId) => {
    soundEngine.playClick();
    setActiveSection(section);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleQuickYesNo = () => {
    const yesNo = BUILT_IN_WHEELS.find((w) => w.id === 'yes-no')!;
    handleSelectWheel(yesNo, true);
  };

  const handleSurpriseMe = () => {
    const pool = allWheels.filter((w) => w.id !== activeWheel.id);
    const chosen = pool[Math.floor(Math.random() * pool.length)] || allWheels[0];
    notify(`Surprise pick: ${chosen.title}`);
    handleSelectWheel(chosen, false);
  };

  const handleToggleFavorite = (wheelId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    soundEngine.playClick();
    setFavorites((prev) => {
      const exists = prev.includes(wheelId);
      const next = exists
        ? prev.filter((id) => id !== wheelId)
        : [wheelId, ...prev];
      saveFavorites(next);
      notify(exists ? 'Removed from favorites.' : 'Added to favorites!');
      return next;
    });
  };

  const handleShuffleActiveOptions = () => {
    const ids = activeOptions.map((o) => o.id);
    for (let i = ids.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [ids[i], ids[j]] = [ids[j], ids[i]];
    }
    setShuffledOrder(ids);
    notify('Wheel segments shuffled.');
  };

  const handleRemoveOption = (optionId: string) => {
    if (activeOptions.length <= 2) {
      notify('At least 2 options must remain on the wheel.', 'warning');
      return;
    }
    setRemovedOptionIds((prev) => [...prev, optionId]);
  };

  const handleSpinComplete = useCallback(
    (winner: WheelOption) => {
      const { message, nextStep } = getUniquePositiveMessage(
        winner.tone,
        activeWheel.category,
        winner.label
      );

      setLatestResult({
        wheel: activeWheel,
        winner,
        message,
        nextStep,
      });
      setResultModalOpen(true);
      setConfettiActive(true);
      setTimeout(() => setConfettiActive(false), 3200);

      // Update Spin History
      const newRecord: SpinRecord = {
        id: `spin-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        wheelId: activeWheel.id,
        wheelTitle: activeWheel.title,
        category: activeWheel.category,
        resultLabel: winner.label,
        resultColor: winner.color,
        message,
        nextStep,
        timestamp: Date.now(),
      };
      setHistory((prev) => {
        const next = [newRecord, ...prev].slice(0, 150);
        saveSpinHistory(next);
        return next;
      });

      // Update Recently Used Wheels
      setRecentIds((prev) => {
        const next = [
          activeWheel.id,
          ...prev.filter((id) => id !== activeWheel.id),
        ].slice(0, 12);
        saveRecentWheelIds(next);
        return next;
      });

      // Update Daily Streak
      const updatedStreak = recordSpinForStreak();
      setStreak(updatedStreak);
    },
    [activeWheel]
  );

  // Custom Wheel CRUD Handlers
  const handleSaveCustomWheel = (wheel: WheelConfig) => {
    setCustomWheels((prev) => {
      const exists = prev.some((w) => w.id === wheel.id);
      const next = exists
        ? prev.map((w) => (w.id === wheel.id ? wheel : w))
        : [wheel, ...prev];
      saveCustomWheels(next);
      return next;
    });
    if (activeWheel.id === wheel.id) {
      setActiveWheel(wheel);
      setRemovedOptionIds([]);
    }
  };

  const handleDeleteCustomWheel = (wheelId: string) => {
    setCustomWheels((prev) => {
      const next = prev.filter((w) => w.id !== wheelId);
      saveCustomWheels(next);
      return next;
    });
    notify('Custom wheel deleted.');
  };

  // Derived collections
  const favoriteWheels = useMemo(
    () =>
      favorites
        .map((id) => allWheels.find((w) => w.id === id))
        .filter((w): w is WheelConfig => Boolean(w)),
    [favorites, allWheels]
  );

  const recentWheels = useMemo(
    () =>
      recentIds
        .map((id) => allWheels.find((w) => w.id === id))
        .filter((w): w is WheelConfig => Boolean(w)),
    [recentIds, allWheels]
  );

  const relatedWheels = useMemo(() => {
    const byId = activeWheel.relatedIds
      .map((id) => allWheels.find((w) => w.id === id))
      .filter((w): w is WheelConfig => Boolean(w));
    if (byId.length >= 2) return byId;
    return BUILT_IN_WHEELS.filter((w) => w.id !== activeWheel.id).slice(0, 2);
  }, [activeWheel, allWheels]);

  // Wheels filtered by current section
  const decisionQuickWheels = useMemo(
    () => BUILT_IN_WHEELS.filter((w) => w.category === 'decision'),
    []
  );
  const difficultWheels = useMemo(
    () => BUILT_IN_WHEELS.filter((w) => w.category === 'difficult'),
    []
  );
  const dailyWheels = useMemo(
    () => BUILT_IN_WHEELS.filter((w) => w.category === 'daily'),
    []
  );
  const funWheels = useMemo(
    () => BUILT_IN_WHEELS.filter((w) => w.category === 'fun'),
    []
  );
  const motivationWheels = useMemo(
    () => BUILT_IN_WHEELS.filter((w) => w.category === 'motivation'),
    []
  );

  // Mobile swipe navigation across primary wheel categories
  const swipeableSections: NavSectionId[] = [
    'home',
    'decision',
    'daily',
    'fun',
    'motivation',
  ];

  const handleSectionTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
  };

  const handleSectionTouchEnd = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartXRef.current;
    touchStartXRef.current = null;
    if (Math.abs(dx) < 75) return;

    const currentIdx = swipeableSections.indexOf(activeSection);
    if (currentIdx === -1) return;
    if (dx < 0 && currentIdx < swipeableSections.length - 1) {
      handleNavigate(swipeableSections[currentIdx + 1]);
    } else if (dx > 0 && currentIdx > 0) {
      handleNavigate(swipeableSections[currentIdx - 1]);
    }
  };

  const renderCategoryGrid = (
    title: string,
    description: string,
    wheels: WheelConfig[],
    includeInFeedAd: boolean = false
  ) => (
    <div className="space-y-5">
      <div>
        <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
          {title}
        </h2>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 mt-1 max-w-2xl">
          {description}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {wheels.slice(0, 6).map((w) => (
          <WheelCard
            key={w.id}
            wheel={w}
            isActive={activeWheel.id === w.id}
            isFavorite={favorites.includes(w.id)}
            onSelect={(wheel) => handleSelectWheel(wheel, false)}
            onToggleFavorite={handleToggleFavorite}
          />
        ))}
      </div>

      {includeInFeedAd && wheels.length > 6 && (
        <AdSlot placement="between-cards" />
      )}

      {wheels.length > 6 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {wheels.slice(6).map((w) => (
            <WheelCard
              key={w.id}
              wheel={w}
              isActive={activeWheel.id === w.id}
              isFavorite={favorites.includes(w.id)}
              onSelect={(wheel) => handleSelectWheel(wheel, false)}
              onToggleFavorite={handleToggleFavorite}
            />
          ))}
        </div>
      )}
    </div>
  );

  // Quick-switch chips inside the wheel stage
  const stageCategoryWheels = useMemo(() => {
    if (activeSection === 'decision') {
      return [...decisionQuickWheels, ...difficultWheels].slice(0, 8);
    }
    if (activeSection === 'daily') return dailyWheels.slice(0, 8);
    if (activeSection === 'fun') return funWheels.slice(0, 8);
    if (activeSection === 'motivation') return motivationWheels.slice(0, 8);
    return [
      BUILT_IN_WHEELS[0], // Yes or No
      BUILT_IN_WHEELS[10], // What Should I Eat?
      BUILT_IN_WHEELS[22], // Confused Mind Wheel
      BUILT_IN_WHEELS[32], // Truth or Dare
      BUILT_IN_WHEELS[44], // Daily Motivation
      BUILT_IN_WHEELS[3], // Take the Risk or Stay Safe
    ];
  }, [
    activeSection,
    decisionQuickWheels,
    difficultWheels,
    dailyWheels,
    funWheels,
    motivationWheels,
  ]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#090D16] text-slate-900 dark:text-slate-100 transition-colors duration-200">
      {/* Confetti Celebration Layer */}
      <ConfettiCanvas
        active={confettiActive}
        styleType={latestResult?.wheel.celebrationStyle || 'burst'}
      />

      {/* Sticky Top Bar (3-zone contract: Wordmark — Single-Line Nav — Primary CTA) */}
      <header className="sticky top-0 z-40 h-14 md:h-16 bg-white/90 dark:bg-[#090D16]/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80">
        <div className="max-w-7xl mx-auto h-full px-4 sm:px-6 flex items-center justify-between gap-4 lg:gap-8">
          {/* Zone 1: Brand Wordmark */}
          <button
            type="button"
            onClick={() => handleNavigate('home')}
            className="font-display text-xl sm:text-2xl font-extrabold tracking-tight bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-blue-500 rounded"
          >
            SPINVERSE
          </button>

          {/* Zone 2: Single-Line Navigation Links (Desktop) */}
          <nav
            aria-label="Main navigation"
            className="hidden lg:flex items-center gap-5 xl:gap-6"
          >
            {NAV_ITEMS.map((item) => {
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleNavigate(item.id)}
                  className={`relative py-1.5 text-sm font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    isActive
                      ? 'text-blue-600 dark:text-blue-400 font-semibold'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <span>{item.label}</span>
                  {isActive && (
                    <span
                      aria-hidden="true"
                      className="absolute left-0 right-0 -bottom-[1px] h-0.5 rounded-full bg-gradient-to-r from-blue-600 to-purple-600"
                    />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Primary Action + Mobile Menu Trigger */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleQuickYesNo}
              className="inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white text-xs sm:text-sm font-semibold shadow-xs transition-all cursor-pointer whitespace-nowrap shrink-0"
            >
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>Quick Spin</span>
            </button>

            <button
              type="button"
              onClick={() => setMobileMenuOpen((v) => !v)}
              aria-expanded={mobileMenuOpen}
              aria-label="Toggle navigation menu"
              className="lg:hidden p-2 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 py-3 shadow-lg">
            <nav
              aria-label="Mobile navigation"
              className="grid grid-cols-2 gap-2"
            >
              {NAV_ITEMS.map((item) => {
                const isActive = activeSection === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleNavigate(item.id)}
                    className={`px-3 py-2.5 rounded-xl text-left text-sm font-medium transition-colors cursor-pointer ${
                      isActive
                        ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-semibold'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </nav>
          </div>
        )}
      </header>

      {/* Workspace Preferences Bar (Theme, Sound, Active Wheel Pill-Free Status) */}
      <div className="border-b border-slate-200/70 dark:border-slate-800/70 bg-white/60 dark:bg-slate-900/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 min-w-0">
            <span className="font-medium text-slate-500 dark:text-slate-400">
              Active Wheel:
            </span>
            <button
              type="button"
              onClick={scrollToWheelStage}
              className="font-semibold text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 truncate max-w-[200px] sm:max-w-none cursor-pointer"
            >
              {activeWheel.title}
            </button>
            <span aria-hidden="true" className="hidden sm:inline text-slate-300 dark:text-slate-700">
              ·
            </span>
            <span className="hidden sm:inline text-slate-500 dark:text-slate-400 tabular-nums">
              {allWheels.length} total wheels available
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => handleNavigate('custom')}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer whitespace-nowrap"
            >
              <PlusCircle className="w-3.5 h-3.5 text-blue-500" />
              <span>Create Wheel</span>
            </button>

            <button
              type="button"
              onClick={() => setIsMuted((m) => !m)}
              aria-label={isMuted ? 'Unmute spin sounds' : 'Mute spin sounds'}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer whitespace-nowrap"
            >
              {isMuted ? (
                <VolumeX className="w-3.5 h-3.5 text-rose-500" />
              ) : (
                <Volume2 className="w-3.5 h-3.5 text-emerald-500" />
              )}
              <span className="hidden sm:inline">
                {isMuted ? 'Muted' : 'Sound'}
              </span>
            </button>

            <button
              type="button"
              onClick={() =>
                setTheme((t) => (t === 'dark' ? 'light' : 'dark'))
              }
              aria-label={
                theme === 'dark'
                  ? 'Switch to light theme'
                  : 'Switch to dark theme'
              }
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer whitespace-nowrap"
            >
              {theme === 'dark' ? (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                  <span className="hidden sm:inline">Light</span>
                </>
              ) : (
                <>
                  <Moon className="w-3.5 h-3.5 text-indigo-600" />
                  <span className="hidden sm:inline">Dark</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* AD SLOT 1: Top Horizontal Banner Below Navigation (Desktop/Tablet; mobile places ads below the wheel) */}
      <div className="hidden md:block max-w-7xl mx-auto w-full px-4 sm:px-6 pt-2">
        <AdSlot placement="top-banner" />
      </div>

      {/* Main Content Container */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-3 sm:px-6 pt-3 md:pt-0 pb-16 space-y-8 sm:space-y-10">
        {/* ============================================================
            HOME SECTION (HERO + LARGE WHEEL + HOW IT WORKS + DAILY + FINDER)
            ============================================================ */}
        {activeSection === 'home' && (
          <>
            <section
              ref={wheelStageRef}
              aria-labelledby="hero-headline"
              className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-4 sm:p-8 lg:p-12 shadow-xs"
            >
              {/* Subtle Floating Geometric Particles (compositor-only, reduced-motion safe) */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -top-16 -right-16 w-64 h-64 rounded-full bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 blur-2xl animate-float-slow"
              />
              <div
                aria-hidden="true"
                className="pointer-events-none absolute bottom-6 left-8 w-32 h-32 rounded-full bg-gradient-to-tr from-cyan-400/10 to-amber-400/10 blur-xl animate-float-alt"
              />

              <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-center">
                {/* Left on Desktop / Second on Mobile: Hero Copy, Primary Actions, How It Works */}
                <div className="order-2 lg:order-1 lg:col-span-6 space-y-5 sm:space-y-6">
                                <div className="text-xs sm:text-sm font-medium text-blue-600 dark:text-blue-400">
                    54 Curated Wheels · Custom Builder · Instant Clarity
                  </div>

                  <h1
                    id="hero-headline"
                    className="font-display text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.1]"
                    style={{ textWrap: 'balance' }}
                  >
                    Can&apos;t Decide? Let{' '}
                    <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                      SPINVERSE
                    </span>{' '}
                    Decide!
                  </h1>

                  <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-xl">
                    Big decisions, small choices, everyday confusion. One spin
                    can make things easier!
                  </p>

                  {/* Hero CTAs */}
                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        soundEngine.playClick();
                        setSpinTrigger((n) => n + 1);
                      }}
                      className="px-7 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-display font-bold text-base shadow-md hover:shadow-lg active:scale-[0.98] transition-all cursor-pointer whitespace-nowrap"
                    >
                      SPIN NOW
                    </button>

                    <button
                      type="button"
                      onClick={handleQuickYesNo}
                      className="px-5 py-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/70 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 font-semibold text-sm transition-colors cursor-pointer whitespace-nowrap"
                    >
                      YES / NO Quick Spin
                    </button>

                    <button
                      type="button"
                      onClick={() => handleNavigate('decision')}
                      className="px-5 py-3.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 font-semibold text-sm transition-colors cursor-pointer whitespace-nowrap"
                    >
                      Explore All Wheels
                    </button>
                  </div>

                  {/* Quick Switcher for Active Wheel on Hero */}
                  <div className="pt-1">
                    <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">
                      Quick switch wheel:
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {stageCategoryWheels.map((w) => (
                        <button
                          key={w.id}
                          type="button"
                          onClick={() => handleSelectWheel(w, false)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                            activeWheel.id === w.id
                              ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
                              : 'bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'
                          }`}
                        >
                          {w.title}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 4-Step How It Works */}
                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      { num: '01.', text: 'Choose your wheel.' },
                      { num: '02.', text: 'Spin the wheel.' },
                      { num: '03.', text: 'Discover your result.' },
                      { num: '04.', text: 'Enjoy your next step!' },
                    ].map((step) => (
                      <div key={step.num} className="space-y-0.5">
                        <div className="font-mono-nums text-xs font-semibold text-blue-600 dark:text-blue-400">
                          {step.num}
                        </div>
                        <div className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-200">
                          {step.text}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right on Desktop / Top on Mobile: Live Interactive Spinning Wheel */}
                <div className="order-1 lg:order-2 lg:col-span-6 flex flex-col items-center w-full">
                  <div className="mb-2 sm:mb-3 text-center">
                    <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
                      {CATEGORY_META[activeWheel.category].shortName} ·{' '}
                      <span className="tabular-nums">
                        {activeOptions.length} slices
                      </span>
                    </div>
                    <h2 className="font-display text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                      {activeWheel.title}
                    </h2>
                  </div>

                  <SpinningWheel
                    wheel={activeWheel}
                    activeOptions={activeOptions}
                    removedCount={removedOptionIds.length}
                    isMuted={isMuted}
                    onToggleMute={() => setIsMuted((m) => !m)}
                    onSpinComplete={handleSpinComplete}
                    onRemoveOption={handleRemoveOption}
                    onResetRemoved={() => setRemovedOptionIds([])}
                    onShuffleOptions={handleShuffleActiveOptions}
                    externalSpinTrigger={spinTrigger}
                    compact
                  />
                </div>
              </div>
            </section>

            {/* AD SLOT 2: Hero Bottom Horizontal Banner */}
            <AdSlot placement="hero-bottom" />

            {/* Daily Spin Experience Hub */}
            <DailyExperienceBar
              dailyState={dailyState}
              streak={streak}
              onSpinWheelNow={(wheel) => handleSelectWheel(wheel, true)}
              onToggleChallengeComplete={() => {
                soundEngine.playClick();
                const next: DailyState = {
                  ...dailyState,
                  completedChallenge: !dailyState.completedChallenge,
                };
                setDailyState(next);
                saveDailyState(next);
                notify(
                  next.completedChallenge
                    ? 'Daily challenge marked complete!'
                    : 'Daily challenge unchecked.'
                );
              }}
              onToggleMissionComplete={() => {
                soundEngine.playClick();
                const next: DailyState = {
                  ...dailyState,
                  completedMission: !dailyState.completedMission,
                };
                setDailyState(next);
                saveDailyState(next);
                notify(
                  next.completedMission
                    ? 'Daily mission marked complete!'
                    : 'Daily mission unchecked.'
                );
              }}
              onSurpriseMe={handleSurpriseMe}
            />

            {/* Smart Wheel Finder */}
            <SmartFinder
              allWheels={allWheels}
              onSelectWheel={(w) => handleSelectWheel(w, false)}
              onSurpriseMe={handleSurpriseMe}
            />

            {/* AD SLOT 10: Mobile-Only Inline Ad Placement */}
            {isAdPlacementActive('mobile-inline') && (
              <div className="md:hidden">
                <AdSlot placement="mobile-inline" />
              </div>
            )}

            {/* AD SLOT 3: Between Wheel Category Sections */}
            <AdSlot placement="between-categories" />

            {/* Popular Wheels Showcase + Desktop Optional Sidebar Ad */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
              <div
                className={`${
                  isAdPlacementActive('desktop-sidebar')
                    ? 'xl:col-span-9'
                    : 'xl:col-span-12'
                } space-y-8`}
                onTouchStart={handleSectionTouchStart}
                onTouchEnd={handleSectionTouchEnd}
              >
                <div className="flex flex-wrap items-end justify-between gap-4">
                  <div>
                    <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                      Explore Wheel Categories
                    </h2>
                    <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
                      Jump into any category for quick answers, daily life plans, reflection, games, or motivation.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleNavigate('custom')}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-semibold cursor-pointer whitespace-nowrap"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>Build Custom Wheel</span>
                  </button>
                </div>

                {/* Category Shortcut Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {(
                    [
                      {
                        nav: 'decision' as NavSectionId,
                        title: 'Quick Decisions',
                        count: decisionQuickWheels.length,
                        desc: 'Yes or No, Take the Risk, Wait or Go, and instant tie-breakers.',
                        color: '#2563EB',
                      },
                      {
                        nav: 'decision' as NavSectionId,
                        title: 'Difficult Decisions',
                        count: difficultWheels.length,
                        desc: 'Overthinking Breaker, Confused Mind, and gentle reflection wheels.',
                        color: '#7C3AED',
                        filter: 'difficult' as const,
                      },
                      {
                        nav: 'daily' as NavSectionId,
                        title: 'Daily Life',
                        count: dailyWheels.length,
                        desc: 'What to Eat, What to Watch, Morning Routine, and Weekend Plans.',
                        color: '#06B6D4',
                      },
                      {
                        nav: 'fun' as NavSectionId,
                        title: 'Fun & Games',
                        count: funWheels.length,
                        desc: 'Truth or Dare, Who Pays Today, Party Games, and Lucky Color.',
                        color: '#EC4899',
                      },
                      {
                        nav: 'motivation' as NavSectionId,
                        title: 'Motivation',
                        count: motivationWheels.length,
                        desc: 'Confidence Booster, Small Step Challenge, Gratitude, and Fresh Start.',
                        color: '#F97316',
                      },
                      {
                        nav: 'custom' as NavSectionId,
                        title: 'Custom Wheel Builder',
                        count: customWheels.length,
                        desc: 'Create, color, weight, save, and share your own custom wheels.',
                        color: '#10B981',
                      },
                    ] as const
                  ).map((cat) => (
                    <button
                      key={cat.title}
                      type="button"
                      onClick={() => {
                        if ('filter' in cat && cat.filter) {
                          setDecisionFilter(cat.filter);
                        } else if (cat.nav === 'decision') {
                          setDecisionFilter('all');
                        }
                        handleNavigate(cat.nav);
                      }}
                      className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-500 text-left transition-all hover:-translate-y-0.5 hover:shadow-md cursor-pointer flex flex-col justify-between gap-4"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2">
                          <span
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: cat.color }}
                          />
                          <span className="text-xs font-mono-nums text-slate-500 dark:text-slate-400">
                            {cat.count} {cat.count === 1 ? 'wheel' : 'wheels'}
                          </span>
                        </div>
                        <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white mt-3">
                          {cat.title}
                        </h3>
                        <p className="text-sm text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                          {cat.desc}
                        </p>
                      </div>
                      <div className="text-xs font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-1">
                        <span>Open Category</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </div>
                    </button>
                  ))}
                </div>

                {/* Featured Popular Wheels */}
                {renderCategoryGrid(
                  'Popular Wheels Ready to Spin',
                  'Pick any favorite below to load it onto the stage immediately.',
                  [
                    BUILT_IN_WHEELS[0],
                    BUILT_IN_WHEELS[10],
                    BUILT_IN_WHEELS[12],
                    BUILT_IN_WHEELS[22],
                    BUILT_IN_WHEELS[32],
                    BUILT_IN_WHEELS[44],
                    BUILT_IN_WHEELS[35],
                    BUILT_IN_WHEELS[23],
                    BUILT_IN_WHEELS[51],
                  ],
                  true
                )}
              </div>

              {/* AD SLOT 9: Optional Desktop Sidebar Advertisement */}
              {isAdPlacementActive('desktop-sidebar') && (
                <div className="hidden xl:block xl:col-span-3 sticky top-24">
                  <AdSlot placement="desktop-sidebar" />
                </div>
              )}
            </div>
          </>
        )}

        {/* ============================================================
            ACTIVE WHEEL STAGE FOR DEDICATED CATEGORY SECTIONS
            ============================================================ */}
        {(activeSection === 'decision' ||
          activeSection === 'daily' ||
          activeSection === 'fun' ||
          activeSection === 'motivation') && (
          <div
            className="space-y-8"
            onTouchStart={handleSectionTouchStart}
            onTouchEnd={handleSectionTouchEnd}
          >
            {/* AD SLOT 5: Above the Wheel Interaction Area (Desktop/Tablet so mobile wheel sits at top) */}
            <div className="hidden md:block">
              <AdSlot placement="above-wheel" />
            </div>

            {/* Dedicated Interactive Wheel Workspace */}
            <section
              ref={wheelStageRef}
              aria-label="Active Wheel Stage"
              className="rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 sm:p-8 shadow-xs"
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                {/* Left: Wheel Engine */}
                <div className="lg:col-span-7 flex flex-col items-center">
                  <SpinningWheel
                    wheel={activeWheel}
                    activeOptions={activeOptions}
                    removedCount={removedOptionIds.length}
                    isMuted={isMuted}
                    onToggleMute={() => setIsMuted((m) => !m)}
                    onSpinComplete={handleSpinComplete}
                    onRemoveOption={handleRemoveOption}
                    onResetRemoved={() => setRemovedOptionIds([])}
                    onShuffleOptions={handleShuffleActiveOptions}
                    externalSpinTrigger={spinTrigger}
                  />
                </div>

                {/* Right: Active Wheel Info, Options & Latest Result */}
                <div className="lg:col-span-5 space-y-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-xs font-medium text-blue-600 dark:text-blue-400">
                        {CATEGORY_META[activeWheel.category].name}
                      </div>
                      <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mt-0.5">
                        {activeWheel.title}
                      </h1>
                      <p className="text-sm text-slate-600 dark:text-slate-300 mt-1.5 leading-relaxed">
                        {activeWheel.subtitle}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleToggleFavorite(activeWheel.id)}
                      aria-label="Favorite active wheel"
                      className={`p-2.5 rounded-xl border transition-colors cursor-pointer shrink-0 ${
                        favorites.includes(activeWheel.id)
                          ? 'border-pink-300 bg-pink-50 dark:bg-pink-950/30 text-pink-500'
                          : 'border-slate-200 dark:border-slate-800 text-slate-400 hover:text-pink-500'
                      }`}
                    >
                      <Heart
                        className={`w-5 h-5 ${
                          favorites.includes(activeWheel.id)
                            ? 'fill-current'
                            : ''
                        }`}
                      />
                    </button>
                  </div>

                  {activeWheel.supportiveGuidance && (
                    <div className="p-3.5 rounded-xl bg-purple-50/80 dark:bg-purple-950/25 border border-purple-100 dark:border-purple-900/40 flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                      <HeartHandshake className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
                      <span>
                        Supportive reflection tool: for major medical, legal, financial, or life-changing decisions, combine your intuition with thoughtful planning.
                      </span>
                    </div>
                  )}

                  {/* Quick Switcher within Section */}
                  <div>
                    <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">
                      Quick-load wheels in this section:
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {stageCategoryWheels.map((w) => (
                        <button
                          key={w.id}
                          type="button"
                          onClick={() => handleSelectWheel(w, false)}
                          className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                            activeWheel.id === w.id
                              ? 'bg-blue-600 text-white'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                          }`}
                        >
                          {w.title}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Active Options Overview */}
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2.5">
                      <span>Wheel Options ({activeOptions.length})</span>
                      {activeWheel.weightedMode && <span>Weighted Odds</span>}
                    </div>
                    <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto">
                      {activeOptions.map((opt) => (
                        <span
                          key={opt.id}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-xs font-medium text-slate-700 dark:text-slate-200"
                        >
                          <span
                            className="w-2 h-2 rounded-full shrink-0"
                            style={{ backgroundColor: opt.color }}
                          />
                          <span>{opt.label}</span>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Latest Spin Result Card Inline */}
                  {latestResult && latestResult.wheel.id === activeWheel.id && (
                    <div className="p-4 rounded-2xl bg-blue-50/70 dark:bg-blue-950/25 border border-blue-100 dark:border-blue-900/40 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-blue-700 dark:text-blue-300">
                          Latest Result
                        </span>
                        <button
                          type="button"
                          onClick={() => setResultModalOpen(true)}
                          className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                        >
                          Open Result Card
                        </button>
                      </div>
                      <div className="font-display text-xl font-bold text-slate-900 dark:text-white">
                        {latestResult.winner.label}
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300">
                        {latestResult.message}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* AD SLOT 6: Below the Wheel Result Area */}
            <AdSlot placement="below-result" />

            {/* Mobile Swipe Hint Bar */}
            <div className="flex md:hidden items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-1">
              <button
                type="button"
                onClick={() => {
                  const idx = swipeableSections.indexOf(activeSection);
                  if (idx > 0) handleNavigate(swipeableSections[idx - 1]);
                }}
                className="inline-flex items-center gap-1 font-medium cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>
              <span>Swipe left/right between categories</span>
              <button
                type="button"
                onClick={() => {
                  const idx = swipeableSections.indexOf(activeSection);
                  if (idx < swipeableSections.length - 1)
                    handleNavigate(swipeableSections[idx + 1]);
                }}
                className="inline-flex items-center gap-1 font-medium cursor-pointer"
              >
                <span>Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Category Catalog Grid + Desktop Sidebar */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
              <div
                className={`${
                  isAdPlacementActive('desktop-sidebar')
                    ? 'xl:col-span-9'
                    : 'xl:col-span-12'
                } space-y-10`}
              >
                {activeSection === 'decision' && (
                  <>
                    {/* Filter Tabs for Quick vs Difficult Decision Wheels */}
                    <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                      <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
                        <SlidersHorizontal className="w-4 h-4 text-blue-500" />
                        <span>Decision Wheel Filter</span>
                      </div>
                      <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-800">
                        {(
                          [
                            { id: 'all', label: 'All (20)' },
                            { id: 'decision', label: 'Quick Decisions (10)' },
                            { id: 'difficult', label: 'Difficult Decisions (10)' },
                          ] as const
                        ).map((tab) => (
                          <button
                            key={tab.id}
                            type="button"
                            onClick={() => setDecisionFilter(tab.id)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                              decisionFilter === tab.id
                                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                            }`}
                          >
                            {tab.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {(decisionFilter === 'all' ||
                      decisionFilter === 'decision') &&
                      renderCategoryGrid(
                        'Quick Decision Wheels',
                        CATEGORY_META.decision.description,
                        decisionQuickWheels,
                        true
                      )}

                    {decisionFilter === 'all' && (
                      <AdSlot placement="between-categories" />
                    )}

                    {(decisionFilter === 'all' ||
                      decisionFilter === 'difficult') &&
                      renderCategoryGrid(
                        'Difficult Decision Wheels',
                        'Thoughtful reflection wheels designed for overthinking, tough crossroads, and calm clarity.',
                        difficultWheels,
                        true
                      )}
                  </>
                )}

                {activeSection === 'daily' &&
                  renderCategoryGrid(
                    'Daily Life Wheels',
                    CATEGORY_META.daily.description,
                    dailyWheels,
                    true
                  )}

                {activeSection === 'fun' &&
                  renderCategoryGrid(
                    'Fun & Entertainment Wheels',
                    CATEGORY_META.fun.description,
                    funWheels,
                    true
                  )}

                {activeSection === 'motivation' &&
                  renderCategoryGrid(
                    'Motivation Wheels',
                    CATEGORY_META.motivation.description,
                    motivationWheels,
                    true
                  )}
              </div>

              {isAdPlacementActive('desktop-sidebar') && (
                <div className="hidden xl:block xl:col-span-3 sticky top-24">
                  <AdSlot placement="desktop-sidebar" />
                </div>
              )}
            </div>
          </div>
        )}

        {/* ============================================================
            CUSTOM WHEEL SECTION
            ============================================================ */}
        {activeSection === 'custom' && (
          <div className="space-y-8">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <h1 className="font-display text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white tracking-tight">
                  Custom Wheel Studio
                </h1>
                <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 mt-1 max-w-2xl">
                  Build your own wheels with custom colors, drag-and-drop ordering, weighted odds, local saving, and shareable links.
                </p>
              </div>
              <button
                type="button"
                onClick={handleSurpriseMe}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:border-blue-400 cursor-pointer"
              >
                <Shuffle className="w-3.5 h-3.5" />
                <span>Try Random Built-In Wheel</span>
              </button>
            </div>

            <CustomWheelBuilder
              savedWheels={customWheels}
              onSaveWheel={handleSaveCustomWheel}
              onDeleteSavedWheel={handleDeleteCustomWheel}
              onLoadWheelToStage={(wheel) => {
                setActiveWheel(wheel);
                setRemovedOptionIds([]);
                setShuffledOrder(null);
                setActiveSection('home');
                setTimeout(() => {
                  scrollToWheelStage();
                  setSpinTrigger((n) => n + 1);
                }, 150);
              }}
              onNotify={(msg) => notify(msg)}
            />

            {/* AD SLOT 7: Between Custom Wheel Builder and Other Content */}
            <AdSlot placement="builder-divider" />

            {/* Quick Interactive Stage Preview for Currently Selected Wheel */}
            <section
              ref={wheelStageRef}
              aria-label="Test Spin Stage"
              className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8"
            >
              <div className="text-center mb-6">
                <h2 className="font-display text-2xl font-bold text-slate-900 dark:text-white">
                  Spin Active Wheel: {activeWheel.title}
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Test your custom or selected wheel right here.
                </p>
              </div>
              <SpinningWheel
                wheel={activeWheel}
                activeOptions={activeOptions}
                removedCount={removedOptionIds.length}
                isMuted={isMuted}
                onToggleMute={() => setIsMuted((m) => !m)}
                onSpinComplete={handleSpinComplete}
                onRemoveOption={handleRemoveOption}
                onResetRemoved={() => setRemovedOptionIds([])}
                onShuffleOptions={handleShuffleActiveOptions}
                externalSpinTrigger={spinTrigger}
                compact
              />
            </section>
          </div>
        )}

        {/* ============================================================
            SPIN HISTORY & FAVORITES SECTION
            ============================================================ */}
        {activeSection === 'history' && (
          <div className="space-y-8">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <h1 className="font-display text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white tracking-tight">
                  Your Spin History &amp; Favorites
                </h1>
                <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 mt-1">
                  Review past decisions, replay favorite wheels, and track your daily spin streak.
                </p>
              </div>
              <button
                type="button"
                onClick={handleQuickYesNo}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-semibold cursor-pointer whitespace-nowrap"
              >
                <Zap className="w-4 h-4 fill-current" />
                <span>Quick Yes/No Spin</span>
              </button>
            </div>

            <HistoryPanel
              history={history}
              favorites={favoriteWheels}
              recentWheels={recentWheels}
              allWheels={allWheels}
              onSelectWheel={(wheel) => {
                setActiveWheel(wheel);
                setRemovedOptionIds([]);
                setShuffledOrder(null);
                setActiveSection('home');
                setTimeout(() => scrollToWheelStage(), 100);
              }}
              onDeleteHistoryItem={(id) => {
                soundEngine.playClick();
                setHistory((prev) => {
                  const next = prev.filter((item) => item.id !== id);
                  saveSpinHistory(next);
                  return next;
                });
              }}
              onClearHistory={() => {
                soundEngine.playClick();
                setHistory([]);
                saveSpinHistory([]);
                notify('Spin history cleared.');
              }}
            />
          </div>
        )}

        {/* AD SLOT 8: Bottom Horizontal Banner */}
        <AdSlot placement="bottom-banner" />
      </main>

      {/* Floating Quick Decision Button (always reachable, compact, never overlaps wheel controls) */}
      <button
        type="button"
        onClick={handleQuickYesNo}
        aria-label="Floating quick Yes or No spin"
        className="fixed bottom-5 right-5 z-30 inline-flex items-center gap-2 px-4 py-3 rounded-full bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white font-display font-bold text-xs sm:text-sm shadow-lg hover:scale-105 active:scale-95 transition-transform cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
      >
        <Zap className="w-4 h-4 fill-current" />
        <span>Yes / No Spin</span>
      </button>

      {/* Clean Quiet Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-display font-bold text-sm text-slate-900 dark:text-white">
              SPINVERSE
            </span>
            <span aria-hidden="true">·</span>
            <span>
              Interactive Decision &amp; Spinning Wheel Platform · No account required
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <button
              type="button"
              onClick={() => handleNavigate('decision')}
              className="hover:text-slate-900 dark:hover:text-white cursor-pointer"
            >
              Decisions
            </button>
            <button
              type="button"
              onClick={() => handleNavigate('daily')}
              className="hover:text-slate-900 dark:hover:text-white cursor-pointer"
            >
              Daily Life
            </button>
            <button
              type="button"
              onClick={() => handleNavigate('custom')}
              className="hover:text-slate-900 dark:hover:text-white cursor-pointer"
            >
              Custom Builder
            </button>
            <button
              type="button"
              onClick={async () => {
                const url = window.location.origin + window.location.pathname;
                if (navigator.share) {
                  try {
                    await navigator.share({
                      title: 'SPINVERSE – The Ultimate Spin & Decision Platform',
                      text: "Can't decide? Let SPINVERSE decide with 54+ interactive wheels!",
                      url,
                    });
                    return;
                  } catch {
                    // fallback
                  }
                }
                try {
                  await navigator.clipboard.writeText(url);
                  notify('SPINVERSE link copied!');
                } catch {
                  notify('Copy failed—please copy the browser URL.');
                }
              }}
              className="inline-flex items-center gap-1 hover:text-slate-900 dark:hover:text-white cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share Site</span>
            </button>
          </div>
        </div>
      </footer>

      {/* Celebratory Result Modal */}
      <ResultModal
        isOpen={resultModalOpen}
        wheel={latestResult?.wheel || activeWheel}
        winner={latestResult?.winner || null}
        message={latestResult?.message || ''}
        nextStep={latestResult?.nextStep || ''}
        canRemoveWinner={activeOptions.length > 2}
        relatedWheels={relatedWheels}
        onClose={() => setResultModalOpen(false)}
        onSpinAgain={() => {
          setResultModalOpen(false);
          setTimeout(() => setSpinTrigger((n) => n + 1), 160);
        }}
        onRemoveAndSpinAgain={() => {
          if (latestResult) {
            handleRemoveOption(latestResult.winner.id);
          }
          setResultModalOpen(false);
          setTimeout(() => setSpinTrigger((n) => n + 1), 180);
        }}
        onSelectRelatedWheel={(rw) => {
          setResultModalOpen(false);
          handleSelectWheel(rw, false);
        }}
        onNotify={(msg) => notify(msg)}
      />

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} />
    </div>
  );
}
