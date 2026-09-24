"use client";

import { FormEvent, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import QRCode from "qrcode";
import { DevelopingStage } from "@/components/developing-stage";
import { Pair, KioskSteps, copy } from "@/lib/kiosk-copy";
import { statusFr } from "@/lib/studio-copy";
import { openFramedImage, saveFramedImage, shareFramedImage } from "@/lib/keep-file";
import { FILM_FILENAME, SOCIAL_FILENAME, keepPortraitPath } from "@/lib/social";
import { BRAND } from "@/lib/brand";
import { useSwipe } from "@/lib/swipe";
import { readApiJson } from "@/lib/api-json";
import { BootScreen } from "@/components/boot-screen";

type Generation = {
  id: string;
  kind: string;
  status: string;
  title: string;
  image: string | null;
  video: string | null;
  error: string | null;
};

type Session = {
  original: string | null;
  kioskPath: string | null;
  generations: Generation[];
};

function souvenirUrl(token: string) {
  return new URL(`/s/${token}`, window.location.origin).href;
}

function portraitKeepUrl(token: string, generationId: string) {
  return new URL(keepPortraitPath(token, generationId), window.location.origin).href;
}

function useDesk() {
  const [desk, setDesk] = useState(true);
  useEffect(() => {
    const query = window.matchMedia("(pointer: coarse) and (max-width: 820px)");
    const sync = () => setDesk(!query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);
  return desk;
}

export default function SharePage() {
  const { token } = useParams<{ token: string }>();
  const desk = useDesk();
  const [session, setSession] = useState<Session | null>(null);
  const [error, setError] = useState("");
  const [qr, setQr] = useState("");
  const [email, setEmail] = useState("");
  const [mailNote, setMailNote] = useState("");
  const [active, setActive] = useState(0);
  const [showSource, setShowSource] = useState(false);
  const [copied, setCopied] = useState(false);
  const [keeping, setKeeping] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [shareUrl, setShareUrl] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function poll() {
      const response = await fetch(`/api/sessions/${token}`);
      const data = await readApiJson<{ session?: Session; error?: string }>(response);
      if (!response.ok) {
        setError(typeof data.error === "string" ? data.error : copy.expired.fr);
        return;
      }
      if (!cancelled && data.session) setSession(data.session);
      const pending = (data.session?.generations || []).some((item) => item.status === "queued" || item.status === "running");
      if (pending && !cancelled) window.setTimeout(() => void poll(), 2000);
    }
    void poll();
    return () => {
      cancelled = true;
    };
  }, [token]);

  const photos = session?.generations.filter((item) => item.kind === "photo") || [];
  const video = session?.generations.find((item) => item.kind === "video");
  const current = photos[active] || photos[0];
  const ready = photos.filter((item) => item.status === "ready" && item.image).length;
  const filmPending = Boolean(video && (video.status === "queued" || video.status === "running"));
  const downloadUrl = current?.image ? `${current.image}?download=1&name=${SOCIAL_FILENAME}` : "";
  const filmDownload = video?.video ? `${video.video}?download=1&name=${FILM_FILENAME}` : "";

  useEffect(() => {
    const url = current?.id ? portraitKeepUrl(token, current.id) : souvenirUrl(token);
    setShareUrl(url);
    QRCode.toDataURL(url, {
      width: 640,
      margin: 1,
      errorCorrectionLevel: "M",
      color: { dark: "#111111", light: "#ffffff" },
    }).then(setQr);
  }, [token, current?.id]);

  useEffect(() => {
    if (photos[active]?.image) return;
    const first = photos.findIndex((item) => item.image);
    if (first >= 0) setActive(first);
  }, [photos, active]);

  useEffect(() => {
    if (!current?.image) return;
    document.querySelector(".print-sheet")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [current?.image]);

  const swipe = useSwipe(
    () => setActive((value) => Math.min(photos.length - 1, value + 1)),
    () => setActive((value) => Math.max(0, value - 1)),
  );

  async function sendEmail(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const framed = current?.image;
    const response = await fetch(`/api/sessions/${token}/email`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = await response.json();
    if (!response.ok) {
      setMailNote(data.error || copy.mailFail.fr);
      return;
    }
    const imageUrl = data.imageUrl || framed;
    try {
      if (imageUrl && (await shareFramedImage(imageUrl, SOCIAL_FILENAME))) {
        setMailNote(copy.mailOk.fr);
        return;
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
    }
    window.location.href = data.mailto;
    setMailNote(copy.mailOpen.fr);
  }

  async function keepPrint() {
    if (!current?.image || keeping) return;
    setKeeping(true);
    try {
      await saveFramedImage(downloadUrl || current.image, SOCIAL_FILENAME);
    } catch {
      openFramedImage(current.image);
    } finally {
      setKeeping(false);
    }
  }

  async function sharePrint() {
    if (sharing) return;
    setSharing(true);
    try {
      if (current?.image && (await shareFramedImage(current.image, SOCIAL_FILENAME))) return;
      if (navigator.share) {
        await navigator.share({ title: current?.title || BRAND.fr, url: shareUrl });
        return;
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
    } finally {
      setSharing(false);
    }
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
  }

  const waiting = Boolean(session) && !current?.image && !current?.error;

  if (!session && !error) {
    return <BootScreen label="Portrait…" />;
  }

  return (
    <main className="souvenir mx-auto min-h-dvh max-w-lg pb-10" data-desk={desk}>
      <header className="no-print flex items-end justify-between px-5 pt-6">
        <div>
          <KioskSteps at={3} done={Boolean(current?.image)} />
          <h1 className="mt-4 text-3xl md:text-4xl">{current?.image ? current.title : copy.entering.fr}</h1>
          {!current?.image ? <p className="pair-fr mt-2">{copy.entering.en}</p> : (
            <p className="mt-2 text-sm text-[#9c9588]">{ready} / {photos.length || 1}</p>
          )}
        </div>
        {session?.original ? (
          <button type="button" onClick={() => setShowSource((value) => !value)} className="text-left">
            <img src={session.original} alt={copy.youAlt.fr} className="h-16 w-12 object-contain bg-[#101010]" />
            <span className="mt-1 block text-[0.6rem] uppercase tracking-[0.18em] text-[#9c9588]">{showSource ? copy.look.fr : copy.you.fr}</span>
          </button>
        ) : null}
      </header>
      {error ? <p className="px-5 pt-4 text-red-300">{error}</p> : null}

      <section className="print-sheet mt-5 px-4" {...swipe}>
        {showSource && session?.original ? (
          <img src={session.original} alt={copy.sourceAlt.fr} className="souvenir-still" />
        ) : current?.image ? (
          <div className="souvenir-frame">
            {photos.length > 1 ? (
              <button className="souvenir-nav" type="button" aria-label={copy.prev.fr} onClick={() => setActive((value) => Math.max(0, value - 1))}>‹</button>
            ) : null}
            <img src={current.image} alt={current.title} className="souvenir-still" />
            {photos.length > 1 ? (
              <button className="souvenir-nav souvenir-nav-next" type="button" aria-label={copy.nextShot.fr} onClick={() => setActive((value) => Math.min(photos.length - 1, value + 1))}>›</button>
            ) : null}
          </div>
        ) : current?.error ? (
          <p className="px-10 py-24 text-center text-[#9c9588]">{current.error}</p>
        ) : (
          <DevelopingStage
            compact
            face={session?.original || undefined}
            remaining={Math.max(1, photos.filter((item) => item.status === "queued" || item.status === "running").length)}
          />
        )}
      </section>

      {current?.image ? (
        <div className="no-print souvenir-actions mt-5 px-5">
          <figure className="souvenir-qr">
            {qr ? <img src={qr} alt={copy.souvenirQr.fr} /> : null}
            <figcaption>
              <Pair en={copy.scanKeep.en} fr={copy.scanKeep.fr} />
            </figcaption>
          </figure>
          {session?.kioskPath ? (
            <Link className="btn btn-gold camera-ready w-full souvenir-next" href={session.kioskPath?.includes("fgi2026") ? "/#mondes" : session.kioskPath}>
              <Pair en={copy.next.en} fr={copy.next.fr} />
            </Link>
          ) : null}
          {!desk ? (
            <>
              <button className="btn btn-ghost camera-ready w-full" type="button" disabled={keeping} onClick={() => void keepPrint()}>
                <Pair en={copy.keepPhone.en} fr={copy.keepPhone.fr} />
              </button>
              <button className="btn btn-ghost camera-ready w-full" type="button" disabled={sharing} onClick={() => void sharePrint()}>
                <Pair en={copy.shareFile.en} fr={copy.shareFile.fr} />
              </button>
              <a className="btn btn-ghost w-full" href={downloadUrl} download={SOCIAL_FILENAME}>
                <Pair en={copy.keep.en} fr={copy.keep.fr} />
              </a>
              <p className="souvenir-hold">
                <Pair en={copy.holdSave.en} fr={copy.holdSave.fr} />
              </p>
            </>
          ) : null}
          <form onSubmit={sendEmail} className="souvenir-mail">
            <input className="field" type="email" required placeholder={copy.email.fr} value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
            <button className="btn btn-gold camera-ready w-full" type="submit">
              <Pair en={copy.mail.en} fr={copy.mail.fr} />
            </button>
            {mailNote ? <p className="text-sm text-[#c8a25a]">{mailNote}</p> : null}
          </form>
          <div className="grid grid-cols-2 gap-3">
            <button className="btn btn-ghost" type="button" onClick={() => window.print()}>
              <Pair en={copy.print.en} fr={copy.print.fr} />
            </button>
            {desk ? (
              <button className="btn btn-ghost" type="button" onClick={() => void sharePrint()}>
                <Pair en={copied ? copy.copied.en : copy.share.en} fr={copied ? copy.copied.fr : copy.share.fr} />
              </button>
            ) : (
              <a className="btn btn-ghost" href={downloadUrl} download={SOCIAL_FILENAME}>
                <Pair en={copy.keepShort.en} fr={copy.keepShort.fr} />
              </a>
            )}
          </div>
          {video?.video ? (
            <a className="btn btn-ghost" href={filmDownload} download={FILM_FILENAME}>
              <Pair en={copy.keepFilm.en} fr={copy.keepFilm.fr} />
            </a>
          ) : null}
        </div>
      ) : null}

      {photos.length > 1 ? (
        <div className="no-print look-strip mt-4 px-5">
          {photos.map((photo, index) => (
            <button key={photo.id} type="button" data-on={index === active} onClick={() => { setActive(index); setShowSource(false); }}>
              {photo.image ? <img src={photo.image} alt={photo.title} /> : <span className="flex h-[6.2rem] items-center justify-center text-[10px] uppercase tracking-widest text-[#9c9588]">{photo.status === "running" ? "…" : statusFr(photo.status)}</span>}
              <small>{photo.title}</small>
            </button>
          ))}
        </div>
      ) : null}

      {video?.video ? (
        <section className="no-print mt-8 px-5">
          <p className="eyebrow">Film</p>
          <video src={video.video} controls playsInline className="souvenir-film mt-3" />
        </section>
      ) : filmPending ? (
        <p className="no-print mt-6 px-5 text-sm text-[#9c9588]">{copy.filmSoon.fr}</p>
      ) : video && !waiting ? (
        <p className="no-print mt-6 px-5 text-sm text-[#9c9588]">
          {video.status === "failed" ? video.error || copy.filmMiss.fr : copy.filmSoon.fr}
        </p>
      ) : null}
    </main>
  );
}
