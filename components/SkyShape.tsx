"use client";

import { useEffect, useRef, type CSSProperties } from "react";

/**
 * Soft ambient sky — radial mesh + organic blobby bottom edge.
 * Colour blobs drift; lighter mesh tones randomly bloom into the dark sky.
 */
export default function SkyShape() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    let raf = 0;
    let start = performance.now();

    const tick = (now: number) => {
      if (reduced.matches) {
        raf = requestAnimationFrame(tick);
        return;
      }

      const t = (now - start) * 0.001;

      // Soft layered drift — incommensurate frequencies feel organic
      const mx1 =
        Math.sin(t * 0.11) * 5.5 + Math.sin(t * 0.037 + 0.8) * 2.2;
      const my1 =
        Math.cos(t * 0.09) * 4.5 + Math.cos(t * 0.029 + 1.2) * 1.8;
      const mx2 =
        Math.cos(t * 0.085 + 1.2) * 6 + Math.sin(t * 0.033 + 2.1) * 2.5;
      const my2 =
        Math.sin(t * 0.12 + 0.4) * 5 + Math.cos(t * 0.041 + 0.6) * 2;
      const mx3 =
        Math.sin(t * 0.07 + 2.1) * 4.5 + Math.cos(t * 0.026 + 3.4) * 2;
      const my3 =
        Math.cos(t * 0.1 + 1.7) * 6 + Math.sin(t * 0.035 + 1.1) * 2.2;
      const hx =
        Math.sin(t * 0.06 + 0.8) * 6.5 + Math.sin(t * 0.022 + 2.5) * 2.8;
      const hy =
        Math.cos(t * 0.05 + 0.3) * 3.5 + Math.cos(t * 0.019 + 0.9) * 1.5;

      // Light flares — slow wander, not looping in lockstep
      const fx1 =
        18 +
        Math.sin(t * 0.055 + 0.3) * 16 +
        Math.cos(t * 0.021) * 6 +
        Math.sin(t * 0.013 + 1.4) * 3;
      const fy1 =
        8 +
        Math.cos(t * 0.048 + 1.1) * 7 +
        Math.sin(t * 0.017) * 3;
      const fx2 =
        62 +
        Math.cos(t * 0.05 + 2.4) * 18 +
        Math.sin(t * 0.023) * 5;
      const fy2 =
        14 +
        Math.sin(t * 0.058 + 0.6) * 9 +
        Math.cos(t * 0.019) * 3.5;
      const fx3 =
        40 +
        Math.sin(t * 0.042 + 4.2) * 20 +
        Math.cos(t * 0.028) * 5;
      const fy3 =
        22 +
        Math.cos(t * 0.046 + 2.8) * 10 +
        Math.sin(t * 0.016) * 3;
      const fx4 =
        78 +
        Math.cos(t * 0.044 + 1.7) * 14 +
        Math.sin(t * 0.031) * 6;
      const fy4 =
        6 +
        Math.sin(t * 0.052 + 3.5) * 6 +
        Math.cos(t * 0.02) * 2.5;
      const fx5 =
        28 +
        Math.sin(t * 0.038 + 5.1) * 15 +
        Math.cos(t * 0.025) * 7;
      const fy5 =
        18 +
        Math.cos(t * 0.056 + 0.9) * 8 +
        Math.sin(t * 0.018) * 3;

      // Soft additive bloom — no harsh on/off from multiplied sines
      const bloom = (a: number, b: number, c: number, bias: number) => {
        const pulse =
          0.42 +
          0.28 * Math.sin(t * a + bias) +
          0.18 * Math.sin(t * b + bias * 1.7) +
          0.12 * Math.sin(t * c + bias * 0.4);
        return Math.max(0.08, Math.min(0.95, pulse)).toFixed(3);
      };

      root.style.setProperty("--drift-x1", `${mx1.toFixed(2)}%`);
      root.style.setProperty("--drift-y1", `${my1.toFixed(2)}%`);
      root.style.setProperty("--drift-x2", `${mx2.toFixed(2)}%`);
      root.style.setProperty("--drift-y2", `${my2.toFixed(2)}%`);
      root.style.setProperty("--drift-x3", `${mx3.toFixed(2)}%`);
      root.style.setProperty("--drift-y3", `${my3.toFixed(2)}%`);
      root.style.setProperty("--drift-hx", `${hx.toFixed(2)}%`);
      root.style.setProperty("--drift-hy", `${hy.toFixed(2)}%`);

      root.style.setProperty("--flare-x1", `${fx1.toFixed(2)}%`);
      root.style.setProperty("--flare-y1", `${fy1.toFixed(2)}%`);
      root.style.setProperty("--flare-x2", `${fx2.toFixed(2)}%`);
      root.style.setProperty("--flare-y2", `${fy2.toFixed(2)}%`);
      root.style.setProperty("--flare-x3", `${fx3.toFixed(2)}%`);
      root.style.setProperty("--flare-y3", `${fy3.toFixed(2)}%`);
      root.style.setProperty("--flare-x4", `${fx4.toFixed(2)}%`);
      root.style.setProperty("--flare-y4", `${fy4.toFixed(2)}%`);
      root.style.setProperty("--flare-x5", `${fx5.toFixed(2)}%`);
      root.style.setProperty("--flare-y5", `${fy5.toFixed(2)}%`);

      root.style.setProperty("--flare-o1", bloom(0.09, 0.05, 0.028, 0.2));
      root.style.setProperty("--flare-o2", bloom(0.075, 0.11, 0.035, 1.4));
      root.style.setProperty("--flare-o3", bloom(0.06, 0.1, 0.025, 2.8));
      root.style.setProperty("--flare-o4", bloom(0.1, 0.055, 0.04, 4.1));
      root.style.setProperty("--flare-o5", bloom(0.08, 0.07, 0.03, 5.6));

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div
      ref={rootRef}
      className="sky-ambient pointer-events-none absolute inset-0 z-0 overflow-hidden"
      style={
        {
          "--drift-x1": "0%",
          "--drift-y1": "0%",
          "--drift-x2": "0%",
          "--drift-y2": "0%",
          "--drift-x3": "0%",
          "--drift-y3": "0%",
          "--drift-hx": "0%",
          "--drift-hy": "0%",
          "--flare-x1": "20%",
          "--flare-y1": "12%",
          "--flare-x2": "65%",
          "--flare-y2": "16%",
          "--flare-x3": "42%",
          "--flare-y3": "24%",
          "--flare-x4": "80%",
          "--flare-y4": "8%",
          "--flare-x5": "30%",
          "--flare-y5": "20%",
          "--flare-o1": "0.4",
          "--flare-o2": "0.35",
          "--flare-o3": "0.45",
          "--flare-o4": "0.3",
          "--flare-o5": "0.4",
        } as CSSProperties
      }
      aria-hidden="true"
    >
      {/* Solid deep base */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 120% 70% at 50% -10%, var(--sky-midnight) 0%, transparent 55%),
            radial-gradient(ellipse 90% 50% at calc(80% + var(--drift-x1)) calc(20% + var(--drift-y1)), color-mix(in srgb, var(--sky-royal) 85%, transparent) 0%, transparent 60%),
            radial-gradient(ellipse 80% 45% at calc(15% + var(--drift-x2)) calc(25% + var(--drift-y2)), color-mix(in srgb, var(--sky-royal) 75%, transparent) 0%, transparent 55%),
            linear-gradient(to bottom, var(--sky-deep) 0%, var(--sky-deep) 38%, var(--sky-midnight) 55%, var(--sky-royal) 70%, transparent 86%)
          `,
        }}
      />

      {/* Soft color mesh — drifting blobs */}
      <div
        className="absolute inset-0"
        style={{
          filter: "blur(48px)",
          transform: "translateZ(0)",
          willChange: "background",
          background: `
            radial-gradient(ellipse 70% 55% at calc(30% + var(--drift-x1)) calc(42% + var(--drift-y1)), color-mix(in srgb, var(--sky-royal) 95%, transparent) 0%, transparent 68%),
            radial-gradient(ellipse 65% 50% at calc(72% + var(--drift-x2)) calc(48% + var(--drift-y2)), color-mix(in srgb, var(--sky-bright) 85%, transparent) 0%, transparent 65%),
            radial-gradient(ellipse 55% 40% at calc(50% + var(--drift-x3)) calc(55% + var(--drift-y3)), color-mix(in srgb, var(--sky-midnight) 90%, transparent) 0%, transparent 62%),
            radial-gradient(ellipse 90% 40% at calc(50% + var(--drift-hx)) calc(60% + var(--drift-hy)), color-mix(in srgb, var(--sky-bright) 90%, transparent) 0%, transparent 68%),
            radial-gradient(ellipse 50% 42% at calc(12% + var(--drift-x2)) calc(52% + var(--drift-y1)), color-mix(in srgb, var(--sky-bright) 80%, transparent) 0%, transparent 65%),
            radial-gradient(ellipse 55% 45% at calc(88% + var(--drift-x1)) calc(38% + var(--drift-y3)), color-mix(in srgb, var(--sky-royal) 90%, transparent) 0%, transparent 68%),
            radial-gradient(ellipse 48% 40% at calc(58% + var(--drift-x3)) calc(35% + var(--drift-y2)), color-mix(in srgb, var(--sky-horizon) 70%, transparent) 0%, transparent 62%),
            radial-gradient(ellipse 62% 48% at calc(22% + var(--drift-hx)) calc(68% + var(--drift-hy)), color-mix(in srgb, var(--sky-royal) 88%, transparent) 0%, transparent 68%),
            radial-gradient(ellipse 55% 45% at calc(78% + var(--drift-x2)) calc(65% + var(--drift-y1)), color-mix(in srgb, var(--sky-bright) 82%, transparent) 0%, transparent 65%),
            radial-gradient(ellipse 70% 50% at calc(45% + var(--drift-x1)) calc(72% + var(--drift-y3)), color-mix(in srgb, var(--sky-horizon) 75%, transparent) 0%, transparent 70%)
          `,
        }}
      />

      {/* Lighter mesh tones blooming randomly into the dark sky */}
      <div
        className="absolute inset-0"
        style={{
          filter: "blur(56px)",
          transform: "translateZ(0)",
          willChange: "opacity, background",
          background: `
            radial-gradient(ellipse 28% 22% at var(--flare-x1) var(--flare-y1), color-mix(in srgb, var(--sky-bright) calc(var(--flare-o1) * 78%), transparent) 0%, transparent 70%),
            radial-gradient(ellipse 24% 20% at var(--flare-x2) var(--flare-y2), color-mix(in srgb, var(--sky-horizon) calc(var(--flare-o2) * 72%), transparent) 0%, transparent 68%),
            radial-gradient(ellipse 32% 18% at var(--flare-x3) var(--flare-y3), color-mix(in srgb, var(--sky-bright) calc(var(--flare-o3) * 65%), transparent) 0%, transparent 72%),
            radial-gradient(ellipse 20% 16% at var(--flare-x4) var(--flare-y4), color-mix(in srgb, var(--sky-horizon) calc(var(--flare-o4) * 80%), transparent) 0%, transparent 65%),
            radial-gradient(ellipse 26% 24% at var(--flare-x5) var(--flare-y5), color-mix(in srgb, var(--sky-bright) calc(var(--flare-o5) * 70%), transparent) 0%, transparent 70%),
            radial-gradient(ellipse 18% 14% at calc(var(--flare-x1) + 12%) calc(var(--flare-y3) - 4%), color-mix(in srgb, var(--sky-horizon) calc(var(--flare-o3) * 55%), transparent) 0%, transparent 68%),
            radial-gradient(ellipse 22% 17% at calc(var(--flare-x2) - 8%) calc(var(--flare-y1) + 6%), color-mix(in srgb, var(--sky-bright) calc(var(--flare-o1) * 50%), transparent) 0%, transparent 66%)
          `,
        }}
      />

      {/* Blue organic hills — slow drift */}
      <div
        className="absolute inset-x-[-10%] bottom-[-8%]"
        style={{
          height: "58%",
          filter: "blur(42px)",
          transform: "translateZ(0)",
          willChange: "background",
          background: `
            radial-gradient(ellipse 22% 110% at calc(6% + var(--drift-x1)) 100%, color-mix(in srgb, var(--sky-bright) 95%, transparent) 0%, transparent 62%),
            radial-gradient(ellipse 28% 140% at calc(18% + var(--drift-x2)) calc(105% + var(--drift-hy)), color-mix(in srgb, var(--sky-horizon) 90%, transparent) 0%, transparent 58%),
            radial-gradient(ellipse 24% 95% at calc(32% + var(--drift-x3)) 100%, color-mix(in srgb, var(--sky-royal) 92%, transparent) 0%, transparent 60%),
            radial-gradient(ellipse 30% 155% at calc(48% + var(--drift-hx)) calc(108% + var(--drift-y1)), color-mix(in srgb, var(--sky-bright) 95%, transparent) 0%, transparent 55%),
            radial-gradient(ellipse 26% 120% at calc(62% + var(--drift-x1)) 100%, color-mix(in srgb, var(--sky-horizon) 88%, transparent) 0%, transparent 58%),
            radial-gradient(ellipse 22% 88% at calc(74% + var(--drift-x2)) calc(102% + var(--drift-y2)), color-mix(in srgb, var(--sky-royal) 90%, transparent) 0%, transparent 62%),
            radial-gradient(ellipse 32% 145% at calc(86% + var(--drift-x3)) calc(110% + var(--drift-hy)), color-mix(in srgb, var(--sky-bright) 92%, transparent) 0%, transparent 56%),
            radial-gradient(ellipse 20% 100% at calc(96% + var(--drift-hx)) 100%, color-mix(in srgb, var(--sky-horizon) 85%, transparent) 0%, transparent 60%),
            radial-gradient(ellipse 18% 70% at calc(40% + var(--drift-x2)) calc(88% + var(--drift-y3)), color-mix(in srgb, var(--sky-horizon) 80%, transparent) 0%, transparent 65%),
            radial-gradient(ellipse 20% 75% at calc(70% + var(--drift-x1)) calc(90% + var(--drift-y1)), color-mix(in srgb, var(--sky-bright) 82%, transparent) 0%, transparent 65%)
          `,
        }}
      />

      {/* Cream organic mounds */}
      <div
        className="absolute inset-x-[-6%] bottom-[-4%]"
        style={{
          height: "46%",
          filter: "blur(28px)",
          transform: "translateZ(0)",
          background: `
            radial-gradient(ellipse 16% 90% at calc(8% + var(--drift-x1)) 100%, var(--sky-cloud) 0%, transparent 58%),
            radial-gradient(ellipse 20% 130% at calc(22% + var(--drift-x2)) calc(108% + var(--drift-hy)), var(--sky-cloud) 0%, transparent 52%),
            radial-gradient(ellipse 14% 70% at calc(36% + var(--drift-x3)) 100%, var(--sky-cloud) 0%, transparent 60%),
            radial-gradient(ellipse 22% 150% at calc(50% + var(--drift-hx)) calc(112% + var(--drift-y1)), var(--sky-cloud) 0%, transparent 50%),
            radial-gradient(ellipse 15% 85% at calc(64% + var(--drift-x1)) 100%, var(--sky-cloud) 0%, transparent 58%),
            radial-gradient(ellipse 18% 120% at calc(78% + var(--drift-x2)) calc(110% + var(--drift-y2)), var(--sky-cloud) 0%, transparent 54%),
            radial-gradient(ellipse 17% 95% at calc(92% + var(--drift-x3)) 100%, var(--sky-cloud) 0%, transparent 56%),
            radial-gradient(ellipse 12% 60% at calc(14% + var(--drift-hx)) 95%, var(--sky-cloud) 0%, transparent 62%),
            radial-gradient(ellipse 13% 75% at calc(42% + var(--drift-x2)) 98%, var(--sky-cloud) 0%, transparent 60%),
            radial-gradient(ellipse 11% 55% at calc(58% + var(--drift-x1)) 96%, var(--sky-cloud) 0%, transparent 64%),
            radial-gradient(ellipse 14% 80% at calc(84% + var(--drift-x3)) calc(102% + var(--drift-hy)), var(--sky-cloud) 0%, transparent 58%),
            radial-gradient(ellipse 70% 40% at 50% 118%, var(--sky-cloud) 0%, transparent 65%)
          `,
        }}
      />

      {/* Sharper crest details */}
      <div
        className="absolute inset-x-[-2%] bottom-0"
        style={{
          height: "32%",
          filter: "blur(16px)",
          transform: "translateZ(0)",
          opacity: 0.95,
          background: `
            radial-gradient(ellipse 10% 65% at calc(12% + var(--drift-x1)) 100%, var(--sky-cloud) 0%, transparent 55%),
            radial-gradient(ellipse 12% 95% at calc(28% + var(--drift-x2)) calc(105% + var(--drift-hy)), var(--sky-cloud) 0%, transparent 50%),
            radial-gradient(ellipse 9% 50% at calc(40% + var(--drift-x3)) 100%, var(--sky-cloud) 0%, transparent 58%),
            radial-gradient(ellipse 14% 110% at calc(52% + var(--drift-hx)) calc(108% + var(--drift-y1)), var(--sky-cloud) 0%, transparent 48%),
            radial-gradient(ellipse 10% 70% at calc(66% + var(--drift-x1)) 100%, var(--sky-cloud) 0%, transparent 55%),
            radial-gradient(ellipse 11% 88% at calc(80% + var(--drift-x2)) calc(106% + var(--drift-y2)), var(--sky-cloud) 0%, transparent 52%),
            radial-gradient(ellipse 10% 60% at calc(94% + var(--drift-x3)) 100%, var(--sky-cloud) 0%, transparent 56%),
            radial-gradient(ellipse 8% 45% at calc(18% + var(--drift-hx)) 98%, color-mix(in srgb, var(--sky-horizon) 35%, var(--sky-cloud)) 0%, transparent 60%)
          `,
        }}
      />

      {/* Floor into solid cream */}
      <div
        className="absolute inset-x-0 bottom-0"
        style={{
          height: "18%",
          background: `linear-gradient(
            to top,
            var(--sky-cloud) 0%,
            color-mix(in srgb, var(--sky-cloud) 90%, transparent) 45%,
            color-mix(in srgb, var(--sky-cloud) 25%, transparent) 80%,
            transparent 100%
          )`,
        }}
      />
    </div>
  );
}
