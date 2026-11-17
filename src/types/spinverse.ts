export type WheelCategoryId =
  | 'decision'
  | 'daily'
  | 'difficult'
  | 'fun'
  | 'motivation'
  | 'custom';

export type NavSectionId =
  | 'home'
  | 'decision'
  | 'daily'
  | 'fun'
  | 'motivation'
  | 'custom'
  | 'history';

export type MessageTone =
  | 'yesno'
  | 'risk'
  | 'wait'
  | 'food'
  | 'motivation'
  | 'challenge'
  | 'fun'
  | 'difficult'
  | 'daily'
  | 'general';

export interface WheelOption {
  id: string;
  label: string;
  color: string;
  weight?: number;
  tone?: MessageTone;
}

export interface WheelConfig {
  id: string;
  title: string;
  subtitle: string;
  category: WheelCategoryId;
  options: WheelOption[];
  weightedMode?: boolean;
  supportiveGuidance?: boolean;
  keywords: string[];
  relatedIds: string[];
  celebrationStyle: 'burst' | 'sparkle' | 'calm' | 'party';
  isCustom?: boolean;
  createdAt?: number;
  updatedAt?: number;
}

export interface SpinRecord {
  id: string;
  wheelId: string;
  wheelTitle: string;
  category: WheelCategoryId;
  resultLabel: string;
  resultColor: string;
  message: string;
  nextStep: string;
  timestamp: number;
}

export interface DailyState {
  dateKey: string;
  completedChallenge: boolean;
  completedMission: boolean;
  luckyChoiceSpun: boolean;
  dailyChallengeResult?: string;
  dailyMissionResult?: string;
  luckyChoiceResult?: string;
}

export interface StreakData {
  count: number;
  lastSpinDate: string | null;
}

export interface ToastItem {
  id: string;
  message: string;
  type?: 'info' | 'success' | 'warning';
}
