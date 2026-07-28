"use client";

import { useEffect, useRef } from "react";

const BAYER_8 = [
  [0, 32, 8, 40, 2, 34, 10, 42],
  [48, 16, 56, 24, 50, 18, 58, 26],
  [12, 44, 4, 36, 14, 46, 6, 38],
  [60, 28, 52, 20, 62, 30, 54, 22],
  [3, 35, 11, 43, 1, 33, 9, 41],
  [51, 19, 59, 27, 49, 17, 57, 25],
  [15, 47, 7, 39, 13, 45, 5, 37],
  [63, 31, 55, 23, 61, 29, 53, 21],
];

// Stars canvas matches taller hero sky
export const LIGHT_FADE_VH = 0.75;
export const SKY_HEIGHT_VH = 1.75;
export const MIST_OVERLAP_VH = 0;

function buildMappedStops(
  stops: [number, number, number, number][],
  viewportRatio: number,
): [number, number, number, number][] {
  const heroEnd = viewportRatio;
  const span = 1 - viewportRatio;
  const [, dr, dg, db] = stops[0];
  const [, mr, mg, mb] = stops[1];
  const [, rr, rg, rb] = stops[2];
  const [, br, bg, bb] = stops[3];
  const [, hr, hg, hb] = stops[4];
  const [, wr, wg, wb] = stops[5];

  // Hold deep longer, then ease through midnight/royal before bright → cream.
  return [
    [0, dr, dg, db],
    [heroEnd * 0.55, dr, dg, db],
    [heroEnd * 0.72, mr, mg, mb],
    [heroEnd * 0.92, rr, rg, rb],
    [heroEnd + span * 0.1, rr, rg, rb],
    [heroEnd + span * 0.35, br, bg, bb],
    [heroEnd + span * 0.55, br, bg, bb],
    [heroEnd + span * 0.72, hr, hg, hb],
    [heroEnd + span * 0.88, hr, hg, hb],
    [1, wr, wg, wb],
  ];
}

// Figma Vector 2 — hero: deep/midnight/royal; scroll: bright/horizon/white
const GRADIENT_STOP_DEFS: { t: number; cssVar: string }[] = [
  { t: 0.0, cssVar: "--sky-deep" },
  { t: 0.331731, cssVar: "--sky-midnight" },
  { t: 0.615385, cssVar: "--sky-royal" },
  { t: 0.721154, cssVar: "--sky-bright" },
  { t: 0.841346, cssVar: "--sky-horizon" },
  { t: 1.0, cssVar: "--sky-cloud" },
];

const GRADIENT_STOP_FALLBACKS: Record<string, [number, number, number]> = {
  "--sky-deep": [0, 0, 22],
  "--sky-midnight": [0, 6, 57],
  "--sky-royal": [0, 2, 117],
  "--sky-bright": [4, 107, 236],
  "--sky-horizon": [124, 206, 253],
  "--sky-cloud": [247, 246, 242],
};

/** Base gap between spawn attempts — random jitter applied each time */
const SHOOTING_STAR_INTERVAL_MS = 2_200;
const SHOOTING_STAR_INTERVAL_JITTER_MS = 2_400;
/** Cap concurrent meteors so the sky stays readable */
const SHOOTING_STAR_MAX = 3;
/** Keep new streaks away from recent ones (canvas px) */
const SHOOTING_STAR_SPREAD_PX = 90;
// Slightly larger on-screen pixels, still dense dither
const PIXEL_SCALE = 3;

interface Star {
  x: number;
  y: number;
  vx: number;
  vy: number;
  opacity: number;
  twinkleSpeed: number;
  twinklePhase: number;
  size: number;
  /** User-clicked stars — these form constellations when nearby */
  placed?: boolean;
  /** Stable id for forced links */
  id?: number;
  /** Shape group — closed forms stay separate even when junction-linked */
  shapeId?: number;
  /** Forced partners (by id), e.g. when placed on an existing line */
  linkIds?: number[];
  /** Bright diffraction-spike “hero” ambient star */
  hero?: boolean;
  /** Curved drift — heading slowly turns so paths aren’t straight */
  driftAngle?: number;
  driftSpeed?: number;
  turnSpeed?: number;
  curvePhase?: number;
  /** Point count for the star glyph — 4, 5, or 6 */
  points?: number;
}

/** Max distance (in canvas px) to link two placed stars into a constellation */
const CONSTELLATION_RADIUS = 42;
/** Max links per star so constellations stay readable */
const CONSTELLATION_MAX_EDGES = 4;
/** How close a click must be to an existing line to snap onto it */
const LINE_HIT_PX = 11;

interface ShootingStar {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  length: number;
}

function hexToRgb(hex: string): [number, number, number] | null {
  const cleaned = hex.trim().replace("#", "");
  if (cleaned.length !== 6) return null;
  const r = Number.parseInt(cleaned.slice(0, 2), 16);
  const g = Number.parseInt(cleaned.slice(2, 4), 16);
  const b = Number.parseInt(cleaned.slice(4, 6), 16);
  if ([r, g, b].some((n) => Number.isNaN(n))) return null;
  return [r, g, b];
}

function resolveSkyStops(): [number, number, number, number][] {
  const styles = getComputedStyle(document.documentElement);

  return GRADIENT_STOP_DEFS.map(({ t, cssVar }) => {
    const fromCss = hexToRgb(styles.getPropertyValue(cssVar));
    const [r, g, b] = fromCss ?? GRADIENT_STOP_FALLBACKS[cssVar];
    return [t, r, g, b];
  });
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

function fbm(x: number, y: number, octaves = 3) {
  let value = 0;
  let amp = 0.5;
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

function smootherstep(edge0: number, edge1: number, x: number) {
  const t = Math.min(1, Math.max(0, (x - edge0) / (edge1 - edge0)));
  return t * t * t * (t * (t * 6 - 15) + 10);
}

function getGradientColor(
  t: number,
  stops: [number, number, number, number][],
): [number, number, number] {
  const clamped = Math.min(1, Math.max(0, t));
  let r = stops[0][1];
  let g = stops[0][2];
  let b = stops[0][3];

  for (let i = 0; i < stops.length - 1; i++) {
    const [t0, r0, g0, b0] = stops[i];
    const [t1, r1, g1, b1] = stops[i + 1];

    if (clamped >= t0 && clamped <= t1) {
      const local = (clamped - t0) / Math.max(1e-6, t1 - t0);
      // Gentler ease between stops — less banding in the bitmap
      const ease = smootherstep(0, 1, local);
      r = lerp(r0, r1, ease);
      g = lerp(g0, g1, ease);
      b = lerp(b0, b1, ease);
      break;
    }
  }

  return [r, g, b];
}

function ditherChannel(value: number, x: number, y: number, levels: number) {
  const scaled = value * (levels - 1);
  const base = Math.floor(scaled);
  const frac = scaled - base;
  const threshold = organicThreshold(x, y);
  return Math.min(levels - 1, base + (frac > threshold ? 1 : 0)) / (levels - 1);
}

function organicThreshold(x: number, y: number) {
  const bayer = BAYER_8[y % 8][x % 8] / 64;
  const grain = hash2(x * 3 + 17, y * 5 + 29);
  const cluster = hash2((x >> 1) + 7, (y >> 1) + 13);
  // Strong Bayer lattice — dither reads clearly in the bitmap
  return bayer * 0.72 + grain * 0.18 + cluster * 0.1;
}

function sampleField(
  field: Float32Array,
  fw: number,
  fh: number,
  x: number,
  y: number,
  width: number,
  height: number,
) {
  const u = (x / Math.max(1, width - 1)) * (fw - 1);
  const v = (y / Math.max(1, height - 1)) * (fh - 1);
  const x0 = Math.floor(u);
  const y0 = Math.floor(v);
  const x1 = Math.min(fw - 1, x0 + 1);
  const y1 = Math.min(fh - 1, y0 + 1);
  const tx = u - x0;
  const ty = v - y0;

  return lerp(
    lerp(field[y0 * fw + x0], field[y0 * fw + x1], tx),
    lerp(field[y1 * fw + x0], field[y1 * fw + x1], tx),
    ty,
  );
}

function buildSkyWarpField(width: number, height: number) {
  const fw = Math.max(72, Math.floor(width / 3.5));
  const fh = Math.max(56, Math.floor(height / 3.5));
  const field = new Float32Array(fw * fh);

  for (let y = 0; y < fh; y++) {
    const ny = y / Math.max(1, fh - 1);

    for (let x = 0; x < fw; x++) {
      const nx = x / Math.max(1, fw - 1);
      const flow =
        fbm(nx * 1.05 + 0.35, ny * 0.72 + 0.15, 5) * 0.6 +
        fbm(nx * 2.1 + 1.8, ny * 1.3 + 0.9, 3) * 0.4;
      const fadeAmt = smoothstep(0.32, 0.92, ny);
      field[y * fw + x] = (flow - 0.5) * 0.045 * (0.25 + fadeAmt * 0.75);
    }
  }

  return { field, fw, fh };
}

function buildMeshTintField(
  width: number,
  height: number,
  viewportRatio: number,
) {
  const fw = Math.max(64, Math.floor(width / 2.8));
  const fh = Math.max(48, Math.floor(height / 2.8));
  const brightTint = new Float32Array(fw * fh);
  const cyanTint = new Float32Array(fw * fh);

  for (let y = 0; y < fh; y++) {
    const ny = y / Math.max(1, fh - 1);
      const fade = smoothstep(viewportRatio * 1.05, 1, ny);

    for (let x = 0; x < fw; x++) {
      const nx = x / Math.max(1, fw - 1);

      const wx =
        nx +
        (fbm(nx * 0.85 + 0.4, ny * 0.45, 4) - 0.5) * 0.14 * fade;
      const wy =
        ny +
        (fbm(nx * 0.85 + 2.3, ny * 0.45 + 1.1, 4) - 0.5) * 0.1 * fade;

      const blobA =
        Math.exp(-Math.pow((wx - 0.35) / 0.38, 2) - Math.pow((wy - 0.72) / 0.28, 2)) *
        fade;
      const blobB =
        Math.exp(-Math.pow((wx - 0.68) / 0.32, 2) - Math.pow((wy - 0.58) / 0.34, 2)) *
        fade;
      const drift =
        fbm(wx * 1.6 + 0.7, wy * 0.9 + 0.3, 5) * fade;

      brightTint[y * fw + x] = Math.min(
        1,
        (blobA * 0.55 + blobB * 0.35 + drift * 0.25) * fade,
      );
      cyanTint[y * fw + x] = Math.min(
        1,
        (blobB * 0.5 + drift * 0.4 + blobA * 0.15) * fade,
      );
    }
  }

  return { brightTint, cyanTint, fw, fh };
}

function buildOrganicFadeField(
  width: number,
  height: number,
  viewportRatio: number,
) {
  const fw = Math.max(160, Math.floor(width / 1.75));
  const fh = Math.max(120, Math.floor(height / 1.75));
  const warp = new Float32Array(fw * fh);
  const whiteBlend = new Float32Array(fw * fh);

  const heroEnd = viewportRatio;
  const span = 1 - viewportRatio;
  // Mist only below the first viewport — keep footer zone dark
  const mistStart = heroEnd + span * 0.08;
  const mistMid = heroEnd + span * 0.35;
  const mistFull = heroEnd + span * 0.9;

  for (let y = 0; y < fh; y++) {
    const ny = y / Math.max(1, fh - 1);
    const fadeWeight = smoothstep(mistStart, mistFull, ny);
    const baseWhite = smoothstep(mistMid, 0.98, ny);

    for (let x = 0; x < fw; x++) {
      const nx = x / Math.max(1, fw - 1);

      const domainX =
        nx + (fbm(nx * 0.7 + 0.15, ny * 0.38, 5) - 0.5) * 0.28 * fadeWeight;
      const domainY =
        ny +
        (fbm(nx * 0.7 + 2.0, ny * 0.38 + 1.3, 5) - 0.5) * 0.18 * fadeWeight;

      const macro =
        fbm(domainX * 0.38 + 0.08, domainY * 0.2 + 0.04, 6) * 0.48;
      const meso =
        fbm(domainX * 0.95 + 0.85, domainY * 0.45 + 0.28, 5) * 0.34;
      const mist =
        fbm(domainX * 2.2 + 1.5, domainY * 0.9 + 0.65, 4) * 0.18;
      const ridge = macro + meso + mist;

      const billow =
        Math.sin(nx * Math.PI * 1.8 + ridge * 5) * 0.045 +
        Math.sin(nx * Math.PI * 4.6 + domainY * 7) * 0.025;
      const edgeLift = (ridge - 0.38 + billow) * fadeWeight;

      warp[y * fw + x] = edgeLift * 0.12;

      const cloudLift =
        Math.pow(Math.max(0, ridge - 0.32 + billow), 1.05) * fadeWeight;
      const softPeaks =
        Math.pow(Math.max(0, macro - 0.42), 1.4) * fadeWeight;
      const hazeVeil = Math.pow(fadeWeight, 1.15) * 0.38;
      const lumps = edgeLift * 0.7 * Math.max(baseWhite, fadeWeight * 0.55);

      whiteBlend[y * fw + x] = Math.min(
        1,
        Math.max(
          0,
          baseWhite * 0.85 +
            hazeVeil +
            cloudLift * 0.7 +
            softPeaks * 0.45 +
            lumps,
        ),
      );
    }
  }

  return { warp, whiteBlend, fw, fh };
}

function softBlurBottomRows(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  startRow: number,
  radius: number,
) {
  const scratch = new Uint8ClampedArray(data);
  const y0 = Math.max(0, startRow);

  for (let pass = 0; pass < 2; pass++) {
    const src = pass === 0 ? scratch : data;

    for (let y = y0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        let r = 0;
        let g = 0;
        let b = 0;
        let n = 0;

        for (let ky = -radius; ky <= radius; ky++) {
          const sy = Math.min(height - 1, Math.max(y0, y + ky));
          for (let kx = -radius; kx <= radius; kx++) {
            const sx = Math.min(width - 1, Math.max(0, x + kx));
            const idx = (sy * width + sx) * 4;
            r += src[idx];
            g += src[idx + 1];
            b += src[idx + 2];
            n++;
          }
        }

        const idx = (y * width + x) * 4;
        data[idx] = r / n;
        data[idx + 1] = g / n;
        data[idx + 2] = b / n;
      }
    }

    if (pass === 0) scratch.set(data);
  }
}

function buildMilkyWayField(width: number, height: number) {
  const fw = Math.max(64, Math.floor(width / 2.8));
  const fh = Math.max(40, Math.floor(height / 3.2));
  const haze = new Float32Array(fw * fh);
  const warm = new Float32Array(fw * fh);
  const violet = new Float32Array(fw * fh);
  const dust = new Float32Array(fw * fh);

  // Horizontal galactic plane through the upper sky
  const bandY = 0.26;
  const bandThick = 0.16;

  for (let y = 0; y < fh; y++) {
    const ny = y / Math.max(1, fh - 1);
    for (let x = 0; x < fw; x++) {
      const nx = x / Math.max(1, fw - 1);

      // Organic warp so the band isn’t a straight stripe
      const warpY =
        (fbm(nx * 1.4 + 0.3, ny * 0.6 + 1.1, 4) - 0.5) * 0.1 +
        (fbm(nx * 3.2 + 2.0, ny * 1.2, 3) - 0.5) * 0.04;
      const warpX = (fbm(nx * 0.8 + 4.2, ny * 2.0, 3) - 0.5) * 0.05;

      const dy = (ny - bandY - warpY) / bandThick;
      const band = Math.exp(-dy * dy);

      // Density rises toward a warmer “core” region (right-of-center)
      const coreX = 0.62;
      const along =
        Math.exp(-Math.pow((nx - coreX) / 0.55, 2)) * 0.55 +
        0.45;

      const gas =
        fbm(nx * 2.6 + warpX * 2, ny * 3.4 + warpY * 3, 5) * 0.55 +
        fbm(nx * 5.5 + 1.7, ny * 4.8 + 0.9, 3) * 0.45;

      const mist = band * along * (0.35 + 0.65 * gas);
      const warmCore =
        mist *
        Math.exp(-Math.pow((nx - coreX) / 0.28, 2)) *
        Math.exp(-Math.pow(dy * 0.7, 2)) *
        (0.4 + 0.6 * gas);
      const violetEdge =
        mist * (0.45 + 0.55 * (1 - Math.exp(-Math.pow(dy * 1.1, 2)))) * gas;
      const dustLane =
        mist *
        Math.pow(1 - gas, 1.4) *
        smoothstep(0.15, 0.55, mist) *
        (0.5 + 0.5 * fbm(nx * 6.0 + 3.1, ny * 5.0, 3));

      const idx = y * fw + x;
      haze[idx] = Math.min(1, mist);
      warm[idx] = Math.min(1, warmCore);
      violet[idx] = Math.min(1, violetEdge);
      dust[idx] = Math.min(1, dustLane);
    }
  }

  return { haze, warm, violet, dust, fw, fh, bandY };
}

/** Soft bitmapped Milky Way band — purple haze, warm core, dust lanes */
function bakeGalaxyOverlay(width: number, height: number) {
  const image = new ImageData(width, height);
  const data = image.data;
  const g = buildMilkyWayField(width, height);
  const levels = 5;

  const DEEP: [number, number, number] = [12, 8, 40];
  const VIOLET: [number, number, number] = [110, 60, 190];
  const MAGENTA: [number, number, number] = [180, 90, 170];
  const AMBER: [number, number, number] = [255, 170, 120];
  const DUST: [number, number, number] = [8, 4, 18];

  for (let y = 0; y < height; y++) {
    const fadeY = 1 - smoothstep(0.7, 0.98, y / Math.max(1, height - 1));
    for (let x = 0; x < width; x++) {
      const hazeV = sampleField(g.haze, g.fw, g.fh, x, y, width, height);
      const warmV = sampleField(g.warm, g.fw, g.fh, x, y, width, height);
      const vioV = sampleField(g.violet, g.fw, g.fh, x, y, width, height);
      const dustV = sampleField(g.dust, g.fw, g.fh, x, y, width, height);

      let r = 0;
      let gch = 0;
      let b = 0;
      let a = 0;

      // Deep indigo fill inside the band
      r = lerp(r, DEEP[0], hazeV * 0.22);
      gch = lerp(gch, DEEP[1], hazeV * 0.22);
      b = lerp(b, DEEP[2], hazeV * 0.3);
      a = Math.max(a, hazeV * 0.1);

      // Violet / magenta nebula mist
      r = lerp(r, VIOLET[0], vioV * 0.18);
      gch = lerp(gch, VIOLET[1], vioV * 0.12);
      b = lerp(b, VIOLET[2], vioV * 0.22);
      a = Math.max(a, vioV * 0.12);

      r = lerp(r, MAGENTA[0], hazeV * warmV * 0.14 + vioV * 0.06);
      gch = lerp(gch, MAGENTA[1], hazeV * warmV * 0.1 + vioV * 0.05);
      b = lerp(b, MAGENTA[2], hazeV * warmV * 0.12 + vioV * 0.08);

      // Warm amber galactic core glow
      r = lerp(r, AMBER[0], warmV * 0.22);
      gch = lerp(gch, AMBER[1], warmV * 0.14);
      b = lerp(b, AMBER[2], warmV * 0.1);
      a = Math.max(a, warmV * 0.14 + hazeV * 0.06);

      // Dark dust lanes cutting through the band
      r = lerp(r, DUST[0], dustV * 0.2);
      gch = lerp(gch, DUST[1], dustV * 0.2);
      b = lerp(b, DUST[2], dustV * 0.2);

      r = ditherChannel(Math.min(1, r / 255), x, y, levels) * 255;
      gch = ditherChannel(Math.min(1, gch / 255), x, y, levels) * 255;
      b = ditherChannel(Math.min(1, b / 255), x, y, levels) * 255;

      const idx = (y * width + x) * 4;
      data[idx] = r;
      data[idx + 1] = gch;
      data[idx + 2] = b;
      data[idx + 3] = Math.round(Math.min(255, a * 255 * fadeY * 0.55));
    }
  }

  return { image, bandY: g.bandY };
}

function milkyWayPoint(width: number, height: number) {
  const bandY = height * 0.26;
  const along = Math.random();
  const coreBias = Math.pow(Math.random(), 0.55);
  const x =
    width *
    (0.02 +
      along * 0.96 +
      (Math.random() - 0.5) * 0.04 +
      (coreBias - 0.5) * 0.08);
  const warp =
    (fbm(along * 3.2, 0.4, 3) - 0.5) * height * 0.08 +
    (Math.random() - 0.5) * height * 0.06;
  const spread = (Math.random() - 0.5) * height * (0.04 + Math.random() * 0.1);
  const y = bandY + warp + spread;
  return {
    x: Math.min(width - 1, Math.max(0, x)),
    y: Math.min(height - 1, Math.max(0, y)),
  };
}

function createStar(
  width: number,
  height: number,
  biased = false,
  inBand = false,
): Star {
  // Soft current across the sky — varied but calm
  const speed = 0.018 + Math.random() * 0.032;
  const angle = -0.2 + Math.random() * 0.18;

  let x = Math.random() * width;
  let y = Math.random() * height;

  if (inBand) {
    const p = milkyWayPoint(width, height);
    x = p.x;
    y = p.y;
  } else if (biased) {
    // Soft milky-way band pull
    const bandY = height * (0.18 + Math.random() * 0.18);
    const along = Math.random();
    y = lerp(y, bandY + (Math.random() - 0.5) * height * 0.05, 0.72);
    x = width * (0.02 + along * 0.96);
  }

  const bright = Math.random();
  // Soft pinpoints — quiet field, but still readable
  const hero = bright > 0.978;
  const opacity = hero
    ? 0.7 + bright * 0.28
    : bright > 0.88
      ? 0.48 + bright * 0.28
      : bright > 0.55
        ? 0.28 + bright * 0.22
        : 0.16 + bright * 0.14;

  return {
    x,
    y,
    // Kept for compatibility; curved motion uses driftAngle / driftSpeed
    vx: Math.cos(angle) * speed * (inBand ? 0.85 : 1),
    vy: Math.sin(angle) * speed * (inBand ? 0.25 : 0.45),
    opacity,
    twinkleSpeed: 0.18 + Math.random() * 0.55,
    twinklePhase: Math.random() * Math.PI * 2,
    size: 1,
    hero,
    driftAngle: angle,
    driftSpeed: speed * (inBand ? 0.85 : 1),
    turnSpeed: 0.06 + Math.random() * 0.12,
    curvePhase: Math.random() * Math.PI * 2,
    points: 4 + Math.floor(Math.random() * 3),
  };
}

function generateStars(width: number, height: number): Star[] {
  // Readable ambient field — denser, still subtle
  const count = Math.floor((width * height) / 1100);
  const bandCount = Math.floor(count * 0.45);
  const softCount = Math.floor(count * 0.3);
  const scatterCount = Math.max(0, count - bandCount - softCount);

  const stars: Star[] = [];
  for (let i = 0; i < bandCount; i++) {
    stars.push(createStar(width, height, false, true));
  }
  for (let i = 0; i < softCount; i++) {
    stars.push(createStar(width, height, true, false));
  }
  for (let i = 0; i < scatterCount; i++) {
    stars.push(createStar(width, height, false, false));
  }
  return stars;
}

function spawnShootingStar(
  width: number,
  height: number,
  avoid: { x: number; y: number }[] = [],
): ShootingStar {
  // Pick an entry region across the full sky so streaks don’t pile up
  const pickStart = () => {
    const lane = Math.floor(Math.random() * 5);
    switch (lane) {
      case 0: // far left, upper
        return {
          x: -6,
          y: height * (0.04 + Math.random() * 0.35),
          fromLeft: true,
        };
      case 1: // mid-left, mid
        return {
          x: -4,
          y: height * (0.2 + Math.random() * 0.35),
          fromLeft: true,
        };
      case 2: // top edge, left half
        return {
          x: width * (0.05 + Math.random() * 0.4),
          y: -4,
          fromLeft: true,
        };
      case 3: // top edge, right half → drift leftish/down
        return {
          x: width * (0.45 + Math.random() * 0.45),
          y: -4,
          fromLeft: false,
        };
      default: // upper-right interior
        return {
          x: width * (0.55 + Math.random() * 0.4),
          y: height * (0.02 + Math.random() * 0.22),
          fromLeft: false,
        };
    }
  };

  let x = -4;
  let y = height * 0.1;
  let fromLeft = true;
  for (let attempt = 0; attempt < 10; attempt++) {
    const start = pickStart();
    const farEnough = avoid.every(
      (p) => Math.hypot(start.x - p.x, start.y - p.y) >= SHOOTING_STAR_SPREAD_PX,
    );
    if (farEnough || avoid.length === 0) {
      x = start.x;
      y = start.y;
      fromLeft = start.fromLeft;
      break;
    }
    if (attempt === 9) {
      x = start.x;
      y = start.y;
      fromLeft = start.fromLeft;
    }
  }

  const speed = 2.4 + Math.random() * 1.8;
  const angleJitter = (Math.random() - 0.5) * 0.35;

  return {
    x,
    y,
    vx: speed * (fromLeft ? 0.85 + Math.random() * 0.35 : 0.45 + Math.random() * 0.4) + angleJitter,
    vy: speed * (0.28 + Math.random() * 0.4),
    life: 0,
    maxLife: 0.85 + Math.random() * 0.55,
    length: 12 + Math.random() * 16,
  };
}

/** Bitmap dither texture over the soft ambient CSS sky */
function bakeBitmapSky(
  width: number,
  height: number,
  stops: [number, number, number, number][],
) {
  const imageData = new ImageData(width, height);
  const data = imageData.data;
  // Fewer levels = more visible dither dots
  const levels = 6;
  const viewportRatio = 1 / SKY_HEIGHT_VH;
  const mapped = buildMappedStops(stops, viewportRatio);
  const warp = buildSkyWarpField(width, height);
  const organic = buildOrganicFadeField(width, height, viewportRatio);
  const mesh = buildMeshTintField(width, height, viewportRatio);

  const brightCss =
    hexToRgb(
      getComputedStyle(document.documentElement).getPropertyValue("--sky-bright"),
    ) ?? GRADIENT_STOP_FALLBACKS["--sky-bright"];
  const horizonCss =
    hexToRgb(
      getComputedStyle(document.documentElement).getPropertyValue(
        "--sky-horizon",
      ),
    ) ?? GRADIENT_STOP_FALLBACKS["--sky-horizon"];
  const whiteCss =
    hexToRgb(
      getComputedStyle(document.documentElement).getPropertyValue("--sky-cloud"),
    ) ?? GRADIENT_STOP_FALLBACKS["--sky-cloud"];

  for (let y = 0; y < height; y++) {
    const ny = y / Math.max(1, height - 1);
    const warpWeight = smoothstep(viewportRatio * 0.7, 1, ny);
    // Keep bitmap strong through most of the sky
    const alphaMul =
      (1 - smoothstep(0.72, 0.97, ny)) * (0.92 + 0.08 * (1 - ny * 0.15));

    for (let x = 0; x < width; x++) {
      const flow = sampleField(
        warp.field,
        warp.fw,
        warp.fh,
        x,
        y,
        width,
        height,
      );
      const terrain = sampleField(
        organic.warp,
        organic.fw,
        organic.fh,
        x,
        y,
        width,
        height,
      );
      const t = Math.min(
        1,
        Math.max(0, ny + (flow * 0.35 + terrain * 0.25) * warpWeight),
      );
      let [r, g, b] = getGradientColor(t, mapped);

      const brightBlob = sampleField(
        mesh.brightTint,
        mesh.fw,
        mesh.fh,
        x,
        y,
        width,
        height,
      );
      const cyanBlob = sampleField(
        mesh.cyanTint,
        mesh.fw,
        mesh.fh,
        x,
        y,
        width,
        height,
      );
      r = lerp(r, brightCss[0], brightBlob * 0.1);
      g = lerp(g, brightCss[1], brightBlob * 0.08);
      b = lerp(b, brightCss[2], brightBlob * 0.12);
      r = lerp(r, horizonCss[0], cyanBlob * 0.1);
      g = lerp(g, horizonCss[1], cyanBlob * 0.12);
      b = lerp(b, horizonCss[2], cyanBlob * 0.08);

      const organicWhite = sampleField(
        organic.whiteBlend,
        organic.fw,
        organic.fh,
        x,
        y,
        width,
        height,
      );
      const toSurface = smoothstep(0.0, 0.95, organicWhite);
      r = lerp(r, horizonCss[0], toSurface * 0.22 * (1 - toSurface));
      g = lerp(g, horizonCss[1], toSurface * 0.26 * (1 - toSurface));
      b = lerp(b, horizonCss[2], toSurface * 0.28 * (1 - toSurface));
      r = lerp(r, whiteCss[0], toSurface);
      g = lerp(g, whiteCss[1], toSurface);
      b = lerp(b, whiteCss[2], toSurface);

      // Full-strength dither — bitmap texture stays obvious
      const ditherAmt = (0.95 + 0.05 * ny) * (1 - toSurface * 0.88);
      const dr = ditherChannel(r / 255, x, y, levels) * 255;
      const dg = ditherChannel(g / 255, x, y, levels) * 255;
      const db = ditherChannel(b / 255, x, y, levels) * 255;

      const idx = (y * width + x) * 4;
      data[idx] = lerp(r, dr, ditherAmt);
      data[idx + 1] = lerp(g, dg, ditherAmt);
      data[idx + 2] = lerp(b, db, ditherAmt);
      data[idx + 3] = Math.round(255 * alphaMul * (1 - toSurface * 0.75));
    }
  }

  return imageData;
}

function drawShootingStar(
  ctx: CanvasRenderingContext2D,
  star: ShootingStar,
) {
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
  gradient.addColorStop(0, "rgba(255,255,255,0)");
  gradient.addColorStop(0.55, `rgba(200,230,255,${0.35 * fade})`);
  gradient.addColorStop(1, `rgba(255,255,255,${0.95 * fade})`);

  ctx.strokeStyle = gradient;
  ctx.lineWidth = 1.25;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(star.x - tx, star.y - ty);
  ctx.lineTo(star.x, star.y);
  ctx.stroke();

  ctx.fillStyle = `rgba(255,255,255,${fade})`;
  ctx.fillRect(Math.floor(star.x), Math.floor(star.y), 1, 1);
}

/** Draw an n-pointed star (spikes > 4 so it isn’t a square) */
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
  ctx.fillStyle = `rgba(255,255,255,${alpha})`;
  ctx.fill();
}

function drawStarGlyph(
  ctx: CanvasRenderingContext2D,
  star: Star,
  alpha: number,
) {
  const cx = star.x;
  const cy = star.y;
  const isPlaced = Boolean(star.placed);
  const isHero = Boolean(star.hero) && !isPlaced;
  const spikes = star.points ?? 5;

  // Scale — ambient stays small; placed stars use their randomized size
  const base = isPlaced
    ? 1.15 + star.size * 0.55
    : isHero
      ? 1.2
      : 0.72 + Math.min(0.4, star.opacity * 0.5);
  const spin = star.twinklePhase * 0.08;

  // Soft glow halo
  const glowR = base * (isPlaced ? 3.4 : isHero ? 2.4 : 2.0);
  const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, glowR);
  if (isPlaced) {
    glow.addColorStop(0, `rgba(235, 245, 255,${alpha * 0.72})`);
    glow.addColorStop(0.25, `rgba(190, 220, 255,${alpha * 0.32})`);
    glow.addColorStop(0.55, `rgba(150, 195, 255,${alpha * 0.12})`);
    glow.addColorStop(1, "rgba(150, 195, 255, 0)");
  } else if (isHero) {
    glow.addColorStop(0, `rgba(255, 245, 250,${alpha * 0.5})`);
    glow.addColorStop(0.35, `rgba(200, 180, 255,${alpha * 0.16})`);
    glow.addColorStop(1, "rgba(120, 150, 255, 0)");
  } else {
    glow.addColorStop(0, `rgba(235, 242, 255,${alpha * 0.58})`);
    glow.addColorStop(0.4, `rgba(195, 220, 255,${alpha * 0.2})`);
    glow.addColorStop(1, "rgba(180, 210, 255, 0)");
  }
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(cx, cy, glowR, 0, Math.PI * 2);
  ctx.fill();

  // Diffraction flares — stronger on placed / hero
  if (isPlaced || isHero || alpha > 0.22) {
    const flareLen = base * (isPlaced ? 2.8 : isHero ? 2.0 : 1.55);
    const flareAlpha = alpha * (isPlaced ? 0.65 : isHero ? 0.4 : 0.28);
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(spin * 0.5);
    for (let i = 0; i < 4; i++) {
      const a = (i * Math.PI) / 2;
      const gradient = ctx.createLinearGradient(
        Math.cos(a) * -flareLen,
        Math.sin(a) * -flareLen,
        Math.cos(a) * flareLen,
        Math.sin(a) * flareLen,
      );
      gradient.addColorStop(0, "rgba(255,255,255,0)");
      gradient.addColorStop(0.5, `rgba(230, 240, 255,${flareAlpha})`);
      gradient.addColorStop(1, "rgba(255,255,255,0)");
      ctx.strokeStyle = gradient;
      ctx.lineWidth = isPlaced ? 0.85 : 0.3;
      ctx.beginPath();
      ctx.moveTo(Math.cos(a) * -flareLen, Math.sin(a) * -flareLen);
      ctx.lineTo(Math.cos(a) * flareLen, Math.sin(a) * flareLen);
      ctx.stroke();
    }
    if (isPlaced || isHero) {
      for (let i = 0; i < 4; i++) {
        const a = Math.PI / 4 + (i * Math.PI) / 2;
        const len = flareLen * 0.65;
        const gradient = ctx.createLinearGradient(
          Math.cos(a) * -len,
          Math.sin(a) * -len,
          Math.cos(a) * len,
          Math.sin(a) * len,
        );
        gradient.addColorStop(0, "rgba(255,255,255,0)");
        gradient.addColorStop(0.5, `rgba(200, 225, 255,${flareAlpha * 0.45})`);
        gradient.addColorStop(1, "rgba(255,255,255,0)");
        ctx.strokeStyle = gradient;
        ctx.lineWidth = isPlaced ? 0.45 : 0.25;
        ctx.beginPath();
        ctx.moveTo(Math.cos(a) * -len, Math.sin(a) * -len);
        ctx.lineTo(Math.cos(a) * len, Math.sin(a) * len);
        ctx.stroke();
      }
    }
    ctx.restore();
  }

  // Pointed star body — 4 / 5 / 6 points
  drawStarShape(
    ctx,
    cx,
    cy,
    spikes,
    base,
    base * 0.36,
    alpha * (isPlaced ? 0.85 : 0.88),
    spin,
  );

  if (isPlaced || isHero) {
    drawStarShape(
      ctx,
      cx,
      cy,
      spikes,
      base * 0.62,
      base * 0.22,
      alpha * 0.7,
      spin + Math.PI / spikes,
    );
  }

  // Hot white core
  const core = ctx.createRadialGradient(cx, cy, 0, cx, cy, base * 0.35);
  core.addColorStop(0, `rgba(255,255,255,${Math.min(1, alpha * 1.05)})`);
  core.addColorStop(0.55, `rgba(230, 240, 255,${alpha * 0.55})`);
  core.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = core;
  ctx.beginPath();
  ctx.arc(cx, cy, base * 0.32, 0, Math.PI * 2);
  ctx.fill();
}

/** Candidate nearest-neighbor edges within constellation radius (same shape only) */
function collectCandidateEdges(placed: Star[]) {
  const candidates: { i: number; j: number; d: number }[] = [];
  const seen = new Set<string>();

  for (let i = 0; i < placed.length; i++) {
    const a = placed[i];
    const neighbors = placed
      .map((b, j) => ({
        j,
        d: Math.hypot(a.x - b.x, a.y - b.y),
      }))
      .filter(({ j, d }) => {
        if (j === i || d <= 0.5 || d > CONSTELLATION_RADIUS) return false;
        // Auto-links stay inside one shape; cross-shape uses forced links
        return (a.shapeId ?? -1) === (placed[j].shapeId ?? -2);
      })
      .sort((p, q) => p.d - q.d)
      .slice(0, CONSTELLATION_MAX_EDGES);

    for (const { j, d } of neighbors) {
      const key = i < j ? `${i}-${j}` : `${j}-${i}`;
      if (seen.has(key)) continue;
      seen.add(key);
      candidates.push({ i, j, d });
    }
  }

  return candidates;
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
  const t = Math.max(
    0,
    Math.min(1, ((px - ax) * abx + (py - ay) * aby) / len2),
  );
  const x = ax + t * abx;
  const y = ay + t * aby;
  return { d: Math.hypot(px - x, py - y), t, x, y };
}

/** True if another star sits on the segment between i and j */
function starSplitsEdge(placed: Star[], i: number, j: number) {
  const a = placed[i];
  const b = placed[j];
  for (let k = 0; k < placed.length; k++) {
    if (k === i || k === j) continue;
    const hit = pointToSegment(placed[k].x, placed[k].y, a.x, a.y, b.x, b.y);
    if (hit.t > 0.08 && hit.t < 0.92 && hit.d <= LINE_HIT_PX) return true;
  }
  return false;
}

function collectForcedEdges(placed: Star[]) {
  const idToIndex = new Map<number, number>();
  for (let i = 0; i < placed.length; i++) {
    const id = placed[i].id;
    if (id != null) idToIndex.set(id, i);
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

/**
 * Find an existing constellation segment near (x, y) so a new star can
 * snap onto the line and split it into a junction.
 */
function findLineUnderPoint(
  placed: Star[],
  x: number,
  y: number,
): { i: number; j: number; x: number; y: number; d: number } | null {
  if (placed.length < 2) return null;

  // Prefer currently drawn edges; fall back to nearby pairs
  const edges = buildConstellationEdges(placed);
  const pool =
    edges.length > 0
      ? edges
      : (() => {
          const pairs: { i: number; j: number; d: number }[] = [];
          for (let i = 0; i < placed.length; i++) {
            for (let j = i + 1; j < placed.length; j++) {
              const d = Math.hypot(
                placed[i].x - placed[j].x,
                placed[i].y - placed[j].y,
              );
              if (d <= CONSTELLATION_RADIUS * 1.5) pairs.push({ i, j, d });
            }
          }
          return pairs;
        })();

  let best: { i: number; j: number; x: number; y: number; d: number } | null =
    null;

  for (const edge of pool) {
    const a = placed[edge.i];
    const b = placed[edge.j];
    const hit = pointToSegment(x, y, a.x, a.y, b.x, b.y);
    // Must be on the interior of the segment, not on an endpoint star
    if (hit.t <= 0.1 || hit.t >= 0.9) continue;
    if (hit.d > LINE_HIT_PX) continue;
    if (!best || hit.d < best.d) {
      best = { i: edge.i, j: edge.j, x: hit.x, y: hit.y, d: hit.d };
    }
  }

  return best;
}

function convexHullIndices(points: { x: number; y: number }[]): number[] {
  const n = points.length;
  if (n < 3) return Array.from({ length: n }, (_, i) => i);

  const order = Array.from({ length: n }, (_, i) => i).sort((a, b) => {
    const dx = points[a].x - points[b].x;
    if (Math.abs(dx) > 1e-6) return dx;
    return points[a].y - points[b].y;
  });

  const cross = (o: number, a: number, b: number) => {
    const ox = points[o].x;
    const oy = points[o].y;
    return (
      (points[a].x - ox) * (points[b].y - oy) -
      (points[a].y - oy) * (points[b].x - ox)
    );
  };

  const lower: number[] = [];
  for (const i of order) {
    while (
      lower.length >= 2 &&
      cross(lower[lower.length - 2], lower[lower.length - 1], i) <= 0
    ) {
      lower.pop();
    }
    lower.push(i);
  }

  const upper: number[] = [];
  for (let k = order.length - 1; k >= 0; k--) {
    const i = order[k];
    while (
      upper.length >= 2 &&
      cross(upper[upper.length - 2], upper[upper.length - 1], i) <= 0
    ) {
      upper.pop();
    }
    upper.push(i);
  }

  lower.pop();
  upper.pop();
  return lower.concat(upper);
}

/**
 * Keep stars linked within each shape. Forced junction links connect
 * separate shapes together. Drop hull diagonals and edges that a
 * mid-line star has already split.
 */
function buildConstellationEdges(placed: Star[]) {
  const auto = collectCandidateEdges(placed);
  const forced = collectForcedEdges(placed);
  const raw = [...auto, ...forced].filter(
    (e) => !starSplitsEdge(placed, e.i, e.j),
  );

  if (raw.length === 0) return [];

  const kept: { i: number; j: number; d: number }[] = [];
  const keptKeys = new Set<string>();

  const pushEdge = (edge: { i: number; j: number; d: number }) => {
    const key = edge.i < edge.j ? `${edge.i}-${edge.j}` : `${edge.j}-${edge.i}`;
    if (keptKeys.has(key)) return;
    if (starSplitsEdge(placed, edge.i, edge.j)) return;
    keptKeys.add(key);
    kept.push(edge);
  };

  // Forced links (click-order + line junctions) always draw
  for (const edge of forced) {
    pushEdge(edge);
  }

  // Closed-shape cleanup runs per shape group so shapes stay distinct
  const byShape = new Map<number, number[]>();
  for (let i = 0; i < placed.length; i++) {
    const sid = placed[i].shapeId ?? i;
    const list = byShape.get(sid);
    if (list) list.push(i);
    else byShape.set(sid, [i]);
  }

  for (const comp of byShape.values()) {
    if (comp.length < 2) continue;

    const compSet = new Set(comp);
    const localEdges = raw.filter(
      (e) => compSet.has(e.i) && compSet.has(e.j),
    );

    if (localEdges.length <= comp.length - 1) {
      for (const edge of localEdges) pushEdge(edge);
      continue;
    }

    const hullLocal = convexHullIndices(comp.map((idx) => placed[idx]));
    if (hullLocal.length < 3) {
      for (const edge of localEdges) pushEdge(edge);
      continue;
    }

    const hullGlobal = hullLocal.map((hi) => comp[hi]);
    const hullSet = new Set(hullGlobal);
    const rim = new Set<string>();

    for (let h = 0; h < hullGlobal.length; h++) {
      const a = hullGlobal[h];
      const b = hullGlobal[(h + 1) % hullGlobal.length];
      rim.add(a < b ? `${a}-${b}` : `${b}-${a}`);
    }

    for (const edge of localEdges) {
      const key =
        edge.i < edge.j ? `${edge.i}-${edge.j}` : `${edge.j}-${edge.i}`;
      const bothOnHull = hullSet.has(edge.i) && hullSet.has(edge.j);
      if (bothOnHull && !rim.has(key)) continue;
      pushEdge(edge);
    }

    for (let h = 0; h < hullGlobal.length; h++) {
      const a = hullGlobal[h];
      const b = hullGlobal[(h + 1) % hullGlobal.length];
      const d = Math.hypot(
        placed[a].x - placed[b].x,
        placed[a].y - placed[b].y,
      );
      if (d <= CONSTELLATION_RADIUS * 1.5) {
        pushEdge({ i: a, j: b, d });
      }
    }

    for (const idx of comp) {
      if (hullSet.has(idx)) continue;
      let bestJ = -1;
      let bestD = Infinity;
      for (const other of comp) {
        if (other === idx) continue;
        const d = Math.hypot(
          placed[idx].x - placed[other].x,
          placed[idx].y - placed[other].y,
        );
        if (d < bestD && d <= CONSTELLATION_RADIUS * 1.35) {
          bestD = d;
          bestJ = other;
        }
      }
      if (bestJ >= 0) pushEdge({ i: idx, j: bestJ, d: bestD });
    }
  }

  return kept;
}

function drawConstellations(ctx: CanvasRenderingContext2D, stars: Star[]) {
  const placed = stars.filter((s) => s.placed);
  if (placed.length < 2) return;

  const edges = buildConstellationEdges(placed);

  for (const { i, j, d } of edges) {
    const a = placed[i];
    const b = placed[j];
    const fade = 1 - Math.min(1, d / (CONSTELLATION_RADIUS * 1.35));

    ctx.strokeStyle = `rgba(160, 205, 255,${0.08 + fade * 0.22})`;
    ctx.lineWidth = 2.8;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();

    ctx.strokeStyle = `rgba(210, 230, 255,${0.22 + fade * 0.55})`;
    ctx.lineWidth = 0.9;
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();
  }
}

export default function GalaxyBackground() {
  const bitmapRef = useRef<HTMLCanvasElement>(null);
  const starsRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const bitmapCanvas = bitmapRef.current;
    const starsCanvas = starsRef.current;
    if (!bitmapCanvas || !starsCanvas) return;

    const bitmapCtx = bitmapCanvas.getContext("2d", { alpha: true });
    const ctx = starsCanvas.getContext("2d", { alpha: true });
    if (!bitmapCtx || !ctx) return;

    const galaxyCanvas = document.createElement("canvas");
    const galaxyCtx = galaxyCanvas.getContext("2d", { alpha: true });
    if (!galaxyCtx) return;

    let width = 0;
    let height = 0;
    let viewportBand = 0.55;
    let ambientStars: Star[] = [];
    let placedStars: Star[] = [];
    let shooting: ShootingStar[] = [];
    let galaxyBandY = 0.26;
    let galaxyDrift = 0;
    let nextStarId = 1;
    let nextShapeId = 1;
    let raf = 0;
    let lastTs = 0;
    let shootTimer = 0;
    let nextShootAt =
      SHOOTING_STAR_INTERVAL_MS +
      Math.random() * SHOOTING_STAR_INTERVAL_JITTER_MS;
    let recentShootOrigins: { x: number; y: number }[] = [];
    let reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const scheduleNextShoot = () => {
      nextShootAt =
        SHOOTING_STAR_INTERVAL_MS +
        Math.random() * SHOOTING_STAR_INTERVAL_JITTER_MS;
    };

    const allStars = () => ambientStars.concat(placedStars);

    const rebuild = () => {
      const host = starsCanvas.parentElement;
      const w = host?.clientWidth || window.innerWidth;
      const expectedH = Math.round(window.innerHeight * SKY_HEIGHT_VH);
      const hostH = host?.clientHeight ?? 0;
      const h = hostH >= expectedH * 0.85 ? hostH : expectedH;

      const prevW = width;
      const prevH = height;

      width = Math.max(1, Math.floor(w / PIXEL_SCALE));
      height = Math.max(1, Math.floor(h / PIXEL_SCALE));
      viewportBand = 0.78;

      for (const c of [bitmapCanvas, starsCanvas, galaxyCanvas]) {
        c.width = width;
        c.height = height;
      }
      starsCanvas.style.width = `${w}px`;
      starsCanvas.style.height = `${h}px`;
      bitmapCanvas.style.width = `${w}px`;
      bitmapCanvas.style.height = `${h}px`;

      const bitmap = bakeBitmapSky(width, height, resolveSkyStops());
      bitmapCtx.clearRect(0, 0, width, height);
      bitmapCtx.putImageData(bitmap, 0, 0);

      const galaxy = bakeGalaxyOverlay(
        width,
        Math.floor(height * viewportBand),
      );
      galaxyBandY = galaxy.bandY;
      galaxyCtx.clearRect(0, 0, width, height);
      // Place Milky Way texture in the upper sky band
      galaxyCtx.putImageData(galaxy.image, 0, 0);

      // Remap user-placed stars so constellations survive resize
      if (prevW > 0 && prevH > 0) {
        const sx = width / prevW;
        const sy = height / prevH;
        for (const star of placedStars) {
          star.x *= sx;
          star.y *= sy;
        }
      }

      ambientStars = generateStars(width, Math.floor(height * viewportBand));
      shooting = [];
      recentShootOrigins = [];
      shootTimer = 0;
      scheduleNextShoot();
    };

    const onClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.closest("a, button")) return;

      const rect = starsCanvas.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * width;
      const y = ((event.clientY - rect.top) / rect.height) * height;
      if (y > height * viewportBand) return;

      const star = createStar(width, Math.floor(height * viewportBand));
      star.vx = 0;
      star.vy = 0;
      star.placed = true;
      star.opacity = Math.max(star.opacity, 0.85);
      // Random size each click — tiny pinpoints through bold sparks
      star.size = 0.9 + Math.random() * 2.6;
      star.points = 4 + Math.floor(Math.random() * 3);
      star.id = nextStarId++;

      // Click on an existing line → snap on, split it, start a separate shape
      // that is still junction-linked to both endpoints.
      const onLine = findLineUnderPoint(placedStars, x, y);
      if (onLine) {
        const a = placedStars[onLine.i];
        const b = placedStars[onLine.j];
        star.x = onLine.x;
        star.y = onLine.y;
        star.shapeId = nextShapeId++;
        if (a.id == null) a.id = nextStarId++;
        if (b.id == null) b.id = nextStarId++;
        star.linkIds = [a.id, b.id];
      } else {
        star.x = x;
        star.y = y;

        // Connect in click order — each new star links to recent ones
        // only when they're close enough.
        const recent = placedStars.slice(-3);
        const linkIds: number[] = [];
        for (let r = recent.length - 1; r >= 0; r--) {
          const prev = recent[r];
          if (prev.id == null) prev.id = nextStarId++;
          const d = Math.hypot(star.x - prev.x, star.y - prev.y);
          if (d <= CONSTELLATION_RADIUS) {
            linkIds.push(prev.id);
          }
        }

        if (linkIds.length > 0) {
          const lastLinked = recent
            .slice()
            .reverse()
            .find((p) => p.id != null && linkIds.includes(p.id));
          star.shapeId = lastLinked?.shapeId ?? nextShapeId++;
          star.linkIds = linkIds;
        } else {
          // Too far from recent stars — start a fresh constellation
          star.shapeId = nextShapeId++;
        }
      }

      placedStars.push(star);
    };

    const tick = (ts: number) => {
      const dt = lastTs ? Math.min(0.05, (ts - lastTs) / 1000) : 0.016;
      lastTs = ts;

      ctx.clearRect(0, 0, width, height);

      // Milky Way band — soft horizontal haze behind stars
      if (!reducedMotion) {
        galaxyDrift += dt * 0.018;
      }
      const bandH = Math.floor(height * viewportBand);
      const driftX =
        Math.sin(galaxyDrift * 0.85) * width * 0.008 +
        Math.sin(galaxyDrift * 0.31 + 1.1) * width * 0.004;
      const driftY =
        Math.cos(galaxyDrift * 0.55) * bandH * 0.005 +
        Math.sin(galaxyDrift * 0.23 + 0.7) * bandH * 0.003;
      ctx.save();
      ctx.globalAlpha = 0.38;
      ctx.globalCompositeOperation = "screen";
      ctx.translate(driftX, driftY);
      ctx.drawImage(galaxyCanvas, 0, 0);
      ctx.restore();

      // Warm core bloom along the band (right-of-center, like the photo)
      const coreX = width * 0.62 + driftX;
      const coreY = bandH * galaxyBandY + driftY;
      const coreBloom = ctx.createRadialGradient(
        coreX,
        coreY,
        0,
        coreX,
        coreY,
        width * 0.28,
      );
      coreBloom.addColorStop(0, "rgba(255, 190, 140, 0.045)");
      coreBloom.addColorStop(0.35, "rgba(220, 120, 180, 0.025)");
      coreBloom.addColorStop(0.7, "rgba(100, 70, 180, 0.012)");
      coreBloom.addColorStop(1, "rgba(20, 20, 60, 0)");
      ctx.fillStyle = coreBloom;
      ctx.beginPath();
      ctx.ellipse(coreX, coreY, width * 0.34, bandH * 0.11, -0.08, 0, Math.PI * 2);
      ctx.fill();

      // Soft violet mist strip across the plane
      const mist = ctx.createLinearGradient(0, coreY - bandH * 0.14, 0, coreY + bandH * 0.14);
      mist.addColorStop(0, "rgba(80, 40, 140, 0)");
      mist.addColorStop(0.5, "rgba(120, 70, 180, 0.02)");
      mist.addColorStop(1, "rgba(40, 20, 80, 0)");
      ctx.fillStyle = mist;
      ctx.fillRect(0, coreY - bandH * 0.14, width, bandH * 0.28);

      // Constellation lines behind stars
      drawConstellations(ctx, placedStars);

      if (!reducedMotion) {
        shootTimer += dt * 1000;
        if (
          shootTimer >= nextShootAt &&
          shooting.length < SHOOTING_STAR_MAX
        ) {
          const bandH = Math.floor(height * viewportBand * 1.15);
          const avoid = recentShootOrigins.concat(
            shooting.map((s) => ({ x: s.x, y: s.y })),
          );
          const meteor = spawnShootingStar(width, bandH, avoid);
          shooting.push(meteor);
          recentShootOrigins.push({ x: meteor.x, y: meteor.y });
          if (
            Math.random() < 0.28 &&
            shooting.length < SHOOTING_STAR_MAX
          ) {
            const second = spawnShootingStar(
              width,
              bandH,
              recentShootOrigins.concat(
                shooting.map((s) => ({ x: s.x, y: s.y })),
              ),
            );
            shooting.push(second);
            recentShootOrigins.push({ x: second.x, y: second.y });
          }
          if (recentShootOrigins.length > 5) {
            recentShootOrigins.splice(0, recentShootOrigins.length - 5);
          }
          shootTimer = 0;
          scheduleNextShoot();
        }

        const starCeiling = height * viewportBand;

        for (const star of allStars()) {
          if (!star.placed) {
            // Float in a soft current — steer toward a slowly evolving heading
            const phase = star.curvePhase ?? 0;
            const t = star.twinklePhase;
            const home = -0.16;
            const curl =
              Math.sin(t * 0.11 + phase) * 0.28 +
              Math.sin(t * 0.047 + phase * 1.4) * 0.16 +
              Math.sin(t * 0.023 + phase * 0.6) * 0.1;
            const targetAngle = home + curl;
            let angle = star.driftAngle ?? home;
            const steer = Math.min(1, (star.turnSpeed ?? 0.1) * 2.4 * dt);
            angle += (targetAngle - angle) * steer;
            star.driftAngle = angle;

            const baseSpeed = star.driftSpeed ?? 0.03;
            const breathe =
              0.88 +
              0.12 * Math.sin(t * 0.07 + phase) +
              0.05 * Math.sin(t * 0.019 + phase * 2.1);
            const speed = baseSpeed * breathe;
            star.vx = Math.cos(angle) * speed;
            star.vy = Math.sin(angle) * speed * 0.38;
            star.x += star.vx;
            star.y += star.vy;

            if (star.x > width + 2) star.x = -2;
            if (star.x < -2) star.x = width + 2;
            if (star.y < -2) star.y = starCeiling;
            if (star.y > starCeiling) star.y = -2;
          }

          star.twinklePhase += star.twinkleSpeed * dt;

          // Soft, uneven twinkle — closer to real star scintillation
          const twinkle =
            0.72 +
            0.18 * Math.sin(star.twinklePhase) +
            0.07 * Math.sin(star.twinklePhase * 2.3 + 0.4) +
            0.03 * Math.sin(star.twinklePhase * 5.1 + 1.2);
          const alpha = star.opacity * Math.max(0.35, Math.min(1, twinkle));
          if (alpha > 0.02) drawStarGlyph(ctx, star, alpha);
        }

        const bandLimit = height * viewportBand * 1.2;
        for (let i = shooting.length - 1; i >= 0; i--) {
          const meteor = shooting[i];
          meteor.life += dt;
          // Natural arc — slight downward pull as it travels
          meteor.vy += 0.35 * dt;
          meteor.x += meteor.vx;
          meteor.y += meteor.vy;
          drawShootingStar(ctx, meteor);

          if (
            meteor.life >= meteor.maxLife ||
            meteor.x > width + 40 ||
            meteor.y > bandLimit
          ) {
            shooting.splice(i, 1);
          }
        }

      } else {
        drawConstellations(ctx, placedStars);
        for (const star of allStars()) {
          drawStarGlyph(ctx, star, star.opacity);
        }
      }

      raf = requestAnimationFrame(tick);
    };

    const onMotionChange = (event: MediaQueryListEvent) => {
      reducedMotion = event.matches;
    };

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    motionQuery.addEventListener("change", onMotionChange);
    const host = starsCanvas.parentElement;

    rebuild();
    // First meteor within the normal 5–10s window
    shootTimer = 0;
    raf = requestAnimationFrame(tick);

    window.addEventListener("resize", rebuild);
    host?.addEventListener("click", onClick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", rebuild);
      host?.removeEventListener("click", onClick);
      motionQuery.removeEventListener("change", onMotionChange);
    };
  }, []);

  return (
    <>
      <canvas
        ref={bitmapRef}
        className="galaxy-canvas pointer-events-none absolute inset-0 z-[1] h-full w-full"
        style={{ mixBlendMode: "overlay", opacity: 0.88 }}
        aria-hidden="true"
      />
      <canvas
        ref={starsRef}
        className="galaxy-canvas pointer-events-none absolute inset-0 z-[2] h-full w-full"
        aria-hidden="true"
      />
    </>
  );
}
