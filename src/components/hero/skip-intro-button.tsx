export function SkipIntroButton({ onSkip, hidden }: { onSkip: () => void; hidden: boolean }) {
  if (hidden) return null;
  return <button className="skip-intro-button" type="button" onClick={onSkip}>Skip Intro</button>;
}