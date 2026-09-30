'use client'

import React, { useContext, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "../../lib/SupabaseClient";
import { PlayerContext } from "../../layouts/FrontendLayuot";

type LyricLine = {
  time: number;
  text: string;
};

const parseLyrics = (lyrics: string): LyricLine[] | null => {
  const lines = lyrics.split("\n");
  const parsed: LyricLine[] = [];

  for (const line of lines) {
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

const stripTimestamps = (lyrics: string): string[] => {
  return lyrics
    .split("\n")
    .map((line) => line.replace(/\[.*?\]\s*/g, "").trim())
    .filter(Boolean);
};

const formatStamp = (t: number) => {
  const m = Math.floor(t / 60);
  const s = Math.floor(t % 60);
  const d = Math.floor((t % 1) * 10);
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}.${d}`;
};

export default function Lyrics() {
  const context = useContext(PlayerContext);
  if (!context) return null;

  const { isLyricsOpen, setIsLyricsOpen, isNowPlayingOpen, currentMusic, currentTime, setQueue, setLyricsSyncActive } =
    context;

  const queryClient = useQueryClient();
  const lyricsViewportRef = useRef<HTMLDivElement | null>(null);
  const lyricsInnerRef = useRef<HTMLDivElement | null>(null);
  const lineRefs = useRef<(HTMLParagraphElement | null)[]>([]);

  const [isSyncMode, setIsSyncMode] = useState(false);
  const [syncIndex, setSyncIndex] = useState(0);
  const [syncTimes, setSyncTimes] = useState<number[]>([]);
  const [syncSaved, setSyncSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  const { setLyricsFetchState: setAutoState, lyricsFetchState: autoState } =
    context;
  const fetchedForIdRef = useRef<number | null>(null);

  useEffect(() => {
    setLyricsSyncActive(isSyncMode);
  }, [isSyncMode, setLyricsSyncActive]);

  const parsed = useMemo(
    () => (currentMusic?.lyrics ? parseLyrics(currentMusic.lyrics) : null),
    [currentMusic?.lyrics]
  );

  const activeIndex = useMemo(() => {
    if (!parsed) return -1;
    let index = -1;
    for (let i = 0; i < parsed.length; i++) {
      if (parsed[i].time <= currentTime) index = i;
    }
    return index;
  }, [parsed, currentTime]);

  useEffect(() => {
    if (!isLyricsOpen || isSyncMode || !parsed) return;

    const viewport = lyricsViewportRef.current;
    const inner = lyricsInnerRef.current;
    if (!viewport || !inner) return;

    const line = lineRefs.current[activeIndex === -1 ? 0 : activeIndex];
    if (!line) return;

    const target = line.offsetTop + line.offsetHeight / 2 - viewport.clientHeight / 2;
    const max = Math.max(0, inner.scrollHeight - viewport.clientHeight);
    inner.style.transform = `translateY(${Math.min(Math.max(-target, -max), 0)}px)`;
  }, [activeIndex, isLyricsOpen, isSyncMode, parsed]);

  const syncLines = useMemo(
    () => (currentMusic?.lyrics ? stripTimestamps(currentMusic.lyrics) : []),
    [currentMusic?.lyrics]
  );

  const syncDone = syncLines.length > 0 && syncIndex >= syncLines.length;

  const generated = useMemo(
    () =>
      syncLines
        .map((line, i) => `[${formatStamp(syncTimes[i] ?? 0)}] ${line}`)
        .join("\n"),
    [syncLines, syncTimes]
  );

  const handleTap = () => {
    if (syncLines.length === 0 || syncDone) return;
    const t = Math.max(0, currentTime);
    setSyncTimes((prev) => {
      const next = [...prev];
      next[syncIndex] = t;
      return next;
    });
    setSyncIndex((i) => i + 1);
  };

  useEffect(() => {
    if (!isLyricsOpen || !isSyncMode || syncDone) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space" || e.key === "Enter") {
        const tag = (e.target as HTMLElement).tagName;
        if (tag === "BUTTON" || tag === "INPUT" || tag === "TEXTAREA") return;
        e.preventDefault();
        handleTap();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  });

  const saveTimedLyrics = async () => {
    await saveLyrics(generated);
    setSyncSaved(true);
  };

  const saveLyrics = async (text: string) => {
    if (!currentMusic) return;

    const { error } = await supabase
      .from("songs")
      .update({ lyrics: text })
      .eq("id", currentMusic.id);

    if (error) {
      console.error("Failed to save lyrics:", error.message);
      return;
    }

    setQueue((prev) =>
      prev.map((s) =>
        s.id === currentMusic.id ? { ...s, lyrics: text } : s
      )
    );

    queryClient.invalidateQueries({ queryKey: ["Allsongs"] });
    queryClient.invalidateQueries({ queryKey: ["userSongs"] });
  };

  const fetchSyncedLyrics = async (
    title: string,
    artist: string
  ): Promise<string | null> => {
    const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9\s]/g, "").trim();

    const search = async (query: string) => {
      try {
        const res = await fetch(
          `https://lrclib.net/api/search?${query}&q_format=plain`
        );
        if (!res.ok) return [];
        const json = (await res.json()) as Array<{
          trackName?: string;
          artistName?: string;
          syncedLyrics?: string | null;
        }>;
        return Array.isArray(json) ? json : [];
      } catch {
        return [];
      }
    };

    try {
      const titleNorm = norm(title);
      const artistNorm = norm(artist);

      // Pass 1: title + artist
      let results = await search(
        `track_name=${encodeURIComponent(title)}&artist_name=${encodeURIComponent(
          artist
        )}`
      );

      // Pass 2: title only (artist names often differ, e.g. "The Weekend" vs "The Weeknd")
      if (!results.some((r) => r.syncedLyrics)) {
        const fallback = await search(
          `track_name=${encodeURIComponent(title)}`
        );
        if (fallback.length > 0) results = fallback;
      }

      const score = (r: { trackName?: string; artistName?: string }) => {
        let s = 0;
        if (r.trackName && norm(r.trackName) === titleNorm) s += 3;
        else if (
          r.trackName &&
          norm(r.trackName).includes(titleNorm) &&
          titleNorm.length > 3
        )
          s += 1;
        if (r.artistName && norm(r.artistName) === artistNorm) s += 2;
        return s;
      };

      const withSynced = results.filter((r) => r.syncedLyrics);
      if (withSynced.length === 0) return null;

      withSynced.sort((a, b) => score(b) - score(a));
      return withSynced[0].syncedLyrics ?? null;
    } catch {
      return null;
    }
  };

  const startAutoFetch = () => {
    if (!currentMusic || fetchedForIdRef.current === currentMusic.id) return;

    fetchedForIdRef.current = currentMusic.id;
    setAutoState("loading");

    fetchSyncedLyrics(currentMusic.title, currentMusic.artist).then((text) => {
      if (text) {
        saveLyrics(text);
        setAutoState("done");
      } else {
        setAutoState("notfound");
      }
    });
  };

  useEffect(() => {
    if (!isLyricsOpen && !isNowPlayingOpen) return;
    if (!currentMusic || isSyncMode || parsed) return;
    startAutoFetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLyricsOpen, isNowPlayingOpen, currentMusic?.id, parsed, isSyncMode]);

  const copyGenerated = async () => {
    try {
      await navigator.clipboard.writeText(generated);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      alert("Could not copy. Select the text manually.");
    }
  };

  const enterSyncMode = () => {
    setIsSyncMode(true);
    setSyncIndex(0);
    setSyncTimes([]);
    setSyncSaved(false);
  };

  return (
    <div
      className={`
        fixed top-20 right-6
        w-96 max-w-[calc(100vw-3rem)] h-[75vh]
        bg-[#121212] border border-zinc-900
        rounded-2xl shadow-2xl
        z-50
        flex flex-col overflow-hidden
        transform transition-all duration-300 ease-out
        ${isLyricsOpen && !isNowPlayingOpen
          ? "opacity-100 translate-y-0 scale-100"
          : "opacity-0 translate-y-3 scale-95 pointer-events-none"}
      `}
    >
      {/* Song header */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-zinc-900">
        <img
          src={currentMusic?.cover_image}
          alt={currentMusic?.title}
          className="w-10 h-10 rounded-md object-cover shrink-0 shadow-lg"
        />
        <div className="flex flex-col min-w-0 flex-1">
          <span className="text-[13px] font-semibold text-white truncate">
            {currentMusic?.title}
          </span>
          <span className="text-[11px] text-zinc-500 truncate">
            {currentMusic?.artist}
          </span>
        </div>
          <button
            onClick={() => (isSyncMode ? setIsSyncMode(false) : enterSyncMode())}
            className={`text-[11px] font-semibold px-3 py-1.5 rounded-full transition cursor-pointer ${
              isSyncMode
                ? "bg-green-500 text-black"
                : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
            }`}
            title={isSyncMode ? "Back to lyrics" : "Tap-to-sync lyrics"}
          >
            {isSyncMode ? "Lyrics" : "Sync"}
          </button>
        <button
          onClick={() => setIsLyricsOpen(false)}
          className="text-zinc-500 hover:text-white transition cursor-pointer p-1.5"
          title="Close"
        >
          ✕
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto">
        {!currentMusic ? (
          <p className="text-zinc-500 text-sm text-center mt-10">
            No song playing.
          </p>
        ) : isSyncMode ? (
          <div className="h-full flex flex-col">
            {/* progress */}
            <div className="h-0.5 bg-zinc-900">
              <div
                className="h-full bg-green-500 transition-all duration-200"
                style={{
                  width: `${
                    syncLines.length
                      ? (Math.min(syncIndex, syncLines.length) /
                          syncLines.length) *
                        100
                      : 0
                  }%`,
                }}
              />
            </div>

            <div className="flex-1 flex flex-col items-center justify-center gap-5 px-8 py-6">
              {syncLines.length === 0 ? (
                <p className="text-zinc-400 text-sm text-center leading-relaxed">
                  This song has no lyrics yet. Add plain lyrics to the{" "}
                  <code className="text-green-500">lyrics</code> column in
                  Supabase first.
                </p>
              ) : syncDone ? (
                <>
                  {syncSaved && (
                    <p className="text-green-500 text-sm font-medium">
                      Saved — syncing live now
                    </p>
                  )}
                  <pre className="whitespace-pre-wrap font-sans text-xs text-zinc-300 bg-zinc-900/60 p-3 rounded-lg max-h-56 overflow-y-auto w-full">
                    {generated}
                  </pre>
                  <div className="flex gap-2 w-full">
                    <button
                      onClick={copyGenerated}
                      className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white text-sm py-2.5 rounded-full transition cursor-pointer"
                    >
                      {copied ? "Copied" : "Copy"}
                    </button>
                    <button
                      onClick={saveTimedLyrics}
                      className="flex-1 bg-green-500 hover:bg-green-400 text-black font-semibold text-sm py-2.5 rounded-full transition cursor-pointer"
                    >
                      {syncSaved ? "Saved" : "Save to Song"}
                    </button>
                  </div>
                  <button
                    onClick={enterSyncMode}
                    className="text-xs text-zinc-500 hover:text-white transition cursor-pointer"
                  >
                    ↺ Re-tap from the start
                  </button>
                </>
              ) : (
                <>
                  <p className="text-[11px] uppercase tracking-widest text-zinc-600">
                    Line {syncIndex + 1} of {syncLines.length}
                  </p>

                  <p className="text-center text-white font-medium text-lg leading-relaxed">
                    {syncLines[syncIndex]}
                  </p>

                  <button
                    onClick={handleTap}
                    className="w-16 h-16 rounded-full bg-green-500 hover:bg-green-400 text-black font-bold text-sm flex items-center justify-center transition cursor-pointer active:scale-90"
                  >
                    TAP
                  </button>

                  <p className="text-[11px] text-zinc-600">
                    or press{" "}
                    <kbd className="text-zinc-300 bg-zinc-800 px-1.5 py-0.5 rounded">
                      Space
                    </kbd>{" "}
                    when each line starts
                  </p>

                  <button
                    onClick={() => setSyncIndex((i) => Math.max(0, i - 1))}
                    disabled={syncIndex === 0}
                    className="text-xs text-zinc-600 hover:text-white transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    ◀ Redo last line
                  </button>
                </>
              )}
            </div>
          </div>
        ) : parsed ? (
          <div
            ref={lyricsViewportRef}
            className="relative h-full overflow-hidden px-8 [mask-image:linear-gradient(to_bottom,transparent,black_12%,black_88%,transparent)]"
          >
            {/* soft highlight band behind the active line */}
            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-24 bg-gradient-to-b from-transparent via-white/[0.07] to-transparent pointer-events-none" />

            <div
              ref={lyricsInnerRef}
              className="relative transition-transform duration-500 ease-out will-change-transform py-6"
            >
              {parsed.map((line, index) => {
                const isActive = index === activeIndex;
                return (
                  <p
                    key={index}
                    ref={(el) => {
                      lineRefs.current[index] = el;
                    }}
                    className={`text-left leading-snug transition-colors duration-300 py-[10px] ${
                      isActive
                        ? "text-white text-[18px] font-semibold"
                        : "text-zinc-600 text-[15px]"
                    }`}
                  >
                    {line.text}
                  </p>
                );
              })}
            </div>
          </div>
        ) : autoState === "loading" ? (
          <div className="flex flex-col items-center justify-center gap-3 h-full px-8">
            <div className="w-6 h-6 border-2 border-zinc-700 border-t-green-500 rounded-full animate-spin" />
            <p className="text-zinc-400 text-sm">
              Loading synced lyrics…
            </p>
          </div>
        ) : autoState === "notfound" ? (
          <div className="flex flex-col items-center gap-3 px-8 py-8 text-center">
            <p className="text-zinc-400 text-sm leading-relaxed">
              No synced lyrics found for this song.
            </p>
            <div className="flex gap-2">
              <button
                onClick={startAutoFetch}
                className="text-xs font-semibold text-white bg-zinc-800 hover:bg-zinc-700 px-4 py-2 rounded-full transition cursor-pointer"
              >
                Try again
              </button>
              <button
                onClick={enterSyncMode}
                className="text-xs font-semibold text-black bg-green-500 hover:bg-green-400 px-4 py-2 rounded-full transition cursor-pointer"
              >
                Manual Sync
              </button>
            </div>
            {currentMusic.lyrics && currentMusic.lyrics.trim() && (
              <p className="text-zinc-500 text-sm leading-relaxed whitespace-pre-line mt-3">
                {currentMusic.lyrics}
              </p>
            )}
          </div>
        ) : currentMusic.lyrics && currentMusic.lyrics.trim() ? (
          <p className="text-zinc-400 text-sm leading-relaxed whitespace-pre-line px-8 py-6">
            {currentMusic.lyrics}
          </p>
        ) : (
          <p className="text-zinc-500 text-sm text-center mt-10">
            No lyrics available for this song.
          </p>
        )}
      </div>
    </div>
  );
}
