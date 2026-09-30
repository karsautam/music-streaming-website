'use client'

import MusicPlayer from "@/components/MusicPlayer";
import Navbar from "@/components/Navbar";
import Queue from "@/components/Queue";
import Lyrics from "@/components/Lyrics";
import Sidebar from "@/components/Sidebar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React, { createContext, useEffect, useState } from "react";
import { Song } from "../types/song";

type PlayerContextType = {
  isQueueModeOpen: boolean;
  setIsQueueModeOpen: React.Dispatch<React.SetStateAction<boolean>>;

  isLyricsOpen: boolean;
  setIsLyricsOpen: React.Dispatch<React.SetStateAction<boolean>>;

  lyricsSyncActive: boolean;
  setLyricsSyncActive: React.Dispatch<React.SetStateAction<boolean>>;

  currentMusic: Song | null;

  isPlaying: boolean;
  setIsPlaying: React.Dispatch<React.SetStateAction<boolean>>;

  currentTime: number;
  setCurrentTime: React.Dispatch<React.SetStateAction<number>>;

  queue: Song[];
  setQueue: React.Dispatch<React.SetStateAction<Song[]>>;

  playNext: () => void;
  playPrev: () => void;

  setCurrentIndex: React.Dispatch<React.SetStateAction<number | null>>;
  currentIndex: number | null;

  searchQuery: string;
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>;

  shuffle: boolean;
  setShuffle: React.Dispatch<React.SetStateAction<boolean>>;

  favorites: Song[];
  toggleFavorite: (song: Song) => void;
  isFavorite: (id: number) => boolean;

  recentlyPlayed: Song[];
};

export const PlayerContext =
  createContext<PlayerContextType | undefined>(undefined);

export default function FrontendLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {

  const queryClient = new QueryClient();

  const [isQueueModeOpen, setIsQueueModeOpen] = useState(false);
  const [isLyricsOpen, setIsLyricsOpen] = useState(false);
  const [lyricsSyncActive, setLyricsSyncActive] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState<number | null>(null);
  const [queue, setQueue] = useState<Song[]>([]);
  const [currentTime, setCurrentTime] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [shuffle, setShuffle] = useState(false);

  // ✅ Current Song Logic (SAFE)
  const currentMusic =
    currentIndex !== null &&
    queue.length > 0 &&
    currentIndex >= 0 &&
    currentIndex < queue.length
      ? queue[currentIndex]
      : null;

  // ✅ Favorites (localStorage)
  const [favorites, setFavorites] = useState<Song[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      return JSON.parse(localStorage.getItem("favorites") || "[]");
    } catch {
      return [];
    }
  });

  const toggleFavorite = (song: Song) => {
    setFavorites((prev) => {
      const exists = prev.some((s) => s.id === song.id);
      const next = exists
        ? prev.filter((s) => s.id !== song.id)
        : [song, ...prev];
      try {
        localStorage.setItem("favorites", JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  };

  const isFavorite = (id: number) =>
    favorites.some((s) => s.id === id);

  // ✅ Recently Played (localStorage)
  const [recentlyPlayed, setRecentlyPlayed] = useState<Song[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      return JSON.parse(localStorage.getItem("recentlyPlayed") || "[]");
    } catch {
      return [];
    }
  });

  useEffect(() => {
    if (!currentMusic) return;
    setRecentlyPlayed((prev) => {
      const next = [
        currentMusic,
        ...prev.filter((s) => s.id !== currentMusic.id),
      ].slice(0, 20);
      try {
        localStorage.setItem("recentlyPlayed", JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  }, [currentMusic]);

  // ✅ Play Next (shuffle-aware)
  const playNext = () => {
    if (currentIndex === null || queue.length === 0) return;

    if (shuffle && queue.length > 1) {
      let next = currentIndex;
      while (next === currentIndex) {
        next = Math.floor(Math.random() * queue.length);
      }
      setCurrentIndex(next);
      return;
    }

    if (currentIndex < queue.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  // ✅ Play Previous (shuffle-aware)
  const playPrev = () => {
    if (currentIndex === null || queue.length === 0) return;

    if (shuffle && queue.length > 1) {
      let prev = currentIndex;
      while (prev === currentIndex) {
        prev = Math.floor(Math.random() * queue.length);
      }
      setCurrentIndex(prev);
      return;
    }

    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  return (
    <QueryClientProvider client={queryClient}>
      <PlayerContext.Provider
        value={{
          isQueueModeOpen,
          setIsQueueModeOpen,
          isLyricsOpen,
          setIsLyricsOpen,
          lyricsSyncActive,
          setLyricsSyncActive,
          currentMusic,
          isPlaying,
          setIsPlaying,
          currentTime,
          setCurrentTime,
          currentIndex,
          setCurrentIndex,
          queue,
          setQueue,
          playNext,
          playPrev,
          searchQuery,
          setSearchQuery,
          shuffle,
          setShuffle,
          favorites,
          toggleFavorite,
          isFavorite,
          recentlyPlayed,
        }}
      >
        <div className="min-h-screen bg-black text-white">

          {/* Navbar */}
          <Navbar />

          <div className="flex pt-16 pb-20">

            {/* Sidebar */}
            <Sidebar />

            {/* Main Content */}
            <div className="flex-1 px-4 overflow-y-auto">
              {children}
            </div>

          </div>

          {/* Queue Panel */}
          <Queue />

          {/* Lyrics Panel */}
          <Lyrics />

          {/* 🎵 Music Player only renders if song exists */}
          {currentMusic && <MusicPlayer />}

        </div>
      </PlayerContext.Provider>
    </QueryClientProvider>
  );
}