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
  setQueue: (songs: Song[]) => void;
  playNext: () => void;
  playPrev: () => void;
  setCurrentIndex: React.Dispatch<React.SetStateAction<number>>;
  currentIndex: number;
};

export const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export default function FrontendLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {

  const queryclient = new QueryClient();
  const [isQueueModeOpen, setIsQueueModeOpen] = useState(false);
  // const [currentMusic, setCurrentMusic] = useState<null | Song>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [queue, setQueue] = useState<Song[]>([]);


  const PlayNext = () => {
    if (currentIndex < queue.length - 1) {
      setCurrentIndex((prevIndex) => prevIndex + 1);
    }
  }

  const PlayPrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prevIndex) => prevIndex - 1)
    }
  }

  const currentMusic =
    queue.length > 0 && currentIndex >= 0 && currentIndex < queue.length
      ? queue[currentIndex]
      : null;

  return (
    <QueryClientProvider client={queryclient}>
      <PlayerContext.Provider
        value={{
          isQueueModeOpen,
          setIsQueueModeOpen,
          currentMusic,
          currentIndex,
          setCurrentIndex,
          queue,
          setQueue,
          playNext: PlayNext,
          playPrev: PlayPrev,
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

          {/* Queue (Right Side Slide Panel) */}
          <Queue />

          {/* Music Player */}
          {currentMusic && <MusicPlayer />}

        </div>
      </PlayerContext.Provider>
    </QueryClientProvider>
  );
}