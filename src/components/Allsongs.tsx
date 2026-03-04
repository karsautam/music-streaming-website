'use client'

import Image from "next/image"
import { IoMdPlay } from "react-icons/io"
import { supabase } from "../../lib/SupabaseClient"
import { useQuery } from "@tanstack/react-query"
import { Song } from "../../types/song"
import { useContext } from "react"
import { PlayerContext } from "../../layouts/FrontendLayuot"

export default function Allsongs() {

  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error("PlayerContext must be used within a PlayerProvider");
  }
  const { setQueue, setCurrentIndex } = context;

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

  // ✅ Loading UI
  if (isLoading) {
    return (
      <div className="min-h-[90vh] bg-background my-18 p-4 lg:ml-80 rounded-lg mx-4">
        <h2 className="text-white text-xl mb-3 font-semibold">
          The Weekend Site
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
          The Weekend Site
        </h2>
        <h2 className="text-center text-white text-2xl">
          {(error as Error).message}
        </h2>
      </div>
    );
  }

  // ✅ Main UI
  return (
    <div className="min-h-[90vh] bg-background my-8 p-4 lg:ml-80 rounded-lg mx-4">
      <h2 className="text-white text-xl mb-3 font-semibold">
        The Weekend Site
      </h2>

      <div className="grid gap-2 grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {data?.map((song: Song, index) => (
          <div
            key={song.id} onClick={() => startPlayingSong(data, index)}
            className="relative bg-black p-2 rounded-md hover:bg-hover group"
          >
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

            <div className="mt-2">
              <p className="text-primary-text font-mono">
                {song.title}
              </p>
              <p className="text-shadow-primary-text font-semibold text-xs">
                {song.artist}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}