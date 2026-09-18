"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BrandMark } from "@/components/brand-mark";
import { CAT_FR } from "@/lib/kiosk-copy";
import { THEME_LOOK, attractCovers } from "@/lib/theme-look";

const worlds = Object.entries(THEME_LOOK);
const covers = attractCovers();

export default function HomePage() {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => setTick((value) => value + 1), 3600);
    return () => window.clearInterval(id);
  }, []);

  const featured = covers[tick % Math.max(covers.length, 1)] || worlds[tick % worlds.length];

  return (
    <main>
      <header className="mx-auto flex max-w-6xl items-start justify-between px-6 pb-4 pt-8">
        <BrandMark href="/" />
        <nav className="flex gap-6 text-[0.95rem] text-[#c6bba8]">
          <Link href="/login">Connexion</Link>
          <Link href="/register" className="text-[#edd9a8]">Commencer</Link>
        </nav>
      </header>

      <section className="relative min-h-[88dvh] overflow-hidden">
        <div className="attract-stage">
          {covers.map(([title, look], index) => (
            look.cover ? <img key={title} src={look.cover} alt="" className="attract-still" data-on={index === tick % covers.length} /> : null
          ))}
        </div>
        <div className="scene-veil" />
        <div className="relative mx-auto flex min-h-[88dvh] max-w-6xl flex-col justify-end px-6 pb-16">
          <p className="eyebrow">Photobooth · N’Djamena</p>
          <h1 className="hero-title mt-6 max-w-3xl text-6xl leading-[0.9] md:text-8xl">Restez ici.<br />Partez en plusieurs.</h1>
          <p className="mt-7 max-w-lg text-lg leading-8 text-[#e8dfd0]">
            L’ordinateur est le booth. Le visage reste. Le lieu — gouvernance, Sahel, atelier, XR — change.
          </p>
          <p className="mt-8 text-sm tracking-[0.16em] uppercase text-[#edd9a8]">{featured ? (featured[1].hint || featured[0]) : ""}</p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link className="btn btn-gold" href="/register">Ouvrir un booth</Link>
            <Link className="btn btn-ghost" href="/login">J’en ai un</Link>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-16 px-6 py-24 md:grid-cols-[1fr_1fr]">
        <ol className="space-y-10">
          {[
            ["Toucher", "L’écran attend. Un tap suffit."],
            ["Visage", "Un ovale. Un compte. Un flash."],
            ["Lieu", "Tchad, jeunesse, IA. Le même visage."],
            ["Garder", "Un cliché, un QR, l’invité suivant."],
          ].map(([step, line], index) => (
            <li key={step}>
              <p className="eyebrow">0{index + 1} · {step}</p>
              <p className="mt-3 max-w-sm text-xl leading-8 text-[#e8dfd0]">{line}</p>
            </li>
          ))}
        </ol>
        <div className="grid grid-cols-2 gap-2 self-start">
          {covers.slice(0, 8).map(([title, look]) => (
            <div key={title} className="relative min-h-36 overflow-hidden">
              {look.cover ? <img src={look.cover} alt="" className="absolute inset-0 h-full w-full object-cover" /> : null}
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 to-transparent" />
              <p className="relative flex h-full min-h-36 flex-col justify-end p-3 text-sm">
                <small className="mb-1 block text-[0.62rem] uppercase tracking-[0.16em] text-[#edd9a8]">{look.hint || CAT_FR[look.note] || look.note}</small>
                {title}
              </p>
            </div>
          ))}
        </div>
      </section>
      <section className="mx-auto max-w-6xl px-6 pb-24">
        <p className="eyebrow">Lieux</p>
        <h2 className="mt-4 max-w-xl text-4xl leading-[1.05]">Anniversaire. Mariage. Fête. Tchad.</h2>
        <div className="mt-10 grid grid-cols-2 gap-2 md:grid-cols-4">
          {worlds.filter(([, look]) => ["Birthday", "Wedding", "Party", "Baby", "Grad"].includes(look.note)).map(([title, look]) => (
            <div key={title} className="theme-pic relative min-h-40" data-motif={look.motif}>
              <span className="theme-wash" style={{ background: look.wash }} />
              <span className="theme-motif" aria-hidden />
              <span className="theme-veil" />
              <span className="theme-name">
                <span>
                  <small>{CAT_FR[look.note] || look.note}</small>
                  <b>{title}</b>
                </span>
              </span>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
