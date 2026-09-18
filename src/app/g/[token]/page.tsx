"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Pair, copy } from "@/lib/kiosk-copy";
import { goBright, keepScreenAwake } from "@/lib/feel";
import { useSwipe } from "@/lib/swipe";

type Photo = { id: string; image: string; title: string; sharePath: string };

export default function GalleryPage() {
  const { token } = useParams<{ token: string }>();
  const [name, setName] = useState("Le mur");
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [open, setOpen] = useState<Photo | null>(null);
  const [live, setLive] = useState(false);
  const [slide, setSlide] = useState(0);
  const newest = useRef("");

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("live") === "1") setLive(true);
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const response = await fetch(`/api/gallery/${token}`);
      const data = await response.json();
      if (!response.ok || cancelled) return;
      setName(data.name);
      setPhotos(data.photos || []);
    }
    void load();
    const id = window.setInterval(() => void load(), 8000);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [token]);

  useEffect(() => {
    const fresh = photos[0]?.id || "";
    if (live && fresh && fresh !== newest.current) setSlide(0);
    newest.current = fresh;
  }, [photos, live]);

  useEffect(() => {
    if (!live || photos.length < 2) return;
    const id = window.setInterval(() => setSlide((value) => (value + 1) % photos.length), 3800);
    return () => window.clearInterval(id);
  }, [live, photos.length]);

  useEffect(() => {
    if (!live) return;
    let release: (() => void) | undefined;
    void keepScreenAwake().then((stop) => {
      release = stop;
    });
    void goBright();
    return () => release?.();
  }, [live]);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(null);
        setLive(false);
      }
      if (!open && !live) return;
      const list = live ? photos : open ? photos : [];
      if (!list.length) return;
      const index = live ? slide : photos.findIndex((item) => item.id === open?.id);
      if (event.key === "ArrowRight") {
        const next = list[(index + 1) % list.length];
        if (live) setSlide((index + 1) % list.length);
        else setOpen(next);
      }
      if (event.key === "ArrowLeft") {
        const next = list[(index - 1 + list.length) % list.length];
        if (live) setSlide((index - 1 + list.length) % list.length);
        else setOpen(next);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, live, photos, slide]);

  const showing = photos[slide] || photos[0];
  const lightboxSwipe = useSwipe(
    () => {
      if (!open) return;
      const index = photos.findIndex((item) => item.id === open.id);
      setOpen(photos[Math.min(photos.length - 1, index + 1)] || open);
    },
    () => {
      if (!open) return;
      const index = photos.findIndex((item) => item.id === open.id);
      setOpen(photos[Math.max(0, index - 1)] || open);
    },
  );

  return (
    <main className="min-h-dvh px-3 py-8 md:px-8">
      <header className="mx-auto flex max-w-6xl items-end justify-between gap-6 px-2">
        <div>
          <p className="eyebrow">{copy.wall.fr}</p>
          <h1 className="mt-3 text-6xl md:text-8xl">{name}</h1>
          <p className="mt-4 text-sm text-[#c6bba8]">{photos.length ? `${photos.length} portraits` : copy.waiting.fr}</p>
        </div>
        {photos.length ? (
          <button className="btn btn-gold shrink-0" type="button" onClick={() => setLive(true)}>
            <Pair en={copy.wallPlay.en} fr={copy.wallPlay.fr} />
          </button>
        ) : null}
      </header>
      <section className="mx-auto mt-10 columns-2 gap-2 md:columns-4 md:gap-3">
        {photos.map((photo) => (
          <button key={photo.id} className="mb-2 block w-full overflow-hidden md:mb-3" type="button" onClick={() => setOpen(photo)}>
            <img src={photo.image} alt={photo.title} className="w-full transition duration-300 hover:scale-[1.02]" />
          </button>
        ))}
      </section>
      {photos.length === 0 ? (
        <div className="mx-auto mt-24 max-w-6xl px-2">
          <p className="text-3xl">{copy.waiting.fr}</p>
          <p className="pair-fr mt-3">{copy.waiting.en}</p>
        </div>
      ) : null}

      {open ? (
        <div className="wall-lightbox" onClick={() => setOpen(null)}>
          <article className="max-h-full max-w-5xl" onClick={(event) => event.stopPropagation()} {...lightboxSwipe}>
            <img src={open.image} alt={open.title} className="max-h-[80vh] w-full object-contain" />
            <div className="mt-4 flex items-center justify-between gap-4">
              <p className="text-xl">{open.title}</p>
              <Link className="btn btn-gold" href={open.sharePath}>
                <Pair en={copy.keepShort.en} fr={copy.keepShort.fr} />
              </Link>
            </div>
          </article>
        </div>
      ) : null}

      {live && showing ? (
        <div className="wall-live">
          <img key={showing.id} src={showing.image} alt={showing.title} className="wall-live-still" />
          <div className="wall-live-veil" />
          <div className="wall-live-copy">
            <p className="eyebrow">{name}</p>
            <h2 className="mt-3 text-5xl md:text-7xl">{showing.title}</h2>
            <p className="mt-6 text-sm text-[#c6bba8]">{slide + 1} / {photos.length}</p>
            <button className="btn btn-ghost mt-8" type="button" onClick={() => setLive(false)}>
              <Pair en={copy.wallStop.en} fr={copy.wallStop.fr} />
            </button>
          </div>
        </div>
      ) : null}
    </main>
  );
}
