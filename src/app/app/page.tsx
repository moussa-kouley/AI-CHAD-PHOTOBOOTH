"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { studio } from "@/lib/studio-copy";
import { readApiJson } from "@/lib/api-json";

type Booth = {
  id: string;
  name: string;
  publicToken: string;
  videoEnabled: boolean;
  isActive: boolean;
  _count?: { sessions: number; generations: number };
};

export default function DashboardPage() {
  const [booths, setBooths] = useState<Booth[] | null>(null);
  const [credits, setCredits] = useState(0);
  const [workspaceName, setWorkspaceName] = useState("");
  const [error, setError] = useState("");
  const [demoMode, setDemoMode] = useState(false);
  const [creating, setCreating] = useState(false);

  async function load() {
    const response = await fetch("/api/booths");
    const data = await readApiJson<{
      booths?: Booth[];
      credits?: number;
      workspaceName?: string;
      demoMode?: boolean;
      error?: string;
    }>(response);
    if (!response.ok) {
      setError(typeof data.error === "string" ? data.error : studio.floor.loadFail);
      setBooths([]);
      return;
    }
    setBooths(data.booths || []);
    setCredits(data.credits || 0);
    setWorkspaceName(data.workspaceName || "");
    setDemoMode(Boolean(data.demoMode));
  }

  useEffect(() => {
    void load();
  }, []);

  async function createBooth(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formEl = event.currentTarget;
    const form = new FormData(formEl);
    setError("");
    setCreating(true);
    try {
      const response = await fetch("/api/booths", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.get("name"),
          brand: { eventName: form.get("name"), subtitle: studio.floor.defaultSubtitle, primary: "#c8a25a", frame: "strip" },
        }),
      });
      if (!response.ok) {
        const data = await readApiJson<{ error?: string }>(response);
        setError(typeof data.error === "string" ? data.error : studio.floor.createFail);
        return;
      }
      formEl.reset();
      await load();
    } finally {
      setCreating(false);
    }
  }

  const list = booths || [];
  const live = list.filter((item) => item.isActive);
  const rest = list.filter((item) => !item.isActive);
  const loading = booths === null;

  return (
    <main className="floor-layout">
      <section>
        <p className="eyebrow">{studio.floor.house}</p>
        <h1 className="mt-3 text-5xl leading-[0.95] md:text-6xl">{workspaceName || studio.floor.yourBooths}</h1>
        <p className="mt-5 max-w-md text-[#c6bba8]">{studio.floor.lead}</p>
        {demoMode ? <p className="mt-4 text-sm text-[#9c9588]">{studio.floor.demo}</p> : null}
        {error ? <p className="mt-4 text-red-300">{error}</p> : null}
        <form onSubmit={createBooth} className="floor-create mt-10">
          <label className="field-wrap">
            <span>{studio.floor.newBooth}</span>
            <input className="field" name="name" placeholder={studio.floor.tonightName} required minLength={2} />
          </label>
          <button className="btn btn-gold" type="submit" disabled={creating}>{creating ? "…" : studio.floor.open}</button>
        </form>
      </section>
      <section>
        <div className="flex items-baseline justify-between gap-4">
          <p className="eyebrow">{studio.floor.floor}</p>
          <Link href="/app/credits" className="text-sm text-[#c8a25a]" title={studio.floor.recorded(credits)}>{studio.floor.portraitsOpen}</Link>
        </div>
        <div className="booth-grid mt-5">
          {loading ? (
            <>
              <div className="floor-skel" />
              <div className="floor-skel" />
            </>
          ) : list.length === 0 ? (
            <article className="booth-card">
              <p className="eyebrow">{studio.floor.empty}</p>
              <h2>{studio.floor.noBooth}</h2>
              <p>{studio.floor.emptyLead}</p>
            </article>
          ) : (
            [...live, ...rest].map((booth) => (
              <article key={booth.id} className="booth-card" data-live={booth.isActive}>
                <p className="eyebrow">{booth.isActive ? studio.floor.live : studio.floor.dark}</p>
                <h2>{booth.name}</h2>
                <p>{studio.floor.guestsPrints(booth._count?.sessions || 0, booth._count?.generations || 0)}</p>
                <div className="booth-actions">
                  <Link className="btn btn-gold" href={`/app/booths/${booth.id}`}>{studio.floor.dress}</Link>
                  <Link className="btn btn-ghost" prefetch href={`/kiosk/${booth.publicToken}`}>{studio.floor.kiosk}</Link>
                  <Link className="btn btn-quiet" href={`/g/${booth.publicToken}`}>{studio.floor.wall}</Link>
                </div>
              </article>
            ))
          )}
        </div>
      </section>
    </main>
  );
}
