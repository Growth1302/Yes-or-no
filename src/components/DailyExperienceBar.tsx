import React from 'react';
import {
  Calendar,
  CheckCircle2,
  Flame,
  Play,
  Shuffle,
  Sun,
} from 'lucide-react';
import type { DailyState, StreakData, WheelConfig } from '../types/spinverse';
import { getDailyHighlights } from '../data/wheels';
import { getDailyPositiveMessage } from '../data/messages';

interface DailyExperienceBarProps {
  dailyState: DailyState;
  streak: StreakData;
  onSpinWheelNow: (wheel: WheelConfig) => void;
  onToggleChallengeComplete: () => void;
  onToggleMissionComplete: () => void;
  onSurpriseMe: () => void;
}

export const DailyExperienceBar: React.FC<DailyExperienceBarProps> = ({
  dailyState,
  streak,
  onSpinWheelNow,
  onToggleChallengeComplete,
  onToggleMissionComplete,
  onSurpriseMe,
}) => {
  const highlights = getDailyHighlights(dailyState.dateKey);
  const dailyMessage = getDailyPositiveMessage(dailyState.dateKey);

  return (
    <section
      aria-labelledby="daily-hub-heading"
      className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 sm:p-7 shadow-xs"
    >
      <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <Calendar className="w-3.5 h-3.5 text-blue-500" />
            <span>Today's Picks</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono-nums">{dailyState.dateKey}</span>
          </div>
          <h2
            id="daily-hub-heading"
            className="font-display text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mt-0.5"
          >
            Daily Spin Experience
          </h2>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200/70 dark:border-amber-900/50 text-amber-800 dark:text-amber-200 text-xs font-semibold">
            <Flame className="w-4 h-4 text-orange-500" />
            <span className="tabular-nums">
              {streak.count} {streak.count === 1 ? 'Day' : 'Days'} Spin Streak
            </span>
          </div>

          <button
            type="button"
            onClick={onSurpriseMe}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:opacity-90 text-xs font-semibold transition-opacity cursor-pointer whitespace-nowrap"
          >
            <Shuffle className="w-3.5 h-3.5" />
            <span>Surprise Me</span>
          </button>
        </div>
      </div>

      {/* 4 Daily Experience Cards */}
      <div className="mt-5 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* 1. Wheel of the Day */}
        <div className="p-4 rounded-xl bg-slate-50/80 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between gap-3">
          <div>
            <div className="text-xs font-semibold text-blue-600 dark:text-blue-400">
              Wheel of the Day
            </div>
            <h3 className="font-display font-bold text-base text-slate-900 dark:text-white mt-1">
              {highlights.wheelOfTheDay.title}
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
              {highlights.wheelOfTheDay.subtitle}
            </p>
          </div>
          <button
            type="button"
            onClick={() => onSpinWheelNow(highlights.wheelOfTheDay)}
            className="inline-flex items-center justify-center gap-1.5 w-full px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-colors cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Spin Wheel of the Day</span>
          </button>
        </div>

        {/* 2. Daily Random Challenge */}
        <div className="p-4 rounded-xl bg-slate-50/80 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between gap-3">
          <div>
            <div className="text-xs font-semibold text-purple-600 dark:text-purple-400">
              Daily Random Challenge
            </div>
            <h3 className="font-display font-bold text-base text-slate-900 dark:text-white mt-1">
              {highlights.dailyChallengeWheel.title}
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
              Spin to draw today's quick action challenge and check it off.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onSpinWheelNow(highlights.dailyChallengeWheel)}
              className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold transition-colors cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Spin Challenge</span>
            </button>
            <button
              type="button"
              onClick={onToggleChallengeComplete}
              aria-label="Mark daily challenge complete"
              className={`p-2 rounded-lg border transition-colors cursor-pointer ${
                dailyState.completedChallenge
                  ? 'bg-emerald-500 border-emerald-500 text-white'
                  : 'border-slate-200 dark:border-slate-700 text-slate-500 hover:text-emerald-600'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 3. Today's Lucky Choice & Fun Mission */}
        <div className="p-4 rounded-xl bg-slate-50/80 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between gap-3">
          <div>
            <div className="text-xs font-semibold text-pink-600 dark:text-pink-400">
              Lucky Choice &amp; Fun Mission
            </div>
            <p className="text-xs font-medium text-slate-800 dark:text-slate-200 mt-1.5 leading-relaxed">
              {highlights.luckyChoicePrompt}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              Mission: {highlights.funMissionPrompt}
            </p>
          </div>
          <button
            type="button"
            onClick={onToggleMissionComplete}
            className={`inline-flex items-center justify-center gap-1.5 w-full px-3 py-2 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
              dailyState.completedMission
                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>
              {dailyState.completedMission ? 'Mission Completed' : 'Mark Mission Done'}
            </span>
          </button>
        </div>

        {/* 4. Daily Positive Message */}
        <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50/90 via-indigo-50/60 to-purple-50/80 dark:from-blue-950/30 dark:via-slate-900 dark:to-purple-950/30 border border-blue-100 dark:border-blue-900/40 flex flex-col justify-between gap-3">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-700 dark:text-indigo-300">
              <Sun className="w-3.5 h-3.5 text-amber-500" />
              <span>Daily Positive Message</span>
            </div>
            <p className="mt-2 text-sm font-medium text-slate-800 dark:text-slate-100 leading-relaxed">
              "{dailyMessage}"
            </p>
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400">
            Refreshes every day for a fresh perspective.
          </div>
        </div>
      </div>
    </section>
  );
};
