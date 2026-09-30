'use client'

import { useContext } from "react"
import { PlayerContext } from "../../layouts/FrontendLayuot"

type LyricLine = {
    time: number;
    text: string;
};

const parseLyrics = (lyrics: string): LyricLine[] | null => {
    const parsed: LyricLine[] = [];

    for (const line of lyrics.split("\n")) {
        const match = line.match(/\[(\d{1,2}):(\d{2})(?:\.(\d{1,3}))?\]\s*(.*)/);
        if (!match) continue;

        const minutes = parseInt(match[1], 10);
        const seconds = parseInt(match[2], 10);
        const fraction = match[3] ? parseFloat(`0.${match[3]}`) : 0;

        parsed.push({
            time: minutes * 60 + seconds + fraction,
            text: match[4].trim(),
        });
    }

    return parsed.length > 0 ? parsed : null;
};

const stripTimestamps = (lyrics: string): string[] =>
    lyrics
        .split("\n")
        .map((line) => line.replace(/\[.*?\]\s*/g, "").trim())
        .filter(Boolean);

export default function AllSongsLyrics() {
    const context = useContext(PlayerContext);

    const currentMusic = context?.currentMusic;
    const currentTime = context?.currentTime ?? 0;

    const lyrics = currentMusic?.lyrics;
    const parsed = lyrics ? parseLyrics(lyrics) : null;
    const plainLines = lyrics ? stripTimestamps(lyrics) : [];

    let activeIndex = -1;
    if (parsed) {
        for (let i = 0; i < parsed.length; i++) {
            if (parsed[i].time <= currentTime) activeIndex = i;
        }
    }

    if (!currentMusic) return null;

    const hasLyrics = plainLines.length > 0;

    return (
        <section className="mt-12 rounded-2xl border border-white/10 bg-gradient-to-b from-zinc-900/60 to-background p-5 sm:p-7">
            <div className="flex items-center gap-2 mb-1">
                <h3 className="text-white text-lg font-semibold">Lyrics</h3>
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
                    {currentMusic.title}
                </span>
            </div>
            <p className="text-xs text-secondary-text mb-5 truncate">
                {currentMusic.artist}
            </p>

            {!hasLyrics ? (
                <p className="text-secondary-text text-sm py-4">
                    No lyrics for this song yet. Add plain lyrics to the{" "}
                    <code className="text-primary">lyrics</code> column in Supabase
                    to see them here.
                </p>
            ) : (
                <div className="max-h-80 overflow-y-auto pr-2 [scrollbar-width:thin]">
                    {parsed
                        ? parsed.map((line, index) => (
                              <p
                                  key={`${line.time}-${index}`}
                                  className={`py-1.5 text-base sm:text-lg leading-relaxed transition-all duration-300 ${
                                      index === activeIndex
                                          ? "text-primary font-semibold scale-[1.02]"
                                          : "text-secondary-text/60 hover:text-secondary-text"
                                  }`}
                              >
                                  {line.text || "♪"}
                              </p>
                          ))
                        : plainLines.map((line, index) => (
                              <p
                                  key={index}
                                  className="py-1.5 text-base sm:text-lg leading-relaxed text-secondary-text/70"
                              >
                                  {line}
                              </p>
                          ))}
                </div>
            )}
        </section>
    );
}
