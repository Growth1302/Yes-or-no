import type { MessageTone, WheelCategoryId } from '../types/spinverse';

const TONE_MESSAGES: Record<MessageTone, string[]> = {
  yesno: [
    'YES! Go for it! Sometimes the first step is all you need.',
    'Not this time! Every NO can lead you towards a better YES.',
    'Clarity unlocked! Trust this answer and reclaim your mental energy.',
    'A clear direction beats endless overthinking every single time.',
    'There is your answer—simple, clean, and ready for action.',
    'Sometimes all we need is a gentle nudge off the fence.',
    'Notice how you felt seeing that result—that reaction tells you everything!',
    'Decision made! You just saved yourself twenty minutes of second-guessing.',
    'Take this result as your green light to move forward with confidence.',
    'One clear choice opens the door to better momentum today.',
    'You asked, the wheel answered—now let yourself act on it calmly.',
    'Indecision ends right here. Step forward with a lighter mind.',
  ],
  risk: [
    'Your next chapter starts when you dare to take the first step.',
    'Bold choices create stories worth telling—just stay smart and steady.',
    'Taking a thoughtful chance builds confidence you never get from waiting.',
    'Playing it safe keeps your energy protected until the right moment.',
    'Courage does not mean zero fear; it means choosing to move anyway.',
    'You are stronger and more adaptable than your doubts suggest.',
    'Whether you leap or pace yourself, you are steering your own path.',
    'Every meaningful breakthrough begins with someone willing to try.',
    'Trust your preparation—you have handled surprises before and thrived.',
    'A calculated risk today can become tomorrow’s proudest milestone.',
    'Choosing safety when you need stability is also a wise decision.',
    'Give yourself credit for weighing your options with care.',
  ],
  wait: [
    "Take a breath. There's no need to rush everything.",
    'Patience is a quiet superpower—let the timing work in your favor.',
    'Pausing gives the dust time to settle so you can see clearly.',
    'Going now builds momentum; waiting protects your focus. Both have value.',
    'Right now is the only moment you need to handle—one breath at a time.',
    'Stepping back for a beat often reveals an easier way forward.',
    'Good timing multiplies good effort. Trust your sense of pace.',
    'Slowing down is not falling behind—it is aiming before you leap.',
    'If the answer says go, start small and steady right away.',
    'If the answer says wait, use this pause to recharge your energy.',
    'Give yourself permission to move at a human, sustainable speed.',
    'Everything important becomes clearer after a calm pause.',
  ],
  food: [
    'Your next delicious adventure has been selected!',
    'No more scrolling menus forever—enjoy every bite of this pick!',
    'Great choice! Good food is one of life’s simplest daily joys.',
    'Dinner debate officially solved. Time to savor something tasty!',
    'Your taste buds just got a clear mission—enjoy the flavor!',
    'Zero menu fatigue today. Treat yourself to a satisfying meal.',
    'Sometimes the best meal is the one you did not have to overthink.',
    'Bon appétit! Good energy starts with enjoying what is on your plate.',
    'Consider this your sign to step away from screens and enjoy your food.',
    'A fresh flavor pick can brighten the whole rest of your day.',
    'Kitchen or takeout, you now have a tasty plan in motion!',
    'Grab a glass of water, enjoy your meal, and relax for a bit.',
  ],
  motivation: [
    "You've got this! Small progress is still progress.",
    'Consistency beats perfection—one focused step today is a huge win.',
    'You do not have to see the whole staircase to take the next step.',
    'Your future self will quietly thank you for showing up today.',
    'Effort compounds even on days when it feels small.',
    'You are capable of much more than yesterday’s doubts told you.',
    'Reset your shoulders, take a deep breath, and begin right where you are.',
    'Real momentum starts the moment you decide to try for just five minutes.',
    'Be proud of how far you have already walked to reach today.',
    'Kindness toward yourself fuels far better discipline than harshness ever could.',
    'Every small promise you keep to yourself strengthens your confidence.',
    'Today is a fresh page—write one positive line on it right now.',
  ],
  challenge: [
    'Challenge unlocked! Make today a little more interesting.',
    'Step slightly outside routine—that is where memorable days happen!',
    'Mission accepted! Give it your best playful effort.',
    'A tiny challenge right now can spark a whole wave of fresh energy.',
    'Turn an ordinary hour into a story worth sharing!',
    'Ready, set, go! Have fun completing this mission at your own pace.',
    'You just unlocked a mini-adventure—embrace the curiosity.',
    'Life feels brighter when you sprinkle in spontaneous challenges.',
    'Keep it lighthearted, give it a genuine try, and smile along the way.',
    'Action cures boredom faster than scrolling ever will!',
    'Your mission is clear—see how smoothly you can pull it off.',
    'Small playful challenges build big creative confidence.',
  ],
  fun: [
    'Surprise! Your random moment has arrived!',
    'Laughter is guaranteed when you lean into the unexpected.',
    'Keep it friendly, keep it playful, and enjoy the moment together!',
    'The best memories usually start with a spontaneous spin like this.',
    'No backing out now—it is all in good fun!',
    'Playfulness is one of the fastest ways to recharge your mood.',
    'Let the good vibes roll—everyone wins when the room is smiling.',
    'A little friendly randomness makes any gathering unforgettable.',
    'That result could not have been scripted better—have a blast!',
    'Pass the smile around and enjoy what happens next!',
    'Spontaneous moments turn ordinary hangouts into favorite stories.',
    'Enjoy the twist—this is why spinning together is so much fun!',
  ],
  difficult: [
    'Give yourself grace—tough choices feel heavy because you care.',
    'You do not have to solve your entire future in a single afternoon.',
    'Notice your immediate gut reaction to this spin; that feeling is valuable data.',
    'Clarity often arrives in layers. Take the gentlest helpful step first.',
    'Protecting your peace of mind is always a worthy priority.',
    'Whatever path you choose, you will carry your wisdom and resilience with you.',
    'Talking things through with someone you trust can bring fresh perspective.',
    'Honor both your feelings and your practical needs as you decide.',
    'It is okay to take extra time before committing to a major decision.',
    'Letting go of pressure makes room for wiser, calmer choices.',
    'You deserve decisions that respect your well-being and long-term growth.',
    'Use this result as a reflection prompt, not a rigid rule—you are in charge.',
  ],
  daily: [
    'Your day just got clearer—enjoy diving into this activity!',
    'A little structure brings calm freedom to the rest of your schedule.',
    'Consider your next hour sorted! Focus on one thing and enjoy it.',
    'Simple daily choices shape happy, balanced weeks.',
    'Great pick! Put on some good energy and make the most of it.',
    'Say goodbye to "what should I do now?" and hello to momentum.',
    'Even an ordinary weekday feels better with an intentional plan.',
    'Take this pick, set a light timer if helpful, and just enjoy the flow.',
    'Balanced days mix focus, movement, nourishment, and real rest.',
    'Here is your friendly nudge to enjoy the present hour.',
    'One clear activity beats an endless mental to-do list.',
    'Have a wonderful time with your chosen plan!',
  ],
  general: [
    'Spin complete! Trust the momentum and enjoy what comes next.',
    'A fresh perspective is often just one spin away.',
    'May this result bring a smile and a helpful spark to your day.',
    'Everything feels lighter once a choice is finally made.',
    'Keep moving forward with curiosity and good humor!',
    'Sometimes a little randomness is the best clarity tool available.',
    'You showed up, took a spin, and found your direction.',
    'Take what resonates from this result and make it yours!',
    'Wishing you an easy, uplifting next step from here.',
    'Decision fatigue? Not today. You are ready to roll!',
    'Enjoy the simplicity of having a clear choice in front of you.',
    'Here is to small sparks of joy and steady forward motion!',
    'Your next positive moment begins right now.',
    'Stay curious, stay kind to yourself, and keep going.',
    'A great choice for a great day ahead!',
    'Let this spin bring a welcome breath of fresh air to your routine.',
    'You have everything you need to handle what comes next.',
  ],
};

// Verify total >= 120 unique messages: 12*9 + 17 = 125 unique messages!

const NEXT_STEPS: Record<WheelCategoryId, string[]> = {
  decision: [
    'Check your gut reaction right now—if you feel relieved, run with it!',
    'Set a 2-minute timer and take the very first tiny action toward this choice.',
    'Note this result in your mind and give yourself permission to stop debating it.',
  ],
  daily: [
    'Start within the next 5 minutes so momentum carries you smoothly.',
    'Grab a glass of water, silence distractions briefly, and enjoy this pick.',
    'Pair this activity with your favorite playlist or a calm break afterward.',
  ],
  difficult: [
    'Write down two honest pros and cons before taking any major real-world step.',
    'Share what you are weighing with a trusted friend, mentor, or family member.',
    'Remember: for serious financial, medical, legal, or life choices, take thoughtful time and seek qualified advice.',
  ],
  fun: [
    'Share this result with a friend or group so everyone gets in on the fun!',
    'Keep the streak going—pass the next spin to someone else in the room.',
    'Snap a quick mental note or screenshot and enjoy the challenge together.',
  ],
  motivation: [
    'Choose one tiny 5-minute action right now to bring this message to life.',
    'Repeat this takeaway once out loud or jot it in your notes for today.',
    'Take one slow, steady breath and start your next task with calm focus.',
  ],
  custom: [
    'Try removing this option if you are narrowing down a shortlist!',
    'Share your custom wheel link with friends so they can spin it too.',
    'Spin again anytime or tweak your option weights in the Custom Wheel builder.',
  ],
};

const recentlyUsedMessages: string[] = [];

export function getUniquePositiveMessage(
  tone: MessageTone | undefined,
  category: WheelCategoryId,
  winningLabel: string
): { message: string; nextStep: string } {
  const lower = winningLabel.toLowerCase();
  let resolvedTone: MessageTone = tone || 'general';

  // Specific smart contextual match for classic YES / NO / RISK / WAIT labels
  if (!tone) {
    if (lower.includes('yes') && !lower.includes('no')) {
      resolvedTone = 'yesno';
    } else if (lower === 'no' || lower.includes('definitely no') || lower.includes('not yet')) {
      resolvedTone = 'yesno';
    } else if (lower.includes('risk') || lower.includes('leap') || lower.includes('dare')) {
      resolvedTone = 'risk';
    } else if (lower.includes('wait') || lower.includes('pause') || lower.includes('later')) {
      resolvedTone = 'wait';
    } else if (category === 'motivation') {
      resolvedTone = 'motivation';
    } else if (category === 'difficult') {
      resolvedTone = 'difficult';
    } else if (category === 'fun') {
      resolvedTone = 'fun';
    } else if (category === 'daily') {
      resolvedTone = 'daily';
    }
  }

  // Exact special highlight responses for iconic outcomes while still rotating
  const candidatePool = [
    ...(TONE_MESSAGES[resolvedTone] || []),
    ...TONE_MESSAGES.general,
  ];

  // Filter out recently shown messages so back-to-back spins never repeat
  let freshPool = candidatePool.filter(
    (msg) => !recentlyUsedMessages.includes(msg)
  );
  if (freshPool.length === 0) {
    recentlyUsedMessages.length = 0;
    freshPool = candidatePool;
  }

  // Prioritize iconic crisp match occasionally when exact YES/NO hits
  let chosen = freshPool[Math.floor(Math.random() * freshPool.length)];
  if (
    lower === 'yes' &&
    !recentlyUsedMessages.includes(TONE_MESSAGES.yesno[0])
  ) {
    chosen = TONE_MESSAGES.yesno[0];
  } else if (
    lower === 'no' &&
    !recentlyUsedMessages.includes(TONE_MESSAGES.yesno[1])
  ) {
    chosen = TONE_MESSAGES.yesno[1];
  }

  recentlyUsedMessages.push(chosen);
  if (recentlyUsedMessages.length > 45) {
    recentlyUsedMessages.shift();
  }

  const steps = NEXT_STEPS[category] || NEXT_STEPS.decision;
  const nextStep = steps[Math.floor(Math.random() * steps.length)];

  return { message: chosen, nextStep };
}

export function getAllPositiveMessagesCount(): number {
  const unique = new Set<string>();
  Object.values(TONE_MESSAGES).forEach((list) => {
    list.forEach((m) => unique.add(m));
  });
  return unique.size;
}

export function getDailyPositiveMessage(dateKey: string): string {
  const all: string[] = [];
  TONE_MESSAGES.motivation.forEach((m) => all.push(m));
  TONE_MESSAGES.general.forEach((m) => all.push(m));
  let hash = 0;
  for (let i = 0; i < dateKey.length; i++) {
    hash = (hash * 31 + dateKey.charCodeAt(i)) >>> 0;
  }
  return all[hash % all.length];
}
