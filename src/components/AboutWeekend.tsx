'use client'

import React, { useEffect } from "react";

const albums = [
  "Trilogy (2012)",
  "Kiss Land (2013)",
  "Beauty Behind the Madness (2015)",
  "Starboy (2016)",
  "After Hours (2020)",
  "Dawn FM (2022)",
  "Hurry Up Tomorrow (2025)",
];

const facts = [
  "Born Abel Makkonen Tesfaye on February 16, 1990, in Toronto, Canada.",
  "Genre-blending artist known for R&B, pop, and synthwave.",
  "Reached global fame with hits like 'Blinding Lights', 'Starboy', 'The Hills' and 'Save Your Tears'.",
  "'Blinding Lights' is one of the most-streamed songs in history.",
  "Performed the Super Bowl LV halftime show in 2021.",
  "His After Hours era defined the synthwave revival of the 2020s.",
];

export default function AboutWeekend({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl max-h-[85vh] flex flex-col"
      >
        {/* Cover */}
        <div className="relative">
          <img
            src="/images/the weekend.jpeg"
            alt="The Weeknd"
            className="w-full h-48 object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/30 to-transparent" />
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-8 h-8 grid place-items-center rounded-full bg-black/60 text-white hover:bg-black/80 transition cursor-pointer"
            title="Close"
          >
            ✕
          </button>
          <div className="absolute bottom-3 left-5">
            <h2 className="text-white text-2xl font-bold">The Weeknd</h2>
            <p className="text-zinc-300 text-sm">Abel Makkonen Tesfaye</p>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          <div>
            <h3 className="text-green-500 text-xs font-semibold uppercase tracking-widest mb-2">
              About
            </h3>
            <ul className="space-y-2">
              {facts.map((fact, i) => (
                <li key={i} className="flex gap-2 text-sm text-zinc-300">
                  <span className="text-green-500 mt-0.5">♪</span>
                  <span>{fact}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-green-500 text-xs font-semibold uppercase tracking-widest mb-2">
              Discography
            </h3>
            <div className="flex flex-wrap gap-2">
              {albums.map((album, i) => (
                <span
                  key={i}
                  className="text-xs text-zinc-300 bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded-full"
                >
                  {album}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
