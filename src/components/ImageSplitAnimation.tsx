"use client";

import { useState, useEffect, useRef, useId } from "react";
import { motion } from "framer-motion";

interface ImageSplitAnimationProps {
  src: string;
  slices?: number;
  width?: number;
  height?: number;
  dark?: boolean;
}

function randomOffsets(count: number) {
  return Array.from({ length: count }, () => ({
    x: (Math.random() - 0.5) * 500,
    y: (Math.random() - 0.5) * 300,
    rotate: (Math.random() - 0.5) * 35,
  }));
}

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export default function ImageSplitAnimation({
  src,
  slices = 3,
  width = 400,
  height = 400,
  dark = true,
}: ImageSplitAnimationProps) {
  const reactId = useId();
  const filterId = `ef${reactId.replace(/:/g, "")}`;
  const [offsets, setOffsets] = useState(() => randomOffsets(slices));
  const [isAssembled, setIsAssembled] = useState(true);
  const [isOutline, setIsOutline] = useState(true);
  const [isVisible, setIsVisible] = useState(true);
  const cancelRef = useRef(false);

  useEffect(() => {
    cancelRef.current = false;

    const loop = async () => {
      while (!cancelRef.current) {
        setIsOutline(true);
        setIsVisible(true);
        setIsAssembled(true);
        await wait(2000);
        if (cancelRef.current) return;

        setIsAssembled(false);
        setOffsets(randomOffsets(slices));
        await wait(1600);
        if (cancelRef.current) return;

        setIsOutline(false);
        setIsAssembled(true);
        await wait(1800);
        if (cancelRef.current) return;

        await wait(1500);
        if (cancelRef.current) return;

        setIsVisible(false);
        await wait(800);
        if (cancelRef.current) return;
      }
    };

    loop();
    return () => {
      cancelRef.current = true;
    };
  }, [slices]);

  const colorMatrix = dark
    ? "-1 0 0 0 1  0 -1 0 0 1  0 0 -1 0 1  0 0 0 1 0"
    : "1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 1 0";

  return (
    <div className="relative" style={{ width, height }}>
      <svg width="0" height="0" style={{ position: "absolute" }}>
        <defs>
          <filter id={filterId} colorInterpolationFilters="sRGB">
            <feColorMatrix type="saturate" values="0" result="gray" />
            <feComponentTransfer in="gray" result="drawing">
              <feFuncR type="linear" slope="5" intercept="-1.5" />
              <feFuncG type="linear" slope="5" intercept="-1.5" />
              <feFuncB type="linear" slope="5" intercept="-1.5" />
            </feComponentTransfer>
            <feColorMatrix in="drawing" type="matrix" values={colorMatrix} />
          </filter>
        </defs>
      </svg>

      {Array.from({ length: slices }, (_, i) => {
        const pct = 100 / slices;
        const left = pct * i;
        const right = 100 - pct * (i + 1);
        const clipPath = `inset(0 ${right}% 0 ${left}%)`;

        return (
          <motion.div
            key={i}
            className="absolute inset-0"
            style={{ clipPath }}
            animate={{
              x: isAssembled ? 0 : offsets[i]?.x ?? 0,
              y: isAssembled ? 0 : offsets[i]?.y ?? 0,
              rotate: isAssembled ? 0 : offsets[i]?.rotate ?? 0,
              opacity: isVisible ? (isAssembled ? 1 : 0.75) : 0,
            }}
            transition={{
              duration: isAssembled ? 1.2 : 0.9,
              delay: isAssembled ? i * 0.15 : (slices - 1 - i) * 0.08,
              ease: isAssembled
                ? [0.16, 1, 0.3, 1]
                : [0.55, 0, 1, 0.45],
              opacity: { duration: 0.5 },
            }}
          >
            <img
              src={src}
              alt=""
              draggable={false}
              className="w-full h-full object-contain select-none pointer-events-none"
              style={{
                filter: isOutline ? `url(#${filterId})` : "none",
                transition: "filter 0.8s ease-in-out",
              }}
            />
          </motion.div>
        );
      })}
    </div>
  );
}
