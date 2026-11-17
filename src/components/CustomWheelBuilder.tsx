import React, { useMemo, useState } from 'react';
import {
  ArrowDown,
  ArrowUp,
  GripVertical,
  Link2,
  Play,
  Plus,
  RotateCcw,
  Save,
  Trash2,
  Edit3,
} from 'lucide-react';
import type { WheelConfig, WheelOption } from '../types/spinverse';
import { WHEEL_COLOR_PALETTE } from '../data/wheels';
import { encodeWheelToShareParam } from '../utils/storage';
import { soundEngine } from '../utils/sound';

interface CustomWheelBuilderProps {
  savedWheels: WheelConfig[];
  onSaveWheel: (wheel: WheelConfig) => void;
  onDeleteSavedWheel: (wheelId: string) => void;
  onLoadWheelToStage: (wheel: WheelConfig) => void;
  onNotify: (msg: string) => void;
}

const DEFAULT_CUSTOM_OPTIONS: WheelOption[] = [
  { id: 'c-1', label: 'Pizza Night', color: '#2563EB', weight: 1 },
  { id: 'c-2', label: 'Sushi Bowl', color: '#7C3AED', weight: 1 },
  { id: 'c-3', label: 'Taco Tuesday', color: '#EC4899', weight: 1 },
  { id: 'c-4', label: 'Cook At Home', color: '#06B6D4', weight: 1 },
];

export const CustomWheelBuilder: React.FC<CustomWheelBuilderProps> = ({
  savedWheels,
  onSaveWheel,
  onDeleteSavedWheel,
  onLoadWheelToStage,
  onNotify,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState('My Custom Decision Wheel');
  const [subtitle, setSubtitle] = useState(
    'Personalized options created for fast, stress-free choices.'
  );
  const [weightedMode, setWeightedMode] = useState(false);
  const [options, setOptions] = useState<WheelOption[]>(DEFAULT_CUSTOM_OPTIONS);
  const [newOptionLabel, setNewOptionLabel] = useState('');
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const totalWeight = useMemo(
    () =>
      options.reduce(
        (sum, o) => sum + (weightedMode ? Math.max(1, o.weight || 1) : 1),
        0
      ),
    [options, weightedMode]
  );

  const handleAddOption = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = newOptionLabel.trim();
    if (!trimmed) {
      setErrorMsg('Please enter an option label before adding.');
      return;
    }
    if (options.length >= 30) {
      setErrorMsg('Maximum of 30 options per wheel reached.');
      return;
    }
    setErrorMsg(null);
    soundEngine.playClick();
    const nextColor =
      WHEEL_COLOR_PALETTE[options.length % WHEEL_COLOR_PALETTE.length];
    setOptions((prev) => [
      ...prev,
      {
        id: `c-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        label: trimmed.slice(0, 50),
        color: nextColor,
        weight: 1,
      },
    ]);
    setNewOptionLabel('');
  };

  const handleUpdateOption = (
    id: string,
    patch: Partial<WheelOption>
  ) => {
    setOptions((prev) =>
      prev.map((opt) => (opt.id === id ? { ...opt, ...patch } : opt))
    );
  };

  const handleRemoveOption = (id: string) => {
    if (options.length <= 2) {
      setErrorMsg('A wheel needs at least 2 options to spin.');
      return;
    }
    setErrorMsg(null);
    soundEngine.playClick();
    setOptions((prev) => prev.filter((o) => o.id !== id));
  };

  const moveOption = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= options.length) return;
    soundEngine.playClick();
    setOptions((prev) => {
      const copy = [...prev];
      const [moved] = copy.splice(index, 1);
      copy.splice(target, 0, moved);
      return copy;
    });
  };

  const handleDropOnRow = (dropIndex: number) => {
    if (dragIndex === null || dragIndex === dropIndex) {
      setDragIndex(null);
      return;
    }
    setOptions((prev) => {
      const copy = [...prev];
      const [moved] = copy.splice(dragIndex, 1);
      copy.splice(dropIndex, 0, moved);
      return copy;
    });
    setDragIndex(null);
  };

  const buildWheelObject = (): WheelConfig | null => {
    const cleanTitle = title.trim();
    if (!cleanTitle) {
      setErrorMsg('Please enter a title for your custom wheel.');
      return null;
    }
    const cleanOptions = options
      .map((o) => ({ ...o, label: o.label.trim() }))
      .filter((o) => o.label.length > 0);
    if (cleanOptions.length < 2) {
      setErrorMsg('Please provide at least 2 non-empty options.');
      return null;
    }
    setErrorMsg(null);
    return {
      id: editingId || `custom-${Date.now()}`,
      title: cleanTitle.slice(0, 80),
      subtitle:
        subtitle.trim().slice(0, 140) ||
        'Custom wheel built and saved on SPINVERSE.',
      category: 'custom',
      options: cleanOptions,
      weightedMode,
      keywords: ['custom', cleanTitle.toLowerCase()],
      relatedIds: ['yes-no', 'what-to-eat', 'daily-motivation'],
      celebrationStyle: 'party',
      isCustom: true,
      createdAt: editingId ? undefined : Date.now(),
      updatedAt: Date.now(),
    };
  };

  const handleSave = () => {
    const built = buildWheelObject();
    if (!built) return;
    soundEngine.playClick();
    onSaveWheel(built);
    setEditingId(built.id);
    onNotify(`Saved "${built.title}" locally!`);
  };

  const handleSaveAndSpin = () => {
    const built = buildWheelObject();
    if (!built) return;
    soundEngine.playClick();
    onSaveWheel(built);
    setEditingId(built.id);
    onLoadWheelToStage(built);
  };

  const handleShareCustomUrl = async () => {
    const built = buildWheelObject();
    if (!built) return;
    const encoded = encodeWheelToShareParam(built);
    const url = `${window.location.origin}${window.location.pathname}?wheel=${encoded}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `SPINVERSE: ${built.title}`,
          text: `Spin my custom wheel "${built.title}" on SPINVERSE!`,
          url,
        });
        return;
      } catch {
        // fallback to clipboard
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      onNotify('Shareable custom wheel link copied!');
    } catch {
      onNotify('Could not copy URL automatically.');
    }
  };

  const handleResetBuilder = () => {
    soundEngine.playClick();
    setEditingId(null);
    setTitle('My Custom Decision Wheel');
    setSubtitle('Personalized options created for fast, stress-free choices.');
    setWeightedMode(false);
    setOptions(DEFAULT_CUSTOM_OPTIONS);
    setErrorMsg(null);
    onNotify('Builder reset to default template.');
  };

  const handleEditSaved = (w: WheelConfig) => {
    soundEngine.playClick();
    setEditingId(w.id);
    setTitle(w.title);
    setSubtitle(w.subtitle);
    setWeightedMode(Boolean(w.weightedMode));
    setOptions(w.options.map((o) => ({ ...o })));
    setErrorMsg(null);
    onNotify(`Loaded "${w.title}" into editor.`);
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Builder Form */}
        <div className="lg:col-span-7 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 sm:p-7 shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-5 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="font-display text-xl font-bold text-slate-900 dark:text-white">
                {editingId ? 'Edit Custom Wheel' : 'Create a Custom Wheel'}
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Add 2 to 30 options, pick colors, drag to reorder, and save locally.
              </p>
            </div>
            <button
              type="button"
              onClick={handleResetBuilder}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer whitespace-nowrap"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>

          {errorMsg && (
            <div
              role="alert"
              className="mt-4 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 px-4 py-3 text-sm text-rose-700 dark:text-rose-300"
            >
              {errorMsg}
            </div>
          )}

          {/* Title & Subtitle */}
          <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="custom-wheel-title"
                className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5"
              >
                Wheel Title
              </label>
              <input
                id="custom-wheel-title"
                type="text"
                maxLength={80}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Friday Team Lunch"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label
                htmlFor="custom-wheel-subtitle"
                className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5"
              >
                Short Description (optional)
              </label>
              <input
                id="custom-wheel-subtitle"
                type="text"
                maxLength={140}
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                placeholder="What is this wheel helping you decide?"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Probability Mode Toggle */}
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200/80 dark:border-slate-800">
            <div>
              <div className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                Probability Mode
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                {weightedMode
                  ? 'Weighted: higher numbers get larger slices and higher odds.'
                  : 'Equal: every option has the exact same slice size and odds.'}
              </div>
            </div>
            <div className="inline-flex p-1 rounded-lg bg-slate-200/70 dark:bg-slate-800">
              <button
                type="button"
                onClick={() => setWeightedMode(false)}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                  !weightedMode
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                Equal Odds
              </button>
              <button
                type="button"
                onClick={() => setWeightedMode(true)}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                  weightedMode
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                Weighted
              </button>
            </div>
          </div>

          {/* Add New Option Input */}
          <form onSubmit={handleAddOption} className="mt-5 flex gap-2">
            <input
              type="text"
              value={newOptionLabel}
              onChange={(e) => setNewOptionLabel(e.target.value)}
              maxLength={50}
              placeholder="Add a new option (e.g. Go for a walk)..."
              aria-label="New wheel option label"
              className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Add</span>
            </button>
          </form>

          {/* Options List with Drag & Mobile Reorder */}
          <div className="mt-4 space-y-2 max-h-[380px] overflow-y-auto pr-1">
            {options.map((opt, idx) => {
              const weightVal = weightedMode ? Math.max(1, opt.weight || 1) : 1;
              const pct = Math.round((weightVal / totalWeight) * 100);
              return (
                <div
                  key={opt.id}
                  draggable
                  onDragStart={() => setDragIndex(idx)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => handleDropOnRow(idx)}
                  className={`flex flex-wrap sm:flex-nowrap items-center gap-2 p-2.5 rounded-xl border bg-slate-50/70 dark:bg-slate-950/60 transition-colors ${
                    dragIndex === idx
                      ? 'border-blue-500 opacity-70'
                      : 'border-slate-200/80 dark:border-slate-800'
                  }`}
                >
                  <span
                    className="hidden sm:inline-flex text-slate-400 cursor-grab active:cursor-grabbing p-1"
                    title="Drag to reorder"
                  >
                    <GripVertical className="w-4 h-4" />
                  </span>

                  <input
                    type="color"
                    value={opt.color}
                    onChange={(e) =>
                      handleUpdateOption(opt.id, { color: e.target.value })
                    }
                    aria-label={`Color for ${opt.label}`}
                    className="w-8 h-8 rounded-lg cursor-pointer border-0 bg-transparent p-0 shrink-0"
                  />

                  <input
                    type="text"
                    value={opt.label}
                    maxLength={50}
                    onChange={(e) =>
                      handleUpdateOption(opt.id, { label: e.target.value })
                    }
                    aria-label={`Option ${idx + 1} label`}
                    className="flex-1 min-w-[130px] px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />

                  {weightedMode && (
                    <div className="flex items-center gap-1.5 shrink-0">
                      <label
                        htmlFor={`weight-${opt.id}`}
                        className="text-[11px] text-slate-500 dark:text-slate-400"
                      >
                        Wt
                      </label>
                      <input
                        id={`weight-${opt.id}`}
                        type="number"
                        min={1}
                        max={20}
                        value={opt.weight ?? 1}
                        onChange={(e) =>
                          handleUpdateOption(opt.id, {
                            weight: Math.max(
                              1,
                              Math.min(20, Number(e.target.value) || 1)
                            ),
                          })
                        }
                        className="w-14 px-2 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-mono-nums text-center text-slate-900 dark:text-white"
                      />
                    </div>
                  )}

                  <span className="text-xs font-mono-nums text-slate-400 dark:text-slate-500 w-9 text-right shrink-0">
                    {pct}%
                  </span>

                  <div className="flex items-center gap-0.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => moveOption(idx, -1)}
                      disabled={idx === 0}
                      aria-label={`Move ${opt.label} up`}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 disabled:opacity-30 cursor-pointer"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveOption(idx, 1)}
                      disabled={idx === options.length - 1}
                      aria-label={`Move ${opt.label} down`}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 disabled:opacity-30 cursor-pointer"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveOption(opt.id)}
                      aria-label={`Delete ${opt.label}`}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Builder Action Buttons */}
          <div className="mt-6 flex flex-wrap gap-2.5">
            <button
              type="button"
              onClick={handleSaveAndSpin}
              className="flex-1 min-w-[170px] inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white text-sm font-semibold shadow-sm transition-all cursor-pointer whitespace-nowrap"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Save &amp; Spin Now</span>
            </button>

            <button
              type="button"
              onClick={handleSave}
              className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap"
            >
              <Save className="w-4 h-4" />
              <span>Save Locally</span>
            </button>

            <button
              type="button"
              onClick={handleShareCustomUrl}
              className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap"
            >
              <Link2 className="w-4 h-4" />
              <span>Share Link</span>
            </button>
          </div>
        </div>

        {/* Right: Saved Custom Wheels + Live Mini Preview */}
        <div className="lg:col-span-5 space-y-6">
          {/* Live Preview Card */}
          <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 sm:p-6">
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-3">
              Live Wheel Preview · {options.length} slices
            </div>
            <div className="flex items-center gap-5">
              <div
                aria-hidden="true"
                className="w-24 h-24 rounded-full shrink-0 border-4 border-white dark:border-slate-800 shadow-md relative flex items-center justify-center"
                style={{
                  background: `conic-gradient(${(() => {
                    let cur = 0;
                    return options
                      .map((o) => {
                        const w = weightedMode ? Math.max(1, o.weight || 1) : 1;
                        const span = (w / totalWeight) * 360;
                        const str = `${o.color} ${cur}deg ${cur + span}deg`;
                        cur += span;
                        return str;
                      })
                      .join(', ');
                  })()})`,
                }}
              >
                <div className="w-7 h-7 rounded-full bg-white dark:bg-slate-900 shadow-xs" />
              </div>
              <div className="min-w-0">
                <h4 className="font-display font-bold text-lg text-slate-900 dark:text-white truncate">
                  {title || 'Untitled Wheel'}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                  {subtitle || 'Ready to spin anytime.'}
                </p>
                <div className="mt-2 text-xs text-slate-600 dark:text-slate-300">
                  {weightedMode ? 'Weighted probabilities' : 'Equal probabilities'}
                </div>
              </div>
            </div>
          </div>

          {/* Saved Custom Wheels List */}
          <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">
                Saved Custom Wheels
              </h3>
              <span className="text-xs font-mono-nums text-slate-500 dark:text-slate-400">
                {savedWheels.length} saved
              </span>
            </div>

            {savedWheels.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-200 dark:border-slate-800 p-6 text-center text-sm text-slate-500 dark:text-slate-400">
                You have no saved custom wheels yet. Customize options on the left and click Save Locally or Save &amp; Spin Now.
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[340px] overflow-y-auto pr-1">
                {savedWheels.map((sw) => (
                  <div
                    key={sw.id}
                    className="p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <div className="font-semibold text-sm text-slate-900 dark:text-white truncate">
                        {sw.title}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 tabular-nums">
                        {sw.options.length} options ·{' '}
                        {sw.weightedMode ? 'Weighted' : 'Equal'}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => onLoadWheelToStage(sw)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-colors cursor-pointer"
                      >
                        <Play className="w-3 h-3 fill-current" />
                        <span>Spin</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleEditSaved(sw)}
                        aria-label={`Edit ${sw.title}`}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          soundEngine.playClick();
                          onDeleteSavedWheel(sw.id);
                          if (editingId === sw.id) setEditingId(null);
                        }}
                        aria-label={`Delete ${sw.title}`}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
