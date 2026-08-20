"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

interface PhilosophyParagraphsProps {
  paragraphs: string[];
}

export function PhilosophyParagraphs({ paragraphs }: PhilosophyParagraphsProps) {
  const [expanded, setExpanded] = useState(false);

  if (!paragraphs || paragraphs.length === 0) return null;

  const first = paragraphs[0];
  const rest = paragraphs.slice(1);

  return (
    <div className="philosophy-content-block">
      <p className="philosophy-lead">{first}</p>
      {rest.length > 0 && (
        <>
          <div
            id="philosophy-extended"
            className={`philosophy-extended ${expanded ? "open" : ""}`}
            aria-hidden={!expanded}
          >
            <div className="philosophy-extended-inner">
              {rest.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          </div>
          <button
            type="button"
            className={`show-more-btn ${expanded ? "expanded" : ""}`}
            onClick={() => setExpanded((prev) => !prev)}
            aria-expanded={expanded}
            aria-controls="philosophy-extended"
          >
            <span>{expanded ? "Show less" : "Read more"}</span>
            <ChevronDown aria-hidden="true" />
          </button>
        </>
      )}
    </div>
  );
}
