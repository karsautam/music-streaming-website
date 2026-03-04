"use client"
import Link from "next/link"
// import Image from "next/image"
import React, { useEffect, useState } from "react"
import { supabase } from "../../../lib/SupabaseClient"
import { useRouter } from "next/navigation"
import useUserSession from "../../../custom-hooks/useUserSession"
// import { Session } from "inspector/promises"

export default function Page() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const { session } = useUserSession();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        router.push("/")   // better than push
      } else {
        setPageLoading(false);
      }
    })
  }, [router]);

const handleUploadSong = async (
  e: React.FormEvent<HTMLFormElement>
) => {
  e.preventDefault();

  if (!title.trim() || !artist.trim() || !audioFile || !imageFile) {
    alert("Please fill all fields");
    return;
  }

  try {
    setLoading(true);

    const timeStamp = Date.now();

    // ================= IMAGE UPLOAD =================
    const imagePath = `cover-images/${timeStamp}_${imageFile.name}`;

    const { error: ImageError } = await supabase.storage
      .from("cover-images")
      .upload(imagePath, imageFile);

    if (ImageError) throw ImageError;

    const {
      data: { publicUrl: imageURL },
    } = supabase.storage
      .from("cover-images")
      .getPublicUrl(imagePath);

    // ================= AUDIO UPLOAD =================
    const audioPath = `songs/${timeStamp}_${audioFile.name}`;

    const { error: audioError } = await supabase.storage
      .from("songs")
      .upload(audioPath, audioFile);

    if (audioError) {
      await supabase.storage.from("cover-images").remove([imagePath]);
      throw audioError;
    }

    const {
      data: { publicUrl: audioURL },
    } = supabase.storage
      .from("songs")
      .getPublicUrl(audioPath);

    // ================= DATABASE INSERT =================
    const { error: insertError } = await supabase.from("songs").insert([
      {
        title,
        artist,
        cover_image: imageURL,
        audio_url: audioURL,
        user_id: session?.user?.id,
      },
    ]);

    if (insertError) {
      await supabase.storage.from("cover-images").remove([imagePath]);
      await supabase.storage.from("songs").remove([audioPath]);
      throw insertError;
    }

    // Reset
    setTitle("");
    setArtist("");
    setImageFile(null);
    setAudioFile(null);

    router.push("/");
  } catch (error: unknown) {
    if (error instanceof Error) {
      alert(error.message);
    }
  } finally {
    setLoading(false);
  }
};

  if (pageLoading) return null;
  return (
    <div className="relative min-h-screen flex justify-center items-center overflow-hidden">

      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src="/images/the weekend.jpeg"
          alt="Background"
          className="w-full h-full object-cover scale-105 animate-[zoom_20s_linear_infinite]"
        />
      </div>

      {/* Soft Gradient Overlay (Not too dark) */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-black/40" />

      {/* Glass Card */}
      <div className="relative z-10 bg-white/10 backdrop-blur-lg border border-white/20 px-8 py-10 rounded-3xl shadow-2xl max-w-[420px] w-[90%]">

        <h1 className="text-3xl font-bold text-white text-center mb-6 tracking-wide">
          Upload Music
        </h1>

        <form onSubmit={handleUploadSong} className="space-y-4">

          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            type="text"
            placeholder="Title of the Song"
            className="w-full bg-white/20 text-white placeholder-gray-300 text-sm p-3 rounded-xl outline-none focus:ring-2 focus:ring-red-500 transition"
          />

          <input
            value={artist}
            type="text"
            onChange={(e) => setArtist(e.target.value)}
            placeholder="Artist Name"
            className="w-full bg-white/20 text-white placeholder-gray-300 text-sm p-3 rounded-xl outline-none focus:ring-2 focus:ring-red-500 transition"
          />

          <label className="block text-gray-200 text-sm">Audio</label>
          <input
            type="file"
            id="audio"
            accept="audio/*"
            onChange={(e) => {
              const files = e.target.files;
              if (!files) return;
              const file = files[0];
              setAudioFile(file);
              console.log(files);
            }}
            className="w-full text-white text-sm"
          />

          <label className="block text-gray-200 text-sm">Cover Image</label>
          <input
            type="file"
            accept="image/*"
            className="w-full text-white text-sm"
            onChange={(e) => {
              const files = e.target.files;
              if (!files) return;
              const file = files[0];
              setImageFile(file);

            }}
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-full transition duration-200 shadow-lg disabled:opacity-50"
          >
            {loading ? "Uploading..." : "Upload Song"}
          </button>

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

      {/* Zoom Animation */}
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