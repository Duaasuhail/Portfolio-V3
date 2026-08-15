"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import { detectSkyQuality, SKY_QUALITY } from "@/lib/skyQuality";

const DRIFT_DEFAULTS = {
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
} as CSSProperties;

/**
 * Soft ambient sky — radial mesh + organic edge.
 * Tip hills sit above the galaxy bitmap so the organic mesh edge reads.
 * Footer variant flips the hero sky (cream → blue → deep).
 */
export default function SkyShape({
  variant = "hero",
}: {
  variant?: "hero" | "footer";
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const tipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const tip = tipRef.current;
    if (!root) return;

    const targets = [root, tip].filter(Boolean) as HTMLDivElement[];

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const quality = detectSkyQuality();
    document.documentElement.dataset.skyQuality = quality;
    const minInterval = 1000 / SKY_QUALITY[quality].skyFps;

    let raf = 0;
    let last = performance.now();
    let lastPaint = 0;
    let t = 0;
    let visible = true;
    let pageVisible = document.visibilityState === "visible";

    const bloom = (nowT: number, a: number, b: number, c: number, bias: number) => {
      const pulse =
        0.42 +
        0.28 * Math.sin(nowT * a + bias) +
        0.18 * Math.sin(nowT * b + bias * 1.7) +
        0.12 * Math.sin(nowT * c + bias * 0.4);
      return Math.max(0.08, Math.min(0.95, pulse)).toFixed(3);
    };

    const setAll = (name: string, value: string) => {
      for (const el of targets) el.style.setProperty(name, value);
    };

    const paint = (nowT: number) => {
      const mx1 = Math.sin(nowT * 0.11) * 5.5 + Math.sin(nowT * 0.037 + 0.8) * 2.2;
      const my1 = Math.cos(nowT * 0.09) * 4.5 + Math.cos(nowT * 0.029 + 1.2) * 1.8;
      const mx2 = Math.cos(nowT * 0.085 + 1.2) * 6 + Math.sin(nowT * 0.033 + 2.1) * 2.5;
      const my2 = Math.sin(nowT * 0.12 + 0.4) * 5 + Math.cos(nowT * 0.041 + 0.6) * 2;
      const mx3 = Math.sin(nowT * 0.07 + 2.1) * 4.5 + Math.cos(nowT * 0.026 + 3.4) * 2;
      const my3 = Math.cos(nowT * 0.1 + 1.7) * 6 + Math.sin(nowT * 0.035 + 1.1) * 2.2;
      const hx = Math.sin(nowT * 0.06 + 0.8) * 6.5 + Math.sin(nowT * 0.022 + 2.5) * 2.8;
      const hy = Math.cos(nowT * 0.05 + 0.3) * 3.5 + Math.cos(nowT * 0.019 + 0.9) * 1.5;

      setAll("--drift-x1", `${mx1.toFixed(2)}%`);
      setAll("--drift-y1", `${my1.toFixed(2)}%`);
      setAll("--drift-x2", `${mx2.toFixed(2)}%`);
      setAll("--drift-y2", `${my2.toFixed(2)}%`);
      setAll("--drift-x3", `${mx3.toFixed(2)}%`);
      setAll("--drift-y3", `${my3.toFixed(2)}%`);
      setAll("--drift-hx", `${hx.toFixed(2)}%`);
      setAll("--drift-hy", `${hy.toFixed(2)}%`);

      // Flares only on the deep sky stack
      root.style.setProperty(
        "--flare-x1",
        `${(18 + Math.sin(nowT * 0.055 + 0.3) * 16 + Math.cos(nowT * 0.021) * 6).toFixed(2)}%`,
      );
      root.style.setProperty(
        "--flare-y1",
        `${(8 + Math.cos(nowT * 0.048 + 1.1) * 7 + Math.sin(nowT * 0.017) * 3).toFixed(2)}%`,
      );
      root.style.setProperty(
        "--flare-x2",
        `${(62 + Math.cos(nowT * 0.05 + 2.4) * 18 + Math.sin(nowT * 0.023) * 5).toFixed(2)}%`,
      );
      root.style.setProperty(
        "--flare-y2",
        `${(14 + Math.sin(nowT * 0.058 + 0.6) * 9 + Math.cos(nowT * 0.019) * 3.5).toFixed(2)}%`,
      );
      root.style.setProperty(
        "--flare-x3",
        `${(40 + Math.sin(nowT * 0.042 + 4.2) * 20 + Math.cos(nowT * 0.028) * 5).toFixed(2)}%`,
      );
      root.style.setProperty(
        "--flare-y3",
        `${(22 + Math.cos(nowT * 0.046 + 2.8) * 10 + Math.sin(nowT * 0.016) * 3).toFixed(2)}%`,
      );
      root.style.setProperty(
        "--flare-x4",
        `${(78 + Math.cos(nowT * 0.044 + 1.7) * 14 + Math.sin(nowT * 0.031) * 6).toFixed(2)}%`,
      );
      root.style.setProperty(
        "--flare-y4",
        `${(6 + Math.sin(nowT * 0.052 + 3.5) * 6 + Math.cos(nowT * 0.02) * 2.5).toFixed(2)}%`,
      );
      root.style.setProperty(
        "--flare-x5",
        `${(28 + Math.sin(nowT * 0.038 + 5.1) * 15 + Math.cos(nowT * 0.025) * 7).toFixed(2)}%`,
      );
      root.style.setProperty(
        "--flare-y5",
        `${(18 + Math.cos(nowT * 0.056 + 0.9) * 8 + Math.sin(nowT * 0.018) * 3).toFixed(2)}%`,
      );

      root.style.setProperty("--flare-o1", bloom(nowT, 0.09, 0.05, 0.028, 0.2));
      root.style.setProperty("--flare-o2", bloom(nowT, 0.075, 0.11, 0.035, 1.4));
      root.style.setProperty("--flare-o3", bloom(nowT, 0.06, 0.1, 0.025, 2.8));
      root.style.setProperty("--flare-o4", bloom(nowT, 0.1, 0.055, 0.04, 4.1));
      root.style.setProperty("--flare-o5", bloom(nowT, 0.08, 0.07, 0.03, 5.6));
    };

    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      if (!pageVisible || !visible) {
        last = now;
        return;
      }

      const scale = reduced.matches ? 0.15 : 1;
      t += (now - last) * 0.001 * scale;
      last = now;

      if (now - lastPaint < minInterval) return;
      lastPaint = now;
      paint(t);
    };

    const onVisibility = () => {
      pageVisible = document.visibilityState === "visible";
      if (pageVisible) last = performance.now();
    };
    document.addEventListener("visibilitychange", onVisibility);

    const io =
      typeof IntersectionObserver !== "undefined"
        ? new IntersectionObserver(
            ([entry]) => {
              visible = entry.isIntersecting;
              if (visible) last = performance.now();
            },
            { threshold: 0.02 },
          )
        : null;
    io?.observe(root);

    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("visibilitychange", onVisibility);
      io?.disconnect();
    };
  }, []);

  const footer = variant === "footer";

  return (
    <>
      <div
        ref={rootRef}
        className={
          footer
            ? "sky-ambient sky-ambient--footer pointer-events-none absolute inset-0 z-0 overflow-hidden"
            : "sky-ambient pointer-events-none absolute inset-0 z-0 overflow-hidden"
        }
        style={DRIFT_DEFAULTS}
        aria-hidden="true"
      >
        <div className="sky-layer sky-layer--base" />
        <div className="sky-layer sky-layer--mesh" />
        <div className="sky-layer sky-layer--flare" />
      </div>
      {/* Above bitmap — organic mesh hills at the end of the gradient */}
      <div
        ref={tipRef}
        className={
          footer
            ? "sky-ambient sky-ambient--footer sky-ambient--tip pointer-events-none absolute inset-0 z-[3] overflow-hidden"
            : "sky-ambient sky-ambient--tip pointer-events-none absolute inset-0 z-[3] overflow-hidden"
        }
        style={DRIFT_DEFAULTS}
        aria-hidden="true"
      >
        <div className="sky-layer sky-layer--hills" />
        <div className="sky-layer sky-layer--mounds" />
        <div className="sky-layer sky-layer--crest" />
        <div className="sky-layer sky-layer--floor" />
        <div className="sky-layer sky-layer--runway" />
      </div>
    </>
  );
}
