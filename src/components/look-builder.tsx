"use client";

import { useState } from "react";
import { EVENT_KINDS, KIND_INK, KIND_NOTES, KIND_PLACE, type EventKind } from "@/lib/custom-look";
import { themeLook, themeMotif } from "@/lib/theme-look";
import { CAT_FR } from "@/lib/kiosk-copy";
import { studio } from "@/lib/studio-copy";

type Built = { id: string; title: string; category: string; scope: string; body: string };

type Props = {
  onBuilt: (prompt: Built) => void | Promise<void>;
};

export function LookBuilder({ onBuilt }: Props) {
  const [kind, setKind] = useState<EventKind>("Birthday");
  const [title, setTitle] = useState("");
  const [honoree, setHonoree] = useState("");
  const [note, setNote] = useState("");
  const [color, setColor] = useState(KIND_INK.Birthday);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState("");

  const place = KIND_PLACE[kind];
  const previewTitle = title.trim() || place.title;
  const look = themeLook(previewTitle, kind, color);
  const motif = themeMotif(kind, previewTitle);

  function chooseKind(next: EventKind) {
    setKind(next);
    setColor(KIND_INK[next]);
  }

  async function build() {
    if (title.trim().length < 2) {
      setError(studio.look.nameFail);
      return;
    }
    setPending(true);
    setError("");
    setDone("");
    const response = await fetch("/api/prompts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, kind, honoree, note, color }),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      setPending(false);
      setError(data.error || studio.look.buildFail);
      return;
    }
    await onBuilt(data.prompt);
    setPending(false);
    setDone(studio.look.done(data.prompt.title));
    setTitle("");
    setHonoree("");
    setNote("");
  }

  return (
    <section className="look-builder">
      <p className="eyebrow">{studio.look.eyebrow}</p>
      <h2>{studio.look.title}</h2>
      <p className="plate-lead">{studio.look.lead}</p>
      <div className="look-stage">
        <div className="look-preview theme-pic" data-motif={motif}>
          <span className="theme-wash" style={{ background: look.wash }} />
          <span className="theme-motif" aria-hidden />
          <span className="theme-veil" />
          <span className="theme-name">
            <span>
                    <small>{look.hint || CAT_FR[kind] || kind}</small>
              <b>{previewTitle}</b>
            </span>
          </span>
        </div>
        <div>
          <div className="flex flex-wrap gap-2">
            {EVENT_KINDS.map((item) => (
              <button key={item} type="button" className="chip" data-on={kind === item} onClick={() => chooseKind(item)}>
                {CAT_FR[item] || item}
              </button>
            ))}
          </div>
          <div className="mt-5 grid gap-3">
            <input className="field" value={title} onChange={(e) => setTitle(e.target.value)} placeholder={studio.look.namePh(place.title)} minLength={2} maxLength={40} />
            <input className="field" value={honoree} onChange={(e) => setHonoree(e.target.value)} placeholder={studio.look.whoPh(place.honoree)} maxLength={60} />
            <textarea className="field min-h-24" value={note} onChange={(e) => setNote(e.target.value)} placeholder={place.note} maxLength={400} />
            <div className="flex flex-wrap gap-2">
              {KIND_NOTES[kind].map((chip) => (
                <button key={chip} type="button" className="theme-pill" data-quiet="true" onClick={() => setNote(chip)}>
                  {chip}
                </button>
              ))}
            </div>
            <label className="flex items-center gap-3 text-[0.65rem] uppercase tracking-[0.2em] text-[#9c9588]">
              {studio.look.accent}
              <input className="h-12 w-16 cursor-pointer border border-[rgba(232,220,196,0.14)] bg-transparent p-1" type="color" value={color} onChange={(e) => setColor(e.target.value)} />
            </label>
          </div>
        </div>
      </div>
      {error ? <p className="mt-3 text-sm text-amber-200">{error}</p> : null}
      {done ? <p className="mt-3 text-sm text-[#c8a25a]">{done}</p> : null}
      <button className="btn btn-gold mt-5" type="button" disabled={pending} onClick={() => void build()}>{pending ? studio.look.building : studio.look.build}</button>
    </section>
  );
}
