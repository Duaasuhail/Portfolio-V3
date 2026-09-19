"use client";

import { useEffect, useRef } from "react";
import { detectSkyQuality, SKY_QUALITY } from "@/lib/skyQuality";

const COLOR_FALLBACKS: Record<string, [number, number, number]> = {
  "--sky-deep": [0, 0, 22],
  "--sky-midnight": [0, 6, 57],
  "--sky-royal": [0, 2, 117],
  "--sky-bright": [4, 107, 236],
  "--sky-horizon": [124, 206, 253],
};

function hexToRgb(hex: string): [number, number, number] | null {
  const cleaned = hex.trim().replace("#", "");
  if (cleaned.length !== 6) return null;
  const r = Number.parseInt(cleaned.slice(0, 2), 16);
  const g = Number.parseInt(cleaned.slice(2, 4), 16);
  const b = Number.parseInt(cleaned.slice(4, 6), 16);
  if ([r, g, b].some((n) => Number.isNaN(n))) return null;
  return [r, g, b];
}

function resolveColor(cssVar: string): [number, number, number] {
  if (typeof document === "undefined") return COLOR_FALLBACKS[cssVar];
  const val = getComputedStyle(document.documentElement).getPropertyValue(cssVar);
  return hexToRgb(val) ?? COLOR_FALLBACKS[cssVar];
}

interface MeshVertex {
  u: number;
  v: number;
  baseColor: [number, number, number];
  freqX: number;
  freqY: number;
  ampX: number;
  ampY: number;
  phase: number;
}

interface StarNode {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  primarySpeed: number;
  shimmerSpeed: number;
  phase: number;
  maxAlpha: number;
}

export default function SkyShape({
  variant = "hero",
}: {
  variant?: "hero" | "footer";
}) {
  const meshCanvasRef = useRef<HTMLCanvasElement>(null);
  const starCanvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isFooter = variant === "footer";

  useEffect(() => {
    const meshCanvas = meshCanvasRef.current;
    const starCanvas = starCanvasRef.current;
    const container = containerRef.current;
    if (!meshCanvas || !starCanvas || !container) return;

    const mCtx = meshCanvas.getContext("2d", { alpha: false });
    const sCtx = starCanvas.getContext("2d", { alpha: true });
    if (!mCtx || !sCtx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const quality = detectSkyQuality();
    const minInterval = 1000 / SKY_QUALITY[quality].skyFps;

    // Buffer resolution for the blurred background mesh
    const MW = 280;
    const MH = 160;
    meshCanvas.width = MW;
    meshCanvas.height = MH;

    // Crisp overlay resolution for stars
    let SW = (starCanvas.width = container.clientWidth || 1200);
    let SH = (starCanvas.height = container.clientHeight || 700);

    const onResize = () => {
      if (!container || !starCanvas) return;
      SW = starCanvas.width = container.clientWidth;
      SH = starCanvas.height = container.clientHeight;
    };
    window.addEventListener("resize", onResize);

    const deep = resolveColor("--sky-deep");
    const midnight = resolveColor("--sky-midnight");
    const royal = resolveColor("--sky-royal");
    const bright = resolveColor("--sky-bright");
    const horizon = resolveColor("--sky-horizon");

    // 1. Mesh Lattice Setup
    const COLS = 4;
    const ROWS = 4;
    const grid: MeshVertex[][] = [];

    const colorLattice: [number, number, number][][] = [
      [deep, midnight, royal, deep],
      [royal, deep, midnight, bright],
      [bright, midnight, deep, horizon],
      [midnight, royal, midnight, deep],
    ];

    for (let r = 0; r < ROWS; r++) {
      grid[r] = [];
      for (let c = 0; c < COLS; c++) {
        grid[r][c] = {
          u: c / (COLS - 1),
          v: r / (ROWS - 1),
          baseColor: colorLattice[r][c],
          freqX: 0.12 + Math.random() * 0.18,
          freqY: 0.10 + Math.random() * 0.16,
          ampX: c === 0 || c === COLS - 1 ? 0.015 : 0.06,
          ampY: r === 0 || r === ROWS - 1 ? 0.015 : 0.06,
          phase: Math.random() * Math.PI * 2,
        };
      }
    }

    // 2. Small, Crisp White Starfield (Isolated without connection lines)
    const STAR_COUNT = 38;
    const stars: StarNode[] = [];

    for (let i = 0; i < STAR_COUNT; i++) {
      stars.push({
        x: Math.random() * SW,
        y: Math.random() * SH,
        vx: (Math.random() - 0.5) * 0.15,
        vy: (Math.random() - 0.5) * 0.12,
        radius: 0.5 + Math.random() * 0.45,
        primarySpeed: 1.4 + Math.random() * 2.0,
        shimmerSpeed: 4.0 + Math.random() * 4.5,
        phase: Math.random() * Math.PI * 2,
        maxAlpha: 0.55 + Math.random() * 0.35,
      });
    }

    let raf = 0;
    let last = performance.now();
    let lastPaint = 0;
    let t = 0;
    let visible = true;
    let pageVisible = document.visibilityState === "visible";

    // Draw background organic mesh
    const drawMesh = (time: number) => {
      mCtx.fillStyle = `rgb(${deep.join(",")})`;
      mCtx.fillRect(0, 0, MW, MH);

      const points: { x: number; y: number; c: [number, number, number] }[][] = [];
      for (let r = 0; r < ROWS; r++) {
        points[r] = [];
        for (let c = 0; c < COLS; c++) {
          const pt = grid[r][c];
          const curU = pt.u + Math.sin(time * pt.freqX + pt.phase) * pt.ampX;
          const curV = pt.v + Math.cos(time * pt.freqY + pt.phase) * pt.ampY;

          points[r][c] = {
            x: curU * MW,
            y: curV * MH,
            c: pt.baseColor,
          };
        }
      }

      for (let r = 0; r < ROWS - 1; r++) {
        for (let c = 0; c < COLS - 1; c++) {
          const p00 = points[r][c];
          const p10 = points[r][c + 1];
          const p01 = points[r + 1][c];
          const p11 = points[r + 1][c + 1];

          const grad = mCtx.createLinearGradient(p00.x, p00.y, p11.x, p11.y);
          grad.addColorStop(0, `rgb(${p00.c.join(",")})`);
          grad.addColorStop(0.35, `rgb(${p10.c.join(",")})`);
          grad.addColorStop(0.7, `rgb(${p01.c.join(",")})`);
          grad.addColorStop(1, `rgb(${p11.c.join(",")})`);

          mCtx.fillStyle = grad;
          mCtx.beginPath();
          mCtx.moveTo(p00.x, p00.y);
          mCtx.lineTo(p10.x, p10.y);
          mCtx.lineTo(p11.x, p11.y);
          mCtx.lineTo(p01.x, p01.y);
          mCtx.closePath();
          mCtx.fill();
        }
      }
    };

    // Draw standalone twinkling white stars
    const drawStars = (time: number, dt: number) => {
      sCtx.clearRect(0, 0, SW, SH);

      const speedFactor = reduced.matches ? 0.2 : 1.0;

      for (let i = 0; i < stars.length; i++) {
        const s = stars[i];
        s.x += s.vx * speedFactor * (dt * 60);
        s.y += s.vy * speedFactor * (dt * 60);

        if (s.x < 0) s.x = SW;
        else if (s.x > SW) s.x = 0;
        if (s.y < 0) s.y = SH;
        else if (s.y > SH) s.y = 0;

        // Twinkle equation combining primary and shimmer frequencies
        const primary = 0.5 + 0.5 * Math.sin(time * s.primarySpeed + s.phase);
        const shimmer = 0.5 + 0.5 * Math.sin(time * s.shimmerSpeed + s.phase * 1.5);
        const combined = Math.pow(primary * 0.7 + shimmer * 0.3, 2.6);
        const alpha = s.maxAlpha * (0.05 + 0.95 * combined);

        // Small, crisp pure white star
        sCtx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
        sCtx.beginPath();
        sCtx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
        sCtx.fill();
      }
    };

    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      if (!pageVisible || !visible) {
        last = now;
        return;
      }

      const delta = Math.min((now - last) * 0.001, 0.1);
      const scale = reduced.matches ? 0.2 : 1;
      t += delta * scale;
      last = now;

      if (now - lastPaint < minInterval) return;
      lastPaint = now;

      drawMesh(t);
      drawStars(t, delta);
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
    io?.observe(container);

    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibility);
      io?.disconnect();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`pointer-events-none absolute inset-0 z-0 overflow-hidden ${
        isFooter ? "rotate-180" : ""
      }`}
      style={{
        maskImage:
          "linear-gradient(180deg, black 0%, black 50%, rgba(0,0,0,0.6) 75%, transparent 95%)",
        WebkitMaskImage:
          "linear-gradient(180deg, black 0%, black 50%, rgba(0,0,0,0.6) 75%, transparent 95%)",
      }}
      aria-hidden="true"
    >
      {/* Background organic blurred color mesh */}
      <canvas
        ref={meshCanvasRef}
        className="absolute inset-0 h-full w-full object-cover blur-[45px] scale-110"
        style={{ imageRendering: "auto" }}
      />

      {/* Crisp foreground twinkling stars */}
      <canvas
        ref={starCanvasRef}
        className="absolute inset-0 h-full w-full pointer-events-none z-[1]"
      />
    </div>
  );
}