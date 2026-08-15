export type SkyQuality = "high" | "medium" | "low";

export type SkyQualityProfile = {
  pixelScale: number;
  /** Larger = fewer ambient stars (area / divisor) */
  starDivisor: number;
  maxMeteors: number;
  /** Draw ambient stars as cheap dots instead of full glyphs */
  simpleAmbient: boolean;
  /** Cap how often the CSS sky mesh updates */
  skyFps: number;
  /** Skip milky-way bloom/mist redraws on this cadence */
  galaxyFxEveryN: number;
};

export const SKY_QUALITY: Record<SkyQuality, SkyQualityProfile> = {
  high: {
    pixelScale: 3,
    starDivisor: 1100,
    maxMeteors: 3,
    simpleAmbient: false,
    skyFps: 30,
    galaxyFxEveryN: 1,
  },
  medium: {
    pixelScale: 4,
    starDivisor: 1800,
    maxMeteors: 2,
    simpleAmbient: true,
    skyFps: 15,
    galaxyFxEveryN: 2,
  },
  low: {
    pixelScale: 5,
    starDivisor: 2800,
    maxMeteors: 1,
    simpleAmbient: true,
    skyFps: 10,
    galaxyFxEveryN: 3,
  },
};

/**
 * Pick a starting quality tier from device signals. Weak laptops / phones
 * get a cheaper sky so motion stays visible instead of freezing under load.
 */
export function detectSkyQuality(): SkyQuality {
  if (typeof window === "undefined") return "high";

  const cores = navigator.hardwareConcurrency || 4;
  const mem = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
  const narrow = window.innerWidth < 1024;
  const saveData = Boolean(
    (navigator as Navigator & { connection?: { saveData?: boolean } })
      .connection?.saveData,
  );
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (saveData || (mem != null && mem <= 4) || (cores <= 4 && narrow) || reduced) {
    return "low";
  }
  if (cores <= 6 || narrow || (mem != null && mem <= 8)) {
    return "medium";
  }
  return "high";
}
