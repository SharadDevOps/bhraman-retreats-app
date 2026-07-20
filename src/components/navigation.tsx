"use client";

import { Menu, X } from "lucide-react";
import { useState } from "react";

export function Navigation() {
  const [open, setOpen] = useState(false);
  return (
    <header className="nav-wrap">
      <a className="brand" href="#top" aria-label="Bhraman Retreats home">
        <span className="brand-mark">भ</span><span>Bhraman <i>Retreats</i></span>
      </a>
      <nav className={open ? "nav-links open" : "nav-links"} aria-label="Main navigation">
        <a href="#philosophy" onClick={() => setOpen(false)}>Our story</a>
        <a href="#elements" onClick={() => setOpen(false)}>The elements</a>
        <a href="#retreat" onClick={() => setOpen(false)}>Upcoming retreat</a>
        <a href="#itinerary" onClick={() => setOpen(false)}>Itinerary</a>
      </nav>
      <button className="menu-button" onClick={() => setOpen(!open)} aria-label="Toggle menu">{open ? <X /> : <Menu />}</button>
    </header>
  );
}
