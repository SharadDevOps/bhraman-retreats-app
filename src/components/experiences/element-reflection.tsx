"use client";

import { useState } from "react";
import { trackAnonymousProductEvent } from "@/lib/anonymous-analytics.mjs";
import { calculateElementResult, ELEMENT_QUESTIONS } from "@/lib/experience-model.mjs";
import { ExperiencePanel, RetreatExperienceCta } from "@/components/experiences/experience-shared";

export function ElementReflection({ onExit }: { onExit: () => void }) {
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [result, setResult] = useState<ReturnType<typeof calculateElementResult>>(null);
  const question = ELEMENT_QUESTIONS[questionIndex];
  const answer = (id: string) => {
    const next = [...answers, id];
    if (questionIndex === ELEMENT_QUESTIONS.length - 1) {
      const nextResult = calculateElementResult(next);
      setAnswers(next);
      setResult(nextResult);
      if (nextResult) trackAnonymousProductEvent("element_result_viewed", { element: nextResult.element });
      trackAnonymousProductEvent("experience_completed", { experience: "element-reflection" });
    } else { setAnswers(next); setQuestionIndex(questionIndex + 1); }
  };
  const restart = () => { setAnswers([]); setQuestionIndex(0); setResult(null); };
  return (
    <ExperiencePanel eyebrow="Element reflection" title="Which element needs your attention?" element={(result?.element ?? "earth")} onExit={onExit}>
      {!result ? <><p className="reflection-disclaimer">A reflective experience, not a diagnosis. Choose what feels closest without overthinking it.</p><div className="question-progress" aria-label={`Question ${questionIndex + 1} of ${ELEMENT_QUESTIONS.length}`}><i style={{ width: `${((questionIndex + 1) / ELEMENT_QUESTIONS.length) * 100}%` }} /></div><fieldset className="reflection-question"><legend>{question.prompt}</legend>{question.options.map((option) => <button type="button" key={option.id} onClick={() => answer(option.id)}>{option.label}</button>)}</fieldset></> : <div className="element-result" role="status"><p className="eyebrow">An invitation from {result.label}</p><h4>{result.label}</h4><p>{result.invitation}</p><small>This is a reflective prompt only. It is not medical or mental-health advice.</small><div className="experience-controls"><button type="button" onClick={restart}>Reflect again</button><RetreatExperienceCta source="element-reflection" /></div></div>}
    </ExperiencePanel>
  );
}