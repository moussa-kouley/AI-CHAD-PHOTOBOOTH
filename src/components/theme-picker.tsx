"use client";

import { useEffect, useMemo, useState } from "react";
import { accentFromBody, CATEGORY_ORDER, categoryLabel, themeLook, themeMotif, themeRank } from "@/lib/theme-look";
import { catFr } from "@/lib/kiosk-copy";
import { studio } from "@/lib/studio-copy";

export type ThemeOption = { id: string; title: string; category: string; scope?: string; body?: string };

type Props = {
  prompts: ThemeOption[];
  selected: string[];
  onToggle: (id: string) => void;
  onRemove?: (id: string) => void;
  focus?: string;
  max?: number;
  guest?: boolean;
};

export function ThemePicker({ prompts, selected, onToggle, onRemove, focus, max, guest }: Props) {
  const categories = useMemo(() => {
    const seen = new Set(prompts.map((item) => categoryLabel(item.category)));
    const ordered = CATEGORY_ORDER.filter((name) => seen.has(name));
    return [...ordered, ...[...seen].filter((name) => !ordered.includes(name))];
  }, [prompts]);
  const [open, setOpen] = useState(() => {
    if (focus) return categoryLabel(focus);
    if (guest && prompts.some((item) => categoryLabel(item.category) === "Horizon")) return "Horizon";
    if (guest && prompts.some((item) => categoryLabel(item.category) === "XR")) return "XR";
    if (guest && prompts.some((item) => categoryLabel(item.category) === "Atelier")) return "Atelier";
    return "All";
  });
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (focus) {
      setOpen(categoryLabel(focus));
      setQuery("");
    }
  }, [focus]);

  const hay = query.trim().toLowerCase();
  const visible = prompts
    .filter((item) => {
      const cat = categoryLabel(item.category);
      if (hay) return item.title.toLowerCase().includes(hay) || cat.toLowerCase().includes(hay);
      if (open === "All") return true;
      return cat === open;
    })
    .sort((a, b) => themeRank(a.title) - themeRank(b.title) || a.title.localeCompare(b.title));

  const picked = selected
    .map((id) => prompts.find((item) => item.id === id))
    .filter((item): item is ThemeOption => Boolean(item));

  return (
    <div className="theme-picker" data-guest={guest || undefined}>
      {picked.length ? (
        <div className="theme-picked">
          {picked.map((prompt) => (
            <button key={prompt.id} type="button" className="theme-pill" onClick={() => onToggle(prompt.id)}>
              {prompt.title}
            </button>
          ))}
          {max ? <span className="theme-cap">{picked.length} / {max}</span> : null}
        </div>
      ) : max ? (
        <p className="theme-hint">{studio.picker.tap} · {max}</p>
      ) : null}
      {!guest ? (
        <input
          className="field theme-search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={studio.picker.find}
        />
      ) : null}
      <div className="theme-cats">
        <button
          type="button"
          className="theme-cat"
          data-on={!hay && open === "All"}
          data-kind="all"
          onClick={() => {
            setOpen("All");
            setQuery("");
          }}
        >
          {catFr("All")}
        </button>
        {categories.map((name) => {
          const count = prompts.filter((item) => categoryLabel(item.category) === name && selected.includes(item.id)).length;
          return (
            <button
              key={name}
              type="button"
              className="theme-cat"
              data-on={!hay && open === name}
              data-kind={name.toLowerCase()}
              onClick={() => {
                setOpen(name);
                setQuery("");
              }}
            >
              {catFr(name)}
              {count ? <em>{count}</em> : null}
            </button>
          );
        })}
      </div>
      <div className="theme-grid">
        {visible.map((prompt) => {
          const look = themeLook(prompt.title, prompt.category, accentFromBody(prompt.body));
          const on = selected.includes(prompt.id);
          const motif = themeMotif(prompt.category, prompt.title);
          const locked = Boolean(max && !on && selected.length >= max);
          return (
            <div key={prompt.id} className="theme-tile">
              <button
                type="button"
                className="theme-chip theme-pic"
                data-on={on}
                data-motif={motif}
                data-locked={locked}
                onClick={() => {
                  if (locked) return;
                  onToggle(prompt.id);
                }}
              >
                {look.cover ? <img src={look.cover} alt="" /> : <span className="theme-wash" style={{ background: look.wash }} />}
                <span className="theme-motif" aria-hidden />
                <span className="theme-veil" />
                <span className="theme-name">
                  <span>
                    <small>{look.hint || catFr(look.note)}</small>
                    <b>{prompt.title}</b>
                  </span>
                  {on ? <i className="theme-check">✓</i> : null}
                </span>
              </button>
              {onRemove && prompt.scope === "custom" ? (
                <button type="button" className="theme-remove" onClick={() => onRemove(prompt.id)}>{studio.picker.remove}</button>
              ) : null}
            </div>
          );
        })}
      </div>
      {!visible.length ? <p className="theme-hint">{studio.picker.empty}</p> : null}
    </div>
  );
}
