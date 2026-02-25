"use client";

import { useState, useEffect, useRef, useId } from "react";
import { motion } from "framer-motion";

// ── Animation constants ──────────────────────────────────────────────────────
// Keeping these as named constants (rather than magic numbers buried in JSX)
// makes it easy to see and tweak the feel of the animation in one place.

// How long each slice takes to slide into its final position
const SLIDE_DURATION = 1.2;
// Each slice starts its slide this many seconds after the previous one.
// This "stagger" is what makes the assembly feel organic rather than mechanical.
const STAGGER_DELAY = 0.3;
// Easing curve: accelerates fast, then gently overshoots and settles.
// Visualize at https://cubic-bezier.com/#.16,1,.3,1
const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

// ── Types ────────────────────────────────────────────────────────────────────

interface TimingConfig {
  /** Milliseconds to wait before the animation starts */
  delay?: number;
  /** Milliseconds to hold the assembled image (only applies when loop=true) */
  hold?: number;
  /** Milliseconds for the fade-out before looping (only applies when loop=true) */
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
  /** Number of slices to split the image into */
  slices?: number;
  /** Container width — any CSS value: 400, "100%", "50vw" */
  width?: number | string;
  /** Container height — any CSS value */
  height?: number | string;
  /** Dark mode: inverts the drawing to white lines on dark background */
  dark?: boolean;
  objectFit?: "contain" | "cover" | "fill" | "none";
  objectPosition?: string;
  /** "vertical" splits into columns, "horizontal" splits into rows */
  direction?: "vertical" | "horizontal";
  /** Whether to start playing on mount */
  autoPlay?: boolean;
  /** Whether to loop. When false, plays once and stays assembled. */
  loop?: boolean;
  /** How far slices scatter before assembling */
  scatterDistance?: { x: number; y: number };
  /** Maximum rotation (degrees) applied to scattered slices */
  rotationRange?: number;
  /**
   * Drawing effect intensity (0–2).
   * 0 = grayscale only, 1 = default pencil look, 2 = very high contrast.
   */
  contrast?: number;
  timing?: TimingConfig;
  /** Called once all slices have finished sliding into place */
  onAssembled?: () => void;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

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

// Returns zero offsets — used as the initial server-side state (see hydration note)
function zeroOffsets(count: number): SliceOffset[] {
  return Array.from({ length: count }, () => ({ x: 0, y: 0, rotate: 0 }));
}

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ── Component ────────────────────────────────────────────────────────────────

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

  // useId() gives a stable ID that matches between server and client renders.
  // We strip colons because SVG filter reference IDs can't contain them.
  const id = useId();
  const filterId = `isf-${id.replace(/:/g, "")}`;

  // contrast (0–2) maps to SVG feComponentTransfer slope/intercept.
  // The formula: output = slope * input + intercept
  // A high slope amplifies differences. A negative intercept shifts midtones
  // to black, leaving only the darkest edges visible — the pencil drawing effect.
  //   contrast=0 → slope=1, intercept=0  (passthrough, just grayscale)
  //   contrast=1 → slope=5, intercept=-1.5  (default pencil look)
  //   contrast=2 → slope=9, intercept=-3  (near silhouette)
  const slope = 1 + contrast * 4;
  const intercept = contrast * -1.5;

  const colorMatrix = dark
    ? // Invert: white→black, black→white (white drawing on dark background)
      "-1 0 0 0 1  0 -1 0 0 1  0 0 -1 0 1  0 0 0 1 0"
    : // Identity: no change (dark drawing on light background)
      "1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 1 0";

  // ── Hydration fix ──────────────────────────────────────────────────────────
  // Math.random() produces different values on the server vs. the client.
  // If we called generateOffsets() inside useState(), React would render
  // scattered positions on the server and different ones on the client,
  // causing a hydration mismatch ("Expected server HTML to contain...").
  //
  // Fix: start with zero offsets (identical on both sides), then randomize
  // inside useEffect which only ever runs on the client.
  const [offsets, setOffsets] = useState<SliceOffset[]>(() =>
    zeroOffsets(slices)
  );
  const [isAssembled, setIsAssembled] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const cancelRef = useRef(false);

  useEffect(() => {
    if (!autoPlay) return;
    cancelRef.current = false;

    // Total time until the last slice finishes landing.
    // The last slice starts after (slices-1) stagger delays, then takes
    // SLIDE_DURATION to complete — we need to wait this long before firing onAssembled.
    const assemblyMs =
      ((slices - 1) * STAGGER_DELAY + SLIDE_DURATION) * 1000;

    const playOnce = async () => {
      // Reset: move slices to new random scattered positions.
      // Since opacity is 0 at this point, the repositioning is invisible.
      setIsAssembled(false);
      setIsVisible(true);
      setOffsets(
        generateOffsets(slices, scatterDistance.x, scatterDistance.y, rotationRange)
      );

      await wait(delay);
      if (cancelRef.current) return;

      // Flip isAssembled → Framer Motion animates each slice from its scattered
      // position to (x:0, y:0, rotate:0), with opacity going from 0 to 1.
      setIsAssembled(true);

      // Wait for the full assembly to complete, then notify the parent
      await wait(assemblyMs);
      if (cancelRef.current) return;
      onAssembled?.();

      // If not looping, stay assembled and stop here
      if (!loop) return;

      await wait(hold);
      if (cancelRef.current) return;

      // Fade out before the next loop
      setIsVisible(false);
      await wait(fadeOut);
      if (cancelRef.current) return;

      playOnce();
    };

    playOnce();

    // Cleanup: flag the async loop to stop when the component unmounts or
    // any dependency changes (e.g. slices count changes)
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
      {/* SVG filter definition: grayscale → high-contrast → optional inversion.
          width/height 0 means it takes up no space; position absolute keeps it
          out of the document flow entirely. */}
      <svg width="0" height="0" style={{ position: "absolute" }}>
        <defs>
          <filter id={filterId} colorInterpolationFilters="sRGB">
            {/* Step 1: Strip color — convert to grayscale */}
            <feColorMatrix type="saturate" values="0" result="gray" />
            {/* Step 2: Boost contrast to get the pencil drawing look */}
            <feComponentTransfer in="gray" result="drawing">
              <feFuncR type="linear" slope={slope} intercept={intercept} />
              <feFuncG type="linear" slope={slope} intercept={intercept} />
              <feFuncB type="linear" slope={slope} intercept={intercept} />
            </feComponentTransfer>
            {/* Step 3: Invert colors if dark mode */}
            <feColorMatrix in="drawing" type="matrix" values={colorMatrix} />
          </filter>
        </defs>
      </svg>

      {Array.from({ length: slices }, (_, i) => {
        const pct = 100 / slices;
        const start = pct * i;
        const end = 100 - pct * (i + 1);

        // clip-path hides every part of the image outside this slice's band.
        // inset(top right bottom left) — for vertical slices we clip left and
        // right to show only the column that belongs to this slice.
        const clipPath =
          direction === "vertical"
            ? `inset(0 ${end}% 0 ${start}%)`
            : `inset(${start}% 0 ${end}% 0)`;

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
            // initial: place the slice at its scattered position on mount,
            // with no animation. When assembly triggers, it flies in FROM there.
            initial={{ x: offset.x, y: offset.y, rotate: offset.rotate, opacity: 0 }}
            animate={{
              x: isAssembled ? 0 : offset.x,
              y: isAssembled ? 0 : offset.y,
              rotate: isAssembled ? 0 : offset.rotate,
              opacity: isVisible ? (isAssembled ? 1 : 0) : 0,
            }}
            transition={{
              // Animate only when entering. On reset, snap instantly (duration:0)
              // so the repositioning is imperceptible while slices are invisible.
              duration: entering ? SLIDE_DURATION : 0,
              delay: entering ? i * STAGGER_DELAY : 0,
              ease: EASE,
              // Opacity fades in slightly faster than the slide, so the slice
              // appears to materialise as it arrives rather than blinking on.
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
                filter: `url(#${filterId})`,
              }}
            />
          </motion.div>
        );
      })}
    </div>
  );
}
