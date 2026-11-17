import React, { useMemo, useState } from 'react';
import { Search, Shuffle, X, ArrowRight } from 'lucide-react';
import type { WheelConfig } from '../types/spinverse';
import { CATEGORY_META, findWheelsByIntent } from '../data/wheels';

interface SmartFinderProps {
  allWheels: WheelConfig[];
  onSelectWheel: (wheel: WheelConfig) => void;
  onSurpriseMe: () => void;
}

const QUICK_PROMPTS = [
  "I'm hungry",
  "I'm bored",
  "I'm confused",
  'I need motivation',
  "I don't know what to do",
  "I'm feeling lazy",
];

export const SmartFinder: React.FC<SmartFinderProps> = ({
  allWheels,
  onSelectWheel,
  onSurpriseMe,
}) => {
  const [query, setQuery] = useState('');

  const matches = useMemo(
    () => findWheelsByIntent(query, allWheels),
    [query, allWheels]
  );

  return (
    <section
      aria-labelledby="smart-finder-heading"
      className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 sm:p-7 shadow-xs"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2
            id="smart-finder-heading"
            className="font-display text-xl sm:text-2xl font-bold text-slate-900 dark:text-white"
          >
            Smart Wheel Finder
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Type how you feel or what you are trying to decide, and we will match the right wheel.
          </p>
        </div>

        <button
          type="button"
          onClick={onSurpriseMe}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white text-xs sm:text-sm font-semibold shadow-xs transition-all cursor-pointer whitespace-nowrap self-start md:self-auto"
        >
          <Shuffle className="w-4 h-4" />
          <span>Surprise Me</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="mt-4 relative">
        <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder='Try "I’m hungry", "I’m bored", "I’m confused", or "party"...'
          aria-label="Search wheels by mood or question"
          className="w-full pl-11 pr-10 py-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm sm:text-base text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery('')}
            aria-label="Clear search query"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Quick Intent Prompt Buttons */}
      <div className="mt-3 flex flex-wrap gap-2">
        {QUICK_PROMPTS.map((prompt) => (
          <button
            key={prompt}
            type="button"
            onClick={() => setQuery(prompt)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer whitespace-nowrap ${
              query.toLowerCase() === prompt.toLowerCase()
                ? 'bg-blue-600 border-blue-600 text-white'
                : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-blue-400'
            }`}
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Search Results */}
      {query.trim().length > 0 && (
        <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800">
          {matches.length === 0 ? (
            <div className="text-sm text-slate-500 dark:text-slate-400 py-3 flex flex-wrap items-center justify-between gap-2">
              <span>
                No direct wheel matched "{query}". Try a custom wheel or spin a random pick!
              </span>
              <button
                type="button"
                onClick={onSurpriseMe}
                className="text-blue-600 dark:text-blue-400 font-semibold hover:underline cursor-pointer"
              >
                Pick a Random Wheel
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {matches.map((wheel) => (
                <button
                  key={wheel.id}
                  type="button"
                  onClick={() => onSelectWheel(wheel)}
                  className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-blue-500 bg-slate-50/60 dark:bg-slate-950/60 text-left transition-all cursor-pointer group flex flex-col justify-between gap-2"
                >
                  <div>
                    <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                      {CATEGORY_META[wheel.category].shortName}
                    </div>
                    <div className="font-display font-semibold text-sm text-slate-900 dark:text-white mt-0.5">
                      {wheel.title}
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs font-semibold text-blue-600 dark:text-blue-400">
                    <span>Load Wheel</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
};
