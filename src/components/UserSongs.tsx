'use client'

import Image from "next/image"
import { FaTrash } from "react-icons/fa"
import { supabase } from "../../lib/SupabaseClient"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import useUserSession from "../../custom-hooks/useUserSession"
import { Song } from "../../types/song"
import { useContext } from "react"
import { PlayerContext } from "../../layouts/FrontendLayuot"
type UserSongsProps = {
    userId: string | undefined
}


export default function UserSongs({ userId }: UserSongsProps) {
    const context = useContext(PlayerContext);
    if (!context) {
        throw new Error("PlayerContext must be used within a PlayerProvider");
    }
    const { setQueue, setCurrentIndex, currentIndex } = context;

    const { session } = useUserSession()
    const queryClient = useQueryClient()

    // 🔥 Fetch only current user's songs
    const getUserSongs = async (): Promise<Song[]> => {
        if (!session?.user.id) return []

        const { data, error } = await supabase
            .from("songs")
            .select("*")
            .eq("user_id", session.user.id)
            .order("created_at", { ascending: false })

        if (error) throw new Error(error.message)

        return data as Song[]
    }

    const { data } = useQuery<Song[]>({
        queryKey: ["userSongs", session?.user.id],
        queryFn: getUserSongs,
        enabled: !!session?.user.id
    })

    // 🗑 Delete Song
    const deleteSong = async (song: Song) => {
        const { error } = await supabase
            .from("songs")
            .delete()
            .eq("id", song.id);

        if (error) {
            console.error(error.message);
            return;
        }

        // 🧠 If deleted song is currently playing
        const isCurrentlyPlaying =
            currentIndex !== null &&
            data &&
            data[currentIndex]?.id === song.id;

        // Remove from storage
        const coverPath = song.cover_image?.split("/cover-images/")?.[1];
        const audioPath = song.audio_url?.split("/audio-files/")?.[1];

        if (coverPath) {
            await supabase.storage.from("cover-images").remove([coverPath]);
        }

        if (audioPath) {
            await supabase.storage.from("audio-files").remove([audioPath]);
        }

        // 🔥 Remove from queue if exists
        if (data) {
            const updatedQueue = data.filter(s => s.id !== song.id);
            setQueue(updatedQueue);

            if (isCurrentlyPlaying) {
                setCurrentIndex(null); // stop player
            }
        }

        queryClient.invalidateQueries({
            queryKey: ["userSongs", session?.user.id],
        });
    };
    const startPlayingSong = (songs: Song[], index: number) => {
        setCurrentIndex(index);
        setQueue(songs);
    }

    return (
        <div className="flex flex-col gap-3">

            {data?.length === 0 && (
                <p className="text-gray-400 text-sm">No songs uploaded yet.</p>
            )}

            {data?.map((song, index) => (
                <div
                    key={song.id}
                    onClick={() => startPlayingSong(data, index)}
                    className="relative flex items-center gap-4 bg-white/10 backdrop-blur-md border border-white/10 p-3 rounded-xl hover:bg-hover group "
                >

                    {/* Cover */}
                    <Image
                        src={song.cover_image}
                        alt={song.title}
                        width={60}
                        height={60}
                        className="w-14 h-14 object-cover rounded-lg"
                    />

                    {/* Info */}
                    <div className="flex flex-col flex-1 min-w-0">
                        <p
                            className={"text-sm font-medium truncate cursor-pointer  text-white"}
                        >
                            {song.title}
                        </p>
                        <p className="text-gray-300 text-xs truncate cursor-pointer hover:underline">
                            {song.artist}
                        </p>
                    </div>

                    {/* Delete */}
                    <button
                        onClick={(e) => {
                            e.stopPropagation();   // 🔥 Prevent parent click
                            deleteSong(song);
                        }}
                        className="text-gray-400 hover:text-white transition text-sm cursor-pointer opacity-0 group-hover:opacity-100"
                    >
                        <FaTrash />
                    </button>

                </div>
            ))}
        </div>
    )
}