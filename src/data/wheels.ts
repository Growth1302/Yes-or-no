import type {
  MessageTone,
  WheelCategoryId,
  WheelConfig,
  WheelOption,
} from '../types/spinverse';

export const WHEEL_COLOR_PALETTE = [
  '#2563EB', // Electric Blue
  '#7C3AED', // Vibrant Purple
  '#EC4899', // Bright Pink
  '#06B6D4', // Cyan
  '#F97316', // Energetic Orange
  '#EAB308', // Warm Yellow
  '#10B981', // Fresh Emerald
  '#6366F1', // Indigo
  '#F43F5E', // Coral Rose
  '#0EA5E9', // Sky Blue
];

function buildOptions(
  items: Array<string | { label: string; tone?: MessageTone; color?: string }>,
  palette: string[] = WHEEL_COLOR_PALETTE
): WheelOption[] {
  return items.map((item, idx) => {
    const label = typeof item === 'string' ? item : item.label;
    const tone = typeof item === 'string' ? undefined : item.tone;
    const color =
      typeof item === 'string'
        ? palette[idx % palette.length]
        : item.color || palette[idx % palette.length];
    return {
      id: `opt-${idx}-${label.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 18)}`,
      label,
      color,
      weight: 1,
      tone,
    };
  });
}

export const CATEGORY_META: Record<
  WheelCategoryId,
  {
    name: string;
    shortName: string;
    description: string;
    accentColor: string;
  }
> = {
  decision: {
    name: 'Quick Decision Wheels',
    shortName: 'Quick Decisions',
    description: 'Fast, crisp binary and multi-choice wheels to break tie moments instantly.',
    accentColor: '#2563EB',
  },
  daily: {
    name: 'Daily Life Wheels',
    shortName: 'Daily Life',
    description: 'Solve meals, routines, shows, workouts, and everyday plans in seconds.',
    accentColor: '#06B6D4',
  },
  difficult: {
    name: 'Difficult Decision Wheels',
    shortName: 'Difficult Decisions',
    description: 'Thoughtful reflection wheels for overthinking, tough crossroads, and clarity.',
    accentColor: '#7C3AED',
  },
  fun: {
    name: 'Fun & Entertainment Wheels',
    shortName: 'Fun & Games',
    description: 'Party games, dares, friendly challenges, and playful group tie-breakers.',
    accentColor: '#EC4899',
  },
  motivation: {
    name: 'Motivation Wheels',
    shortName: 'Motivation',
    description: 'Confidence boosts, affirmations, gratitude prompts, and fresh-start energy.',
    accentColor: '#F97316',
  },
  custom: {
    name: 'Custom Wheels',
    shortName: 'Custom Wheel',
    description: 'Wheels you built, customized, weighted, and saved right in your browser.',
    accentColor: '#10B981',
  },
};

export const BUILT_IN_WHEELS: WheelConfig[] = [
  // =========================================================
  // A. QUICK DECISION WHEELS (10)
  // =========================================================
  {
    id: 'yes-no',
    title: 'Yes or No',
    subtitle: 'The classic instant tie-breaker for any everyday question.',
    category: 'decision',
    celebrationStyle: 'burst',
    keywords: ['yes', 'no', 'quick', 'decide', 'binary', 'choice', 'answer'],
    relatedIds: ['absolutely-yes-no', 'should-i-do-it', 'trust-your-gut'],
    options: buildOptions([
      { label: 'YES', tone: 'yesno', color: '#10B981' },
      { label: 'NO', tone: 'yesno', color: '#F43F5E' },
      { label: 'YES', tone: 'yesno', color: '#2563EB' },
      { label: 'NO', tone: 'yesno', color: '#F97316' },
      { label: 'YES', tone: 'yesno', color: '#06B6D4' },
      { label: 'NO', tone: 'yesno', color: '#7C3AED' },
    ]),
  },
  {
    id: 'absolutely-yes-no',
    title: 'Absolutely Yes or No',
    subtitle: 'High-conviction answers when maybe is not an option.',
    category: 'decision',
    celebrationStyle: 'burst',
    keywords: ['yes', 'no', 'absolutely', 'definitely', 'certain', 'fast'],
    relatedIds: ['yes-no', 'should-i-do-it', 'now-or-later'],
    options: buildOptions([
      { label: 'Absolutely YES!', tone: 'yesno', color: '#10B981' },
      { label: 'Definitely NO', tone: 'yesno', color: '#F43F5E' },
      { label: '100% Go For It', tone: 'yesno', color: '#2563EB' },
      { label: 'Not This Time', tone: 'yesno', color: '#7C3AED' },
      { label: 'YES, Without Doubt', tone: 'yesno', color: '#06B6D4' },
      { label: 'Pass For Now', tone: 'wait', color: '#F97316' },
    ]),
  },
  {
    id: 'should-i-do-it',
    title: 'Should I Do It?',
    subtitle: 'Stop hovering over the send button or delaying that plan.',
    category: 'decision',
    celebrationStyle: 'burst',
    keywords: ['should', 'do it', 'hesitate', 'confused', 'text', 'action'],
    relatedIds: ['take-risk-stay-safe', 'wait-or-go', 'now-or-later'],
    options: buildOptions([
      { label: 'Do It Now', tone: 'yesno', color: '#2563EB' },
      { label: 'Wait A Little', tone: 'wait', color: '#EAB308' },
      { label: 'Go All In', tone: 'risk', color: '#10B981' },
      { label: 'Skip It Today', tone: 'yesno', color: '#F43F5E' },
      { label: 'Start Small First', tone: 'motivation', color: '#7C3AED' },
      { label: 'Ask A Friend First', tone: 'wait', color: '#06B6D4' },
    ]),
  },
  {
    id: 'take-risk-stay-safe',
    title: 'Take the Risk or Stay Safe',
    subtitle: 'Weigh bold adventure against steady protection.',
    category: 'decision',
    celebrationStyle: 'sparkle',
    keywords: ['risk', 'safe', 'bold', 'chance', 'dare', 'careful'],
    relatedIds: ['take-chance-or-wait', 'trust-your-gut', 'should-i-do-it'],
    options: buildOptions([
      { label: 'Take The Risk', tone: 'risk', color: '#F97316' },
      { label: 'Stay Safe', tone: 'wait', color: '#2563EB' },
      { label: 'Calculated Leap', tone: 'risk', color: '#EC4899' },
      { label: 'Protect Your Peace', tone: 'wait', color: '#10B981' },
      { label: 'Try A Small Test', tone: 'risk', color: '#7C3AED' },
      { label: 'Hold Steady', tone: 'wait', color: '#06B6D4' },
    ]),
  },
  {
    id: 'wait-or-go',
    title: 'Wait or Go',
    subtitle: 'Check whether the timing says move forward or pause.',
    category: 'decision',
    celebrationStyle: 'burst',
    keywords: ['wait', 'go', 'timing', 'rush', 'pause', 'move'],
    relatedIds: ['now-or-later', 'should-i-do-it', 'yes-no'],
    options: buildOptions([
      { label: 'GO Right Now', tone: 'yesno', color: '#10B981' },
      { label: 'WAIT & Observe', tone: 'wait', color: '#6366F1' },
      { label: 'GO With A Plan', tone: 'risk', color: '#2563EB' },
      { label: 'WAIT Until Tomorrow', tone: 'wait', color: '#F97316' },
      { label: 'GO Slowly', tone: 'wait', color: '#06B6D4' },
      { label: 'Pause & Breathe', tone: 'wait', color: '#7C3AED' },
    ]),
  },
  {
    id: 'trust-your-gut',
    title: 'Trust Your Gut',
    subtitle: 'Tune into your honest instinct when logic hits a tie.',
    category: 'decision',
    celebrationStyle: 'sparkle',
    keywords: ['gut', 'instinct', 'intuition', 'confused', 'feel'],
    relatedIds: ['yes-no', 'confused-mind-wheel', 'make-move-let-go'],
    options: buildOptions([
      { label: 'Follow Instinct', tone: 'risk' },
      { label: 'Sleep On It', tone: 'wait' },
      { label: 'First Thought Wins', tone: 'yesno' },
      { label: 'Check One Fact', tone: 'wait' },
      { label: 'Trust Yourself', tone: 'motivation' },
      { label: 'Step Back', tone: 'wait' },
    ]),
  },
  {
    id: 'make-move-let-go',
    title: 'Make the Move or Let It Go',
    subtitle: 'Decide whether to pursue an opportunity or release it.',
    category: 'decision',
    celebrationStyle: 'burst',
    keywords: ['move', 'let go', 'reach out', 'message', 'chance'],
    relatedIds: ['let-go-or-hold-on', 'should-i-do-it', 'try-again-move-on'],
    options: buildOptions([
      { label: 'Make The Move', tone: 'risk' },
      { label: 'Let It Go', tone: 'difficult' },
      { label: 'Reach Out', tone: 'yesno' },
      { label: 'Save Energy', tone: 'wait' },
      { label: 'One Honest Try', tone: 'risk' },
      { label: 'Move Forward', tone: 'difficult' },
    ]),
  },
  {
    id: 'try-again-move-on',
    title: 'Try Again or Move On',
    subtitle: 'Know when persistence pays off and when a pivot shines.',
    category: 'decision',
    celebrationStyle: 'sparkle',
    keywords: ['try again', 'move on', 'pivot', 'retry', 'effort'],
    relatedIds: ['keep-trying-take-break', 'start-fresh-continue', 'yes-no'],
    options: buildOptions([
      { label: 'Try Again', tone: 'motivation' },
      { label: 'Move On Fresh', tone: 'difficult' },
      { label: 'New Approach', tone: 'risk' },
      { label: 'Pivot Now', tone: 'motivation' },
      { label: 'Wait 48 Hours', tone: 'wait' },
      { label: 'Start Fresh', tone: 'risk' },
    ]),
  },
  {
    id: 'now-or-later',
    title: 'Now or Later',
    subtitle: 'Beat procrastination or avoid burnout with smart pacing.',
    category: 'decision',
    celebrationStyle: 'burst',
    keywords: ['now', 'later', 'procrastinate', 'time', 'lazy', 'today'],
    relatedIds: ['wait-or-go', 'productivity-challenge', 'study-or-relax'],
    options: buildOptions([
      { label: 'Do It NOW', tone: 'motivation' },
      { label: 'Do It Later', tone: 'wait' },
      { label: '5-Min Start', tone: 'challenge' },
      { label: 'Rest First', tone: 'wait' },
      { label: 'Easy Part First', tone: 'motivation' },
      { label: 'Tomorrow AM', tone: 'wait' },
    ]),
  },
  {
    id: 'choose-your-own-destiny',
    title: 'Choose Your Own Destiny',
    subtitle: 'An upbeat multi-outcome wheel for spontaneous twists.',
    category: 'decision',
    celebrationStyle: 'party',
    keywords: ['destiny', 'fate', 'surprise', 'adventure', 'random'],
    relatedIds: ['mystery-surprise', 'todays-random-mission', 'yes-no'],
    options: buildOptions([
      { label: 'Say Yes', tone: 'risk' },
      { label: 'Create New', tone: 'motivation' },
      { label: 'Connect', tone: 'daily' },
      { label: 'Stay Calm', tone: 'wait' },
      { label: 'Surprise Self', tone: 'fun' },
      { label: 'Take A Leap', tone: 'risk' },
      { label: 'Stay Curious', tone: 'challenge' },
      { label: 'Be Kind', tone: 'daily' },
    ]),
  },

  // =========================================================
  // B. DAILY LIFE WHEELS (12)
  // =========================================================
  {
    id: 'what-to-eat',
    title: 'What Should I Eat?',
    subtitle: 'End mealtime indecision and pick a crave-worthy dish.',
    category: 'daily',
    celebrationStyle: 'party',
    keywords: ['hungry', 'eat', 'food', 'dinner', 'lunch', 'restaurant', 'takeout'],
    relatedIds: ['what-to-cook', 'evening-activities', 'weekend-plans'],
    options: buildOptions([
      { label: 'Tacos', tone: 'food' },
      { label: 'Ramen', tone: 'food' },
      { label: 'Pizza', tone: 'food' },
      { label: 'Grain Bowl', tone: 'food' },
      { label: 'Sushi', tone: 'food' },
      { label: 'Burger & Fries', tone: 'food' },
      { label: 'Curry & Rice', tone: 'food' },
      { label: 'Fresh Salad', tone: 'food' },
      { label: 'Pasta Night', tone: 'food' },
      { label: 'Breakfast Meal', tone: 'food' },
    ]),
  },
  {
    id: 'what-to-cook',
    title: 'What Should I Cook Today?',
    subtitle: 'Quick, realistic home-cooked ideas when the fridge feels blank.',
    category: 'daily',
    celebrationStyle: 'sparkle',
    keywords: ['cook', 'hungry', 'kitchen', 'recipe', 'homemade', 'dinner'],
    relatedIds: ['what-to-eat', 'evening-activities', 'morning-routine'],
    options: buildOptions([
      { label: 'Garlic Pasta', tone: 'food' },
      { label: 'Veggie Stir-Fry', tone: 'food' },
      { label: 'Quesadillas', tone: 'food' },
      { label: 'Roasted Tray', tone: 'food' },
      { label: 'Fried Rice', tone: 'food' },
      { label: 'Soup & Toast', tone: 'food' },
      { label: 'Herb Omelette', tone: 'food' },
      { label: 'Rice Bowl', tone: 'food' },
    ]),
  },
  {
    id: 'what-to-watch',
    title: 'What Should I Watch?',
    subtitle: 'Stop scrolling streaming menus and press play on a vibe.',
    category: 'daily',
    celebrationStyle: 'burst',
    keywords: ['watch', 'movie', 'show', 'tv', 'bored', 'netflix', 'relax'],
    relatedIds: ['evening-activities', 'what-to-eat', 'study-or-relax'],
    options: buildOptions([
      { label: 'Comedy', tone: 'daily' },
      { label: 'Sci-Fi', tone: 'daily' },
      { label: 'Mystery', tone: 'daily' },
      { label: 'Comfort Rewatch', tone: 'daily' },
      { label: 'Documentary', tone: 'daily' },
      { label: 'Animation', tone: 'daily' },
      { label: 'Stand-Up', tone: 'fun' },
      { label: 'Action Film', tone: 'daily' },
    ]),
  },
  {
    id: 'what-to-do-today',
    title: 'What Should I Do Today?',
    subtitle: 'Beat boredom with an energizing, achievable daily plan.',
    category: 'daily',
    celebrationStyle: 'party',
    keywords: ['bored', 'do today', 'nothing to do', 'activity', 'lazy'],
    relatedIds: ['todays-random-mission', 'indoor-or-outdoor', 'weekend-plans'],
    options: buildOptions([
      { label: 'Scenic Walk', tone: 'daily' },
      { label: 'Tidy A Drawer', tone: 'daily' },
      { label: 'New Recipe', tone: 'food' },
      { label: 'Read 20 Pages', tone: 'daily' },
      { label: 'Call A Friend', tone: 'daily' },
      { label: 'Learn A Skill', tone: 'motivation' },
      { label: 'Cozy Café', tone: 'daily' },
      { label: 'Full Album', tone: 'daily' },
    ]),
  },
  {
    id: 'morning-routine',
    title: 'Morning Routine',
    subtitle: 'Kickstart your morning with an intentional feel-good anchor.',
    category: 'daily',
    celebrationStyle: 'sparkle',
    keywords: ['morning', 'wake up', 'routine', 'start', 'energy'],
    relatedIds: ['exercise-or-rest', 'daily-motivation', 'gratitude-wheel'],
    options: buildOptions([
      { label: 'Water & Stretch', tone: 'daily' },
      { label: 'Morning Walk', tone: 'daily' },
      { label: '3 Gratitudes', tone: 'motivation' },
      { label: 'Good Breakfast', tone: 'food' },
      { label: 'Screen-Free 20m', tone: 'daily' },
      { label: 'Top 1 Priority', tone: 'motivation' },
    ]),
  },
  {
    id: 'evening-activities',
    title: 'Evening Activities',
    subtitle: 'Wind down well instead of losing hours to endless scrolling.',
    category: 'daily',
    celebrationStyle: 'calm',
    keywords: ['evening', 'night', 'unwind', 'relax', 'sleep', 'bored'],
    relatedIds: ['what-to-watch', 'mental-reset', 'study-or-relax'],
    options: buildOptions([
      { label: 'Tea & Reading', tone: 'daily' },
      { label: 'Movie Night', tone: 'daily' },
      { label: 'Walk & Podcast', tone: 'daily' },
      { label: 'Warm Meal', tone: 'food' },
      { label: '5-Min Journal', tone: 'motivation' },
      { label: 'Stretch & Music', tone: 'daily' },
      { label: 'Puzzle Time', tone: 'fun' },
    ]),
  },
  {
    id: 'weekend-plans',
    title: 'Weekend Plans',
    subtitle: 'Turn free days into refreshing memories without overplanning.',
    category: 'daily',
    celebrationStyle: 'party',
    keywords: ['weekend', 'saturday', 'sunday', 'plans', 'bored', 'out'],
    relatedIds: ['indoor-or-outdoor', 'what-to-eat', 'what-to-do-today'],
    options: buildOptions([
      { label: 'Market & Coffee', tone: 'daily' },
      { label: 'Nature Park', tone: 'daily' },
      { label: 'Hobby Hour', tone: 'daily' },
      { label: 'See Friends', tone: 'fun' },
      { label: 'Bookstore Visit', tone: 'daily' },
      { label: 'Pure Rest Day', tone: 'wait' },
      { label: 'Mini Day Trip', tone: 'risk' },
      { label: 'Movie & Reset', tone: 'daily' },
    ]),
  },
  {
    id: 'study-or-relax',
    title: 'Study or Relax',
    subtitle: 'Balance focused learning with guilt-free recovery.',
    category: 'daily',
    celebrationStyle: 'burst',
    keywords: ['study', 'relax', 'work', 'lazy', 'tired', 'focus', 'break'],
    relatedIds: ['productivity-challenge', 'exercise-or-rest', 'now-or-later'],
    options: buildOptions([
      { label: '25m Study', tone: 'motivation' },
      { label: '20m Rest', tone: 'wait' },
      { label: 'Quick Review', tone: 'daily' },
      { label: 'Walk Then Study', tone: 'daily' },
      { label: 'Practice Quiz', tone: 'challenge' },
      { label: 'Recharge Now', tone: 'wait' },
    ]),
  },
  {
    id: 'exercise-or-rest',
    title: 'Exercise or Rest',
    subtitle: 'Honor your body with movement or mindful recovery.',
    category: 'daily',
    celebrationStyle: 'sparkle',
    keywords: ['exercise', 'workout', 'gym', 'rest', 'lazy', 'tired', 'fitness'],
    relatedIds: ['study-or-relax', 'morning-routine', 'small-step-challenge'],
    options: buildOptions([
      { label: '20m Walk', tone: 'daily' },
      { label: 'Full Workout', tone: 'motivation' },
      { label: '10m Stretch', tone: 'daily' },
      { label: 'Rest & Hydrate', tone: 'wait' },
      { label: 'Light Yoga', tone: 'daily' },
      { label: '10m Cardio', tone: 'challenge' },
    ]),
  },
  {
    id: 'productivity-challenge',
    title: 'Productivity Challenge',
    subtitle: 'Cut through procrastination with a single crisp sprint.',
    category: 'daily',
    celebrationStyle: 'burst',
    keywords: ['productive', 'procrastinate', 'focus', 'work', 'lazy', 'clean'],
    relatedIds: ['now-or-later', 'discipline-challenge', 'small-step-challenge'],
    options: buildOptions([
      { label: '10m Inbox Zero', tone: 'challenge' },
      { label: '25m Deep Focus', tone: 'motivation' },
      { label: 'Clear Desk', tone: 'challenge' },
      { label: '1 Hard Task', tone: 'motivation' },
      { label: 'Write Top 3', tone: 'daily' },
      { label: 'Close Extra Tabs', tone: 'challenge' },
    ]),
  },
  {
    id: 'indoor-or-outdoor',
    title: 'Indoor or Outdoor Activity',
    subtitle: 'Match your mood with fresh air or cozy indoor comfort.',
    category: 'daily',
    celebrationStyle: 'burst',
    keywords: ['indoor', 'outdoor', 'outside', 'inside', 'weather', 'bored'],
    relatedIds: ['what-to-do-today', 'weekend-plans', 'todays-random-mission'],
    options: buildOptions([
      { label: 'Sunlight Walk', tone: 'daily' },
      { label: 'Indoor Reading', tone: 'daily' },
      { label: 'Coffee Run', tone: 'daily' },
      { label: 'Creative Hour', tone: 'challenge' },
      { label: 'Park Bench', tone: 'daily' },
      { label: 'Music & Tidy', tone: 'daily' },
    ]),
  },
  {
    id: 'todays-random-mission',
    title: "Today's Random Mission",
    subtitle: 'Add one bright, unexpected micro-quest to your day.',
    category: 'daily',
    celebrationStyle: 'party',
    keywords: ['mission', 'quest', 'bored', 'random', 'fun', 'daily'],
    relatedIds: ['random-challenge', 'what-to-do-today', 'self-improvement-mission'],
    options: buildOptions([
      { label: 'Kind Compliment', tone: 'challenge' },
      { label: 'New Walk Route', tone: 'challenge' },
      { label: 'Drink 2 Glasses', tone: 'daily' },
      { label: 'Text A Friend', tone: 'daily' },
      { label: 'Learn 1 Fact', tone: 'challenge' },
      { label: '2h Screen Break', tone: 'motivation' },
      { label: 'Take 1 Photo', tone: 'fun' },
    ]),
  },

  // =========================================================
  // C. DIFFICULT DECISION WHEELS (10)
  // =========================================================
  {
    id: 'confused-mind-wheel',
    title: 'Confused Mind Wheel',
    subtitle: 'Quiet mental noise and find one grounded next step.',
    category: 'difficult',
    supportiveGuidance: true,
    celebrationStyle: 'calm',
    keywords: ['confused', 'overwhelmed', 'stuck', 'lost', 'mind', 'clarity'],
    relatedIds: ['overthinking-breaker', 'trust-your-gut', 'mental-reset'],
    options: buildOptions([
      { label: 'Focus On Today', tone: 'difficult' },
      { label: 'Talk It Out', tone: 'difficult' },
      { label: 'List Priorities', tone: 'difficult' },
      { label: '24-Hour Pause', tone: 'wait' },
      { label: 'Kindest Option', tone: 'difficult' },
      { label: 'Check Facts', tone: 'difficult' },
    ]),
  },
  {
    id: 'overthinking-breaker',
    title: 'Overthinking Breaker',
    subtitle: 'Interrupt spiraling thoughts and return to calm presence.',
    category: 'difficult',
    supportiveGuidance: true,
    celebrationStyle: 'calm',
    keywords: ['overthinking', 'anxious', 'worry', 'confused', 'stress', 'spiral'],
    relatedIds: ['confused-mind-wheel', 'mental-reset', 'wait-or-go'],
    options: buildOptions([
      { label: 'Progress Wins', tone: 'motivation' },
      { label: '1-Year Test', tone: 'difficult' },
      { label: 'Physical Reset', tone: 'daily' },
      { label: 'Drop Worst Case', tone: 'difficult' },
      { label: 'Good Enough', tone: 'difficult' },
      { label: 'Step Outside', tone: 'wait' },
    ]),
  },
  {
    id: 'take-chance-or-wait',
    title: 'Take a Chance or Wait',
    subtitle: 'Reflect on readiness, timing, and heart versus preparation.',
    category: 'difficult',
    supportiveGuidance: true,
    celebrationStyle: 'calm',
    keywords: ['chance', 'wait', 'opportunity', 'timing', 'difficult', 'risk'],
    relatedIds: ['take-risk-stay-safe', 'follow-dream-stay-comfortable', 'wait-or-go'],
    options: buildOptions([
      { label: 'Take A Chance', tone: 'risk' },
      { label: 'Build Your Plan', tone: 'wait' },
      { label: 'Small Test', tone: 'difficult' },
      { label: 'Ask Advice', tone: 'difficult' },
      { label: 'Wait One Week', tone: 'wait' },
      { label: 'Trust Readiness', tone: 'risk' },
    ]),
  },
  {
    id: 'should-i-change-my-life',
    title: 'Should I Change My Life?',
    subtitle: 'Explore meaningful change gently through thoughtful small steps.',
    category: 'difficult',
    supportiveGuidance: true,
    celebrationStyle: 'calm',
    keywords: ['change', 'life', 'career', 'stuck', 'new', 'big decision'],
    relatedIds: ['start-fresh-continue', 'fresh-start-wheel', 'follow-dream-stay-comfortable'],
    options: buildOptions([
      { label: 'One New Habit', tone: 'motivation' },
      { label: 'Explore Safely', tone: 'difficult' },
      { label: 'Keep What Works', tone: 'difficult' },
      { label: '30-Day Trial', tone: 'risk' },
      { label: 'Seek Guidance', tone: 'difficult' },
      { label: 'True Priorities', tone: 'difficult' },
    ]),
  },
  {
    id: 'follow-dream-stay-comfortable',
    title: 'Follow My Dream or Stay Comfortable',
    subtitle: 'Balance ambition and security with practical wisdom.',
    category: 'difficult',
    supportiveGuidance: true,
    celebrationStyle: 'calm',
    keywords: ['dream', 'comfort', 'passion', 'career', 'fear', 'future'],
    relatedIds: ['take-chance-or-wait', 'should-i-change-my-life', 'confidence-booster'],
    options: buildOptions([
      { label: 'Build On Side', tone: 'difficult' },
      { label: 'Grow Steadily', tone: 'wait' },
      { label: 'Bold Step Now', tone: 'risk' },
      { label: 'Guard Base', tone: 'difficult' },
      { label: 'Ask A Mentor', tone: 'difficult' },
      { label: '30m Daily Dream', tone: 'motivation' },
    ]),
  },
  {
    id: 'speak-up-stay-silent',
    title: 'Speak Up or Stay Silent',
    subtitle: 'Decide when honest expression helps and when calm restraint wins.',
    category: 'difficult',
    supportiveGuidance: true,
    celebrationStyle: 'calm',
    keywords: ['speak up', 'silent', 'confront', 'honest', 'talk', 'relationship'],
    relatedIds: ['forgive-move-forward', 'make-move-let-go', 'trust-your-gut'],
    options: buildOptions([
      { label: 'Speak Kindly', tone: 'difficult' },
      { label: 'Pause First', tone: 'wait' },
      { label: 'Write It Out', tone: 'difficult' },
      { label: 'Keep Peace', tone: 'difficult' },
      { label: 'Ask Gently', tone: 'difficult' },
      { label: 'Set Boundary', tone: 'motivation' },
    ]),
  },
  {
    id: 'keep-trying-take-break',
    title: 'Keep Trying or Take a Break',
    subtitle: 'Distinguish healthy grit from genuine need for rest.',
    category: 'difficult',
    supportiveGuidance: true,
    celebrationStyle: 'calm',
    keywords: ['keep trying', 'break', 'burnout', 'tired', 'quit', 'rest'],
    relatedIds: ['try-again-move-on', 'mental-reset', 'exercise-or-rest'],
    options: buildOptions([
      { label: 'Real Rest First', tone: 'wait' },
      { label: 'Keep Going', tone: 'motivation' },
      { label: 'New Strategy', tone: 'difficult' },
      { label: 'Pause Tonight', tone: 'wait' },
      { label: 'Ask For Help', tone: 'difficult' },
      { label: 'Own Your Wins', tone: 'motivation' },
    ]),
  },
  {
    id: 'start-fresh-continue',
    title: 'Start Fresh or Continue',
    subtitle: 'See whether refining your current path or resetting serves you best.',
    category: 'difficult',
    supportiveGuidance: true,
    celebrationStyle: 'calm',
    keywords: ['start fresh', 'continue', 'reset', 'rebuild', 'restart'],
    relatedIds: ['fresh-start-wheel', 'try-again-move-on', 'should-i-change-my-life'],
    options: buildOptions([
      { label: 'Clean Slate', tone: 'difficult' },
      { label: 'Keep Refining', tone: 'motivation' },
      { label: 'Refresh Plan', tone: 'difficult' },
      { label: '2 More Weeks', tone: 'wait' },
      { label: 'Simplify All', tone: 'difficult' },
      { label: 'Fresh Tomorrow', tone: 'motivation' },
    ]),
  },
  {
    id: 'forgive-move-forward',
    title: 'Forgive or Move Forward',
    subtitle: 'Emotional clarity for releasing resentment and protecting peace.',
    category: 'difficult',
    supportiveGuidance: true,
    celebrationStyle: 'calm',
    keywords: ['forgive', 'move forward', 'hurt', 'peace', 'heal', 'closure'],
    relatedIds: ['let-go-or-hold-on', 'speak-up-stay-silent', 'mental-reset'],
    options: buildOptions([
      { label: 'Forgive & Free', tone: 'difficult' },
      { label: 'Set Boundaries', tone: 'difficult' },
      { label: 'Take More Time', tone: 'wait' },
      { label: 'Release Weight', tone: 'difficult' },
      { label: 'Lean On Friends', tone: 'difficult' },
      { label: 'Be Gentle', tone: 'motivation' },
    ]),
  },
  {
    id: 'let-go-or-hold-on',
    title: 'Let Go or Hold On',
    subtitle: 'Reflect gently on what deserves your care versus release.',
    category: 'difficult',
    supportiveGuidance: true,
    celebrationStyle: 'calm',
    keywords: ['let go', 'hold on', 'attachment', 'confused', 'relationship'],
    relatedIds: ['forgive-move-forward', 'make-move-let-go', 'confused-mind-wheel'],
    options: buildOptions([
      { label: 'Let Go Calmly', tone: 'difficult' },
      { label: 'Mutual Effort', tone: 'difficult' },
      { label: 'Loosen Grip', tone: 'wait' },
      { label: 'Self-Respect', tone: 'difficult' },
      { label: 'Watch Actions', tone: 'wait' },
      { label: 'Make New Space', tone: 'motivation' },
    ]),
  },

  // =========================================================
  // D. FUN AND ENTERTAINMENT WHEELS (12)
  // =========================================================
  {
    id: 'truth-or-dare',
    title: 'Truth or Dare',
    subtitle: 'The timeless party classic with wholesome, playful prompts.',
    category: 'fun',
    celebrationStyle: 'party',
    keywords: ['truth', 'dare', 'party', 'friends', 'game', 'fun'],
    relatedIds: ['party-game-wheel', 'dare-of-the-day', 'best-friend-challenge'],
    options: buildOptions([
      { label: 'TRUTH: Memory', tone: 'fun' },
      { label: 'DARE: 10s Dance', tone: 'fun' },
      { label: 'TRUTH: Talent', tone: 'fun' },
      { label: 'DARE: Accent', tone: 'fun' },
      { label: 'TRUTH: Proudest', tone: 'fun' },
      { label: 'DARE: Imitate', tone: 'fun' },
      { label: 'TRUTH: Dream Trip', tone: 'fun' },
      { label: 'DARE: Sing Loud', tone: 'fun' },
    ]),
  },
  {
    id: 'random-challenge',
    title: 'Random Challenge',
    subtitle: 'Fun spontaneous mini-challenges for solo or group play.',
    category: 'fun',
    celebrationStyle: 'party',
    keywords: ['challenge', 'bored', 'fun', 'game', 'play', 'spontaneous'],
    relatedIds: ['dare-of-the-day', 'todays-random-mission', 'party-game-wheel'],
    options: buildOptions([
      { label: '30s Sketch', tone: 'challenge' },
      { label: '20s Balance', tone: 'challenge' },
      { label: '2-Line Poem', tone: 'fun' },
      { label: 'High-Five', tone: 'fun' },
      { label: 'No "Um" Talk', tone: 'challenge' },
      { label: '5 Fruits Fast', tone: 'challenge' },
      { label: '10 Jump Jacks', tone: 'challenge' },
    ]),
  },
  {
    id: 'funny-punishment',
    title: 'Funny Punishment',
    subtitle: 'Lighthearted, harmless forfeits for friendly game nights.',
    category: 'fun',
    celebrationStyle: 'party',
    keywords: ['punishment', 'forfeit', 'lose', 'game', 'party', 'funny'],
    relatedIds: ['who-pays-today', 'truth-or-dare', 'party-game-wheel'],
    options: buildOptions([
      { label: 'Fetch Drinks', tone: 'fun' },
      { label: 'Best Dad Joke', tone: 'fun' },
      { label: 'Dramatic Bow', tone: 'fun' },
      { label: 'Robot Voice 1m', tone: 'fun' },
      { label: 'Compliment All', tone: 'fun' },
      { label: 'Pick Next Song', tone: 'fun' },
    ]),
  },
  {
    id: 'who-pays-today',
    title: 'Who Pays Today?',
    subtitle: 'Settle coffee, snack, or bill rounds fairly with suspense.',
    category: 'fun',
    celebrationStyle: 'burst',
    keywords: ['who pays', 'bill', 'coffee', 'friends', 'split', 'money'],
    relatedIds: ['who-goes-first', 'funny-punishment', 'what-to-eat'],
    options: buildOptions([
      { label: 'Person Left', tone: 'fun' },
      { label: 'Person Right', tone: 'fun' },
      { label: 'Split Evenly', tone: 'fun' },
      { label: 'Idea Maker', tone: 'fun' },
      { label: 'Tallest Treats', tone: 'fun' },
      { label: 'Tie! Spin Again', tone: 'fun' },
      { label: 'Youngest Pays', tone: 'fun' },
      { label: 'On You Today', tone: 'fun' },
    ]),
  },
  {
    id: 'who-goes-first',
    title: 'Who Goes First?',
    subtitle: 'Kick off board games, trivia, or turns without arguing.',
    category: 'fun',
    celebrationStyle: 'burst',
    keywords: ['first', 'turn', 'board game', 'player', 'start'],
    relatedIds: ['who-pays-today', 'random-number-generator', 'party-game-wheel'],
    options: buildOptions([
      { label: 'Spinner First!', tone: 'fun' },
      { label: 'Person Left', tone: 'fun' },
      { label: 'Person Right', tone: 'fun' },
      { label: 'Brightest Shirt', tone: 'fun' },
      { label: 'Newest Guest', tone: 'fun' },
      { label: 'Next Birthday', tone: 'fun' },
    ]),
  },
  {
    id: 'best-friend-challenge',
    title: 'Best Friend Challenge',
    subtitle: 'Playful prompts that spark laughs and stories with close friends.',
    category: 'fun',
    celebrationStyle: 'party',
    keywords: ['friend', 'bestie', 'hangout', 'challenge', 'fun'],
    relatedIds: ['friendship-challenge', 'truth-or-dare', 'who-pays-today'],
    options: buildOptions([
      { label: 'Guess Snack', tone: 'fun' },
      { label: 'Old Photo Pose', tone: 'fun' },
      { label: 'Swap Playlists', tone: 'fun' },
      { label: 'Joke Battle', tone: 'fun' },
      { label: 'Plan Hangout', tone: 'fun' },
      { label: '3 Kind Facts', tone: 'motivation' },
    ]),
  },
  {
    id: 'random-number-generator',
    title: 'Random Number Generator',
    subtitle: 'Pick a crisp random number from 1 to 12 in one spin.',
    category: 'fun',
    celebrationStyle: 'burst',
    keywords: ['number', 'random', '1 to 12', 'dice', 'count', 'lottery'],
    relatedIds: ['lucky-color', 'who-goes-first', 'mystery-surprise'],
    options: buildOptions([
      '1',
      '2',
      '3',
      '4',
      '5',
      '6',
      '7',
      '8',
      '9',
      '10',
      '11',
      '12',
    ]),
  },
  {
    id: 'lucky-color',
    title: 'Lucky Color',
    subtitle: 'Pick a color vibe for your outfit, design, or lucky mood.',
    category: 'fun',
    celebrationStyle: 'sparkle',
    keywords: ['color', 'lucky', 'outfit', 'aesthetic', 'vibe'],
    relatedIds: ['random-number-generator', 'mystery-surprise', 'choose-your-own-destiny'],
    options: buildOptions([
      { label: 'Electric Blue', color: '#2563EB', tone: 'fun' },
      { label: 'Royal Purple', color: '#7C3AED', tone: 'fun' },
      { label: 'Rose Pink', color: '#EC4899', tone: 'fun' },
      { label: 'Ocean Cyan', color: '#06B6D4', tone: 'fun' },
      { label: 'Sunset Orange', color: '#F97316', tone: 'fun' },
      { label: 'Gold Yellow', color: '#EAB308', tone: 'fun' },
      { label: 'Emerald', color: '#10B981', tone: 'fun' },
      { label: 'Coral Red', color: '#F43F5E', tone: 'fun' },
    ]),
  },
  {
    id: 'mystery-surprise',
    title: 'Mystery Surprise',
    subtitle: 'Unwrap an unexpected upbeat treat or mini activity.',
    category: 'fun',
    celebrationStyle: 'party',
    keywords: ['mystery', 'surprise', 'gift', 'random', 'bored'],
    relatedIds: ['choose-your-own-destiny', 'lucky-color', 'todays-random-mission'],
    options: buildOptions([
      { label: 'Treat Snack', tone: 'food' },
      { label: 'Dance 1 Song', tone: 'fun' },
      { label: 'Kind Text', tone: 'motivation' },
      { label: '10m Break', tone: 'wait' },
      { label: 'Fun Friday', tone: 'daily' },
      { label: 'New Drink', tone: 'food' },
    ]),
  },
  {
    id: 'party-game-wheel',
    title: 'Party Game Wheel',
    subtitle: 'Keep group energy lively with instant round twists.',
    category: 'fun',
    celebrationStyle: 'party',
    keywords: ['party', 'group', 'game night', 'friends', 'fun'],
    relatedIds: ['truth-or-dare', 'funny-punishment', 'who-goes-first'],
    options: buildOptions([
      { label: '2m Charades', tone: 'fun' },
      { label: 'Two Truths', tone: 'fun' },
      { label: 'Fast Trivia', tone: 'challenge' },
      { label: 'Hum A Song', tone: 'fun' },
      { label: 'Speed Words', tone: 'challenge' },
      { label: 'Group Story', tone: 'fun' },
    ]),
  },
  {
    id: 'dare-of-the-day',
    title: 'Dare of the Day',
    subtitle: 'Safe, fun confidence dares to brighten an ordinary day.',
    category: 'fun',
    celebrationStyle: 'party',
    keywords: ['dare', 'challenge', 'bold', 'fun', 'daily'],
    relatedIds: ['random-challenge', 'todays-random-mission', 'confidence-booster'],
    options: buildOptions([
      { label: 'Smile At 3', tone: 'challenge' },
      { label: 'Bold Color', tone: 'fun' },
      { label: 'Try New Dish', tone: 'food' },
      { label: 'Kind Note', tone: 'motivation' },
      { label: 'Sing Loud', tone: 'fun' },
      { label: 'Start Task', tone: 'challenge' },
    ]),
  },
  {
    id: 'friendship-challenge',
    title: 'Friendship Challenge',
    subtitle: 'Wholesome activities to celebrate and strengthen friendships.',
    category: 'fun',
    celebrationStyle: 'party',
    keywords: ['friendship', 'friends', 'bond', 'kindness', 'fun'],
    relatedIds: ['best-friend-challenge', 'gratitude-wheel', 'party-game-wheel'],
    options: buildOptions([
      { label: 'Voice Hello', tone: 'fun' },
      { label: 'Share A Meme', tone: 'fun' },
      { label: 'Coffee Chat', tone: 'daily' },
      { label: 'Say Thanks', tone: 'motivation' },
      { label: 'Show Tip', tone: 'daily' },
      { label: 'Game Night', tone: 'fun' },
    ]),
  },

  // =========================================================
  // E. MOTIVATION WHEELS (10)
  // =========================================================
  {
    id: 'daily-motivation',
    title: 'Daily Motivation',
    subtitle: 'A bright spark of encouragement whenever you need a lift.',
    category: 'motivation',
    celebrationStyle: 'sparkle',
    keywords: ['motivation', 'inspire', 'energy', 'lazy', 'tired', 'encourage'],
    relatedIds: ['confidence-booster', 'todays-power-message', 'small-step-challenge'],
    options: buildOptions([
      { label: 'Start Small', tone: 'motivation' },
      { label: 'Action Wins', tone: 'motivation' },
      { label: 'One Step Now', tone: 'motivation' },
      { label: 'Trust Growth', tone: 'motivation' },
      { label: 'Effort Counts', tone: 'motivation' },
      { label: 'Keep Promises', tone: 'motivation' },
    ]),
  },
  {
    id: 'confidence-booster',
    title: 'Confidence Booster',
    subtitle: 'Remind yourself of your strengths before a big moment.',
    category: 'motivation',
    celebrationStyle: 'sparkle',
    keywords: ['confidence', 'nervous', 'interview', 'presentation', 'self esteem'],
    relatedIds: ['positive-affirmation', 'daily-motivation', 'todays-power-message'],
    options: buildOptions([
      { label: 'You Got This', tone: 'motivation' },
      { label: 'Speak Calmly', tone: 'motivation' },
      { label: 'Own Your Voice', tone: 'motivation' },
      { label: 'Stay Bold', tone: 'motivation' },
      { label: 'Stand Tall', tone: 'motivation' },
      { label: 'You Are Ready', tone: 'motivation' },
    ]),
  },
  {
    id: 'discipline-challenge',
    title: 'Discipline Challenge',
    subtitle: 'Turn motivation into clean, doable follow-through.',
    category: 'motivation',
    celebrationStyle: 'burst',
    keywords: ['discipline', 'habit', 'focus', 'lazy', 'procrastinate'],
    relatedIds: ['productivity-challenge', 'small-step-challenge', 'now-or-later'],
    options: buildOptions([
      { label: 'Phone Away 30m', tone: 'challenge' },
      { label: 'First Task First', tone: 'motivation' },
      { label: '2-Min Rule', tone: 'challenge' },
      { label: '5m Tidy Desk', tone: 'challenge' },
      { label: 'Keep 1 Habit', tone: 'motivation' },
      { label: 'No Snooze', tone: 'motivation' },
    ]),
  },
  {
    id: 'positive-affirmation',
    title: 'Positive Affirmation',
    subtitle: 'Gentle, grounded statements to shift your inner dialogue.',
    category: 'motivation',
    celebrationStyle: 'calm',
    keywords: ['affirmation', 'positive', 'self love', 'kind', 'mindset'],
    relatedIds: ['gratitude-wheel', 'confidence-booster', 'mental-reset'],
    options: buildOptions([
      { label: 'I Grow Daily', tone: 'motivation' },
      { label: 'I Deserve Joy', tone: 'motivation' },
      { label: 'I Am Calm', tone: 'motivation' },
      { label: 'My Pace Works', tone: 'motivation' },
      { label: 'Good Ahead', tone: 'motivation' },
      { label: 'I Am Strong', tone: 'motivation' },
    ]),
  },
  {
    id: 'self-improvement-mission',
    title: 'Self-Improvement Mission',
    subtitle: 'Pick one meaningful micro-habit to invest in yourself today.',
    category: 'motivation',
    celebrationStyle: 'sparkle',
    keywords: ['self improvement', 'growth', 'better', 'habit', 'learn'],
    relatedIds: ['small-step-challenge', 'todays-random-mission', 'discipline-challenge'],
    options: buildOptions([
      { label: 'Read 10 Pages', tone: 'motivation' },
      { label: 'Water & Stretch', tone: 'daily' },
      { label: 'Learn 1 Tip', tone: 'challenge' },
      { label: 'Write 3 Goals', tone: 'motivation' },
      { label: 'Listen Deeply', tone: 'motivation' },
      { label: 'Sleep Earlier', tone: 'daily' },
    ]),
  },
  {
    id: 'mental-reset',
    title: 'Mental Reset',
    subtitle: 'Clear mental clutter and return to a peaceful baseline.',
    category: 'motivation',
    celebrationStyle: 'calm',
    keywords: ['mental reset', 'stress', 'overwhelmed', 'calm', 'breathe'],
    relatedIds: ['overthinking-breaker', 'gratitude-wheel', 'evening-activities'],
    options: buildOptions([
      { label: '4 Deep Breaths', tone: 'wait' },
      { label: 'Cold Water', tone: 'daily' },
      { label: 'Look At Sky', tone: 'wait' },
      { label: 'Relax Shoulders', tone: 'motivation' },
      { label: 'Brain Dump', tone: 'difficult' },
      { label: '5m Quiet Time', tone: 'wait' },
    ]),
  },
  {
    id: 'todays-power-message',
    title: "Today's Power Message",
    subtitle: 'Draw a bold headline for your mindset today.',
    category: 'motivation',
    celebrationStyle: 'burst',
    keywords: ['power', 'message', 'quote', 'inspiration', 'focus'],
    relatedIds: ['daily-motivation', 'confidence-booster', 'fresh-start-wheel'],
    options: buildOptions([
      { label: 'Build Momentum', tone: 'motivation' },
      { label: 'Done Beats All', tone: 'motivation' },
      { label: 'Small Hinges', tone: 'motivation' },
      { label: 'Energy Flows', tone: 'motivation' },
      { label: 'Kind Strength', tone: 'motivation' },
      { label: 'Stay Curious', tone: 'motivation' },
    ]),
  },
  {
    id: 'small-step-challenge',
    title: 'Small Step Challenge',
    subtitle: 'Overcome inertia by making the next step wonderfully tiny.',
    category: 'motivation',
    celebrationStyle: 'sparkle',
    keywords: ['small step', 'start', 'lazy', 'stuck', 'procrastinate'],
    relatedIds: ['discipline-challenge', 'productivity-challenge', 'daily-motivation'],
    options: buildOptions([
      { label: 'Just 3 Minutes', tone: 'challenge' },
      { label: 'First Sentence', tone: 'motivation' },
      { label: 'Shoes On Only', tone: 'challenge' },
      { label: 'Open The File', tone: 'motivation' },
      { label: 'Just 5 Reps', tone: 'challenge' },
      { label: 'Clear 3 Items', tone: 'challenge' },
    ]),
  },
  {
    id: 'gratitude-wheel',
    title: 'Gratitude Wheel',
    subtitle: 'Spot one bright piece of good already present in your life.',
    category: 'motivation',
    celebrationStyle: 'calm',
    keywords: ['gratitude', 'thankful', 'happy', 'mindful', 'appreciate'],
    relatedIds: ['positive-affirmation', 'mental-reset', 'morning-routine'],
    options: buildOptions([
      { label: '1 Kind Person', tone: 'motivation' },
      { label: '1 Cozy Comfort', tone: 'motivation' },
      { label: 'Body Strength', tone: 'motivation' },
      { label: 'Recent Laugh', tone: 'fun' },
      { label: 'Lesson Learned', tone: 'motivation' },
      { label: 'Warm Drink', tone: 'daily' },
    ]),
  },
  {
    id: 'fresh-start-wheel',
    title: 'Fresh Start Wheel',
    subtitle: 'Reset your day at any hour—new momentum can start right now.',
    category: 'motivation',
    celebrationStyle: 'sparkle',
    keywords: ['fresh start', 'reset', 'new chapter', 'restart', 'hope'],
    relatedIds: ['start-fresh-continue', 'daily-motivation', 'mental-reset'],
    options: buildOptions([
      { label: 'Let Earlier Go', tone: 'motivation' },
      { label: '1 Fresh Goal', tone: 'motivation' },
      { label: 'Open A Window', tone: 'daily' },
      { label: 'Chapter Two', tone: 'motivation' },
      { label: 'New Playlist', tone: 'daily' },
      { label: 'Reset Right Now', tone: 'motivation' },
    ]),
  },
];

export function findWheelsByIntent(
  query: string,
  allWheels: WheelConfig[]
): WheelConfig[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  // Helpful natural language intent expansions
  const synonyms: Record<string, string[]> = {
    hungry: ['eat', 'cook', 'food', 'dinner', 'lunch'],
    eat: ['eat', 'cook', 'food'],
    food: ['eat', 'cook', 'food'],
    bored: ['do today', 'watch', 'random', 'challenge', 'weekend', 'mystery'],
    confused: ['confused', 'overthinking', 'trust', 'yes', 'clarit'],
    overthinking: ['overthinking', 'confused', 'mental', 'wait'],
    motivation: ['motivation', 'confidence', 'affirmation', 'small step', 'power'],
    motivated: ['motivation', 'discipline', 'power'],
    lazy: ['small step', 'now or later', 'exercise', 'productivity', 'discipline'],
    tired: ['rest', 'mental reset', 'evening', 'break'],
    party: ['party', 'truth', 'punishment', 'who pays', 'first'],
    friends: ['friend', 'truth', 'who pays', 'party'],
    sad: ['mental reset', 'gratitude', 'affirmation', 'fresh start'],
    stressed: ['mental reset', 'overthinking', 'breathe', 'break'],
    work: ['productivity', 'study', 'discipline', 'now or later'],
  };

  const expandedTokens = new Set(q.split(/\s+/).filter(Boolean));
  for (const [key, extra] of Object.entries(synonyms)) {
    if (q.includes(key)) {
      extra.forEach((t) => expandedTokens.add(t));
    }
  }

  const scored = allWheels
    .map((wheel) => {
      let score = 0;
      const titleLower = wheel.title.toLowerCase();
      const subtitleLower = wheel.subtitle.toLowerCase();
      const kwText = wheel.keywords.join(' ').toLowerCase();

      if (titleLower.includes(q)) score += 12;
      if (subtitleLower.includes(q)) score += 6;

      expandedTokens.forEach((token) => {
        if (token.length < 2) return;
        if (titleLower.includes(token)) score += 6;
        if (kwText.includes(token)) score += 5;
        if (subtitleLower.includes(token)) score += 3;
        if (wheel.options.some((o) => o.label.toLowerCase().includes(token))) {
          score += 2;
        }
      });

      return { wheel, score };
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score);

  return scored.slice(0, 8).map((s) => s.wheel);
}

export function getDailyHighlights(dateKey: string): {
  wheelOfTheDay: WheelConfig;
  dailyChallengeWheel: WheelConfig;
  luckyChoicePrompt: string;
  funMissionPrompt: string;
} {
  let hash = 0;
  for (let i = 0; i < dateKey.length; i++) {
    hash = (hash * 33 + dateKey.charCodeAt(i)) >>> 0;
  }

  const wheelOfTheDay = BUILT_IN_WHEELS[hash % BUILT_IN_WHEELS.length];
  const challengeWheels = BUILT_IN_WHEELS.filter(
    (w) =>
      w.id === 'todays-random-mission' ||
      w.id === 'small-step-challenge' ||
      w.id === 'random-challenge' ||
      w.id === 'productivity-challenge' ||
      w.id === 'dare-of-the-day'
  );
  const dailyChallengeWheel =
    challengeWheels[(hash >> 2) % challengeWheels.length];

  const luckyPrompts = [
    'Spin Today’s Lucky Color or Lucky Number for a positive cue.',
    'Spin Choose Your Own Destiny for today’s signature theme.',
    'Spin Gratitude Wheel to highlight one hidden win today.',
    'Spin Fresh Start Wheel to set a clean intention right now.',
  ];
  const missionPrompts = [
    'Complete 1 Random Mission spin and mark it done today.',
    'Try a 5-minute Small Step Challenge to build easy momentum.',
    'Share a positive spin result with a friend to brighten their day.',
    'Discover 1 new wheel you have never spun before.',
  ];

  return {
    wheelOfTheDay,
    dailyChallengeWheel,
    luckyChoicePrompt: luckyPrompts[hash % luckyPrompts.length],
    funMissionPrompt: missionPrompts[(hash >> 3) % missionPrompts.length],
  };
}
