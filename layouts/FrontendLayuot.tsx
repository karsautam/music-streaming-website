'use client'

import MusicPlayer from "@/components/MusicPlayer";
import Navbar from "@/components/Navbar";
import Queue from "@/components/Queue";
import Sidebar from "@/components/Sidebar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React, { createContext, useState } from "react";
import { Song } from "../types/song";

type PlayerContextType = {
  isQueueModeOpen: boolean;
  setIsQueueModeOpen: React.Dispatch<React.SetStateAction<boolean>>;

  currentMusic: Song | null;

  queue: Song[];
  setQueue: React.Dispatch<React.SetStateAction<Song[]>>;

  playNext: () => void;
  playPrev: () => void;

  setCurrentIndex: React.Dispatch<React.SetStateAction<number | null>>;
  currentIndex: number | null;
};

export const PlayerContext =
  createContext<PlayerContextType | undefined>(undefined);

export default function FrontendLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {

  const queryClient = new QueryClient();

  const [isQueueModeOpen, setIsQueueModeOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState<number | null>(null);
  const [queue, setQueue] = useState<Song[]>([]);

  // ✅ Play Next
  const playNext = () => {
    if (currentIndex !== null && currentIndex < queue.length - 1) {
      setCurrentIndex(prev =>
        prev !== null ? prev + 1 : 0
      );
    }
  };

  // ✅ Play Previous
  const playPrev = () => {
    if (currentIndex !== null && currentIndex > 0) {
      setCurrentIndex(prev =>
        prev !== null ? prev - 1 : 0
      );
    }
  };

  // ✅ Current Song Logic (SAFE)
  const currentMusic =
    currentIndex !== null &&
    queue.length > 0 &&
    currentIndex >= 0 &&
    currentIndex < queue.length
      ? queue[currentIndex]
      : null;

  return (
    <QueryClientProvider client={queryClient}>
      <PlayerContext.Provider
        value={{
          isQueueModeOpen,
          setIsQueueModeOpen,
          currentMusic,
          currentIndex,
          setCurrentIndex,
          queue,
          setQueue,
          playNext,
          playPrev,
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

          {/* 🎵 Music Player only renders if song exists */}
          {currentMusic && <MusicPlayer />}

        </div>
      </PlayerContext.Provider>
    </QueryClientProvider>
  );
}