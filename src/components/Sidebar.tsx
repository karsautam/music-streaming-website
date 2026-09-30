'use client'

import Image from "next/image"
import Link from "next/link"
import { useContext, useState } from "react"
import { LuPlus } from "react-icons/lu"
import { MdOutlineLibraryMusic, MdOutlineQueueMusic } from "react-icons/md"
import useUserSession from "../../custom-hooks/useUserSession"
import { PlayerContext } from "../../layouts/FrontendLayuot"
import NowPlayingBars from "./NowPlayingBars"
import UserSongs from "./UserSongs"

export default function Sidebar() {
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const { loading, session } = useUserSession();
    const context = useContext(PlayerContext);
    const currentMusic = context?.currentMusic;
    const isPlaying = context?.isPlaying ?? false;
    const isQueueModeOpen = context?.isQueueModeOpen ?? false;
    const setIsQueueModeOpen = context?.setIsQueueModeOpen;

    return (
        <>
            <aside
                className={`z-50 fixed left-2 top-14 my-4 bg-background w-75 rounded-2xl h-[90vh] p-3 overflow-y-auto 
                ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} 
                transition-transform duration-500 lg:translate-x-0`}
            >
                {currentMusic && (
                    <button
                        type="button"
                        onClick={() => setIsQueueModeOpen?.(prev => !prev)}
                        title={isQueueModeOpen ? "Hide queue" : "Show queue"}
                        className="group relative w-full flex items-center gap-3 p-2 mb-4 rounded-xl text-left bg-gradient-to-r from-primary/25 via-primary/10 to-transparent border border-primary/40 hover:border-primary/70 hover:from-primary/35 transition-all duration-300"
                    >
                        <Image
                            src={currentMusic.cover_image}
                            alt={currentMusic.title}
                            width={48}
                            height={48}
                            className="w-12 h-12 rounded-lg object-cover shrink-0 ring-1 ring-white/10"
                        />
                        <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5">
                                <NowPlayingBars active={isPlaying} className="h-2.5" />
                                <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-primary">
                                    {isPlaying ? "Now Playing" : "Paused"}
                                </span>
                            </div>
                            <p className="text-sm font-semibold text-primary-text truncate">
                                {currentMusic.title}
                            </p>
                            <p className="text-xs text-secondary-text truncate">
                                {currentMusic.artist}
                            </p>
                        </div>
                        <MdOutlineQueueMusic
                            size={20}
                            className={`shrink-0 transition ${isQueueModeOpen ? "text-primary" : "text-secondary-text group-hover:text-primary-text"}`}
                        />
                    </button>
                )}

                <div className="flex justify-between text-primary-text items-center mb-3">
                    <h2 className="font-bold">Your Library</h2>
                    <Link href="/uplode_song">
                        <LuPlus />
                    </Link>
                </div>

                {loading ? (
                    <>
                        {[...Array(9)].map((_, index) => (
                            <div key={index} className="flex gap-2 animate-pulse mb-4">
                                <div className="w-10 h-10 rounded-md bg-zinc-800"></div>
                                <div className="h-5 w-[80%] rounded-md bg-zinc-800"></div>
                            </div>
                        ))}
                    </>
                ) : session ? (
                    <UserSongs userId={session.user.id} />
                ) : (
                    <div className="py-8 text-center">
                        <Link
                            href="/login"
                            className="bg-white px-6 py-2 rounded-full font-semibold text-blue-600 hover:bg-hover"
                        >
                            Login
                        </Link>
                        <p className="mt-4 text-white">
                            Login to view your library
                        </p>
                    </div>
                )}
            </aside>

            <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="z-55 fixed top-5 left-1 bg-black lg:hidden h-8 w-8 grid place-items-center text-white rounded-full cursor-pointer"
            >
                <MdOutlineLibraryMusic />
            </button>
        </>
    );
}