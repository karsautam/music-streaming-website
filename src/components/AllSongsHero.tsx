'use client'

import Image from "next/image"
import { useContext } from "react"
import { IoMdPause, IoMdPlay, IoMdSkipBackward, IoMdSkipForward } from "react-icons/io"
import { MdOutlineLoop, MdShuffle } from "react-icons/md"
import { PlayerContext } from "../../layouts/FrontendLayuot"
import NowPlayingBars from "./NowPlayingBars"

export default function AllSongsHero() {
    const context = useContext(PlayerContext);
    if (!context) return null;

    const {
        currentMusic, isPlaying, togglePlay, playNext, playPrev,
        shuffle, setShuffle, loop, setLoop, currentTime, duration, seek, formatTime, audioRef,
    } = context;

    if (!currentMusic) return null;

    const progressPercent = duration ? (currentTime / duration) * 100 : 0;

    return (
        <section className="relative mb-10 rounded-2xl overflow-hidden border border-white/10 bg-gradient-to-br from-zinc-900/80 via-background to-black">
            <div aria-hidden="true" className="absolute inset-0 opacity-25 blur-3xl pointer-events-none">
                <Image
                    src={currentMusic.cover_image}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="100vw"
                />
            </div>

            <div className="relative flex flex-col sm:flex-row items-center gap-6 sm:gap-8 p-5 sm:p-7">
                <div className="relative shrink-0">
                    <Image
                        src={currentMusic.cover_image}
                        alt={currentMusic.title}
                        width={500}
                        height={500}
                        className={`w-44 h-44 sm:w-56 sm:h-56 lg:w-64 lg:h-64 object-cover rounded-xl shadow-2xl transition-all duration-500 ${
                            isPlaying ? "ring-2 ring-primary/70" : "opacity-85"
                        }`}
                    />
                    <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-black/85 px-3 py-1.5 rounded-full backdrop-blur-sm border border-white/10">
                        <NowPlayingBars active={isPlaying} className="h-3" />
                    </div>
                </div>

                <div className="flex-1 w-full min-w-0 flex flex-col gap-4">
                    <div className="text-center sm:text-left">
                        <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-primary mb-1.5">
                            <NowPlayingBars active={isPlaying} className="h-2" />
                            {isPlaying ? "Now Playing" : "Paused"}
                        </span>
                        <h3 className="text-2xl sm:text-3xl font-bold text-white truncate">
                            {currentMusic.title}
                        </h3>
                        <p className="text-sm sm:text-base text-secondary-text truncate">
                            {currentMusic.artist}
                        </p>
                    </div>

                    <div>
                        <input
                            type="range"
                            min="0"
                            max={duration || 0}
                            value={currentTime || 0}
                            onChange={(e) => seek(Number(e.target.value))}
                            style={{ "--range-progress": `${progressPercent}%` } as React.CSSProperties}
                            className="player-range w-full"
                        />
                        <div className="flex justify-between text-xs text-secondary-text mt-1.5">
                            <span>{formatTime(currentTime)}</span>
                            <span>{formatTime(duration)}</span>
                        </div>
                    </div>

                    <div className="flex items-center justify-center sm:justify-start gap-5 sm:gap-7">
                        <button
                            onClick={() => setShuffle(prev => !prev)}
                            className={`cursor-pointer transition ${shuffle ? "text-primary" : "text-gray-400 hover:text-white"}`}
                            title="Shuffle"
                        >
                            <MdShuffle size={20} />
                        </button>

                        <button onClick={playPrev} className="cursor-pointer text-gray-300 hover:text-white transition" title="Previous">
                            <IoMdSkipBackward size={26} />
                        </button>

                        <button
                            onClick={togglePlay}
                            className={`cursor-pointer h-14 w-14 rounded-full flex items-center justify-center hover:scale-105 transition-all ${
                                isPlaying
                                    ? "bg-primary text-black shadow-[0_0_28px_-4px_rgba(29,185,84,0.9)]"
                                    : "bg-white text-black"
                            }`}
                        >
                            {isPlaying ? <IoMdPause size={26} /> : <IoMdPlay size={26} className="ml-1" />}
                        </button>

                        <button onClick={playNext} className="cursor-pointer text-gray-300 hover:text-white transition" title="Next">
                            <IoMdSkipForward size={26} />
                        </button>

                        <button
                            onClick={() => {
                                setLoop(prev => {
                                    if (audioRef.current) audioRef.current.loop = !prev;
                                    return !prev;
                                });
                            }}
                            className={`cursor-pointer transition ${loop ? "text-primary" : "text-gray-400 hover:text-white"}`}
                            title="Loop"
                        >
                            <MdOutlineLoop size={20} />
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
}
