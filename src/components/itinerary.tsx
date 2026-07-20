"use client";

import { useState } from "react";
import { itinerary } from "@/data/retreat";

export function Itinerary() {
  const [active, setActive] = useState(0);
  const item = itinerary[active];
  return (
    <div className="itinerary-shell">
      <div className="day-tabs" role="tablist" aria-label="Retreat days">
        {itinerary.map((entry, index) => (
          <button key={entry.day} className={active === index ? "active" : ""} onClick={() => setActive(index)} role="tab">
            <span>0{index + 1}</span>{entry.element}
          </button>
        ))}
      </div>
      <div className="day-panel" role="tabpanel">
        <p className="eyebrow">{item.day} · {item.element}</p>
        <h3>{item.title}</h3>
        <ol>{item.activities.map((activity, index) => <li key={activity}><span>{String(index + 1).padStart(2, "0")}</span>{activity}</li>)}</ol>
        <p className="schedule-note">The complete time-by-time schedule becomes available in your retreat account after booking.</p>
      </div>
    </div>
  );
}
