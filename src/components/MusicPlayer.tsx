'use client'

import React, { useEffect, useRef, useState, useContext } from "react";
import { IoMdPause, IoMdVolumeLow, IoMdPlay, IoMdSkipBackward, IoMdSkipForward, IoMdVolumeHigh, IoMdVolumeOff } from "react-icons/io";
import { LuReceipt } from "react-icons/lu";
import { MdOutlineLoop, MdOutlineQueueMusic, MdShuffle } from "react-icons/md";
// Import the microphone icon for lyrics
import { TbMicrophone2 } from "react-icons/tb"; 
import { PlayerContext } from "../../layouts/FrontendLayuot";
import ExpandedPlayer from "./ExpandedPlayer";
import NowPlayingBars from "./NowPlayingBars";

export default function MusicPlayer() {
    const [previousVolume, setPreviousVolume] = useState(50);

    const context = useContext(PlayerContext);

    if (!context) {
        throw new Error("MusicPlayer must be used inside PlayerProvider");
    }

    const { isQueueModeOpen, setIsQueueModeOpen, isLyricsOpen, setIsLyricsOpen, lyricsSyncActive, shuffle, setShuffle, currentMusic, isPlaying, setIsPlaying, currentTime, setCurrentTime, playNext, playPrev, isNowPlayingOpen, setIsNowPlayingOpen, duration, audioRef, seek, togglePlay, formatTime, loop, setLoop, volume, setVolume } = context;

    const togglePlayButton = togglePlay;

    const toggleMute = () => {
        if (volume === 0) {
            setVolume(previousVolume);
        } else {
            setPreviousVolume(volume);
            setVolume(0);
        }
    };

    const toggleLoop = () => {
        setLoop(prev => {
            if (audioRef.current) audioRef.current.loop = !prev;
            return !prev;
        });
    };

    const handleChangeVolume = (e: React.ChangeEvent<HTMLInputElement>) => {
        setVolume(parseInt(e.target.value));
    };

    // ✅ Keyboard shortcuts: Space = play/pause, Arrows = seek/volume, J/K = skip
    useEffect(() => {
        const onKeyDown = (e: KeyboardEvent) => {
            const tag = (e.target as HTMLElement).tagName;
            if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
            if (lyricsSyncActive) return;
            if (!audioRef.current) return;

            switch (e.key) {
                case " ":
                case "k":
                    e.preventDefault();
                    togglePlayButton();
                    break;
                case "ArrowRight":
                    e.preventDefault();
                    audioRef.current.currentTime = Math.min(
                        audioRef.current.duration || 0,
                        audioRef.current.currentTime + 5
                    );
                    break;
                case "ArrowLeft":
                    e.preventDefault();
                    audioRef.current.currentTime = Math.max(
                        0,
                        audioRef.current.currentTime - 5
                    );
                    break;
                case "ArrowUp":
                    e.preventDefault();
                    handleChangeVolume({ target: { value: String(Math.min(100, volume + 5)) } } as React.ChangeEvent<HTMLInputElement>);
                    break;
                case "ArrowDown":
                    e.preventDefault();
                    handleChangeVolume({ target: { value: String(Math.max(0, volume - 5)) } } as React.ChangeEvent<HTMLInputElement>);
                    break;
                case "j":
                    e.preventDefault();
                    playPrev();
                    break;
                case "l":
                    e.preventDefault();
                    playNext();
                    break;
                default:
                    break;
            }
        };

        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    });

    if (!currentMusic) return null;

    const progressPercent = duration ? (currentTime / duration) * 100 : 0;

    return (
        <>
        {isNowPlayingOpen && (
            <ExpandedPlayer
                currentMusic={currentMusic}
                audioRef={audioRef}
                isPlaying={isPlaying}
                togglePlayButton={togglePlayButton}
                playNext={playNext}
                playPrev={playPrev}
                shuffle={shuffle}
                setShuffle={setShuffle}
                loop={loop}
                toggleLoop={toggleLoop}
                currentTime={currentTime}
                duration={duration}
                volume={volume}
                handleChangeVolume={handleChangeVolume}
                toggleMute={toggleMute}
                formatTime={formatTime}
                isLyricsOpen={isLyricsOpen}
                setIsLyricsOpen={setIsLyricsOpen}
                isQueueModeOpen={isQueueModeOpen}
                setIsQueueModeOpen={setIsQueueModeOpen}
            />
        )}
        <div className="fixed bottom-0 left-0 w-full bg-gradient-to-t from-black via-black to-zinc-900/70 text-white flex flex-wrap md:flex-nowrap items-center justify-between px-3 sm:px-6 py-2 sm:py-3 z-60 gap-y-2 md:gap-y-0 border-t border-white/10 shadow-[0_-10px_40px_-12px_rgba(0,0,0,0.9)]">
            <div
                aria-hidden="true"
                className="absolute top-0 left-0 h-[2px] bg-primary shadow-[0_0_12px_1px_rgba(29,185,84,0.6)] transition-[width] duration-150 pointer-events-none"
                style={{ width: `${progressPercent}%` }}
            />

            {/* Left Section - Song Info */}
            <button
                type="button"
                onClick={() => setIsNowPlayingOpen(true)}
                title="Open full player"
                className="flex items-center gap-2 sm:gap-3 min-w-0 w-[55%] md:w-auto md:flex-1 order-1 text-left cursor-pointer hover:opacity-80 transition-opacity"
            >
                <div className="relative shrink-0">
                    <img
                        src={currentMusic.cover_image || ""}
                        alt="Song Cover"
                        className={`w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-md object-cover transition-all duration-300 ${
                            isPlaying
                                ? "ring-2 ring-primary/80 ring-offset-2 ring-offset-black"
                                : "opacity-70"
                        }`}
                    />
                </div>
                <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                        <NowPlayingBars active={isPlaying} className="h-2.5" />
                        <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-primary">
                            {isPlaying ? "Now Playing" : "Paused"}
                        </span>
                    </div>
                    <h3 className="text-sm font-semibold truncate">
                        {currentMusic.title}
                    </h3>
                    <p className="text-[11px] sm:text-xs text-gray-400 truncate hover:underline">
                        {currentMusic.artist}
                    </p>
                </div>
            </button>

            {/* Center Section - Controls */}
            <div className="w-full md:w-auto md:max-w-[400px] md:flex-1 flex flex-col items-center gap-1 sm:gap-2 md:gap-3 order-3 md:order-2 pb-1 md:pb-0">
                <div className="flex gap-4 sm:gap-6 items-center">
                    <button onClick={playPrev} className="cursor-pointer text-gray-300 hover:text-white transition">
                        <IoMdSkipBackward size={18} className="md:w-5 md:h-5" />
                    </button>

                    <button onClick={togglePlayButton} className={`cursor-pointer h-8 w-8 sm:h-9 sm:w-9 rounded-full flex items-center justify-center hover:scale-105 transition-all ${isPlaying ? "bg-primary text-black shadow-[0_0_16px_-2px_rgba(29,185,84,0.8)]" : "bg-white text-black"}`}>
                        {isPlaying ? <IoMdPause size={18} /> : <IoMdPlay size={18} className="ml-0.5" />}
                    </button>

                    <button onClick={playNext} className="cursor-pointer text-gray-300 hover:text-white transition">
                        <IoMdSkipForward size={18} className="md:w-5 md:h-5" />
                    </button>

                    <button
                        onClick={() => setShuffle(prev => !prev)}
                        className={`cursor-pointer transition ${shuffle ? "text-green-500" : "text-gray-300 hover:text-white"}`}
                        title="Shuffle"
                    >
                        <MdShuffle size={18} className="md:w-5 md:h-5" />
                    </button>

                    <button
                        onClick={toggleLoop}
                        className={`cursor-pointer transition ${loop ? "text-green-500" : "text-gray-300 hover:text-white"}`}
                    >
                        <MdOutlineLoop size={18} className="md:w-5 md:h-5" />
                    </button>
                </div>

                {/* Progress Bar */}
                <div className="w-full flex items-center gap-2 px-1 sm:px-4 md:px-0">
                    <span className="text-[10px] sm:text-xs text-gray-400 min-w-[35px] text-right">{formatTime(currentTime)}</span>
                    <input
                        type="range"
                        min="0"
                        max={duration || 0}
                        value={currentTime || 0}
                        onChange={(e) => seek(Number(e.target.value))}
                        style={{ "--range-progress": `${progressPercent}%` } as React.CSSProperties}
                        className="player-range w-full"
                    />
                    <span className="text-[10px] sm:text-xs text-gray-400 min-w-[35px]">{formatTime(duration)}</span>
                </div>
            </div>

            {/* Right Section - Volume & Extras */}
            <div className="flex items-center justify-end space-x-3 w-[40%] md:w-auto md:flex-1 order-2 md:order-3">
                
                {/* Lyrics Button */}
                <button
                    onClick={() => setIsLyricsOpen(prev => !prev)}
                    className={`transition  ${isLyricsOpen ? "text-green-500" : "text-gray-300 hover:text-white"}`}
                    title="Lyrics"
                >
                    <TbMicrophone2 size={18} className="md:w-5 md:h-5" />
                </button>

                {/* Queue Button */}
                <button
                    onClick={() => setIsQueueModeOpen(prev => !prev)}
                    className={`transition ${isQueueModeOpen ? "text-green-500" : "text-gray-300 hover:text-white"}`}
                    title="Queue"
                >
                    <MdOutlineQueueMusic size={20} className="md:w-6 md:h-6" />
                </button>

                <div className="flex items-center gap-2">
                    <button
                        onClick={toggleMute}
                        className="text-sm cursor-pointer text-gray-300 hover:text-white transition"
                    >
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
                        className="player-range w-12 sm:w-16 md:w-[100px]"
                    />
                </div>
            </div>
        </div>
        </>
    )
}