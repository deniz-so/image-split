"use client";

import { useState, useEffect, useRef, useId } from "react";
import { motion } from "framer-motion";

interface TimingConfig {
  delay?: number;
  reassemble?: number;
  hold?: number;
  fadeOut?: number;
}

interface ImageSplitAnimationProps {
  src: string;
  alt?: string;
  className?: string;
  slices?: number;
  width?: number;
  height?: number;
  dark?: boolean;
  objectFit?: "contain" | "cover" | "fill" | "none";
  direction?: "vertical" | "horizontal";
  autoPlay?: boolean;
  scatterDistance?: { x: number; y: number };
  rotationRange?: number;
  drawingContrast?: { slope: number; intercept: number };
  timing?: TimingConfig;
}

function randomOffsets(
  count: number,
  distanceX: number,
  distanceY: number,
  rotation: number
) {
  return Array.from({ length: count }, () => ({
    x: (Math.random() - 0.5) * distanceX,
    y: (Math.random() - 0.5) * distanceY,
    rotate: (Math.random() - 0.5) * rotation,
  }));
}

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export default function ImageSplitAnimation({
  src,
  alt = "",
  className,
  slices = 3,
  width = 400,
  height = 400,
  dark = true,
  objectFit = "contain",
  direction = "vertical",
  autoPlay = true,
  scatterDistance = { x: 500, y: 300 },
  rotationRange = 35,
  drawingContrast = { slope: 5, intercept: -1.5 },
  timing = {},
}: ImageSplitAnimationProps) {
  const {
    delay = 500,
    reassemble = 2500,
    hold = 2000,
    fadeOut = 800,
  } = timing;

  const reactId = useId();
  const filterId = `ef${reactId.replace(/:/g, "")}`;
  const [offsets, setOffsets] = useState(() =>
    randomOffsets(slices, scatterDistance.x, scatterDistance.y, rotationRange)
  );
  const [isAssembled, setIsAssembled] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const cancelRef = useRef(false);

  useEffect(() => {
    if (!autoPlay) return;
    cancelRef.current = false;

    const loop = async () => {
      while (!cancelRef.current) {
        setIsAssembled(false);
        setIsVisible(true);
        setOffsets(
          randomOffsets(
            slices,
            scatterDistance.x,
            scatterDistance.y,
            rotationRange
          )
        );

        await wait(delay);
        if (cancelRef.current) return;

        setIsAssembled(true);
        await wait(reassemble);
        if (cancelRef.current) return;

        await wait(hold);
        if (cancelRef.current) return;

        setIsVisible(false);
        await wait(fadeOut);
        if (cancelRef.current) return;
      }
    };

    loop();
    return () => {
      cancelRef.current = true;
    };
  }, [
    autoPlay,
    slices,
    scatterDistance.x,
    scatterDistance.y,
    rotationRange,
    delay,
    reassemble,
    hold,
    fadeOut,
  ]);

  const colorMatrix = dark
    ? "-1 0 0 0 1  0 -1 0 0 1  0 0 -1 0 1  0 0 0 1 0"
    : "1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 1 0";

  return (
    <div className={className} style={{ position: "relative", width, height }}>
      <svg width="0" height="0" style={{ position: "absolute" }}>
        <defs>
          <filter id={filterId} colorInterpolationFilters="sRGB">
            <feColorMatrix type="saturate" values="0" result="gray" />
            <feComponentTransfer in="gray" result="drawing">
              <feFuncR
                type="linear"
                slope={drawingContrast.slope}
                intercept={drawingContrast.intercept}
              />
              <feFuncG
                type="linear"
                slope={drawingContrast.slope}
                intercept={drawingContrast.intercept}
              />
              <feFuncB
                type="linear"
                slope={drawingContrast.slope}
                intercept={drawingContrast.intercept}
              />
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
            ? `inset(0 ${end}% 0 ${start}%)`
            : `inset(${start}% 0 ${end}% 0)`;

        const entering = isAssembled && isVisible;

        return (
          <motion.div
            key={i}
            style={{
              position: "absolute",
              top: 0,
              right: 0,
              bottom: 0,
              left: 0,
              clipPath,
            }}
            animate={{
              x: isAssembled ? 0 : offsets[i]?.x ?? 0,
              y: isAssembled ? 0 : offsets[i]?.y ?? 0,
              rotate: isAssembled ? 0 : offsets[i]?.rotate ?? 0,
              opacity: isVisible ? (isAssembled ? 1 : 0) : 0,
            }}
            transition={{
              duration: entering ? 1.2 : 0,
              delay: entering ? i * 0.3 : 0,
              ease: [0.16, 1, 0.3, 1],
              opacity: entering
                ? { duration: 0.5, delay: i * 0.3 }
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
