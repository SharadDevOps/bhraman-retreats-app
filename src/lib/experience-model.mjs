export const EXPERIENCE_IDS = Object.freeze(["breathing", "intention", "element-reflection", "daily-pause"]);
export const ELEMENTS = Object.freeze(["earth", "water", "fire", "air", "space"]);

export const BREATHING_PHASES = Object.freeze([
  Object.freeze({ id: "inhale", label: "Inhale", durationMs: 4000 }),
  Object.freeze({ id: "hold", label: "Hold", durationMs: 2000 }),
  Object.freeze({ id: "exhale", label: "Exhale", durationMs: 6000 }),
]);
export const BREATHING_CYCLES = 5;
export const BREATHING_CYCLE_MS = BREATHING_PHASES.reduce((total, phase) => total + phase.durationMs, 0);
export const BREATHING_TOTAL_MS = BREATHING_CYCLE_MS * BREATHING_CYCLES;

export const INTENTIONS = Object.freeze([
  { id: "peace", label: "Peace", element: "space", response: "Let quiet become something you can return to." },
  { id: "healing", label: "Healing", element: "water", response: "Make room for softness without asking yourself to rush." },
  { id: "clarity", label: "Clarity", element: "air", response: "Create a little space before deciding what comes next." },
  { id: "purpose", label: "Purpose", element: "fire", response: "Follow the smallest action that feels honest and alive." },
  { id: "rest", label: "Rest", element: "earth", response: "Let enough be enough for this moment." },
  { id: "digital-detox", label: "Digital Detox", element: "air", response: "Place one gentle boundary around your attention today." },
]);

export const ELEMENT_QUESTIONS = Object.freeze([
  {
    id: "present-need",
    prompt: "What would support you most today?",
    options: [
      { id: "steady", label: "Steadiness", element: "earth" },
      { id: "soften", label: "Room to soften", element: "water" },
      { id: "momentum", label: "Fresh momentum", element: "fire" },
      { id: "breathe", label: "Breathing room", element: "air" },
      { id: "perspective", label: "Quiet perspective", element: "space" },
    ],
  },
  {
    id: "rhythm",
    prompt: "Which rhythm feels furthest away?",
    options: [
      { id: "routine", label: "A steady routine", element: "earth" },
      { id: "flow", label: "Ease and flow", element: "water" },
      { id: "spark", label: "Energy and spark", element: "fire" },
      { id: "lightness", label: "Lightness", element: "air" },
      { id: "stillness", label: "Uninterrupted stillness", element: "space" },
    ],
  },
  {
    id: "body-invitation",
    prompt: "What is your body quietly asking for?",
    options: [
      { id: "ground", label: "Ground and settle", element: "earth" },
      { id: "release", label: "Release and restore", element: "water" },
      { id: "warm", label: "Warm and awaken", element: "fire" },
      { id: "expand", label: "Open and expand", element: "air" },
      { id: "listen", label: "Pause and listen", element: "space" },
    ],
  },
  {
    id: "attention",
    prompt: "Where does your attention naturally want to go?",
    options: [
      { id: "home", label: "Home and foundations", element: "earth" },
      { id: "feeling", label: "Feelings and connection", element: "water" },
      { id: "action", label: "Action and change", element: "fire" },
      { id: "ideas", label: "Ideas and expression", element: "air" },
      { id: "meaning", label: "Meaning and awareness", element: "space" },
    ],
  },
  {
    id: "practice",
    prompt: "Which small practice feels most inviting?",
    options: [
      { id: "walk", label: "A slow barefoot walk", element: "earth" },
      { id: "wash", label: "A mindful wash or bath", element: "water" },
      { id: "sun", label: "Standing in morning light", element: "fire" },
      { id: "breath", label: "Five spacious breaths", element: "air" },
      { id: "silence", label: "Two minutes of silence", element: "space" },
    ],
  },
]);

export const ELEMENT_RESULTS = Object.freeze({
  earth: { label: "Earth", invitation: "Return to simple routines, nourishing food and contact with the ground." },
  water: { label: "Water", invitation: "Invite softness through rest, hydration and unhurried emotional space." },
  fire: { label: "Fire", invitation: "Choose one clear action that rekindles warmth and direction." },
  air: { label: "Air", invitation: "Create room to breathe, move and express what has been held." },
  space: { label: "Space", invitation: "Protect a pocket of silence where perspective can return." },
});

export const DAILY_PAUSES = Object.freeze([
  { id: "three-breaths", title: "Three conscious breaths", activity: "Let each exhale be slightly longer than the inhale." },
  { id: "feet", title: "Feel your feet", activity: "Notice five points of contact between your feet and the ground." },
  { id: "sky", title: "Look toward the sky", activity: "Rest your gaze on the widest view available for one quiet minute." },
  { id: "water", title: "Drink with attention", activity: "Take a glass of water slowly, noticing temperature and movement." },
  { id: "sound", title: "Listen outward", activity: "Name the nearest sound, the farthest sound and the silence beneath both." },
  { id: "shoulders", title: "Release the shoulders", activity: "Lift your shoulders on an inhale and let them soften on the exhale." },
  { id: "screen", title: "Set the screen down", activity: "Place your device out of reach and sit without input for two minutes." },
]);

export function getBreathingState(elapsedMs) {
  const elapsed = Math.max(0, Number(elapsedMs) || 0);
  if (elapsed >= BREATHING_TOTAL_MS) {
    return { complete: true, phase: "complete", label: "Complete", cycle: BREATHING_CYCLES, remainingMs: 0, totalRemainingMs: 0, progress: 1 };
  }
  const cycle = Math.floor(elapsed / BREATHING_CYCLE_MS) + 1;
  const withinCycle = elapsed % BREATHING_CYCLE_MS;
  let boundary = 0;
  for (const phase of BREATHING_PHASES) {
    boundary += phase.durationMs;
    if (withinCycle < boundary) {
      return {
        complete: false,
        phase: phase.id,
        label: phase.label,
        cycle,
        remainingMs: boundary - withinCycle,
        totalRemainingMs: BREATHING_TOTAL_MS - elapsed,
        progress: elapsed / BREATHING_TOTAL_MS,
      };
    }
  }
  throw new Error("Breathing phase could not be resolved.");
}

export function calculateElementResult(answerIds) {
  const scores = Object.fromEntries(ELEMENTS.map((element) => [element, 0]));
  const answers = Array.isArray(answerIds) ? answerIds : [];
  let answered = 0;
  for (const answerId of answers) {
    const option = ELEMENT_QUESTIONS.flatMap((question) => question.options).find((candidate) => candidate.id === answerId);
    if (!option) continue;
    scores[option.element] += 1;
    answered += 1;
  }
  if (!answered) return null;
  const element = ELEMENTS.reduce((best, candidate) => scores[candidate] > scores[best] ? candidate : best, ELEMENTS[0]);
  return { element, scores, answered, ...ELEMENT_RESULTS[element] };
}

export function getDailyPause(date = new Date()) {
  const value = date instanceof Date
    ? `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`
    : String(date);
  const hash = [...value].reduce((total, character) => ((total * 31) + character.charCodeAt(0)) >>> 0, 7);
  return DAILY_PAUSES[hash % DAILY_PAUSES.length];
}