'use client'

import Link from "next/link"
import { useState } from "react"
import { LuPlus } from "react-icons/lu"
import { MdOutlineLibraryMusic } from "react-icons/md"
import useUserSession from "../../custom-hooks/useUserSession"
import UserSongs from "./UserSongs"

export default function Sidebar() {
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const { loading, session } = useUserSession();

    return (
        <>
            <aside
                className={`z-50 fixed left-2 top-14 my-4 bg-background w-75 rounded-2xl h-[90vh] p-3 overflow-y-auto 
                ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} 
                transition-transform duration-500 lg:translate-x-0`}
            >
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
                            className="bg-white px-6 py-2 rounded-full font-semibold hover:bg-secondary-text"
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