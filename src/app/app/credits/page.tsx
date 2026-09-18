"use client";

import { useEffect, useState } from "react";
import { studio } from "@/lib/studio-copy";

export default function CreditsPage() {
  const [credits, setCredits] = useState(0);
  const [note, setNote] = useState("");

  async function load() {
    const response = await fetch("/api/booths");
    const data = await response.json();
    if (response.ok) setCredits(data.credits);
  }

  useEffect(() => {
    void load();
  }, []);

  async function addPack() {
    const response = await fetch("/api/workspace/credits", { method: "POST" });
    const data = await response.json();
    if (!response.ok) {
      setNote(data.error || studio.portraits.addFail);
      return;
    }
    setCredits(data.credits);
    setNote(studio.portraits.added);
  }

  return (
    <main className="max-w-xl">
      <p className="eyebrow">{studio.portraits.eyebrow}</p>
      <h1 className="mt-3 text-5xl leading-[0.94] md:text-6xl">{studio.portraits.title}</h1>
      <p className="mt-5 max-w-md text-[#9c9588]">{studio.portraits.lead}</p>
      <p className="mt-14 font-display text-[7rem] leading-none text-[#e8d3a0]">{credits}</p>
      <p className="mt-2 text-[0.68rem] uppercase tracking-[0.28em] text-[#9c9588]">{studio.portraits.recorded}</p>
      <button className="btn btn-gold mt-10" type="button" onClick={() => void addPack()}>{studio.portraits.addPack}</button>
      {note ? <p className="mt-5 text-sm text-[#c8a25a]">{note}</p> : null}
    </main>
  );
}
