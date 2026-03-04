'use client'

import React, { useContext } from "react";
import { PlayerContext } from "../../layouts/FrontendLayuot";
// import Image from "next/image";

export default function Queue() {
  const context = useContext(PlayerContext);
  if (!context) return null;

  const { 
    isQueueModeOpen, 
    currentMusic, 
    currentIndex, 
    queue, 
    setCurrentIndex 
  } = context;

  return (
    <div
      className={`
        fixed top-20 right-6
        w-80 h-[75vh]
        bg-zinc-950 border border-zinc-800
        p-5 overflow-y-auto
        rounded-xl shadow-2xl z-50
        transform transition-all duration-300 ease-out
        ${isQueueModeOpen
          ? "opacity-100 translate-y-0 scale-100"
          : "opacity-0 translate-y-3 scale-95 pointer-events-none"}
      `}
    >
      {/* NOW PLAYING */}
      <h2 className="text-white text-lg font-semibold mb-4">
        Now Playing
      </h2>

      {currentMusic && (
        <div className="flex items-center gap-4 bg-zinc-900 p-3 rounded-lg mb-6">
          <img
            src={currentMusic.cover_image}
            alt={currentMusic.title}
            className="w-14 h-14 rounded-md object-cover"
          />
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-semibold truncate  text-green-600">
              {currentMusic.title}
            </span>
            <span className="text-xs text-gray-400 truncate">
              {currentMusic.artist}
            </span>
          </div>
          <span className="ml-auto text-green-500 font-bold">▶</span>
        </div>
      )}

      <h3 className="text-white text-md font-semibold mb-4">
        Next in Queue
      </h3>

      <div className="flex flex-col gap-3">
        {queue.slice(currentIndex + 1).map((song, index) => (
          <div
            key={song.id}
            onClick={() => setCurrentIndex(currentIndex + 1 + index)}
            className="flex items-center gap-3 p-2 rounded-md cursor-pointer hover:bg-zinc-900 transition"
          >
            <img
              src={song.cover_image}
              alt={song.title}
              className="w-10 h-10 rounded object-cover"
            />
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-medium truncate">
                {song.title}
              </span>
              <span className="text-xs text-gray-400 truncate">
                {song.artist}
              </span>
            </div>
          </div>
        ))}
      </div>

      {queue.slice(currentIndex + 1).length === 0 && (
        <p className="text-gray-400 text-sm mt-3">
          No upcoming songs
        </p>
      )}
    </div>
  );
}