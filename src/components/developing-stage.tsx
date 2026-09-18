"use client";

import { useEffect, useMemo, useState } from "react";
import { WAIT_QUOTES, estimateWaitSeconds, formatWait } from "@/lib/chad-quotes";
import { copy } from "@/lib/kiosk-copy";

type Props = {
  face?: string;
  remaining?: number;
  compact?: boolean;
};

export function DevelopingStage({ face, remaining = 1, compact = false }: Props) {
  const start = useMemo(() => estimateWaitSeconds(remaining), [remaining]);
  const [left, setLeft] = useState(start);
  const [quote, setQuote] = useState(0);

  useEffect(() => {
    setLeft(start);
  }, [start]);

  useEffect(() => {
    const tick = window.setInterval(() => setLeft((value) => Math.max(0, value - 1)), 1000);
    return () => window.clearInterval(tick);
  }, []);

  useEffect(() => {
    const spin = window.setInterval(() => setQuote((value) => (value + 1) % WAIT_QUOTES.length), 2800);
    return () => window.clearInterval(spin);
  }, []);

  const line = WAIT_QUOTES[quote];
  const progress = start ? Math.min(1, (start - left) / start) : 0;

  return (
    <section className={`world-wait ${compact ? "world-wait-compact" : ""}`}>
      <div className="world-sky" aria-hidden>
        <i /><i /><i /><i />
      </div>
      <div className="world-orbit">
        <span className="world-ring world-ring-a" />
        <span className="world-ring world-ring-b" />
        <figure className="world-face">
          {face ? <img src={face} alt="" /> : <span className="world-empty" />}
        </figure>
      </div>
      <h1 className="world-title">{copy.entering.fr}</h1>
      <p className="pair-fr mt-2">{copy.entering.en}</p>
      <div className="world-meter mt-8" aria-hidden>
        <b style={{ width: `${Math.max(12, progress * 100)}%` }} />
      </div>
      <p className="world-eta">{formatWait(left)}</p>
      <blockquote className="world-quote" key={quote}>
        <p>{line.fr}</p>
        <cite>{line.en}</cite>
      </blockquote>
    </section>
  );
}
