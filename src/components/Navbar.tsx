'use client'

import Image from "next/image";
import Link from "next/link";
import { GoSearch } from "react-icons/go";
import useUserSession from "../../custom-hooks/useUserSession";
import { useContext, useState } from "react";
import { PlayerContext } from "../../layouts/FrontendLayuot";
import AboutWeekend from "./AboutWeekend";

import LogoutUser from "../../lib/auth/logoutUser";
import { useRouter } from "next/navigation";

export default function Navbar() {
  
  const { session, loading } = useUserSession();
  const router = useRouter();
  const [aboutOpen, setAboutOpen] = useState(false);

  const context = useContext(PlayerContext);
  const searchQuery = context?.searchQuery ?? "";
  const setSearchQuery = context?.setSearchQuery ?? (() => {});

  const handleLogout = async () => {
    const result = await LogoutUser();

    if(!result?.error){
      router.push("/");
    }

  }
  return (
    <>
      <nav className="h-16 flex justify-between items-center px-4 md:px-6 fixed top-0 left-0 w-full bg-red-900 z-50">

      {/* Left Section */}
      <div className="flex items-center gap-2 sm:gap-4 shrink-0">
        <button
          onClick={() => setAboutOpen(true)}
          title="About The Weeknd"
          className="block cursor-pointer"
        >
          <Image
            src="/images/dp.jpg"
            alt="weekend"
            width={70}
            height={70}
            className="w-12 h-12 sm:w-14 sm:h-14 ml-1 sm:ml-0 rounded-full object-cover hover:scale-105 transition"
          />
        </button>
      </div>

      {/* Middle Section - Search */}
      <div className="flex flex-1 min-w-0 items-center bg-white rounded-full px-3 sm:px-4 py-1 max-w-[400px] mx-2 md:mx-4">
        <GoSearch size={21} className="text-gray-500 mr-2 shrink-0" />
        <input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full min-w-0 outline-none text-black placeholder-gray-400 bg-transparent text-sm"
          type="text"
          placeholder="What do you want to play?"
        />
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-6 text-white shrink-0">
        <div className="hidden md:flex gap-4 text-secondary-text border-r-2 border-white pr-6 font-bold">
          <a href="#" className="hover:text-primary-text">Premium</a>
          <a href="#" className="hover:text-primary-text">Support</a>
          <a href="#" className="hover:text-primary-text">Download</a>
        </div>
        <div>
          {!loading && (
            session ? (
              <button 
                onClick={handleLogout}
                className="h-7 bg-white text-blue-600 hover:bg-gray-200 rounded-full px-6"
              >
                Logout
              </button>
            ) : (
              <Link
                href="/login"
                className="h-7 bg-white text-blue-600 hover:bg-gray-200 rounded-full px-6 grid items-center"
              >
                Login
              </Link>
            )
          )}
        </div>

      </div>

      </nav>

      {/* About The Weeknd modal */}
      <AboutWeekend open={aboutOpen} onClose={() => setAboutOpen(false)} />
    </>
  )
}

