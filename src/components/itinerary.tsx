"use client";

import { useEffect, useState } from "react";

export type ItineraryItem = {
  day: string;
  element: string;
  title: string;
  activities: string[];
};

export function Itinerary({ items, scheduleNote }: { items: ItineraryItem[]; scheduleNote: string }) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.toLowerCase().replace("#", "");
      if (!hash) return;
      const index = items.findIndex(
        (it, idx) =>
          hash === `day-${it.element.toLowerCase()}` ||
          hash === `day-${idx + 1}` ||
          hash === it.element.toLowerCase()
      );
      if (index !== -1) {
        setActive(index);
      }
    };

    handleHash();
    window.addEventListener("hashchange", handleHash);
    return () => window.removeEventListener("hashchange", handleHash);
  }, [items]);

  const item = items[active];
  if (!item) return null;
  return (
    <div className="itinerary-shell">
      <div className="day-tabs" role="tablist" aria-label="Retreat days">
        {items.map((entry, index) => (
          <button
            key={entry.day}
            id={`day-${entry.element.toLowerCase()}`}
            className={active === index ? "active" : ""}
            onClick={() => setActive(index)}
            role="tab"
            aria-selected={active === index}
          >
            <span>0{index + 1}</span>{entry.element}
          </button>
        ))}
      </div>
      <div className="day-panel" role="tabpanel">
        <p className="eyebrow">{item.day} · {item.element}</p>
        <h3>{item.title}</h3>
        <ol>{item.activities.map((activity, index) => <li key={activity}><span>{String(index + 1).padStart(2, "0")}</span>{activity}</li>)}</ol>
        <p className="schedule-note">{scheduleNote}</p>
      </div>
    </div>
  );
}
