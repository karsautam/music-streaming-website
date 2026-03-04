'use client'

import React, { useEffect, useRef, useState, useContext } from "react";
import { IoMdPause, IoMdVolumeLow, IoMdPlay, IoMdSkipBackward, IoMdSkipForward, IoMdVolumeHigh, IoMdVolumeOff } from "react-icons/io";
import { LuReceipt } from "react-icons/lu";
import { MdOutlineLoop, MdOutlineQueueMusic } from "react-icons/md";
// Import the microphone icon for lyrics
import { TbMicrophone2 } from "react-icons/tb"; 
import { PlayerContext } from "../../layouts/FrontendLayuot";

export default function MusicPlayer() {
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [volume, setVolume] = useState(50);
    const [loop, setLoop] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [previousVolume, setPreviousVolume] = useState(50);
    
    // State for toggling lyrics view
    const [isLyricsOpen, setIsLyricsOpen] = useState(false);

    const context = useContext(PlayerContext);

    if (!context) {
        throw new Error("MusicPlayer must be used inside PlayerProvider");
    }

    const { isQueueModeOpen, setIsQueueModeOpen, currentMusic, playNext, playPrev } = context;

    const togglePlayButton = () => {
        if (!audioRef.current) return;

        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play();
        }
        setIsPlaying(!isPlaying)
    }

    

    const toggleMute = () => {
        if (!audioRef.current) return;

        if (volume === 0) {
            setVolume(previousVolume);
            audioRef.current.volume = previousVolume / 100;
        } else {
            setPreviousVolume(volume);
            setVolume(0);
            audioRef.current.volume = 0;
        }
    };

    const toggleLoop = () => {
        if (!audioRef.current) return;
        const newLoopState = !loop;
        setLoop(newLoopState);
        audioRef.current.loop = newLoopState;
    };

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const updateTime = () => {
            setCurrentTime(audio.currentTime);
            setDuration(audio.duration || 0);
        };

        audio.addEventListener("timeupdate", updateTime);
        audio.addEventListener("loadedmetadata", updateTime);

        return () => {
            audio.removeEventListener("timeupdate", updateTime);
            audio.removeEventListener("loadedmetadata", updateTime);
        };
    }, []);

    const formatTime = (time: number) => {
        const minutes = Math.floor(time / 60);
        const Seconds = Math.floor(time % 60).toString().padStart(2, "0");
        return `${minutes}:${Seconds}`;
    }

    const handleChangeVolume = (e: React.ChangeEvent<HTMLInputElement>) => {
        const vol = parseInt(e.target.value);
        setVolume(vol);

        if (audioRef.current) {
            audioRef.current.volume = vol / 100;
        }
    };

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio || !currentMusic) return;

        const playAudio = async () => {
            try {
                await audio.play();
                setIsPlaying(true);
            } catch (error) {
                console.log("Audioplay error:", error)
                setIsPlaying(false);
            }
        };
        playAudio();
    }, [currentMusic])

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const handleEnded = () => {
            if (loop) {
                audio.currentTime = 0;
                audio.play();
            } else {
                playNext();
            }
        };

        audio.addEventListener("ended", handleEnded);

        return () => {
            audio.removeEventListener("ended", handleEnded);
        };
    }, [loop, playNext]);

    if (!currentMusic) return null;

    return (
        <div className="fixed bottom-0 left-0 w-full bg-black text-white flex flex-wrap md:flex-nowrap items-center justify-between px-3 sm:px-6 py-2 sm:py-3 z-60 gap-y-2 md:gap-y-0">
            <audio src={currentMusic.audio_url || ""} ref={audioRef}></audio>
            
            {/* Left Section - Song Info */}
            <div className="flex items-center gap-2 sm:gap-3 min-w-0 w-[55%] md:w-auto md:flex-1 order-1">
                <img
                    src={currentMusic.cover_image || ""}
                    alt="Song Cover"
                    className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-md object-cover shrink-0"
                />
                <div className="flex flex-col min-w-0 cursor-pointer">
                    <h3 className="text-sm font-semibold truncate cursor-pointer">
                        {currentMusic.title}
                    </h3>
                    <p className="text-[11px] sm:text-xs text-gray-400 truncate cursor-pointer hover:underline">
                        {currentMusic.artist}
                    </p>
                </div>
            </div>

            {/* Center Section - Controls */}
            <div className="w-full md:w-auto md:max-w-[400px] md:flex-1 flex flex-col items-center gap-1 sm:gap-2 md:gap-3 order-3 md:order-2 pb-1 md:pb-0">
                <div className="flex gap-4 sm:gap-6 items-center">
                    <button onClick={playPrev} className="cursor-pointer text-gray-300 hover:text-white transition">
                        <IoMdSkipBackward size={18} className="md:w-5 md:h-5" />
                    </button>

                    <button onClick={togglePlayButton} className="cursor-pointer bg-white text-black h-8 w-8 sm:h-9 sm:w-9 rounded-full flex items-center justify-center hover:scale-105 transition">
                        {isPlaying ? <IoMdPause size={18} /> : <IoMdPlay size={18} className="ml-0.5" />}
                    </button>

                    <button onClick={playNext} className="cursor-pointer text-gray-300 hover:text-white transition">
                        <IoMdSkipForward size={18} className="md:w-5 md:h-5" />
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
                        onChange={(e) => {
                            const time = Number(e.target.value);
                            if (audioRef.current) {
                                audioRef.current.currentTime = time;
                            }
                        }}
                        className="w-full h-1 cursor-pointer bg-zinc-700 outline-none rounded-md accent-white"
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
                        className="w-12 sm:w-16 md:w-[100px] outline-none h-1 bg-zinc-700 accent-white"
                    />
                </div>
            </div>
        </div>
    )
}