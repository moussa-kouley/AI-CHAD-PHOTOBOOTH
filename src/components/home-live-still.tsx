"use client";

import { useEffect, useState } from "react";
import { attractCovers } from "@/lib/theme-look";

const covers = attractCovers();
const CYCLE_MS = 5200;

export function HomeLiveStill() {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => setTick((value) => value + 1), CYCLE_MS);
    return () => window.clearInterval(id);
  }, []);

  const count = Math.max(covers.length, 1);
  const index = tick % count;
  const featured = covers[index];
  const world = featured?.[0] || "IA";
  const hint = featured?.[1].hint || world;

  return (
    <figure className="home-live-still" suppressHydrationWarning>
      <div className="home-still-frame">
        {covers.map(([title, look], coverIndex) =>
          look.cover ? (
            <img
              key={title}
              src={look.cover}
              alt=""
              className="attract-still"
              data-on={coverIndex === index ? "true" : undefined}
              loading={coverIndex < 2 ? "eager" : "lazy"}
              decoding="async"
            />
          ) : null,
        )}
        <span className="home-progress" key={tick} aria-hidden="true" />
      </div>
      <figcaption className="home-caption">
        <b>{world}</b>
        <span>{hint}</span>
        <small>
          {String(index + 1).padStart(2, "0")} / {String(count).padStart(2, "0")}
        </small>
      </figcaption>
    </figure>
  );
}
