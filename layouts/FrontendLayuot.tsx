'use client'

import MusicPlayer from "@/components/MusicPlayer";
import Navbar from "@/components/Navbar";
import Queue from "@/components/Queue";
import Lyrics from "@/components/Lyrics";
import Sidebar from "@/components/Sidebar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React, { createContext, useCallback, useEffect, useRef, useState } from "react";
import { Song } from "../types/song";

type PlayerContextType = {
  isQueueModeOpen: boolean;
  setIsQueueModeOpen: React.Dispatch<React.SetStateAction<boolean>>;

  isLyricsOpen: boolean;
  setIsLyricsOpen: React.Dispatch<React.SetStateAction<boolean>>;

  lyricsSyncActive: boolean;
  setLyricsSyncActive: React.Dispatch<React.SetStateAction<boolean>>;

  lyricsFetchState: "idle" | "loading" | "notfound" | "done";
  setLyricsFetchState: React.Dispatch<
    React.SetStateAction<"idle" | "loading" | "notfound" | "done">
  >;

  currentMusic: Song | null;

  isPlaying: boolean;
  setIsPlaying: React.Dispatch<React.SetStateAction<boolean>>;

  isNowPlayingOpen: boolean;
  setIsNowPlayingOpen: React.Dispatch<React.SetStateAction<boolean>>;

  duration: number;
  seek: (time: number) => void;
  audioRef: React.RefObject<HTMLAudioElement | null>;
  togglePlay: () => void;
  formatTime: (time: number) => string;

  loop: boolean;
  setLoop: React.Dispatch<React.SetStateAction<boolean>>;

  volume: number;
  setVolume: React.Dispatch<React.SetStateAction<number>>;

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
  const [lyricsFetchState, setLyricsFetchState] =
    useState<"idle" | "loading" | "notfound" | "done">("idle");
  const [isPlaying, setIsPlaying] = useState(false);
  const [isNowPlayingOpen, setIsNowPlayingOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState<number | null>(null);
  const [queue, setQueue] = useState<Song[]>([]);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [shuffle, setShuffle] = useState(false);
  const [loop, setLoop] = useState(false);
  const [volume, setVolume] = useState(50);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) audio.volume = volume / 100;
  }, [volume]);

  const seek = useCallback((time: number) => {
    setCurrentTime(time);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  }, []);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      audio.play().catch(() => setIsPlaying(false));
    } else {
      audio.pause();
    }
  }, []);

  const formatTime = useCallback((time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60)
      .toString()
      .padStart(2, "0");
    return `${minutes}:${seconds}`;
  }, []);

  // ✅ Current Song Logic (SAFE)
  const currentMusic =
    currentIndex !== null &&
    queue.length > 0 &&
    currentIndex >= 0 &&
    currentIndex < queue.length
      ? queue[currentIndex]
      : null;

  const currentAudioUrl = currentMusic?.audio_url ?? null;

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => {
      setCurrentTime(audio.currentTime);
      setDuration(audio.duration || 0);
    };

    const syncPlaying = () => setIsPlaying(!audio.paused);
    const syncEnded = () => setIsPlaying(false);

    audio.addEventListener("timeupdate", updateTime);
    audio.addEventListener("loadedmetadata", updateTime);
    audio.addEventListener("durationchange", updateTime);
    audio.addEventListener("seeked", updateTime);
    audio.addEventListener("play", syncPlaying);
    audio.addEventListener("pause", syncPlaying);
    audio.addEventListener("ended", syncEnded);

    updateTime();

    return () => {
      audio.removeEventListener("timeupdate", updateTime);
      audio.removeEventListener("loadedmetadata", updateTime);
      audio.removeEventListener("durationchange", updateTime);
      audio.removeEventListener("seeked", updateTime);
      audio.removeEventListener("play", syncPlaying);
      audio.removeEventListener("pause", syncPlaying);
      audio.removeEventListener("ended", syncEnded);
    };
  }, [currentAudioUrl]);

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
      if (prev[0]?.id === currentMusic.id) return prev;
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

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentAudioUrl) return;

    audio.currentTime = 0;
    audio.load();

    const playAudio = async () => {
      try {
        await audio.play();
        setIsPlaying(true);
      } catch (error) {
        console.log("Audioplay error:", error);
        setIsPlaying(false);
      }
    };
    playAudio();
  }, [currentAudioUrl]);

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

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleEnded = () => {
      if (audio.loop) {
        audio.currentTime = 0;
        audio.play();
      } else {
        playNext();
      }
    };

    audio.addEventListener("ended", handleEnded);
    return () => audio.removeEventListener("ended", handleEnded);
  }, [playNext]);

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
    lyricsFetchState,
    setLyricsFetchState,
          currentMusic,
          isPlaying,
          setIsPlaying,
          isNowPlayingOpen,
          setIsNowPlayingOpen,
          duration,
          seek,
          audioRef,
          togglePlay,
          formatTime,
          loop,
          setLoop,
          volume,
          setVolume,
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

          <div className={`flex pt-16 ${isNowPlayingOpen ? "pb-6" : "pb-20"}`}>

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

          {/* 🎵 Single shared audio element for the whole app */}
          {currentMusic && (
            <audio
              src={currentMusic.audio_url || ""}
              ref={audioRef}
            ></audio>
          )}

          {/* 🎵 Music Player only renders if song exists and expanded view is closed */}
          {currentMusic && !isNowPlayingOpen && <MusicPlayer />}

        </div>
      </PlayerContext.Provider>
    </QueryClientProvider>
  );
}