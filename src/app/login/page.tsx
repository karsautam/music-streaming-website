'use client'

import Link from "next/link"
// import Image from "next/image";
import { useEffect, useState } from "react";
import { IoMdEye, IoMdEyeOff } from "react-icons/io";
import { useRouter } from "next/navigation";
import loginUser from "../../../lib/auth/loginUser";
import { supabase } from "../../../lib/SupabaseClient";

export default function Page() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false); // login button
  const [checkingSession, setCheckingSession] = useState(true); // page protection

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();

      if (data.session) {
        router.replace("/"); // already logged in → go home
      } else {
        setCheckingSession(false);
      }
    };

    checkSession();
  }, [router]);



  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    setMessage("");

    if (!email.trim() || !password.trim()) {
      setMessage("Please fill all fields.");
      setLoading(false);
      return;
    }

    const result = await loginUser(email, password);

    if (result?.error) {
      setMessage(result.error);
      setLoading(false);
      return;
    }

    setMessage("Login successful 🎉");

    setTimeout(() => {
      router.push("/");
    }, 1500);
  };

  if (checkingSession) return null;
  return (
    <div className="relative min-h-screen flex justify-center items-center overflow-hidden">

      {/* Background */}
      <div className="absolute inset-0">
        <img
          src="/images/the weekend.jpeg"
          alt="Background"
          className="w-full h-full object-cover scale-105"
        />
      </div>

      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-black/60" />

      <div className="relative z-10 bg-white/10 backdrop-blur-xl border border-white/20 px-8 py-10 rounded-3xl shadow-2xl max-w-[400px] w-[90%]">

        <h1 className="text-3xl font-bold text-white text-center mb-2">
          Welcome Back
        </h1>

        <p className="text-sm text-gray-300 text-center mb-6">
          Login to your account
        </p>

        <form onSubmit={handleLogin} className="space-y-4">

          {/* Email */}
          <div>
            <label className="text-xs text-gray-300 block mb-1">
              Email
            </label>
            <input
              required
              onChange={(e) => setEmail(e.target.value)}
              value={email}
              type="email"
              placeholder="Enter your email"
              className="w-full bg-white/20 text-white placeholder-gray-300 text-sm p-3 rounded-xl outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          {/* Password */}
          <div>
            <label className="text-xs text-gray-300 block mb-1">
              Password
            </label>

            <div className="relative">
              <input
                required
                onChange={(e) => setPassword(e.target.value)}
                value={password}
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                className="w-full bg-white/20 text-white placeholder-gray-300 text-sm p-3 pr-12 rounded-xl outline-none focus:ring-2 focus:ring-red-500"
              />

              <button
                type="button"
                onClick={() => setShowPassword(prev => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/70 hover:text-white transition"
              >
                {showPassword ? <IoMdEyeOff size={18} /> : <IoMdEye size={18} />}
              </button>
            </div>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-full transition duration-200 shadow-lg shadow-red-900/40 disabled:opacity-50"
          >
            {loading ? "Logging in..." : "Login"}
          </button>

          {/* Message */}
          {message && (
            <p className={`text-center text-sm mt-2 ${message.includes("successful") ? "text-green-400" : "text-red-400"
              }`}>
              {message}
            </p>
          )}

        </form>

        {/* Divider */}
        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px bg-white/30"></div>
          <span className="text-xs text-gray-300">OR</span>
          <div className="flex-1 h-px bg-white/30"></div>
        </div>

        <p className="text-center text-sm text-gray-300">
          Don’t have an account?{" "}
          <Link href="/signup" className="text-red-400 hover:underline">
            Sign up
          </Link>
        </p>

      </div>
      <style jsx global>{`
        @keyframes zoom {
          0% { transform: scale(1.05); }
          50% { transform: scale(1.1); }
          100% { transform: scale(1.05); }
        }
      `}</style>
    </div>
  )
}