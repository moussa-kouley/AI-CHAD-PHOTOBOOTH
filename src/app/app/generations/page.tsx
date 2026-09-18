"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { statusFr, studio } from "@/lib/studio-copy";

type Item = {
  id: string;
  kind: string;
  status: string;
  title: string;
  booth: string;
  createdAt: string;
  image: string | null;
  sharePath: string;
  error: string | null;
};

export default function GenerationsPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [booth, setBooth] = useState("All");
  const [query, setQuery] = useState("");

  useEffect(() => {
    fetch("/api/generations")
      .then((response) => response.json())
      .then((data) => setItems(data.generations || []));
  }, []);

  const stills = items.filter((item) => item.kind === "photo");
  const houses = useMemo(() => [...new Set(stills.map((item) => item.booth))], [stills]);
  const visible = stills.filter((item) => {
    if (booth !== "All" && item.booth !== booth) return false;
    const hay = query.trim().toLowerCase();
    if (!hay) return true;
    return item.title.toLowerCase().includes(hay) || item.booth.toLowerCase().includes(hay);
  });

  return (
    <main>
      <p className="eyebrow">{studio.archive.eyebrow}</p>
      <h1 className="mt-3 text-5xl leading-[0.94] md:text-6xl">{studio.archive.title}</h1>
      <p className="mt-4 max-w-md text-[#9c9588]">{studio.archive.lead}</p>
      <div className="archive-toolbar">
        <button type="button" className="chip" data-on={booth === "All"} onClick={() => setBooth("All")}>{studio.archive.all}</button>
        {houses.map((name) => (
          <button key={name} type="button" className="chip" data-on={booth === name} onClick={() => setBooth(name)}>{name}</button>
        ))}
      </div>
      <input className="field mt-4 max-w-sm" value={query} onChange={(event) => setQuery(event.target.value)} placeholder={studio.archive.find} />
      {visible.length === 0 ? <p className="mt-16 text-[#9c9588]">{studio.archive.empty}</p> : null}
      <section className="mt-12 columns-2 gap-3 md:columns-3">
        {visible.map((item) => (
          <article key={item.id} className="mb-3 break-inside-avoid">
            {item.image ? (
              <Link href={item.sharePath}>
                <img src={item.image} alt={item.title} className="w-full" />
              </Link>
            ) : (
              <div className="flex aspect-[3/4] items-end bg-[#111] p-4">
                <p className="text-sm text-[#9c9588]">{item.error || statusFr(item.status)}</p>
              </div>
            )}
            <div className="mt-2 flex items-baseline justify-between gap-3">
              <h2 className="text-lg">{item.title}</h2>
              <p className="text-[0.62rem] uppercase tracking-[0.18em] text-[#9c9588]">{item.booth}</p>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
