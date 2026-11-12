"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import type { CSSProperties } from "react";

export type SurveyQuote = {
  src: string;
  x: number;
  y: number;
  w: number;
  h: number;
  cover?: boolean;
  img?: CSSProperties;
};

const BOARD_W = 1512;
const BOARD_H = 965;
const STAGGER_MS = 140; // gap between each quote's start

const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

// Fixed-seed shuffle so the "scattered" order is random-looking but identical
// on server and client (no hydration mismatch).
function scatterOrder(count: number) {
  const order = Array.from({ length: count }, (_, i) => i);
  let seed = 7;
  for (let i = count - 1; i > 0; i--) {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    const j = seed % (i + 1);
    [order[i], order[j]] = [order[j], order[i]];
  }
  const delayByIndex = new Array<number>(count);
  order.forEach((quoteIndex, rank) => {
    delayByIndex[quoteIndex] = rank * STAGGER_MS;
  });
  return delayByIndex;
}

export default function FeltSurveyResponses({ quotes }: { quotes: SurveyQuote[] }) {
  const boardRef = useRef<HTMLDivElement>(null);
  const delays = scatterOrder(quotes.length);

  useIsoLayoutEffect(() => {
    const board = boardRef.current;
    if (!board) return;

    // Arm the hidden state only once JS is running, so quotes are never
    // stuck invisible if scripts fail.
    board.dataset.ready = "1";

    // Slide in when the section is scrolled onto, slide back out when it leaves.
    // Two thresholds give hysteresis so it doesn't flicker at the edge.
    const SHOW_AT = 0.2;
    const HIDE_BELOW = 0.05;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.intersectionRatio >= SHOW_AT) {
          board.dataset.in = "1";
        } else if (!entry.isIntersecting || entry.intersectionRatio < HIDE_BELOW) {
          delete board.dataset.in;
        }
      },
      { threshold: [0, HIDE_BELOW, SHOW_AT] },
    );
    io.observe(board);

    return () => io.disconnect();
  }, []);

  return (
    <div className="felt-quotes-scroller">
      <div
        ref={boardRef}
        className="felt-quotes"
        role="img"
        aria-label="Scattered anonymous survey responses describing menstrual pain through metaphor"
      >
        {quotes.map((quote, index) => (
          <div
            key={`${quote.src}-${quote.x}-${quote.y}`}
            className="felt-quote"
            style={
              {
                left: `${(quote.x / BOARD_W) * 100}%`,
                top: `${(quote.y / BOARD_H) * 100}%`,
                width: `${(quote.w / BOARD_W) * 100}%`,
                height: `${(quote.h / BOARD_H) * 100}%`,
                "--delay": `${delays[index]}ms`,
              } as CSSProperties
            }
          >
            <img
              src={`/projects/felt/${quote.src}`}
              alt=""
              className={quote.cover ? "is-cover" : undefined}
              style={quote.img}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
