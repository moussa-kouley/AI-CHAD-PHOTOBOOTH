import type { CSSProperties } from "react";
import { FRAMES, type FrameId } from "@/lib/frames";

type Props = {
  value: string;
  paperInk?: string;
  logo?: string;
  title?: string;
  onChange: (frame: FrameId) => void;
  className?: string;
};

function Wordmark({ logo, gold }: { logo?: string; gold: string }) {
  return (
    <span className="sheet-mark">
      {logo ? <img src={logo} alt="" className="sheet-wordmark" /> : <i className="sheet-crest" style={{ borderColor: gold }} />}
    </span>
  );
}

function Trio() {
  return (
    <span className="sheet-trio">
      <i className="sheet-shot" />
      <i className="sheet-shot" />
      <i className="sheet-shot" />
    </span>
  );
}

function Colophon() {
  return (
    <span className="sheet-colophon">
      <em />
      <i className="sheet-qr" />
    </span>
  );
}

function FrameSheet({
  frameId,
  paperInk,
  logo,
  title,
}: {
  frameId: string;
  paperInk: string;
  logo?: string;
  title?: string;
}) {
  const frame = FRAMES.find((item) => item.id === frameId) || FRAMES[0];
  const gold = paperInk;

  if (frame.id === "instant") {
    return (
      <span className={`sheet sheet-instant${logo ? " sheet-has-mark" : ""}`} style={{ "--gold": gold } as CSSProperties}>
        <span className="sheet-photo" />
        <span className="sheet-instant-foot">
          <Wordmark logo={logo} gold={gold} />
          <span className="sheet-instant-date">{title || "16 SEP 2026"}</span>
        </span>
      </span>
    );
  }

  if (frame.id === "poster") {
    return (
      <span className="sheet sheet-poster">
        <img src="/brand/fgi-poster.jpg" alt="" />
      </span>
    );
  }

  if (frame.id === "held") {
    return (
      <span className={`sheet sheet-salon${logo ? " sheet-has-mark" : ""}`} style={{ "--gold": gold } as CSSProperties}>
        <span className="sheet-photo" />
        <span className="sheet-label">
          <span className="sheet-salon-copy">
            <b>{title || frame.name}</b>
            <em style={{ background: gold }} />
          </span>
          <Wordmark logo={logo} gold={gold} />
        </span>
      </span>
    );
  }

  return (
    <span
      className={`sheet sheet-${frame.id}${logo ? " sheet-has-mark" : ""}`}
      style={{ "--gold": gold, "--paper": frame.paper } as CSSProperties}
    >
      {frame.id === "brand" ? <span className="sheet-mat" /> : null}
      <span className="sheet-inner">
        <span className={`sheet-mast${frame.id === "sparkle" ? " sheet-mast-cream" : ""}`}>
          <Wordmark logo={logo} gold={gold} />
        </span>
        {frame.id === "strip" ? <Trio /> : <span className="sheet-photo" />}
        <Colophon />
      </span>
    </span>
  );
}

export function FrameHero({ value, paperInk = "#c8a25a", logo, title }: Omit<Props, "onChange" | "className">) {
  const frame = FRAMES.find((item) => item.id === value) || FRAMES[0];
  return (
    <figure className="studio-hero">
      <div className="frame-tile" data-frame={frame.id} data-on="true">
        <span className="frame-stage">
          <FrameSheet frameId={frame.id} paperInk={paperInk} logo={logo} title={title} />
        </span>
      </div>
      <figcaption>
        <strong className="display text-2xl">{frame.name}</strong>
        <span className="mt-1 block">{frame.note}</span>
      </figcaption>
    </figure>
  );
}

export function FrameChooser({ value, paperInk = "#c8a25a", logo, title, onChange, className = "frame-grid" }: Props) {
  return (
    <div className={className}>
      {FRAMES.map((frame) => (
        <button
          key={frame.id}
          type="button"
          data-on={value === frame.id}
          data-frame={frame.id}
          className="frame-tile"
          onClick={() => onChange(frame.id)}
        >
          <span className="frame-stage">
            <FrameSheet frameId={frame.id} paperInk={paperInk} logo={logo} title={title} />
          </span>
          <span className="frame-meta">
            <strong>{frame.name}</strong>
            <span>{frame.note}</span>
          </span>
        </button>
      ))}
    </div>
  );
}
