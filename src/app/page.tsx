"use client";

import { useState, useCallback } from "react";
import ImageSplitAnimation from "@/components/ImageSplitAnimation";

export default function Home() {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [dark, setDark] = useState(true);
  const [sliceCount, setSliceCount] = useState(3);
  const [direction, setDirection] = useState<"vertical" | "horizontal">("vertical");

  const handleFile = useCallback((file: File) => {
    setImageSrc((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return URL.createObjectURL(file);
    });
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file?.type.startsWith("image/")) handleFile(file);
    },
    [handleFile]
  );

  return (
    <main
      className={`min-h-screen flex flex-col items-center justify-center gap-10 transition-colors duration-500 overflow-hidden ${
        dark ? "bg-neutral-950" : "bg-white"
      }`}
    >
      {!imageSrc ? (
        /* Upload zone */
        <label
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          className={`flex flex-col items-center justify-center w-[420px] h-[320px] rounded-2xl border-2 border-dashed cursor-pointer transition-colors ${
            dark
              ? "border-neutral-700 text-neutral-400 hover:border-neutral-500"
              : "border-neutral-300 text-neutral-500 hover:border-neutral-400"
          }`}
        >
          <svg
            className="w-12 h-12 mb-4 opacity-40"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M12 16V4m0 0l-4 4m4-4l4 4M4 14v4a2 2 0 002 2h12a2 2 0 002-2v-4"
            />
          </svg>
          <span className="text-lg font-medium">Drop an image here</span>
          <span className="text-sm mt-1 opacity-60">or click to browse</span>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
            }}
          />
        </label>
      ) : (
        /* Animation display */
        <>
          <ImageSplitAnimation
            src={imageSrc}
            slices={sliceCount}
            width={420}
            height={420}
            dark={dark}
            direction={direction}
          />

          {/* Controls */}
          <div className="flex items-center gap-6">
            {/* Dark/Light toggle */}
            <button
              onClick={() => setDark((d) => !d)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                dark
                  ? "bg-neutral-800 text-neutral-200 hover:bg-neutral-700"
                  : "bg-neutral-200 text-neutral-700 hover:bg-neutral-300"
              }`}
            >
              {dark ? "Light mode" : "Dark mode"}
            </button>

            {/* Direction toggle */}
            <button
              onClick={() => setDirection((d) => d === "vertical" ? "horizontal" : "vertical")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                dark
                  ? "bg-neutral-800 text-neutral-200 hover:bg-neutral-700"
                  : "bg-neutral-200 text-neutral-700 hover:bg-neutral-300"
              }`}
            >
              {direction === "vertical" ? "Horizontal" : "Vertical"}
            </button>

            {/* Slice count */}
            <div className="flex items-center gap-2">
              <span
                className={`text-sm ${
                  dark ? "text-neutral-400" : "text-neutral-500"
                }`}
              >
                Slices
              </span>
              {[2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  onClick={() => setSliceCount(n)}
                  className={`w-8 h-8 rounded-md text-sm font-medium transition-colors ${
                    sliceCount === n
                      ? dark
                        ? "bg-white text-black"
                        : "bg-black text-white"
                      : dark
                        ? "bg-neutral-800 text-neutral-400 hover:bg-neutral-700"
                        : "bg-neutral-200 text-neutral-600 hover:bg-neutral-300"
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>

            {/* Change image */}
            <label
              className={`px-4 py-2 rounded-lg text-sm font-medium cursor-pointer transition-colors ${
                dark
                  ? "bg-neutral-800 text-neutral-200 hover:bg-neutral-700"
                  : "bg-neutral-200 text-neutral-700 hover:bg-neutral-300"
              }`}
            >
              Change image
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFile(file);
                }}
              />
            </label>
          </div>
        </>
      )}
    </main>
  );
}
