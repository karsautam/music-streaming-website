"use client"

import Link from "next/link"
// import Image from "next/image"
import { IoMdEye, IoMdEyeOff } from "react-icons/io";
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import signUpUser from "../../../lib/auth/signUpUser";
import { supabase } from "../../../lib/SupabaseClient";

export default function Page() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
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

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!name.trim() || !email.trim() || !password.trim()) {
      setMessage("Please fill all fields.");
      return;
    }

    if (password.length < 6) {
      setMessage("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    setMessage("");

    const result = await signUpUser(name, email, password);

    setLoading(false);

    if (result?.error) {
      setMessage(result.error || "Signup failed");
      return;
    }

    setMessage("Signup successful 🎉 Redirecting...");

    // Clear inputs
    setName("");
    setEmail("");
    setPassword("");

    // Redirect after 2 seconds
    setTimeout(() => {
      router.push("/");
    }, 2000);
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

      {/* Card */}
      <div className="relative z-10 bg-white/10 backdrop-blur-xl border border-white/20 px-8 py-10 rounded-3xl shadow-2xl max-w-[420px] w-[90%]">

        <h1 className="text-3xl font-bold text-white text-center mb-2">
          Create Account
        </h1>

        <p className="text-sm text-gray-300 text-center mb-6">
          Join us and start your music journey
        </p>

        <form onSubmit={handleSignup} className="space-y-4">

          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            type="text"
            placeholder="Full Name"
            className="w-full bg-white/20 text-white p-3 rounded-xl outline-none focus:ring-2 focus:ring-red-500"
          />

          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            placeholder="Email"
            className="w-full bg-white/20 text-white p-3 rounded-xl outline-none focus:ring-2 focus:ring-red-500"
          />

          <div className="relative w-full">
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              className="w-full bg-white/20 text-white p-3 pr-12 rounded-xl outline-none focus:ring-2 focus:ring-red-500"
            />

            <button
              type="button"
              onClick={() => setShowPassword(prev => !prev)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/70 hover:text-white"
            >
              {showPassword ? <IoMdEyeOff size={20} /> : <IoMdEye size={20} />}
            </button>
          </div>


          <button
            type="submit"
            disabled={loading}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-full transition"
          >
            {loading ? "Creating..." : "Sign Up"}
          </button>

          {message && (
            <p className="text-center text-sm text-white mt-2">
              {message}
            </p>
          )}

        </form>

        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px bg-white/30"></div>
          <span className="text-xs text-gray-300">OR</span>
          <div className="flex-1 h-px bg-white/30"></div>
        </div>

        <p className="text-center text-sm text-gray-300">
          Already have an account?{" "}
          <Link href="/login" className="text-red-400 hover:underline">
            Login
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