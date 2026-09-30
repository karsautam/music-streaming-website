'use client'

import Image from "next/image"
import { IoMdPlay } from "react-icons/io"
import { FaHeart, FaRegHeart } from "react-icons/fa"
import { supabase } from "../../lib/SupabaseClient"
import { useQuery } from "@tanstack/react-query"
import { Song } from "../../types/song"
import { useContext, useMemo, useState } from "react"
import { PlayerContext } from "../../layouts/FrontendLayuot"
import AllSongsHero from "./AllSongsHero"
import AllSongsLyrics from "./AllSongsLyrics"
import NowPlayingBars from "./NowPlayingBars"

export default function Allsongs() {

  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error("PlayerContext must be used within a PlayerProvider");
  }
  const { setQueue, setCurrentIndex, searchQuery, favorites, toggleFavorite, isFavorite, recentlyPlayed, currentMusic, isPlaying } = context;

  const [filter, setFilter] = useState<"all" | "favorites">("all");

  // ✅ Fetch function with proper typing + error throwing
  const getAllSongs = async (): Promise<Song[]> => {
    const { data, error } = await supabase
      .from("songs")
      .select("*");

    if (error) {
      throw new Error(error.message); // IMPORTANT for React Query
    }

    return data as Song[];
  };

  // ✅ Typed React Query
  const { data, isLoading, error, isError } = useQuery<Song[]>({
    queryFn: getAllSongs,
    queryKey: ["Allsongs"]
  });

  const startPlayingSong = (songs: Song[], index: number) => {
    setCurrentIndex(index);
    setQueue(songs);
  }

  const visibleSongs = useMemo(() => {
    let songs = data ?? [];

    if (filter === "favorites") {
      songs = songs.filter((s) => isFavorite(s.id));
    }

    const q = searchQuery.trim().toLowerCase();
    if (q) {
      songs = songs.filter(
        (s) =>
          s.title.toLowerCase().includes(q) ||
          s.artist.toLowerCase().includes(q)
      );
    }

    return songs;
  }, [data, filter, searchQuery, isFavorite]);

  // ✅ Loading UI
  if (isLoading) {
    return (
      <div className="min-h-[90vh] bg-background my-18 p-4 lg:ml-80 rounded-lg mx-4">
        <h2 className="text-white text-xl mb-3 font-semibold">
          The Weeknd Site
        </h2>
        <div className=" animate-pulse grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
           {[...Array(9)].map((_, index) => (
          <div key={index}>
          <div className="w-full h-50 rounded-md bg-zinc-800 mb-2"></div>
          <div className="h-3 w-[80%] rounded-md bg-zinc-800"></div>
          </div>
           ))}
        </div>
      </div>
    );
  }

  // ✅ Error UI
  if (isError) {
    return (
      <div className="min-h-[90vh] bg-background my-18 p-4 lg:ml-80 rounded-lg mx-4">
        <h2 className="text-white text-xl mb-3 font-semibold">
          The Weeknd Site
        </h2>
        <h2 className="text-center text-white text-2xl">
          {(error as Error).message}
        </h2>
      </div>
    );
  }

  return (
    <div className="min-h-[90vh] bg-background my-8 p-4 lg:ml-80 rounded-lg mx-4">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h2 className="text-white text-xl font-semibold">
          The Weeknd Site
        </h2>

        {/* Filter pills */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilter("all")}
            className={`text-xs font-semibold px-4 py-1.5 rounded-full transition cursor-pointer ${
              filter === "all"
                ? "bg-green-600 text-white"
                : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
            }`}
          >
            All Songs
          </button>
          <button
            onClick={() => setFilter("favorites")}
            className={`flex items-center gap-1.5 text-xs font-semibold px-4 py-1.5 rounded-full transition cursor-pointer ${
              filter === "favorites"
                ? "bg-green-600 text-white"
                : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
            }`}
          >
            <FaHeart size={11} />
            Favorites
            <span className="text-[10px] opacity-80">{favorites.length}</span>
          </button>
        </div>
      </div>

      {/* Full cover + controls for the running song */}
      <AllSongsHero />

      {/* Recently Played */}
      {recentlyPlayed.length > 0 && !searchQuery.trim() && filter === "all" && (
        <div className="mb-8">
          <h3 className="text-white text-base font-semibold mb-3">
            Recently Played
          </h3>
          <div className="flex gap-3 overflow-x-auto pb-2 [scrollbar-width:thin]">
            {recentlyPlayed.map((song, index) => (
              <div
                key={`${song.id}-${index}`}
                onClick={() => startPlayingSong(recentlyPlayed, index)}
                className="relative shrink-0 w-36 bg-black p-2 rounded-md hover:bg-hover group cursor-pointer"
              >
                <div className="relative">
                  <Image
                    src={song.cover_image}
                    alt={song.title}
                    height={200}
                    width={200}
                    className="w-full h-32 object-cover rounded"
                  />
                  <button className="bg-primary w-8 h-8 rounded-full grid place-items-center absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-all duration-300 cursor-pointer">
                    <IoMdPlay />
                  </button>
                </div>
                <p className="text-primary-text text-xs font-mono mt-1.5 truncate">
                  {song.title}
                </p>
                <p className="text-shadow-primary-text font-semibold text-[10px] truncate">
                  {song.artist}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Song Grid */}
      <div className="grid gap-2 grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {visibleSongs.map((song: Song, index) => {
          const fav = isFavorite(song.id);
          const isCurrent = currentMusic?.id === song.id;
          return (
            <div
              key={song.id} onClick={() => startPlayingSong(visibleSongs, index)}
              className="relative bg-black p-2 rounded-md hover:bg-hover group"
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFavorite(song);
                }}
                className={`absolute top-3 right-3 z-10 transition cursor-pointer ${
                  fav
                    ? "text-red-500"
                    : "text-white/70 opacity-0 group-hover:opacity-100 hover:text-white"
                }`}
                title={fav ? "Remove from Favorites" : "Add to Favorites"}
              >
                {fav ? <FaHeart size={16} /> : <FaRegHeart size={16} />}
              </button>

              <button className="bg-primary w-12 h-12 rounded-full grid place-items-center absolute bottom-8 opacity-0 right-5 group-hover:opacity-100 group-hover:bottom-18 transition-all duration-300 ease-in-out cursor-pointer">
                <IoMdPlay />
              </button>

              <Image
                src={song.cover_image}
                alt={song.title}
                height={500}
                width={500}
                className="w-full h-50 object-cover"
              />

              {isCurrent && (
                <span className="absolute top-3 left-3 z-10 flex items-center gap-1.5 bg-black/80 backdrop-blur-sm px-2 py-1 rounded-full border border-primary/50">
                  <NowPlayingBars active={isPlaying} className="h-2" />
                  <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-primary">
                    Playing
                  </span>
                </span>
              )}

              <div className="mt-2">
                <p
                  className={`font-mono truncate ${
                    isCurrent ? "text-primary" : "text-primary-text"
                  }`}
                >
                  {song.title}
                </p>
                <p className="text-shadow-primary-text font-semibold text-xs truncate">
                  {song.artist}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {visibleSongs.length === 0 && (
        <p className="text-gray-400 text-sm text-center mt-10">
          {filter === "favorites"
            ? "No favorite songs yet. Tap the ♥ on a song to add it."
            : searchQuery.trim()
            ? `No songs match "${searchQuery}".`
            : "No songs available."}
        </p>
      )}

      {/* Lyrics for the running song - sits at the very bottom */}
      <AllSongsLyrics />
    </div>
  )
}
