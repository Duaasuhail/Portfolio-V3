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

export default function FeltSurveyResponses({ quotes }: { quotes: SurveyQuote[] }) {
  const lastRank = Math.max(quotes.length - 1, 1);
  const rangeByIndex = new Map(
    [...quotes]
      .map((quote, index) => ({ index, y: quote.y }))
      .sort((a, b) => a.y - b.y)
      .map((quote, rank) => {
        const start = (rank / lastRank) * 58;
        return [quote.index, { start, end: start + 42 }] as const;
      }),
  );

  return (
    <div className="felt-quotes-scroller">
      <div
        className="felt-quotes"
        role="img"
        aria-label="Scattered anonymous survey responses describing menstrual pain through metaphor"
      >
        {quotes.map((quote, index) => {
          const range = rangeByIndex.get(index) ?? { start: 0, end: 100 };
          return (
            <div
              key={`${quote.src}-${quote.x}-${quote.y}`}
              className="felt-quote"
              style={{
                left: `${(quote.x / BOARD_W) * 100}%`,
                top: `${(quote.y / BOARD_H) * 100}%`,
                width: `${(quote.w / BOARD_W) * 100}%`,
                height: `${(quote.h / BOARD_H) * 100}%`,
                animationRange: `entry ${range.start}% entry ${range.end}%`,
              }}
            >
              <img
                src={`/projects/felt/${quote.src}`}
                alt=""
                className={quote.cover ? "is-cover" : undefined}
                style={quote.img}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
