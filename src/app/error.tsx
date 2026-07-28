"use client";

export default function HomepageError({ reset }: { reset: () => void }) {
  return (
    <main className="page-error">
      <p className="eyebrow">A quiet pause</p>
      <h1>The journey could not be opened just now.</h1>
      <p>Please try again. Your enquiry and retreat information remain safe.</p>
      <button className="button button-dark" type="button" onClick={reset}>Try again</button>
    </main>
  );
}
