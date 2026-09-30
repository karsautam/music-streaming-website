'use client'

import Link from "next/link"
import { useContext } from "react"
import { LuPlus } from "react-icons/lu"
import { MdClose } from "react-icons/md"
import useUserSession from "../../custom-hooks/useUserSession"
import { PlayerContext } from "../../layouts/FrontendLayuot"
import UserSongs from "./UserSongs"

export default function Sidebar() {
    const context = useContext(PlayerContext)
    const sidebarOpen = context?.sidebarOpen ?? false
    const setSidebarOpen = context?.setSidebarOpen ?? (() => {})
    const { loading, session } = useUserSession();

    return (
        <>
            <aside
                className={`z-50 fixed left-2 top-14 my-4 bg-background w-75 max-w-[calc(100vw-1rem)] rounded-2xl h-[90vh] p-3 overflow-y-auto shadow-2xl
                ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
                transition-transform duration-500 lg:translate-x-0`}
            >
                <div className="flex justify-between text-primary-text items-center mb-3">
                    <h2 className="font-bold">Your Library</h2>
                    <div className="flex items-center gap-1">
                        <Link href="/uplode_song" className="p-1.5 hover:bg-white/10 rounded-full transition">
                            <LuPlus />
                        </Link>
                        <button
                            onClick={() => setSidebarOpen(false)}
                            aria-label="Close library"
                            className="lg:hidden p-1.5 text-secondary-text hover:text-white hover:bg-white/10 rounded-full transition cursor-pointer"
                        >
                            <MdClose size={18} />
                        </button>
                    </div>
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
        </>
    );
}