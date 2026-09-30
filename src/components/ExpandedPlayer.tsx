'use client'

import { useContext, useEffect } from "react"
import { IoMdPause, IoMdPlay, IoMdSkipBackward, IoMdSkipForward, IoMdVolumeHigh, IoMdVolumeLow, IoMdVolumeOff } from "react-icons/io"
import { MdClose, MdOutlineLoop, MdShuffle } from "react-icons/md"
import { TbMicrophone2 } from "react-icons/tb"
import { MdOutlineQueueMusic } from "react-icons/md"
import { PlayerContext } from "../../layouts/FrontendLayuot"
import { Song } from "../../types/song"
import NowPlayingBars from "./NowPlayingBars"

type ExpandedPlayerProps = {
    currentMusic: Song;
    audioRef: React.RefObject<HTMLAudioElement | null>;
    isPlaying: boolean;
    togglePlayButton: () => void;
    playNext: () => void;
    playPrev: () => void;
    shuffle: boolean;
    setShuffle: React.Dispatch<React.SetStateAction<boolean>>;
    loop: boolean;
    toggleLoop: () => void;
    currentTime: number;
    duration: number;
    volume: number;
    handleChangeVolume: (e: React.ChangeEvent<HTMLInputElement>) => void;
    toggleMute: () => void;
    formatTime: (time: number) => string;
    isLyricsOpen: boolean;
    setIsLyricsOpen: React.Dispatch<React.SetStateAction<boolean>>;
    isQueueModeOpen: boolean;
    setIsQueueModeOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function ExpandedPlayer(props: ExpandedPlayerProps) {
    const {
        currentMusic, audioRef, isPlaying, togglePlayButton, playNext, playPrev,
        shuffle, setShuffle, loop, toggleLoop, currentTime, duration, volume,
        handleChangeVolume, toggleMute, formatTime, isLyricsOpen, setIsLyricsOpen,
        isQueueModeOpen, setIsQueueModeOpen,
    } = props;

    const context = useContext(PlayerContext);
    const setIsNowPlayingOpen = context?.setIsNowPlayingOpen;

    useEffect(() => {
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") setIsNowPlayingOpen?.(false);
        };
        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [setIsNowPlayingOpen]);

    const progressPercent = duration ? (currentTime / duration) * 100 : 0;

    return (
        <div className="fixed inset-0 z-70 now-playing-open bg-gradient-to-b from-zinc-900 via-black to-black flex flex-col items-center justify-between py-6 px-4 sm:py-10 overflow-y-auto">
            <div className="absolute inset-0 opacity-30 blur-3xl pointer-events-none">
                <img src={currentMusic.cover_image || ""} alt="" className="w-full h-full object-cover" />
            </div>

            <div className="relative w-full max-w-2xl flex flex-col items-center gap-6 flex-1 justify-center">
                <button
                    type="button"
                    onClick={() => setIsNowPlayingOpen?.(false)}
                    className="absolute -top-2 left-0 text-white/70 hover:text-white transition cursor-pointer p-2"
                    title="Close (Esc)"
                >
                    <MdClose size={28} />
                </button>

                <div className="relative">
                    <img
                        src={currentMusic.cover_image || ""}
                        alt={currentMusic.title}
                        className={`w-64 h-64 sm:w-80 sm:h-80 rounded-2xl object-cover shadow-2xl transition-all duration-500 ${
                            isPlaying ? "ring-2 ring-primary/60" : "opacity-80"
                        }`}
                    />
                    {isPlaying && (
                        <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 bg-black/80 px-3 py-1.5 rounded-full backdrop-blur-sm">
                            <NowPlayingBars active={isPlaying} className="h-3" />
                        </div>
                    )}
                </div>

                <div className="text-center mt-4">
                    <h2 className="text-2xl sm:text-3xl font-bold text-white mb-1 break-words">
                        {currentMusic.title}
                    </h2>
                    <p className="text-base text-secondary-text">{currentMusic.artist}</p>
                </div>

                <div className="w-full">
                    <input
                        type="range"
                        min="0"
                        max={duration || 0}
                        value={currentTime || 0}
                        onChange={(e) => {
                            const time = Number(e.target.value);
                            if (audioRef.current) audioRef.current.currentTime = time;
                        }}
                        style={{ "--range-progress": `${progressPercent}%` } as React.CSSProperties}
                        className="player-range w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-400 mt-1.5">
                        <span>{formatTime(currentTime)}</span>
                        <span>{formatTime(duration)}</span>
                    </div>
                </div>

                <div className="flex items-center gap-6 sm:gap-8">
                    <button
                        onClick={() => setShuffle(prev => !prev)}
                        className={`cursor-pointer transition ${shuffle ? "text-primary" : "text-gray-400 hover:text-white"}`}
                        title="Shuffle"
                    >
                        <MdShuffle size={22} />
                    </button>

                    <button onClick={playPrev} className="cursor-pointer text-gray-300 hover:text-white transition" title="Previous">
                        <IoMdSkipBackward size={30} />
                    </button>

                    <button
                        onClick={togglePlayButton}
                        className={`cursor-pointer h-16 w-16 rounded-full flex items-center justify-center hover:scale-105 transition-all ${
                            isPlaying ? "bg-primary text-black shadow-[0_0_30px_-4px_rgba(29,185,84,0.9)]" : "bg-white text-black"
                        }`}
                    >
                        {isPlaying ? <IoMdPause size={30} /> : <IoMdPlay size={30} className="ml-1" />}
                    </button>

                    <button onClick={playNext} className="cursor-pointer text-gray-300 hover:text-white transition" title="Next">
                        <IoMdSkipForward size={30} />
                    </button>

                    <button
                        onClick={toggleLoop}
                        className={`cursor-pointer transition ${loop ? "text-primary" : "text-gray-400 hover:text-white"}`}
                        title="Loop"
                    >
                        <MdOutlineLoop size={22} />
                    </button>
                </div>

                <div className="flex items-center gap-5 w-full max-w-sm">
                    <button onClick={toggleMute} className="cursor-pointer text-gray-300 hover:text-white transition" title="Mute">
                        {volume === 0 ? (
                            <IoMdVolumeOff size={20} />
                        ) : volume < 50 ? (
                            <IoMdVolumeLow size={20} />
                        ) : (
                            <IoMdVolumeHigh size={20} />
                        )}
                    </button>
                    <input
                        type="range"
                        min="0"
                        max="100"
                        value={volume}
                        onChange={handleChangeVolume}
                        style={{ "--range-progress": `${volume}%` } as React.CSSProperties}
                        className="player-range w-full"
                    />
                </div>

                <div className="flex items-center gap-6">
                    <button
                        onClick={() => setIsLyricsOpen(prev => !prev)}
                        className={`cursor-pointer transition ${isLyricsOpen ? "text-primary" : "text-gray-400 hover:text-white"}`}
                        title="Lyrics"
                    >
                        <TbMicrophone2 size={22} />
                    </button>
                    <button
                        onClick={() => setIsQueueModeOpen(prev => !prev)}
                        className={`cursor-pointer transition ${isQueueModeOpen ? "text-primary" : "text-gray-400 hover:text-white"}`}
                        title="Queue"
                    >
                        <MdOutlineQueueMusic size={24} />
                    </button>
                </div>
            </div>
        </div>
    );
}
