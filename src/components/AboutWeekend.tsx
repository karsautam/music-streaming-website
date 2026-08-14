'use client'

import React, { useEffect } from "react";
import { FaFacebook, FaInstagram, FaXTwitter } from "react-icons/fa6";

const albums = [
  "Trilogy (2012)",
  "Kiss Land (2013)",
  "Beauty Behind the Madness (2015)",
  "Starboy (2016)",
  "My Dear Melancholy (2018)",
  "After Hours (2020)",
  "Dawn FM (2022)",
  "Hurry Up Tomorrow (2025)",
];

const bestAlbums = [
  "After Hours (2020)",
  "Starboy (2016)",
  "Beauty Behind the Madness (2015)",
  "Trilogy (2012)",
  "Dawn FM (2022)",
];

const facts = [
  "Born Abel Makkonen Tesfaye on February 16, 1990, in Toronto, Ontario, Canada.",
  "Genre-blending artist known for R&B, pop, and synthwave.",
  "Reached global fame with hits like 'Blinding Lights', 'Starboy', 'The Hills' and 'Save Your Tears'.",
  "'Blinding Lights' is one of the most-streamed songs in history.",
  "Performed the Super Bowl LV halftime show in 2021.",
  "His After Hours era defined the synthwave revival of the 2020s.",
];

const awards = [
  "4× Grammy Award winner",
  "20× Billboard Music Awards",
  "6× American Music Awards",
  "22× Juno Awards (Canada)",
  "4× Guinness World Records",
  "Named Spotify's most-streamed artist of 2023",
];

const socials = [
  {
    label: "Instagram",
    icon: <FaInstagram size={18} />,
    href: "https://www.instagram.com/theweeknd",
  },
  {
    label: "X (Twitter)",
    icon: <FaXTwitter size={18} />,
    href: "https://x.com/theweeknd",
  },
  {
    label: "Facebook",
    icon: <FaFacebook size={18} />,
    href: "https://www.facebook.com/theweeknd",
  },
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
            className="w-full h-44 object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent" />
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

        {/* Stats */}
        <div className="grid grid-cols-2 gap-2 p-5 pb-0">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-center">
            <p className="text-green-500 text-xl font-bold">#3</p>
            <p className="text-zinc-400 text-[11px] uppercase tracking-wider">
              World Rank
            </p>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-center">
            <p className="text-green-500 text-xl font-bold">
              115.2M
            </p>
            <p className="text-zinc-400 text-[11px] uppercase tracking-wider">
              Monthly Listeners
            </p>
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
              Awards & Achievements
            </h3>
            <ul className="space-y-2">
              {awards.map((award, i) => (
                <li key={i} className="flex gap-2 text-sm text-zinc-300">
                  <span className="text-green-500 mt-0.5">★</span>
                  <span>{award}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-green-500 text-xs font-semibold uppercase tracking-widest mb-2">
              Best Albums
            </h3>
            <div className="flex flex-wrap gap-2">
              {bestAlbums.map((album, i) => (
                <span
                  key={i}
                  className="text-xs text-zinc-300 bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded-full"
                >
                  {album}
                </span>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-green-500 text-xs font-semibold uppercase tracking-widest mb-2">
              Discography
            </h3>
            <div className="flex flex-wrap gap-2">
              {albums.map((album, i) => (
                <span
                  key={i}
                  className="text-xs text-zinc-400 bg-zinc-900/60 border border-zinc-800/60 px-3 py-1.5 rounded-full"
                >
                  {album}
                </span>
              ))}
            </div>
          </div>

          {/* Socials */}
          <div>
            <h3 className="text-green-500 text-xs font-semibold uppercase tracking-widest mb-3">
              Follow
            </h3>
            <div className="flex gap-3">
              {socials.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-zinc-300 bg-zinc-900 border border-zinc-800 px-4 py-2 rounded-full hover:bg-zinc-800 hover:text-white transition cursor-pointer"
                >
                  {social.icon}
                  {social.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
