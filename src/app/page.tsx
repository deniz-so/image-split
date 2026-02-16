"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ImageSplitAnimation from "@/components/ImageSplitAnimation";

function SunIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
    </svg>
  );
}

function VerticalIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <line x1="8" y1="4" x2="8" y2="20" />
      <line x1="12" y1="4" x2="12" y2="20" />
      <line x1="16" y1="4" x2="16" y2="20" />
    </svg>
  );
}

function HorizontalIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <line x1="4" y1="8" x2="20" y2="8" />
      <line x1="4" y1="12" x2="20" y2="12" />
      <line x1="4" y1="16" x2="20" y2="16" />
    </svg>
  );
}

function ImageIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <polyline points="21 15 16 10 5 21" />
    </svg>
  );
}

const transition = {
  duration: 0.5,
  ease: [0.16, 1, 0.3, 1] as const,
};

export default function Home() {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [dark, setDark] = useState(true);
  const [sliceCount, setSliceCount] = useState(3);
  const [direction, setDirection] = useState<"vertical" | "horizontal">(
    "vertical"
  );
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFile = useCallback((file: File) => {
    setImageSrc((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return URL.createObjectURL(file);
    });
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file?.type.startsWith("image/")) handleFile(file);
    },
    [handleFile]
  );

  return (
    <main
      className={`relative min-h-dvh flex flex-col items-center justify-center transition-colors duration-500 overflow-hidden ${
        dark ? "bg-neutral-950 dot-grid-dark" : "bg-white dot-grid-light"
      }`}
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: dark
            ? "radial-gradient(ellipse 600px 400px at 50% 45%, rgba(255,255,255,0.03) 0%, transparent 100%)"
            : "radial-gradient(ellipse 600px 400px at 50% 45%, rgba(0,0,0,0.02) 0%, transparent 100%)",
        }}
      />

      <AnimatePresence mode="wait">
        {!imageSrc ? (
          <motion.label
            key="upload"
            initial={{ opacity: 0, scale: 0.96, filter: "blur(4px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, scale: 0.98, filter: "blur(4px)" }}
            transition={transition}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragOver(true);
            }}
            onDragEnter={() => setIsDragOver(true)}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleDrop}
            className={`relative z-10 flex flex-col items-center justify-center w-[400px] h-[300px] rounded-2xl border cursor-pointer transition-all duration-300 ${
              isDragOver
                ? dark
                  ? "border-white/20 bg-white/[0.03]"
                  : "border-black/20 bg-black/[0.02]"
                : dark
                  ? "border-white/[0.08] hover:border-white/[0.15]"
                  : "border-black/[0.08] hover:border-black/[0.12]"
            }`}
          >
            <svg
              className={`w-10 h-10 mb-4 transition-colors duration-300 ${
                dark ? "text-neutral-600" : "text-neutral-300"
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.2}
                d="M12 16V4m0 0l-4 4m4-4l4 4M4 14v4a2 2 0 002 2h12a2 2 0 002-2v-4"
              />
            </svg>
            <span
              className={`text-base font-medium ${
                dark ? "text-neutral-400" : "text-neutral-500"
              }`}
            >
              Drop an image
            </span>
            <span
              className={`text-xs mt-1.5 ${
                dark ? "text-neutral-600" : "text-neutral-400"
              }`}
            >
              or click to upload
            </span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFile(file);
              }}
            />
          </motion.label>
        ) : (
          <motion.div
            key="animation"
            initial={{ opacity: 0, scale: 0.96, filter: "blur(4px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, scale: 0.98, filter: "blur(4px)" }}
            transition={transition}
            className="relative z-10 flex flex-col items-center gap-8"
          >
            <ImageSplitAnimation
              src={imageSrc}
              slices={sliceCount}
              width={440}
              height={440}
              dark={dark}
              direction={direction}
            />

            <div
              className={`flex items-center gap-1 rounded-full border p-1.5 transition-colors duration-300 ${
                dark
                  ? "bg-white/[0.05] border-white/[0.08] backdrop-blur-xl"
                  : "bg-black/[0.04] border-black/[0.06] backdrop-blur-xl"
              }`}
            >
              <button
                onClick={() => setDark((d) => !d)}
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                  dark
                    ? "text-neutral-400 hover:text-neutral-200 hover:bg-white/[0.08]"
                    : "text-neutral-500 hover:text-neutral-700 hover:bg-black/[0.06]"
                }`}
              >
                {dark ? <MoonIcon /> : <SunIcon />}
              </button>

              <div
                className={`w-px h-4 mx-0.5 ${
                  dark ? "bg-white/[0.06]" : "bg-black/[0.06]"
                }`}
              />

              <button
                onClick={() =>
                  setDirection((d) =>
                    d === "vertical" ? "horizontal" : "vertical"
                  )
                }
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                  dark
                    ? "text-neutral-400 hover:text-neutral-200 hover:bg-white/[0.08]"
                    : "text-neutral-500 hover:text-neutral-700 hover:bg-black/[0.06]"
                }`}
              >
                {direction === "vertical" ? (
                  <VerticalIcon />
                ) : (
                  <HorizontalIcon />
                )}
              </button>

              <div
                className={`w-px h-4 mx-0.5 ${
                  dark ? "bg-white/[0.06]" : "bg-black/[0.06]"
                }`}
              />

              <div
                className={`flex items-center rounded-full p-0.5 ${
                  dark ? "bg-white/[0.04]" : "bg-black/[0.03]"
                }`}
              >
                {[2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    onClick={() => setSliceCount(n)}
                    className={`w-7 h-7 rounded-full text-xs font-medium transition-all duration-200 ${
                      sliceCount === n
                        ? dark
                          ? "bg-white text-black"
                          : "bg-neutral-900 text-white"
                        : dark
                          ? "text-neutral-500 hover:text-neutral-300"
                          : "text-neutral-400 hover:text-neutral-600"
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>

              <div
                className={`w-px h-4 mx-0.5 ${
                  dark ? "bg-white/[0.06]" : "bg-black/[0.06]"
                }`}
              />

              <label
                className={`w-8 h-8 rounded-full flex items-center justify-center cursor-pointer transition-colors ${
                  dark
                    ? "text-neutral-400 hover:text-neutral-200 hover:bg-white/[0.08]"
                    : "text-neutral-500 hover:text-neutral-700 hover:bg-black/[0.06]"
                }`}
              >
                <ImageIcon />
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
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
