import Image from "next/image";
import Link from "next/link";
import { GoSearch } from "react-icons/go";
import { MdHomeFilled } from "react-icons/md";
import useUserSession from "../../custom-hooks/useUserSession";

import LogoutUser from "../../lib/auth/logoutUser";
import { useRouter } from "next/navigation";

export default function Navbar() {
  
  const { session, loading } = useUserSession();
  const router = useRouter();
  
  const handleLogout = async () => {
    const result = await LogoutUser();

    if(!result?.error){
      router.push("/");
    }

  }
  return (
    <nav className="h-16 flex justify-between items-center px-4 md:px-6 fixed top-0 left-0 w-full bg-red-900 z-50">

      {/* Left Section */}
      <div className="flex items-center gap-4">
        <Image
          src="/images/dp.jpg"
          alt="weekend"
          width={70}
          height={70}
          className="w-12 h-12 ml-5 rounded-full"
        />

        <Link
          href="/"
          className="bg-[#FA8072] w-11 h-11 grid place-items-center text-white text-2xl rounded-full"
        >
          <MdHomeFilled />
        </Link>
      </div>

      {/* Middle Section */}
      <div className=" hidden lg:flex items-center bg-white rounded-full px-4 py-1 w-[400px]">
        <GoSearch size={21} className="text-gray-500 mr-2" />
        <input
          className="w-full outline-none text-black placeholder-gray-400"
          type="text"
          placeholder="What do you want to play?"
        />
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-6 text-white ">
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
  )
}

