"use client";

import { useState } from "react";

interface PhilosophyParagraphsProps {
  paragraphs: string[];
}

export function PhilosophyParagraphs({ paragraphs }: PhilosophyParagraphsProps) {
  const [expanded, setExpanded] = useState(false);

  if (!paragraphs || paragraphs.length === 0) return null;

  const first = paragraphs[0];
  const rest = paragraphs.slice(1);

  return (
    <>
      <p>
        {first}{" "}
        {rest.length > 0 && !expanded && (
          <button
            className="show-more-btn"
            onClick={() => setExpanded(true)}
            aria-expanded={false}
          >
            Show more
          </button>
        )}
      </p>
      {expanded && (
        <>
          {rest.map((p, i) => <p key={i}>{p}</p>)}
          <button
            className="show-more-btn"
            onClick={() => setExpanded(false)}
            aria-expanded={true}
          >
            Show less
          </button>
        </>
      )}
    </>
  );
}
