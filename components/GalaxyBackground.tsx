"use client";

import { useEffect, useRef } from "react";
import {
  detectSkyQuality,
  SKY_QUALITY,
  type SkyQuality,
} from "@/lib/skyQuality";

/** Standard 8x8 Bayer Matrix (values 0–63) */
const BAYER_8 = [
  [ 0, 32,  8, 40,  2, 34, 10, 42],
  [48, 16, 56, 24, 50, 18, 58, 26],
  [12, 44,  4, 36, 14, 46,  6, 38],
  [60, 28, 52, 20, 62, 30, 54, 22],
  [ 3, 35, 11, 43,  1, 33,  9, 41],
  [51, 19, 59, 27, 49, 17, 57, 25],
  [15, 47,  7, 39, 13, 45,  5, 37],
  [63, 31, 55, 23, 61, 29, 53, 21],
];

const BITMAP_BLOCK_SIZE = 4;
export const SKY_HEIGHT_VH = 1.4;
export const FOOTER_SKY_VH = 1.15;

export type GalaxyVariant = "hero" | "footer";

const GRADIENT_STOP_FALLBACKS: Record<string, [number, number, number]> = {
  "--sky-deep": [0, 0, 22],
  "--sky-midnight": [0, 6, 57],
  "--sky-royal": [0, 2, 117],
  "--sky-bright": [4, 107, 236],
  "--sky-horizon": [124, 206, 253],
  "--sky-cloud": [247, 246, 242],
};

const STAR_SNAP_PX = 16;
const LINE_HIT_PX = 12;
const LINE_FADE_PX = 220;

const SHOOTING_STAR_INTERVAL_MS = 2200;
const SHOOTING_STAR_INTERVAL_JITTER_MS = 2400;
const SHOOTING_STAR_SPREAD_PX = 90;

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
  if (typeof document === "undefined") return GRADIENT_STOP_FALLBACKS[cssVar];
  const val = getComputedStyle(document.documentElement).getPropertyValue(cssVar);
  return hexToRgb(val) ?? GRADIENT_STOP_FALLBACKS[cssVar];
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function smoothstep(edge0: number, edge1: number, x: number) {
  const t = Math.min(1, Math.max(0, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

function hash2(x: number, y: number) {
  let n = Math.imul(x, 374761393) + Math.imul(y, 668265263);
  n = Math.imul(n ^ (n >>> 13), 1274126177);
  return ((n ^ (n >>> 16)) >>> 0) / 4294967295;
}

function valueNoise(x: number, y: number) {
  const x0 = Math.floor(x);
  const y0 = Math.floor(y);
  const xf = x - x0;
  const yf = y - y0;
  const u = xf * xf * (3 - 2 * xf);
  const v = yf * yf * (3 - 2 * yf);

  return lerp(
    lerp(hash2(x0, y0), hash2(x0 + 1, y0), u),
    lerp(hash2(x0, y0 + 1), hash2(x0 + 1, y0 + 1), u),
    v,
  );
}

function fbm(x: number, y: number, octaves = 4) {
  let value = 0;
  let amp = 0.52;
  let freq = 1;
  let norm = 0;

  for (let i = 0; i < octaves; i++) {
    value += amp * valueNoise(x * freq, y * freq);
    norm += amp;
    amp *= 0.5;
    freq *= 2.05;
  }
  return value / norm;
}

function bayerThreshold8x8(x: number, y: number) {
  return BAYER_8[Math.abs(y) % 8][Math.abs(x) % 8] / 64;
}

function ditherChannel(value: number, x: number, y: number, levels = 16) {
  const scaled = value * (levels - 1);
  const base = Math.floor(scaled);
  const frac = scaled - base;
  const threshold = bayerThreshold8x8(x, y);
  return Math.min(levels - 1, base + (frac > threshold ? 1 : 0)) / (levels - 1);
}

function getSkyGradientColor(
  t: number,
  stops: [number, [number, number, number]][],
): [number, number, number] {
  const clamped = Math.min(1, Math.max(0, t));
  for (let i = 0; i < stops.length - 1; i++) {
    const [t0, c0] = stops[i];
    const [t1, c1] = stops[i + 1];
    if (clamped >= t0 && clamped <= t1) {
      const local = (clamped - t0) / Math.max(1e-6, t1 - t0);
      const ease = local * local * (3 - 2 * local);
      return [
        lerp(c0[0], c1[0], ease),
        lerp(c0[1], c1[1], ease),
        lerp(c0[2], c1[2], ease),
      ];
    }
  }
  return stops[stops.length - 1][1];
}

interface AmbientStar {
  baseX: number;
  baseY: number;
  vx: number;
  vy: number;
  primarySpeed: number;
  shimmerSpeed: number;
  phase: number;
  maxAlpha: number;
}

interface PlacedStar {
  id: number;
  x: number;
  y: number;
  shapeId?: number;
  linkIds?: number[];
  twinklePhase: number;
  twinkleSpeed: number;
  points: number;
  size: number;
}

interface ShootingStar {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  length: number;
}

function spawnShootingStar(
  width: number,
  height: number,
  avoid: { x: number; y: number }[] = [],
): ShootingStar {
  const pickStart = () => {
    const lane = Math.floor(Math.random() * 5);
    switch (lane) {
      case 0:
        return { x: -10, y: height * (0.05 + Math.random() * 0.3), fromLeft: true };
      case 1:
        return { x: -8, y: height * (0.2 + Math.random() * 0.3), fromLeft: true };
      case 2:
        return { x: width * (0.05 + Math.random() * 0.4), y: -8, fromLeft: true };
      case 3:
        return { x: width * (0.45 + Math.random() * 0.45), y: -8, fromLeft: false };
      default:
        return { x: width * (0.55 + Math.random() * 0.35), y: height * (0.02 + Math.random() * 0.2), fromLeft: false };
    }
  };

  const spread = Math.min(SHOOTING_STAR_SPREAD_PX, width * 0.3);
  let x = -8;
  let y = height * 0.1;
  let fromLeft = true;

  for (let attempt = 0; attempt < 8; attempt++) {
    const start = pickStart();
    const farEnough = avoid.every((p) => Math.hypot(start.x - p.x, start.y - p.y) >= spread);
    if (farEnough || avoid.length === 0) {
      x = start.x;
      y = start.y;
      fromLeft = start.fromLeft;
      break;
    }
    if (attempt === 7) {
      x = start.x;
      y = start.y;
      fromLeft = start.fromLeft;
    }
  }

  const speed = 3.2 + Math.random() * 2.2;
  const angleJitter = (Math.random() - 0.5) * 0.35;

  return {
    x,
    y,
    vx: speed * (fromLeft ? 0.85 + Math.random() * 0.3 : 0.45 + Math.random() * 0.35) + angleJitter,
    vy: speed * (0.28 + Math.random() * 0.38),
    life: 0,
    maxLife: 0.85 + Math.random() * 0.55,
    length: 16 + Math.random() * 22,
  };
}

function drawShootingStar(ctx: CanvasRenderingContext2D, star: ShootingStar) {
  const progress = star.life / star.maxLife;
  const fade =
    progress < 0.15
      ? progress / 0.15
      : progress > 0.7
        ? (1 - progress) / 0.3
        : 1;

  const dx = star.vx;
  const dy = star.vy;
  const len = Math.hypot(dx, dy) || 1;
  const tx = (dx / len) * star.length;
  const ty = (dy / len) * star.length;

  const gradient = ctx.createLinearGradient(
    star.x - tx,
    star.y - ty,
    star.x,
    star.y,
  );
  gradient.addColorStop(0, "rgba(255, 255, 255, 0)");
  gradient.addColorStop(0.55, `rgba(200, 230, 255, ${0.35 * fade})`);
  gradient.addColorStop(1, `rgba(255, 255, 255, ${0.95 * fade})`);

  ctx.strokeStyle = gradient;
  ctx.lineWidth = 1.35;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(star.x - tx, star.y - ty);
  ctx.lineTo(star.x, star.y);
  ctx.stroke();

  ctx.fillStyle = `rgba(255, 255, 255, ${fade})`;
  ctx.fillRect(Math.floor(star.x), Math.floor(star.y), 2, 2);
}

function pointToSegment(
  px: number,
  py: number,
  ax: number,
  ay: number,
  bx: number,
  by: number,
) {
  const abx = bx - ax;
  const aby = by - ay;
  const len2 = abx * abx + aby * aby;
  if (len2 < 1e-6) {
    return { d: Math.hypot(px - ax, py - ay), t: 0, x: ax, y: ay };
  }
  const t = Math.max(0, Math.min(1, ((px - ax) * abx + (py - ay) * aby) / len2));
  const x = ax + t * abx;
  const y = ay + t * aby;
  return { d: Math.hypot(px - x, py - y), t, x, y };
}

function collectForcedEdges(placed: PlacedStar[]) {
  const idToIndex = new Map<number, number>();
  for (let i = 0; i < placed.length; i++) {
    idToIndex.set(placed[i].id, i);
  }

  const edges: { i: number; j: number; d: number }[] = [];
  const seen = new Set<string>();

  for (let i = 0; i < placed.length; i++) {
    const links = placed[i].linkIds;
    if (!links?.length) continue;
    for (const linkId of links) {
      const j = idToIndex.get(linkId);
      if (j == null || j === i) continue;
      const key = i < j ? `${i}-${j}` : `${j}-${i}`;
      if (seen.has(key)) continue;
      seen.add(key);
      const d = Math.hypot(placed[i].x - placed[j].x, placed[i].y - placed[j].y);
      edges.push({ i, j, d });
    }
  }

  return edges;
}

function findLineUnderPoint(
  placed: PlacedStar[],
  x: number,
  y: number,
): { i: number; j: number; x: number; y: number; d: number } | null {
  if (placed.length < 2) return null;

  const edges = collectForcedEdges(placed);
  let best: { i: number; j: number; x: number; y: number; d: number } | null = null;

  for (const edge of edges) {
    const a = placed[edge.i];
    const b = placed[edge.j];
    const hit = pointToSegment(x, y, a.x, a.y, b.x, b.y);
    if (hit.t <= 0.1 || hit.t >= 0.9) continue;
    if (hit.d > LINE_HIT_PX) continue;
    if (!best || hit.d < best.d) {
      best = { i: edge.i, j: edge.j, x: hit.x, y: hit.y, d: hit.d };
    }
  }

  return best;
}

function findNearestStar(
  placed: PlacedStar[],
  x: number,
  y: number,
  maxDist: number,
): PlacedStar | null {
  let best: PlacedStar | null = null;
  let bestD = maxDist;
  for (const p of placed) {
    const d = Math.hypot(x - p.x, y - p.y);
    if (d < bestD) {
      bestD = d;
      best = p;
    }
  }
  return best;
}

function drawStarShape(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  spikes: number,
  outerR: number,
  innerR: number,
  alpha: number,
  rotation = 0,
) {
  ctx.beginPath();
  for (let i = 0; i < spikes * 2; i++) {
    const r = i % 2 === 0 ? outerR : innerR;
    const a = (i * Math.PI) / spikes - Math.PI / 2 + rotation;
    const x = cx + Math.cos(a) * r;
    const y = cy + Math.sin(a) * r;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
  ctx.fill();
}

function drawPlacedStarGlyph(ctx: CanvasRenderingContext2D, star: PlacedStar) {
  const cx = star.x;
  const cy = star.y;
  const spikes = star.points ?? 4;
  const base = 3.35 + star.size * 0.45;
  const spin = star.twinklePhase * 0.08;
  const alpha = 0.85 + 0.15 * Math.sin(star.twinklePhase);

  const glowR = base * 2.2 + 2;
  const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, glowR);
  glow.addColorStop(0, `rgba(255, 255, 255, ${alpha * 0.95})`);
  glow.addColorStop(0.2, `rgba(215, 235, 255, ${alpha * 0.45})`);
  glow.addColorStop(0.6, `rgba(124, 206, 253, ${alpha * 0.08})`);
  glow.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(cx, cy, glowR, 0, Math.PI * 2);
  ctx.fill();

  const flareLen = base * 3.4 + 2;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(spin * 0.5);
  ctx.lineCap = "round";
  for (let i = 0; i < 4; i++) {
    const a = (i * Math.PI) / 2;
    const grad = ctx.createLinearGradient(
      Math.cos(a) * -flareLen,
      Math.sin(a) * -flareLen,
      Math.cos(a) * flareLen,
      Math.sin(a) * flareLen,
    );
    grad.addColorStop(0, "rgba(255,255,255,0)");
    grad.addColorStop(0.5, `rgba(255,255,255,${alpha * 0.85})`);
    grad.addColorStop(1, "rgba(255,255,255,0)");
    ctx.strokeStyle = grad;
    ctx.lineWidth = 2.55;
    ctx.beginPath();
    ctx.moveTo(Math.cos(a) * -flareLen, Math.sin(a) * -flareLen);
    ctx.lineTo(Math.cos(a) * flareLen, Math.sin(a) * flareLen);
    ctx.stroke();
  }
  ctx.restore();

  drawStarShape(ctx, cx, cy, spikes, base, base * 0.25, alpha * 0.95, spin);

  ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
  ctx.beginPath();
  ctx.arc(cx, cy, base * 0.22 + 0.5, 0, Math.PI * 2);
  ctx.fill();
}

function drawConstellations(ctx: CanvasRenderingContext2D, placed: PlacedStar[]) {
  if (placed.length < 2) return;
  const edges = collectForcedEdges(placed);

  for (const { i, j, d } of edges) {
    const a = placed[i];
    const b = placed[j];
    const fade = 1 - Math.min(1, d / LINE_FADE_PX) * 0.45;

    ctx.strokeStyle = `rgba(124, 206, 253, ${0.22 * fade})`;
    ctx.lineWidth = 3.6;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();

    ctx.strokeStyle = `rgba(255, 255, 255, ${0.75 * fade})`;
    ctx.lineWidth = 2.6;
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();
  }
}

function drawPenOverlay(
  ctx: CanvasRenderingContext2D,
  pen: PlacedStar | null,
  pathOrigin: PlacedStar | null,
  strokeLen: number,
  pointer: { x: number; y: number; active: boolean } | null,
) {
  if (!pen || !pointer?.active) return;

  const nearOrigin =
    pathOrigin &&
    strokeLen >= 3 &&
    Math.hypot(pointer.x - pathOrigin.x, pointer.y - pathOrigin.y) <= STAR_SNAP_PX;

  if (!nearOrigin) {
    ctx.save();
    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = "rgba(200, 225, 255, 0.45)";
    ctx.lineWidth = 2.6;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(pen.x, pen.y);
    ctx.lineTo(pointer.x, pointer.y);
    ctx.stroke();
    ctx.restore();
  } else if (pathOrigin) {
    ctx.save();
    ctx.strokeStyle = "rgba(180, 220, 255, 0.6)";
    ctx.lineWidth = 2.6;
    ctx.beginPath();
    ctx.moveTo(pen.x, pen.y);
    ctx.lineTo(pathOrigin.x, pathOrigin.y);
    ctx.stroke();
    ctx.restore();
  }

  ctx.save();
  ctx.strokeStyle = "rgba(220, 235, 255, 0.85)";
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.arc(pen.x, pen.y, 5.5, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();

  if (pathOrigin && strokeLen >= 3) {
    ctx.save();
    ctx.strokeStyle = nearOrigin ? "rgba(255, 255, 255, 0.95)" : "rgba(180, 210, 255, 0.5)";
    ctx.lineWidth = nearOrigin ? 1.85 : 1.55;
    ctx.beginPath();
    ctx.arc(pathOrigin.x, pathOrigin.y, nearOrigin ? 6.5 : 5.5, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }
}

export default function GalaxyBackground({
  variant = "hero",
}: {
  variant?: GalaxyVariant;
}) {
  const bitmapRef = useRef<HTMLCanvasElement>(null);
  const starsRef = useRef<HTMLCanvasElement>(null);
  const isFooter = variant === "footer";

  useEffect(() => {
    const bitmapCanvas = bitmapRef.current;
    const starsCanvas = starsRef.current;
    if (!bitmapCanvas || !starsCanvas) return;

    const bitmapCtx = bitmapCanvas.getContext("2d", { alpha: true });
    const starsCtx = starsCanvas.getContext("2d", { alpha: true });
    if (!bitmapCtx || !starsCtx) return;

    bitmapCtx.imageSmoothingEnabled = false;

    let gridW = 0;
    let gridH = 0;
    let hostW = 0;
    let hostH = 0;
    let raf = 0;
    let lastPaint = 0;
    let lastTs = 0;
    let ambientStars: AmbientStar[] = [];

    // Constellation state
    let placedStars: PlacedStar[] = [];
    let nextStarId = 1;
    let nextShapeId = 1;
    let penStar: PlacedStar | null = null;
    let pathOrigin: PlacedStar | null = null;
    let strokeLen = 0;
    let pointer: { x: number; y: number; active: boolean } | null = null;

    // Shooting stars state
    let shooting: ShootingStar[] = [];
    let shootTimer = 0;
    let nextShootAt =
      SHOOTING_STAR_INTERVAL_MS +
      Math.random() * SHOOTING_STAR_INTERVAL_JITTER_MS;
    let recentShootOrigins: { x: number; y: number }[] = [];

    const scheduleNextShoot = () => {
      nextShootAt =
        SHOOTING_STAR_INTERVAL_MS +
        Math.random() * SHOOTING_STAR_INTERVAL_JITTER_MS;
    };

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const quality: SkyQuality = detectSkyQuality();
    const minInterval = 1000 / SKY_QUALITY[quality].skyFps;

    const deep = resolveColor("--sky-deep");
    const midnight = resolveColor("--sky-midnight");
    const royal = resolveColor("--sky-royal");
    const bright = resolveColor("--sky-bright");
    const horizon = resolveColor("--sky-horizon");
    const cloud = resolveColor("--sky-cloud");

    const pureStarWhite: [number, number, number] = [255, 255, 255];
    const cosmicViolet: [number, number, number] = [84, 38, 142];
    const galacticCoreWarm: [number, number, number] = [255, 182, 140];

    const skyStops: [number, [number, number, number]][] = [
      [0.0, deep],
      [0.32, midnight],
      [0.58, royal],
      [0.72, bright],
      [0.86, horizon],
      [1.0, cloud],
    ];

    const host = bitmapCanvas.parentElement;

    const liftPen = () => {
      penStar = null;
      pathOrigin = null;
      strokeLen = 0;
    };

    const linkStars = (from: PlacedStar, to: PlacedStar) => {
      if (from.id === to.id) return;
      to.linkIds = to.linkIds ?? [];
      if (!to.linkIds.includes(from.id)) to.linkIds.push(from.id);
    };

    const generateAmbientStars = (w: number, h: number) => {
      const count = Math.max(18, Math.floor((w * h) / 260));
      const generated: AmbientStar[] = [];

      for (let i = 0; i < count; i++) {
        generated.push({
          baseX: Math.random() * w,
          baseY: Math.random() * (h * 0.85),
          vx: (Math.random() - 0.5) * 0.16,
          vy: (Math.random() - 0.5) * 0.12,
          primarySpeed: 1.4 + Math.random() * 2.0,
          shimmerSpeed: 4.0 + Math.random() * 4.5,
          phase: Math.random() * Math.PI * 2,
          maxAlpha: 0.65 + Math.random() * 0.35,
        });
      }
      return generated;
    };

    const resize = () => {
      const prevW = hostW;
      const prevH = hostH;

      hostW = host?.clientWidth || window.innerWidth;
      const skyVh = isFooter ? FOOTER_SKY_VH : SKY_HEIGHT_VH;
      hostH = Math.round(window.innerHeight * skyVh);

      gridW = Math.max(1, Math.ceil(hostW / BITMAP_BLOCK_SIZE));
      gridH = Math.max(1, Math.ceil(hostH / BITMAP_BLOCK_SIZE));

      bitmapCanvas.width = gridW;
      bitmapCanvas.height = gridH;
      bitmapCanvas.style.width = `${gridW * BITMAP_BLOCK_SIZE}px`;
      bitmapCanvas.style.height = `${gridH * BITMAP_BLOCK_SIZE}px`;

      starsCanvas.width = hostW;
      starsCanvas.height = hostH;
      starsCanvas.style.width = `${hostW}px`;
      starsCanvas.style.height = `${hostH}px`;

      ambientStars = generateAmbientStars(gridW, gridH);

      if (prevW > 0 && prevH > 0) {
        const sx = hostW / prevW;
        const sy = hostH / prevH;
        for (const s of placedStars) {
          s.x *= sx;
          s.y *= sy;
        }
      }
    };

    const canvasPoint = (event: MouseEvent) => {
      const rect = starsCanvas.getBoundingClientRect();
      return {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      };
    };

    const onPointerMove = (event: MouseEvent) => {
      if (!hostW || !hostH) return;
      const { x, y } = canvasPoint(event);
      const active = isFooter ? y >= hostH * 0.25 : y <= hostH * 0.85;
      pointer = { x, y, active };
      if (host) host.style.cursor = active ? "crosshair" : "";
    };

    const onPointerLeave = () => {
      if (pointer) pointer.active = false;
      if (host) host.style.cursor = "";
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && penStar) {
        liftPen();
        event.preventDefault();
      }
    };

    const onDblClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.closest("a, button")) return;
      if (penStar) {
        liftPen();
        event.preventDefault();
      }
    };

    const onClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.closest("a, button")) return;

      const { x, y } = canvasPoint(event);
      const inZone = isFooter ? y >= hostH * 0.25 : y <= hostH * 0.85;
      if (!inZone) return;

      const nearest = findNearestStar(placedStars, x, y, STAR_SNAP_PX);
      if (nearest) {
        if (
          penStar &&
          pathOrigin &&
          nearest === pathOrigin &&
          strokeLen >= 3 &&
          penStar !== pathOrigin
        ) {
          linkStars(penStar, pathOrigin);
          liftPen();
          return;
        }

        if (penStar && penStar !== nearest) {
          linkStars(penStar, nearest);
          if (nearest.shapeId == null) {
            nearest.shapeId = penStar.shapeId ?? nextShapeId++;
          }
          penStar = nearest;
          strokeLen += 1;
          return;
        }

        penStar = nearest;
        pathOrigin = nearest;
        strokeLen = 1;
        return;
      }

      const onLine = findLineUnderPoint(placedStars, x, y);
      if (onLine) {
        const a = placedStars[onLine.i];
        const b = placedStars[onLine.j];
        const newStar: PlacedStar = {
          id: nextStarId++,
          x: onLine.x,
          y: onLine.y,
          shapeId: a.shapeId ?? b.shapeId ?? nextShapeId++,
          linkIds: [a.id, b.id],
          twinklePhase: Math.random() * Math.PI * 2,
          twinkleSpeed: 0.8 + Math.random() * 1.5,
          points: 4 + Math.floor(Math.random() * 3),
          size: 0.8 + Math.random() * 1.4,
        };

        if (penStar) linkStars(penStar, newStar);
        placedStars.push(newStar);
        if (!penStar) {
          pathOrigin = newStar;
          strokeLen = 1;
        } else {
          strokeLen += 1;
        }
        penStar = newStar;
        return;
      }

      const newStar: PlacedStar = {
        id: nextStarId++,
        x,
        y,
        shapeId: penStar ? penStar.shapeId ?? nextShapeId++ : nextShapeId++,
        linkIds: [],
        twinklePhase: Math.random() * Math.PI * 2,
        twinkleSpeed: 0.8 + Math.random() * 1.5,
        points: 4 + Math.floor(Math.random() * 3),
        size: 0.8 + Math.random() * 1.4,
      };

      if (penStar) {
        linkStars(penStar, newStar);
        strokeLen += 1;
      } else {
        pathOrigin = newStar;
        strokeLen = 1;
      }
      placedStars.push(newStar);
      penStar = newStar;
    };

    const parseCssPercent = (el: HTMLElement, prop: string, fallback: number) => {
      const v = el.style.getPropertyValue(prop);
      if (!v) return fallback;
      const num = parseFloat(v);
      return Number.isNaN(num) ? fallback : num / 100;
    };

    const parseCssFloat = (el: HTMLElement, prop: string, fallback: number) => {
      const v = el.style.getPropertyValue(prop);
      if (!v) return fallback;
      const num = parseFloat(v);
      return Number.isNaN(num) ? fallback : num;
    };

    const render = (timeSec: number, dt: number) => {
      const img = bitmapCtx.createImageData(gridW, gridH);
      const data = img.data;

      const ambientEl = host?.querySelector<HTMLElement>(".sky-ambient") || host;

      const SPEED_DAMP = 0.08;
      const internalTimeDriftX = timeSec * 0.006;
      const internalTimeDriftY = Math.sin(timeSec * 0.005) * 0.01;

      const dx1 = (ambientEl ? parseCssPercent(ambientEl, "--drift-x1", 0) : 0) * SPEED_DAMP + internalTimeDriftX;
      const dy1 = (ambientEl ? parseCssPercent(ambientEl, "--drift-y1", 0) : 0) * SPEED_DAMP + internalTimeDriftY;
      const dx2 = (ambientEl ? parseCssPercent(ambientEl, "--drift-x2", 0) : 0) * SPEED_DAMP - internalTimeDriftX * 0.6;
      const dy2 = (ambientEl ? parseCssPercent(ambientEl, "--drift-y2", 0) : 0) * SPEED_DAMP - internalTimeDriftY * 0.6;
      const dhx = (ambientEl ? parseCssPercent(ambientEl, "--drift-hx", 0) : 0) * SPEED_DAMP + internalTimeDriftX * 0.4;
      const dhy = (ambientEl ? parseCssPercent(ambientEl, "--drift-hy", 0) : 0) * SPEED_DAMP + internalTimeDriftY * 0.4;

      const f1x = (ambientEl ? parseCssPercent(ambientEl, "--flare-x1", 0.2) : 0.2) + Math.sin(timeSec * 0.015) * 0.02;
      const f1y = ambientEl ? parseCssPercent(ambientEl, "--flare-y1", 0.12) : 0.12;
      const f1o = ambientEl ? parseCssFloat(ambientEl, "--flare-o1", 0.4) : 0.4;

      const f2x = (ambientEl ? parseCssPercent(ambientEl, "--flare-x2", 0.65) : 0.65) + Math.cos(timeSec * 0.012) * 0.025;
      const f2y = ambientEl ? parseCssPercent(ambientEl, "--flare-y2", 0.16) : 0.16;
      const f2o = ambientEl ? parseCssFloat(ambientEl, "--flare-o2", 0.35) : 0.35;

      const f3x = (ambientEl ? parseCssPercent(ambientEl, "--flare-x3", 0.42) : 0.42) + Math.sin(timeSec * 0.01) * 0.02;
      const f3y = ambientEl ? parseCssPercent(ambientEl, "--flare-y3", 0.24) : 0.24;
      const f3o = ambientEl ? parseCssFloat(ambientEl, "--flare-o3", 0.45) : 0.45;

      const f5x = ambientEl ? parseCssPercent(ambientEl, "--flare-x5", 0.5) : 0.5;
      const f5y = ambientEl ? parseCssPercent(ambientEl, "--flare-y5", 0.26) : 0.26;
      const f5o = ambientEl ? parseCssFloat(ambientEl, "--flare-o5", 0.65) : 0.65;

      for (let y = 0; y < gridH; y++) {
        const ny = y / Math.max(1, gridH - 1);
        const yNorm = isFooter ? 1 - ny : ny;

        for (let x = 0; x < gridW; x++) {
          const nx = x / Math.max(1, gridW - 1);

          const hillMacro = Math.sin((nx + dhx) * Math.PI * 3.0) * 0.075;
          const hillMeso = Math.sin((nx * 2.0 - dx1) * Math.PI * 4.5) * 0.035;
          const hillProfile = hillMacro + hillMeso + dhy * 0.45;

          const horizonCut = 0.69 + hillProfile;
          const hillFade = 1 - smoothstep(horizonCut - 0.14, horizonCut + 0.04, yNorm);

          const wx = nx + (fbm((nx + dx1) * 2.2, (yNorm + dy1) * 2.2, 2) - 0.5) * 0.12;
          const wy = yNorm + (fbm((nx + dx2) * 2.2 + 1.4, (yNorm + dy2) * 2.2 + 0.8, 2) - 0.5) * 0.09;

          const gasShape = fbm(wx * 3.4 + dx1, wy * 2.8 + dy1, 3);
          const gasDetail = fbm(wx * 7.2 - dx2, wy * 5.8 - dy2, 2);
          const gas = gasShape * 0.65 + gasDetail * 0.35;

          const elevation = Math.min(
            1,
            Math.max(0, yNorm + (gas - 0.5) * 0.22 + hillProfile * 0.18),
          );

          let [r, g, b] = getSkyGradientColor(elevation, skyStops);

          const flare1 = Math.exp(-Math.hypot(nx - f1x, yNorm - f1y) / 0.16) * f1o;
          const flare2 = Math.exp(-Math.hypot(nx - f2x, yNorm - f2y) / 0.2) * f2o;
          const flare3 = Math.exp(-Math.hypot(nx - f3x, yNorm - f3y) / 0.22) * f3o;
          const coreGlow = Math.exp(-Math.hypot(nx - f5x, yNorm - f5y) / 0.15) * f5o;
          const flareTotal = flare1 + flare2 + flare3;

          const dustDepth = Math.pow(Math.max(0, 0.45 - gas), 1.8) * 1.6;
          r = lerp(r, cosmicViolet[0], dustDepth * 0.35);
          g = lerp(g, cosmicViolet[1], dustDepth * 0.25);
          b = lerp(b, cosmicViolet[2], dustDepth * 0.45);

          r = lerp(r, galacticCoreWarm[0], coreGlow * 0.4);
          g = lerp(g, galacticCoreWarm[1], coreGlow * 0.25);
          b = lerp(b, galacticCoreWarm[2], coreGlow * 0.15);

          r = lerp(r, bright[0], flareTotal * 0.45);
          g = lerp(g, bright[1], flareTotal * 0.4);
          b = lerp(b, bright[2], flareTotal * 0.6);

          const crestBlend = smoothstep(0.44, horizonCut, yNorm);
          r = lerp(r, horizon[0], crestBlend * 0.7);
          g = lerp(g, horizon[1], crestBlend * 0.7);
          b = lerp(b, horizon[2], crestBlend * 0.7);

          r = ditherChannel(Math.min(1, Math.max(0, r / 255)), x, y, 16) * 255;
          g = ditherChannel(Math.min(1, Math.max(0, g / 255)), x, y, 16) * 255;
          b = ditherChannel(Math.min(1, Math.max(0, b / 255)), x, y, 16) * 255;

          const baseAlpha = smoothstep(0.01, 0.08, yNorm);
          const rawAlpha = hillFade * baseAlpha * (0.68 + gas * 0.28 + coreGlow * 0.15);
          const ditheredAlpha = ditherChannel(Math.min(1, Math.max(0, rawAlpha)), x, y, 16);

          const idx = (y * gridW + x) * 4;
          data[idx] = r;
          data[idx + 1] = g;
          data[idx + 2] = b;
          data[idx + 3] = Math.round(ditheredAlpha * 255);
        }
      }

      for (let i = 0; i < ambientStars.length; i++) {
        const s = ambientStars[i];

        let curGx = Math.floor((s.baseX + s.vx * timeSec) % gridW);
        let curGy = Math.floor((s.baseY + s.vy * timeSec) % gridH);
        if (curGx < 0) curGx += gridW;
        if (curGy < 0) curGy += gridH;

        const primary = 0.5 + 0.5 * Math.sin(timeSec * s.primarySpeed + s.phase);
        const shimmer = 0.5 + 0.5 * Math.sin(timeSec * s.shimmerSpeed + s.phase * 1.5);
        const combined = Math.pow(primary * 0.7 + shimmer * 0.3, 2.6);
        const alpha = s.maxAlpha * (0.05 + 0.95 * combined);

        if (curGx >= 0 && curGx < gridW && curGy >= 0 && curGy < gridH) {
          const idx = (curGy * gridW + curGx) * 4;
          data[idx] = Math.min(255, lerp(data[idx], pureStarWhite[0], alpha));
          data[idx + 1] = Math.min(255, lerp(data[idx + 1], pureStarWhite[1], alpha));
          data[idx + 2] = Math.min(255, lerp(data[idx + 2], pureStarWhite[2], alpha));
          data[idx + 3] = Math.max(data[idx + 3], Math.round(alpha * 255));
        }
      }

      bitmapCtx.putImageData(img, 0, 0);

      // Render foreground interactive constellation & shooting star canvas
      starsCtx.clearRect(0, 0, hostW, hostH);

      // Shooting stars logic
      if (!reducedMotion) {
        shootTimer += dt * 1000;
        if (shootTimer >= nextShootAt && shooting.length < 3) {
          const spawnH = isFooter ? hostH * 0.7 : hostH * 0.65;
          const avoid = recentShootOrigins.concat(shooting.map((s) => ({ x: s.x, y: s.y })));
          const meteor = spawnShootingStar(hostW, spawnH, avoid);
          if (isFooter) meteor.y += hostH * 0.25;
          shooting.push(meteor);
          recentShootOrigins.push({ x: meteor.x, y: meteor.y });

          if (recentShootOrigins.length > 5) {
            recentShootOrigins.splice(0, recentShootOrigins.length - 5);
          }
          shootTimer = 0;
          scheduleNextShoot();
        }
      }

      const frameScale = dt * 60;
      const meteorCeiling = isFooter ? hostH : hostH * 0.85;

      for (let i = shooting.length - 1; i >= 0; i--) {
        const m = shooting[i];
        m.life += dt;
        m.vy += 0.35 * dt;
        m.x += m.vx * frameScale;
        m.y += m.vy * frameScale;
        drawShootingStar(starsCtx, m);

        if (
          m.life >= m.maxLife ||
          m.x > hostW + 40 ||
          m.y > meteorCeiling ||
          (isFooter && m.y < hostH * 0.2)
        ) {
          shooting.splice(i, 1);
        }
      }

      drawConstellations(starsCtx, placedStars);
      for (const star of placedStars) {
        star.twinklePhase += 0.04;
        drawPlacedStarGlyph(starsCtx, star);
      }
      drawPenOverlay(starsCtx, penStar, pathOrigin, strokeLen, pointer);
    };

    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      const dt = lastTs ? Math.min(0.05, (now - lastTs) / 1000) : 0.016;
      lastTs = now;

      if (now - lastPaint < minInterval) return;
      lastPaint = now;
      render(now * 0.001, dt);
    };

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("keydown", onKeyDown);
    host?.addEventListener("click", onClick);
    host?.addEventListener("dblclick", onDblClick);
    host?.addEventListener("mousemove", onPointerMove);
    host?.addEventListener("mouseleave", onPointerLeave);
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("keydown", onKeyDown);
      host?.removeEventListener("click", onClick);
      host?.removeEventListener("dblclick", onDblClick);
      host?.removeEventListener("mousemove", onPointerMove);
      host?.removeEventListener("mouseleave", onPointerLeave);
      if (host) host.style.cursor = "";
    };
  }, [isFooter]);

  return (
    <>
      <canvas
        ref={bitmapRef}
        className="galaxy-canvas galaxy-canvas--bitmap pointer-events-none absolute inset-0 z-[1] [image-rendering:pixelated]"
        aria-hidden="true"
      />
      <canvas
        ref={starsRef}
        className="galaxy-canvas pointer-events-none absolute inset-0 z-[2]"
        aria-hidden="true"
      />
    </>
  );
}