"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ImageSplitAnimation from "@/components/ImageSplitAnimation";

// ── Icons ────────────────────────────────────────────────────────────────────
// Small inline SVGs kept as components so they're named and reusable.

function SunIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5" />
      <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
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

function VerticalSlicesIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <line x1="8" y1="4" x2="8" y2="20" />
      <line x1="12" y1="4" x2="12" y2="20" />
      <line x1="16" y1="4" x2="16" y2="20" />
    </svg>
  );
}

function HorizontalSlicesIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <line x1="4" y1="8" x2="20" y2="8" />
      <line x1="4" y1="12" x2="20" y2="12" />
      <line x1="4" y1="16" x2="20" y2="16" />
    </svg>
  );
}

function UploadIcon() {
  return (
    <svg className="w-10 h-10 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2} d="M12 16V4m0 0l-4 4m4-4l4 4M4 14v4a2 2 0 002 2h12a2 2 0 002-2v-4" />
    </svg>
  );
}

function ImageIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <polyline points="21 15 16 10 5 21" />
    </svg>
  );
}

// ── Theme helpers ─────────────────────────────────────────────────────────────
// Instead of repeating `dark ? "class-a" : "class-b"` throughout the JSX,
// we build a lookup object once. This makes the markup readable at a glance.

function buildTheme(dark: boolean) {
  return {
    bg: dark ? "bg-neutral-950 dot-grid-dark" : "bg-white dot-grid-light",
    glow: dark
      ? "radial-gradient(ellipse 600px 400px at 50% 45%, rgba(255,255,255,0.03) 0%, transparent 100%)"
      : "radial-gradient(ellipse 600px 400px at 50% 45%, rgba(0,0,0,0.02) 0%, transparent 100%)",
    uploadBorder: dark ? "border-white/[0.08] hover:border-white/[0.15]" : "border-black/[0.08] hover:border-black/[0.12]",
    uploadBorderActive: dark ? "border-white/20 bg-white/[0.03]" : "border-black/20 bg-black/[0.02]",
    uploadIcon: dark ? "text-neutral-600" : "text-neutral-300",
    uploadText: dark ? "text-neutral-400" : "text-neutral-500",
    uploadHint: dark ? "text-neutral-600" : "text-neutral-400",
    toolbar: dark ? "bg-white/[0.05] border-white/[0.08]" : "bg-black/[0.04] border-black/[0.06]",
    divider: dark ? "bg-white/[0.06]" : "bg-black/[0.06]",
    iconBtn: dark ? "text-neutral-400 hover:text-neutral-200 hover:bg-white/[0.08]" : "text-neutral-500 hover:text-neutral-700 hover:bg-black/[0.06]",
    sliceGroup: dark ? "bg-white/[0.04]" : "bg-black/[0.03]",
    sliceActive: dark ? "bg-white text-black" : "bg-neutral-900 text-white",
    sliceInactive: dark ? "text-neutral-500 hover:text-neutral-300" : "text-neutral-400 hover:text-neutral-600",
  };
}

// ── Shared animation config ───────────────────────────────────────────────────

const fadeScale = {
  initial: { opacity: 0, scale: 0.96, filter: "blur(4px)" },
  animate: { opacity: 1, scale: 1, filter: "blur(0px)" },
  exit: { opacity: 0, scale: 0.98, filter: "blur(4px)" },
  transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const },
};

// ── Page ─────────────────────────────────────────────────────────────────────

export default function Home() {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [dark, setDark] = useState(true);
  const [sliceCount, setSliceCount] = useState(3);
  const [direction, setDirection] = useState<"vertical" | "horizontal">("vertical");
  const [isDragOver, setIsDragOver] = useState(false);

  const cls = buildTheme(dark);

  const handleFile = useCallback((file: File) => {
    // Revoke any previous object URL to avoid memory leaks
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
    <main className={`relative min-h-dvh flex flex-col items-center justify-center transition-colors duration-500 overflow-hidden ${cls.bg}`}>
      {/* Subtle radial glow in the center */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: cls.glow }}
      />

      <AnimatePresence mode="wait">
        {!imageSrc ? (
          // ── Upload zone ──────────────────────────────────────────────────
          <motion.label
            key="upload"
            {...fadeScale}
            onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
            onDragEnter={() => setIsDragOver(true)}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleDrop}
            className={`relative z-10 flex flex-col items-center justify-center w-[400px] h-[300px] rounded-2xl border cursor-pointer transition-all duration-300 ${isDragOver ? cls.uploadBorderActive : cls.uploadBorder}`}
          >
            <UploadIcon />
            <span className={`text-base font-medium ${cls.uploadText}`}>Drop an image</span>
            <span className={`text-xs mt-1.5 ${cls.uploadHint}`}>or click to upload</span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
            />
          </motion.label>
        ) : (
          // ── Animation + controls ─────────────────────────────────────────
          <motion.div key="animation" {...fadeScale} className="relative z-10 flex flex-col items-center gap-8">
            <ImageSplitAnimation
              key={sliceCount}
              src={imageSrc}
              slices={sliceCount}
              width={440}
              height={440}
              dark={dark}
              direction={direction}
            />

            {/* Toolbar */}
            <div className={`flex items-center gap-1 rounded-full border p-1.5 backdrop-blur-xl transition-colors duration-300 ${cls.toolbar}`}>

              {/* Dark/light toggle */}
              <button
                onClick={() => setDark((d) => !d)}
                aria-label="Toggle dark mode"
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${cls.iconBtn}`}
              >
                {dark ? <MoonIcon /> : <SunIcon />}
              </button>

              <div className={`w-px h-4 mx-0.5 ${cls.divider}`} />

              {/* Slice direction toggle */}
              <button
                onClick={() => setDirection((d) => d === "vertical" ? "horizontal" : "vertical")}
                aria-label="Toggle slice direction"
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${cls.iconBtn}`}
              >
                {direction === "vertical" ? <VerticalSlicesIcon /> : <HorizontalSlicesIcon />}
              </button>

              <div className={`w-px h-4 mx-0.5 ${cls.divider}`} />

              {/* Slice count selector */}
              <div className={`flex items-center rounded-full p-0.5 ${cls.sliceGroup}`}>
                {[2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    onClick={() => setSliceCount(n)}
                    aria-label={`${n} slices`}
                    aria-pressed={sliceCount === n}
                    className={`w-7 h-7 rounded-full text-xs font-medium transition-all duration-200 ${sliceCount === n ? cls.sliceActive : cls.sliceInactive}`}
                  >
                    {n}
                  </button>
                ))}
              </div>

              <div className={`w-px h-4 mx-0.5 ${cls.divider}`} />

              {/* Upload new image */}
              <label
                aria-label="Upload new image"
                className={`w-8 h-8 rounded-full flex items-center justify-center cursor-pointer transition-colors ${cls.iconBtn}`}
              >
                <ImageIcon />
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
                />
              </label>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
