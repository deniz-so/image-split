"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ImageSplitAnimation from "@/components/ImageSplitAnimation";

// ── Full component source (embedded for copy) ─────────────────────────────────

const COMPONENT_SOURCE = `"use client";

import { useState, useEffect, useRef, useId } from "react";
import { motion } from "framer-motion";

const SLIDE_DURATION = 1.2;
const STAGGER_DELAY = 0.3;
const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

interface TimingConfig {
  delay?: number;
  hold?: number;
  fadeOut?: number;
}

interface SliceOffset {
  x: number;
  y: number;
  rotate: number;
}

export interface ImageSplitAnimationProps {
  src: string;
  alt?: string;
  className?: string;
  slices?: number;
  width?: number | string;
  height?: number | string;
  dark?: boolean;
  objectFit?: "contain" | "cover" | "fill" | "none";
  objectPosition?: string;
  direction?: "vertical" | "horizontal";
  autoPlay?: boolean;
  loop?: boolean;
  scatterDistance?: { x: number; y: number };
  rotationRange?: number;
  contrast?: number;
  timing?: TimingConfig;
  onAssembled?: () => void;
}

function generateOffsets(
  count: number,
  distanceX: number,
  distanceY: number,
  rotation: number
): SliceOffset[] {
  return Array.from({ length: count }, () => ({
    x: (Math.random() - 0.5) * distanceX,
    y: (Math.random() - 0.5) * distanceY,
    rotate: (Math.random() - 0.5) * rotation,
  }));
}

function zeroOffsets(count: number): SliceOffset[] {
  return Array.from({ length: count }, () => ({ x: 0, y: 0, rotate: 0 }));
}

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export default function ImageSplitAnimation({
  src,
  alt = "",
  className,
  slices = 3,
  width = "100%",
  height = "100%",
  dark = true,
  objectFit = "contain",
  objectPosition,
  direction = "vertical",
  autoPlay = true,
  loop = true,
  scatterDistance = { x: 500, y: 300 },
  rotationRange = 35,
  contrast = 1,
  timing = {},
  onAssembled,
}: ImageSplitAnimationProps) {
  const { delay = 500, hold = 2000, fadeOut = 800 } = timing;

  const id = useId();
  const filterId = \`isf-\${id.replace(/:/g, "")}\`;

  const slope = 1 + contrast * 4;
  const intercept = contrast * -1.5;

  const colorMatrix = dark
    ? "-1 0 0 0 1  0 -1 0 0 1  0 0 -1 0 1  0 0 0 1 0"
    : "1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 1 0";

  const [offsets, setOffsets] = useState<SliceOffset[]>(() =>
    zeroOffsets(slices)
  );
  const [isAssembled, setIsAssembled] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const cancelRef = useRef(false);

  useEffect(() => {
    if (!autoPlay) return;
    cancelRef.current = false;

    const assemblyMs =
      ((slices - 1) * STAGGER_DELAY + SLIDE_DURATION) * 1000;

    const playOnce = async () => {
      setIsAssembled(false);
      setIsVisible(true);
      setOffsets(
        generateOffsets(slices, scatterDistance.x, scatterDistance.y, rotationRange)
      );

      await wait(delay);
      if (cancelRef.current) return;

      setIsAssembled(true);

      await wait(assemblyMs);
      if (cancelRef.current) return;
      onAssembled?.();

      if (!loop) return;

      await wait(hold);
      if (cancelRef.current) return;

      setIsVisible(false);
      await wait(fadeOut);
      if (cancelRef.current) return;

      playOnce();
    };

    playOnce();

    return () => {
      cancelRef.current = true;
    };
  }, [
    autoPlay,
    loop,
    slices,
    scatterDistance.x,
    scatterDistance.y,
    rotationRange,
    delay,
    hold,
    fadeOut,
    onAssembled,
  ]);

  return (
    <div className={className} style={{ position: "relative", width, height }}>
      <svg width="0" height="0" style={{ position: "absolute" }}>
        <defs>
          <filter id={filterId} colorInterpolationFilters="sRGB">
            <feColorMatrix type="saturate" values="0" result="gray" />
            <feComponentTransfer in="gray" result="drawing">
              <feFuncR type="linear" slope={slope} intercept={intercept} />
              <feFuncG type="linear" slope={slope} intercept={intercept} />
              <feFuncB type="linear" slope={slope} intercept={intercept} />
            </feComponentTransfer>
            <feColorMatrix in="drawing" type="matrix" values={colorMatrix} />
          </filter>
        </defs>
      </svg>

      {Array.from({ length: slices }, (_, i) => {
        const pct = 100 / slices;
        const start = pct * i;
        const end = 100 - pct * (i + 1);

        const clipPath =
          direction === "vertical"
            ? \`inset(0 \${end}% 0 \${start}%)\`
            : \`inset(\${start}% 0 \${end}% 0)\`;

        const offset = offsets[i] ?? { x: 0, y: 0, rotate: 0 };
        const entering = isAssembled && isVisible;

        return (
          <motion.div
            key={i}
            style={{
              position: "absolute",
              inset: 0,
              clipPath,
              willChange: "transform, opacity",
              backfaceVisibility: "hidden",
            }}
            initial={{ x: offset.x, y: offset.y, rotate: offset.rotate, opacity: 0 }}
            animate={{
              x: isAssembled ? 0 : offset.x,
              y: isAssembled ? 0 : offset.y,
              rotate: isAssembled ? 0 : offset.rotate,
              opacity: isVisible ? (isAssembled ? 1 : 0) : 0,
            }}
            transition={{
              duration: entering ? SLIDE_DURATION : 0,
              delay: entering ? i * STAGGER_DELAY : 0,
              ease: EASE,
              opacity: entering
                ? { duration: 0.5, delay: i * STAGGER_DELAY }
                : { duration: 0.5 },
            }}
          >
            <img
              src={src}
              alt={alt}
              draggable={false}
              style={{
                width: "100%",
                height: "100%",
                objectFit,
                objectPosition,
                userSelect: "none",
                pointerEvents: "none",
                filter: \`url(#\${filterId})\`,
              }}
            />
          </motion.div>
        );
      })}
    </div>
  );
}`;

function generateSnippet(slices: number, direction: "vertical" | "horizontal", dark: boolean) {
  return `import ImageSplitAnimation from "./ImageSplitAnimation";

<ImageSplitAnimation
  src="./your-image.jpg"
  slices={${slices}}
  direction="${direction}"
  dark={${dark}}
  width={440}
  height={440}
/>`;
}

// ── Icons ────────────────────────────────────────────────────────────────────

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

function CopyIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="13" height="13" rx="2" />
      <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function GitHubIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
    </svg>
  );
}

// ── Theme ─────────────────────────────────────────────────────────────────────

function buildTheme(dark: boolean) {
  return {
    bg: dark ? "bg-neutral-950 dot-grid-dark" : "bg-white dot-grid-light",
    glow: dark
      ? "radial-gradient(ellipse 600px 400px at 50% 45%, rgba(255,255,255,0.03) 0%, transparent 100%)"
      : "radial-gradient(ellipse 600px 400px at 50% 45%, rgba(0,0,0,0.02) 0%, transparent 100%)",
    heading: dark ? "text-neutral-100" : "text-neutral-900",
    description: dark ? "text-neutral-500" : "text-neutral-500",
    githubLink: dark ? "text-neutral-600 hover:text-neutral-400 transition-colors" : "text-neutral-400 hover:text-neutral-600 transition-colors",
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
    code: dark ? "bg-white/[0.03] border-white/[0.07] text-neutral-400" : "bg-black/[0.02] border-black/[0.06] text-neutral-600",
    codeHeader: dark ? "border-white/[0.07]" : "border-black/[0.06]",
    tabActive: dark ? "text-neutral-200 bg-white/[0.08]" : "text-neutral-700 bg-black/[0.07]",
    tabInactive: dark ? "text-neutral-600 hover:text-neutral-400" : "text-neutral-400 hover:text-neutral-600",
    copyBtn: dark ? "text-neutral-500 hover:text-neutral-300 transition-colors" : "text-neutral-400 hover:text-neutral-600 transition-colors",
  };
}

// ── Animation preset ──────────────────────────────────────────────────────────

const fadeScale = {
  initial: { opacity: 0, scale: 0.96, filter: "blur(4px)" },
  animate: { opacity: 1, scale: 1, filter: "blur(0px)" },
  exit: { opacity: 0, scale: 0.98, filter: "blur(4px)" },
  transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const },
};

const btnMotion = {
  whileHover: { scale: 1.1 },
  whileTap: { scale: 0.88 },
  transition: { type: "spring", stiffness: 400, damping: 17 },
} as const;

const sliceMotion = {
  whileHover: { scale: 1.12 },
  whileTap: { scale: 0.9 },
  transition: { type: "spring", stiffness: 500, damping: 20 },
} as const;

// ── Page ──────────────────────────────────────────────────────────────────────

export default function Home() {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [dark, setDark] = useState(true);
  const [sliceCount, setSliceCount] = useState(3);
  const [direction, setDirection] = useState<"vertical" | "horizontal">("vertical");
  const [isDragOver, setIsDragOver] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<"usage" | "component">("usage");

  const cls = buildTheme(dark);

  const handleFile = useCallback((file: File) => {
    setImageSrc((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return URL.createObjectURL(file);
    });
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file?.type.startsWith("image/")) handleFile(file);
  }, [handleFile]);

  const snippet = generateSnippet(sliceCount, direction, dark);

  const handleCopy = useCallback(() => {
    const content = activeTab === "usage" ? snippet : COMPONENT_SOURCE;
    navigator.clipboard.writeText(content).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [activeTab, snippet]);

  return (
    <main className={`min-h-dvh flex flex-col transition-colors duration-500 ${cls.bg}`}>
      {/* Glow */}
      <div className="pointer-events-none fixed inset-0" style={{ background: cls.glow }} />

      {/* ── Header ── */}
      <header className="relative z-10 flex flex-col items-center pt-20 pb-12 px-6 text-center">
        <h1 className={`text-2xl font-medium tracking-tight mb-3 ${cls.heading}`}>
          image split animation
        </h1>
        <p className={`text-sm max-w-sm leading-relaxed ${cls.description}`}>
          A React component that splits any image into animated slices, scatters them, and reassembles.
          Built with Framer Motion. Drop an image to try it.
        </p>
        <a
          href="https://github.com/denizsoybas/image-split-animation"
          target="_blank"
          rel="noopener noreferrer"
          className={`mt-4 flex items-center gap-1.5 text-xs font-mono ${cls.githubLink}`}
        >
          <GitHubIcon />
          github
        </a>
      </header>

      {/* ── Demo ── */}
      <section className="relative z-10 flex flex-col items-center justify-center px-6 pb-16 min-h-[60vh]">
        <AnimatePresence mode="wait">
          {!imageSrc ? (
            <motion.label
              key="upload"
              {...fadeScale}
              onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
              onDragEnter={() => setIsDragOver(true)}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={handleDrop}
              className={`relative flex flex-col items-center justify-center w-[400px] h-[300px] rounded-2xl border cursor-pointer transition-all duration-300 ${isDragOver ? cls.uploadBorderActive : cls.uploadBorder}`}
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
            <motion.div key="animation" {...fadeScale} className="flex flex-col items-center gap-8 w-full max-w-3xl px-6 pb-24">
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
                <motion.button
                  onClick={() => setDark((d) => !d)}
                  aria-label="Toggle dark mode"
                  className={`w-8 h-8 rounded-full flex items-center justify-center cursor-pointer ${cls.iconBtn}`}
                  {...btnMotion}
                >
                  {dark ? <MoonIcon /> : <SunIcon />}
                </motion.button>

                <div className={`w-px h-4 mx-0.5 ${cls.divider}`} />

                <motion.button
                  onClick={() => setDirection((d) => d === "vertical" ? "horizontal" : "vertical")}
                  aria-label="Toggle slice direction"
                  className={`w-8 h-8 rounded-full flex items-center justify-center cursor-pointer ${cls.iconBtn}`}
                  {...btnMotion}
                >
                  {direction === "vertical" ? <VerticalSlicesIcon /> : <HorizontalSlicesIcon />}
                </motion.button>

                <div className={`w-px h-4 mx-0.5 ${cls.divider}`} />

                <div className={`flex items-center rounded-full p-0.5 ${cls.sliceGroup}`}>
                  {[2, 3, 4, 5].map((n) => (
                    <motion.button
                      key={n}
                      onClick={() => setSliceCount(n)}
                      aria-label={`${n} slices`}
                      aria-pressed={sliceCount === n}
                      className={`w-7 h-7 rounded-full text-xs font-medium cursor-pointer ${sliceCount === n ? cls.sliceActive : cls.sliceInactive}`}
                      {...sliceMotion}
                    >
                      {n}
                    </motion.button>
                  ))}
                </div>

                <div className={`w-px h-4 mx-0.5 ${cls.divider}`} />

                <motion.label
                  aria-label="Upload new image"
                  className={`w-8 h-8 rounded-full flex items-center justify-center cursor-pointer ${cls.iconBtn}`}
                  {...btnMotion}
                >
                  <ImageIcon />
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
                  />
                </motion.label>
              </div>

              {/* Code preview */}
              <div className={`w-full rounded-2xl border overflow-hidden transition-colors duration-300 ${cls.code}`}>
                {/* Header with tabs + copy */}
                <div className={`flex items-center justify-between px-3 py-2.5 border-b ${cls.codeHeader}`}>
                  <div className="flex items-center gap-0.5">
                    {(["usage", "component"] as const).map((tab) => (
                      <motion.button
                        key={tab}
                        onClick={() => { setActiveTab(tab); setCopied(false); }}
                        className={`px-2.5 py-1 rounded-md text-xs font-mono transition-colors ${activeTab === tab ? cls.tabActive : cls.tabInactive}`}
                        whileHover={{ scale: 1.04 }}
                        whileTap={{ scale: 0.96 }}
                        transition={{ type: "spring", stiffness: 500, damping: 20 }}
                      >
                        {tab}
                      </motion.button>
                    ))}
                  </div>
                  <motion.button
                    onClick={handleCopy}
                    className={`flex items-center gap-1.5 text-xs font-mono ${cls.copyBtn}`}
                    whileHover={{ scale: 1.06 }}
                    whileTap={{ scale: 0.94 }}
                    transition={{ type: "spring", stiffness: 500, damping: 20 }}
                  >
                    {copied ? <CheckIcon /> : <CopyIcon />}
                    {copied ? "copied!" : "copy"}
                  </motion.button>
                </div>
                <AnimatePresence mode="wait">
                  <motion.pre
                    key={activeTab}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.15, ease: "easeOut" }}
                    className="text-xs font-mono leading-relaxed p-4 overflow-auto max-h-[420px]"
                  >
                    {activeTab === "usage" ? snippet : COMPONENT_SOURCE}
                  </motion.pre>
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>
    </main>
  );
}
