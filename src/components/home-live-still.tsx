"use client";

import { useEffect, useState } from "react";
import { FgiPoster } from "@/components/fgi-poster";
import { EVENT_TEMPLATES } from "@/lib/fgi-agenda";

const CYCLE_MS = 5200;

export function HomeLiveStill() {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => setTick((value) => value + 1), CYCLE_MS);
    return () => window.clearInterval(id);
  }, []);

  const count = EVENT_TEMPLATES.length;
  const index = tick % count;
  const featured = EVENT_TEMPLATES[index];

  return (
    <figure className="home-live-still" suppressHydrationWarning>
      {EVENT_TEMPLATES.map((item, coverIndex) => (
        <FgiPoster
          key={item.slug}
          photo={item.guest}
          position={item.portrait}
          className={coverIndex === index ? "home-fgi-live is-on" : "home-fgi-live"}
        />
      ))}
      <figcaption className="home-caption">
        <b>{featured.title}</b>
        <span>Affiche FGI · {featured.topic}</span>
        <small>
          {String(index + 1).padStart(2, "0")} / {String(count).padStart(2, "0")}
        </small>
      </figcaption>
    </figure>
  );
}
