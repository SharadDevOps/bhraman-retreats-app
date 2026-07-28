import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { createAnonymousProductEvent, PRODUCT_EVENTS } from "../src/lib/anonymous-analytics.mjs";
import {
  BREATHING_TOTAL_MS,
  calculateElementResult,
  ELEMENT_QUESTIONS,
  getBreathingState,
  getDailyPause,
  INTENTIONS,
} from "../src/lib/experience-model.mjs";

test("breathing timing follows five 4-2-6 cycles for one minute", () => {
  assert.equal(BREATHING_TOTAL_MS, 60000);
  assert.deepEqual({ phase: getBreathingState(0).phase, seconds: getBreathingState(0).remainingMs / 1000 }, { phase: "inhale", seconds: 4 });
  assert.equal(getBreathingState(3999).phase, "inhale");
  assert.equal(getBreathingState(4000).phase, "hold");
  assert.equal(getBreathingState(6000).phase, "exhale");
  assert.equal(getBreathingState(12000).cycle, 2);
  assert.equal(getBreathingState(59999).complete, false);
  assert.equal(getBreathingState(60000).complete, true);
});

test("element result calculation scores only configured fixed-choice answers", () => {
  const result = calculateElementResult(["steady", "routine", "ground", "home", "walk"]);
  assert.equal(result.element, "earth");
  assert.equal(result.scores.earth, 5);
  assert.equal(result.answered, 5);
  assert.equal(calculateElementResult(["unknown"]), null);
});

test("reflective question model contains no more than five accessible fixed-choice questions", () => {
  assert.ok(ELEMENT_QUESTIONS.length <= 5);
  assert.equal(ELEMENT_QUESTIONS.length, 5);
  for (const question of ELEMENT_QUESTIONS) {
    assert.ok(question.prompt.trim().length > 0);
    assert.ok(question.options.length >= 2);
    assert.equal(new Set(question.options.map((option) => option.id)).size, question.options.length);
  }
  assert.deepEqual(INTENTIONS.map((item) => item.label), ["Peace", "Healing", "Clarity", "Purpose", "Rest", "Digital Detox"]);
});

test("daily pause is stable for a day and rotates across dates", () => {
  assert.deepEqual(getDailyPause("2026-07-28"), getDailyPause("2026-07-28"));
  const activities = new Set(Array.from({ length: 14 }, (_, day) => getDailyPause(`2026-08-${day + 1}`).id));
  assert.ok(activities.size > 1);
});

test("anonymous analytics accepts only approved events and properties", () => {
  assert.deepEqual(PRODUCT_EVENTS, ["experience_started", "experience_completed", "intention_selected", "element_result_viewed", "retreat_cta_clicked"]);
  const event = createAnonymousProductEvent("intention_selected", { intention: "peace", answer: "private free text", email: "person@example.com" });
  assert.deepEqual(event, { event: "intention_selected", properties: { intention: "peace" } });
  assert.throws(() => createAnonymousProductEvent("wellness_answer_saved", { answer: "sensitive" }), /Unsupported/);
});

test("experience components expose keyboard-native controls and reflective disclaimer", () => {
  const intention = readFileSync(new URL("../src/components/experiences/intention-experience.tsx", import.meta.url), "utf8");
  const reflection = readFileSync(new URL("../src/components/experiences/element-reflection.tsx", import.meta.url), "utf8");
  const breathing = readFileSync(new URL("../src/components/experiences/breathing-experience.tsx", import.meta.url), "utf8");
  const module = readFileSync(new URL("../src/components/experiences/experience-bhraman.tsx", import.meta.url), "utf8");
  assert.match(intention, /<fieldset/);
  assert.match(intention, /<legend>/);
  assert.match(reflection, /not a diagnosis/i);
  assert.match(reflection, /<fieldset/);
  assert.match(breathing, /aria-live="polite"/);
  assert.match(breathing, /aria-pressed=\{bellOn\}/);
  assert.match(module, /event\.key === "Escape"/);
  assert.doesNotMatch(`${intention}${reflection}`, /type="text"|<textarea/i);
});