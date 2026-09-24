"use client";

import { Suspense, useEffect, useRef, useState, type ReactNode } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { BootScreen } from "@/components/boot-screen";
import QRCode from "qrcode";
import { compressPortrait, flushQueue, guestPhotoFilename, listQueue, queueCapture } from "@/lib/offline-queue";
import { ThemePicker } from "@/components/theme-picker";
import { DevelopingStage } from "@/components/developing-stage";
import { Pair, KioskSteps, PathWhisper, copy, guestSubtitle } from "@/lib/kiosk-copy";
import { BRAND } from "@/lib/brand";
import { keepScreenAwake, pulse, goBright } from "@/lib/feel";
import { snapPortrait } from "@/lib/snap";
import { useBoothLens } from "@/lib/use-booth-lens";
import { canUseCamera, openUserMedia } from "@/lib/camera";
import { FgiPoster } from "@/components/fgi-poster";
import { attractCovers } from "@/lib/theme-look";
import { EVENT_PUBLIC_TOKEN, eventGuestBooth, eventGuestPrompts, eventTemplateByLook } from "@/lib/fgi-agenda";
import { readApiJson } from "@/lib/api-json";

type Prompt = { id: string; title: string; category: string; scope?: string; body?: string };
type Booth = {
  id: string;
  name: string;
  publicToken: string;
  videoEnabled: boolean;
  deliveryMode: string;
  promptMode: string;
  eventName: string;
  subtitle: string;
  consentText?: string;
};

type Step = "attract" | "camera" | "review" | "format" | "style" | "sending" | "queued";

const EVENT_PROMPTS = eventGuestPrompts();
const EVENT_BOOTH = eventGuestBooth();

export default function KioskPage() {
  return (
    <Suspense fallback={<BootScreen label="Booth…" />}>
      <KioskDesk />
    </Suspense>
  );
}

function KioskDesk() {
  const { token } = useParams<{ token: string }>();
  const router = useRouter();
  const search = useSearchParams();
  const lookName = (search.get("look") || "").trim();
  const eventLook = eventTemplateByLook(lookName);
  const isEvent = token === EVENT_PUBLIC_TOKEN;
  const lookLocked = Boolean(eventLook);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [booth, setBooth] = useState<Booth | null>(isEvent ? EVENT_BOOTH : null);
  const [prompts, setPrompts] = useState<Prompt[]>(isEvent ? EVENT_PROMPTS : []);
  const [step, setStep] = useState<Step>("attract");
  const [selected, setSelected] = useState<string[]>(eventLook ? [eventLook.look] : []);
  const [wantVideo, setWantVideo] = useState(false);
  const [email, setEmail] = useState("");
  const [blob, setBlob] = useState<Blob | null>(null);
  const [preview, setPreview] = useState("");
  const [error, setError] = useState("");
  const [online, setOnline] = useState(true);
  const [queued, setQueued] = useState(0);
  const [facing, setFacing] = useState<"user" | "environment">("user");
  const [count, setCount] = useState<number | null>(null);
  const [flash, setFlash] = useState(false);
  const [loading, setLoading] = useState(!isEvent);
  const [idle, setIdle] = useState(0);
  const [lensQr, setLensQr] = useState("");
  const [askLens, setAskLens] = useState(false);
  const [camReady, setCamReady] = useState(false);
  const [camDenied, setCamDenied] = useState(false);
  const [camTick, setCamTick] = useState(0);
  const [still, setStill] = useState(0);
  const [operator, setOperator] = useState(false);
  const [fromLibrary, setFromLibrary] = useState(false);
  const lens = useBoothLens(step === "camera" ? token : undefined, videoRef);
  const viewFacing = lens.live ? lens.facing : facing;
  const lensOpen = camReady || lens.live;
  const counting = count !== null;
  const captureRound = useRef(0);
  const covers = attractCovers();

  function poke() {
    setIdle((value) => value + 1);
  }

  useEffect(() => {
    const sync = () => setOnline(navigator.onLine);
    const refreshQueue = () => void listQueue().then((items) => setQueued(items.length));
    sync();
    refreshQueue();
    window.addEventListener("online", sync);
    window.addEventListener("offline", sync);
    window.addEventListener("online", () => void flushQueue().then(refreshQueue));
    void flushQueue().then(refreshQueue);
    return () => {
      window.removeEventListener("online", sync);
      window.removeEventListener("offline", sync);
    };
  }, []);

  useEffect(() => {
    const control = new AbortController();
    fetch(`/api/booths/public/${token}`, { signal: control.signal })
      .then(async (response) => {
        const data = await readApiJson<{ booth?: Booth; prompts?: Prompt[]; error?: string }>(response);
        if (!response.ok) throw new Error(typeof data.error === "string" ? data.error : copy.boothDown.fr);
        if (!data.booth) throw new Error(copy.boothDown.fr);
        setBooth(data.booth);
        const nextPrompts = data.prompts?.length ? data.prompts : isEvent ? EVENT_PROMPTS : [];
        setPrompts(nextPrompts);
        const locked = lookName
          ? nextPrompts.find((item) => item.title.toLowerCase() === lookName.toLowerCase() || item.id.toLowerCase() === lookName.toLowerCase())
          : undefined;
        setSelected(
          locked
            ? [locked.id]
            : lookLocked && lookName
              ? [lookName]
              : data.booth.promptMode === "automatic"
                ? nextPrompts.slice(0, 1).map((item) => item.id)
                : [],
        );
        setWantVideo(false);
        setError("");
      })
      .catch((err) => {
        if (control.signal.aborted) return;
        if (isEvent) return;
        setError(err.message);
      })
      .finally(() => setLoading(false));
    if (!isEvent) {
      fetch("/api/me", { credentials: "same-origin", signal: control.signal })
        .then((response) => readApiJson<{ user?: unknown }>(response))
        .then((data) => setOperator(Boolean(data.user)))
        .catch(() => setOperator(false));
    }
    return () => control.abort();
  }, [token, lookName, isEvent, lookLocked]);

  useEffect(() => {
    if (!askLens) return;
    const origin = window.location.origin;
    QRCode.toDataURL(`${origin}/kiosk/${token}/lens`, {
      width: 192,
      margin: 1,
      color: { dark: "#111111", light: "#ffffff" },
    }).then(setLensQr);
  }, [token, askLens]);

  useEffect(() => {
    let release: (() => void) | undefined;
    void keepScreenAwake().then((stop) => {
      release = stop;
    });
    return () => release?.();
  }, []);

  useEffect(() => {
    if (lens.live) setAskLens(false);
  }, [lens.live]);

  useEffect(() => {
    if (step !== "attract") return;
    const id = window.setInterval(() => setStill((value) => value + 1), 5200);
    return () => window.clearInterval(id);
  }, [step]);

  useEffect(() => {
    if (step === "attract" || step === "sending" || step === "queued") return;
    const id = window.setTimeout(() => {
      streamRef.current?.getTracks().forEach((track) => track.stop());
      setBlob(null);
      setPreview((current) => {
        if (current) URL.revokeObjectURL(current);
        return "";
      });
      setError("");
      setStep("attract");
    }, 90_000);
    return () => window.clearTimeout(id);
  }, [step, idle]);

  useEffect(() => {
    if (step !== "camera") {
      captureRound.current += 1;
      setCount(null);
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
      setCamReady(false);
      return;
    }
    if (lens.live) {
      setCamDenied(false);
      setCamReady(true);
      lens.attach();
      return;
    }
    if (!canUseCamera()) {
      setCamDenied(true);
      setCamReady(false);
      return;
    }
    let gone = false;
    setCamReady(false);
    const wait = window.setTimeout(() => {
      if (gone || videoRef.current?.srcObject) return;
      setCamDenied(true);
      setCamReady(false);
    }, 5500);
    void openUserMedia(facing)
      .then((stream) => {
        if (gone) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
        setCamDenied(false);
        setError("");
      })
      .catch(() => {
        if (!gone) {
          setCamDenied(true);
          setCamReady(false);
        }
      });
    return () => {
      gone = true;
      window.clearTimeout(wait);
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, [step, facing, lens.live, lens.attach, camTick]);

  const make = copy.make(selected.length);

  const lookCap = isEvent ? 1 : 3;

  function toggleTheme(id: string) {
    poke();
    pulse("tap");
    setSelected((current) => {
      if (current.includes(id)) return current.filter((item) => item !== id);
      if (current.length >= lookCap) return isEvent ? [id] : current;
      return [...current, id];
    });
  }

  function lucky() {
    poke();
    pulse("tap");
    setSelected((current) => {
      const unused = prompts.filter((item) => !current.includes(item.id));
      const pool = unused.length ? unused : prompts;
      if (!pool.length) return current;
      if (!current.length) {
        const mix = [...pool].sort(() => Math.random() - 0.5).slice(0, Math.min(lookCap, pool.length));
        return mix.map((item) => item.id);
      }
      if (current.length >= lookCap) return current;
      const pick = pool[Math.floor(Math.random() * pool.length)];
      return pick ? [...current, pick.id] : current;
    });
  }

  function holdShot(file: Blob, library = false) {
    setFromLibrary(library);
    setBlob(file);
    setPreview((current) => {
      if (current) URL.revokeObjectURL(current);
      return URL.createObjectURL(file);
    });
    setError("");
    setWantVideo(false);
    setStep("review");
  }

  async function captureFromCamera() {
    if (lens.live) {
      const shot = await lens.shutter();
      if (shot) {
        holdShot(shot);
        return;
      }
    }
    const video = videoRef.current;
    if (!video) {
      setError(copy.snapFail.fr);
      return;
    }
    const captured = await snapPortrait(video, viewFacing === "user");
    if (captured) {
      holdShot(captured);
      return;
    }
    setError(copy.snapFail.fr);
  }

  async function countdownCapture() {
    if (!lensOpen || counting) return;
    const round = ++captureRound.current;
    poke();
    for (const value of [3, 2, 1]) {
      setCount(value);
      pulse("count");
      await new Promise((resolve) => window.setTimeout(resolve, 450));
      if (captureRound.current !== round) return;
    }
    setCount(null);
    setFlash(true);
    pulse("flash");
    window.setTimeout(() => setFlash(false), 160);
    await captureFromCamera();
  }

  function cancelCountdown() {
    captureRound.current += 1;
    setCount(null);
    poke();
  }

  function continueAfterPhoto(film = wantVideo) {
    setWantVideo(film);
    const locked =
      lookName
        ? prompts.find((item) => item.title.toLowerCase() === lookName.toLowerCase() || item.id.toLowerCase() === lookName.toLowerCase())
        : undefined;
    const lockedId = locked?.id || (lookLocked ? lookName : "");
    if (lockedId || booth?.promptMode === "automatic") {
      const ids = lockedId ? [lockedId] : selected.length ? selected : prompts.slice(0, 1).map((item) => item.id);
      if (!ids.length) {
        setError(copy.noPlaceOpen.fr);
        return;
      }
      setSelected(ids);
      void submit(undefined, ids, film);
      return;
    }
    setStep("style");
  }

  function acceptPhoto() {
    poke();
    if (booth?.videoEnabled && !lookLocked) {
      setStep("format");
      return;
    }
    continueAfterPhoto(false);
  }

  function pickFormat(film: boolean) {
    poke();
    continueAfterPhoto(film);
  }

  const fileAccept = "image/*,.jpg,.jpeg,.png,.webp,.heic,.heif";

  async function onUpload(file?: File) {
    if (!file) return;
    poke();
    try {
      holdShot(await compressPortrait(file, Number.POSITIVE_INFINITY), true);
    } catch {
      setError(copy.badImage.fr);
    }
  }

  async function submit(forced?: Blob, looks?: string[], film = wantVideo) {
    const source = forced || blob;
    const picks = looks || selected;
    if (!source || picks.length === 0) {
      setError(copy.tapPlace.fr);
      setStep(lookLocked ? "review" : "style");
      return;
    }
    if (booth?.deliveryMode === "email" && !email) {
      setError(copy.needEmail.fr);
      setStep(lookLocked ? "review" : "style");
      return;
    }
    setError("");
    setStep("sending");
    const photo = await compressPortrait(source);
    const offlineId = crypto.randomUUID();

    function buildForm() {
      const form = new FormData();
      form.set("boothToken", token);
      form.set("promptIds", JSON.stringify(picks));
      form.set("wantVideo", String(film));
      form.set("consent", "true");
      form.set("offlineId", offlineId);
      if (email) form.set("email", email);
      form.set("photo", photo, guestPhotoFilename(photo));
      return form;
    }

    const tries = isEvent ? 3 : 1;
    let lastMessage = copy.boothStartFail.fr;
    for (let attempt = 0; attempt < tries; attempt += 1) {
      try {
        const response = await fetch("/api/sessions", { method: "POST", body: buildForm() });
        const data = await readApiJson<{ session?: { sharePath?: string }; error?: string }>(response);
        if (response.ok && data.session?.sharePath) {
          router.push(data.session.sharePath);
          return;
        }
        lastMessage = response.status === 402 ? copy.noLooks.fr : data.error || copy.boothStartFail.fr;
        if (response.status < 500 || isEvent === false) {
          setError(lastMessage);
          setStep(lookLocked ? "review" : "style");
          return;
        }
      } catch {
        lastMessage = copy.boothStartFail.fr;
      }
      if (attempt < tries - 1) await new Promise((resolve) => window.setTimeout(resolve, 700 * (attempt + 1)));
    }

    if (isEvent || navigator.onLine) {
      setError(lastMessage);
      setStep(lookLocked ? "review" : "style");
      return;
    }

    await queueCapture({
      id: offlineId,
      boothToken: token,
      promptId: picks[0],
      promptIds: picks,
      wantVideo: film,
      consent: true,
      email: email || undefined,
      blob: photo,
      createdAt: Date.now(),
      attempts: 0,
    });
    setQueued((value) => value + 1);
    setStep("queued");
  }

  function resetShot() {
    setBlob(null);
    setPreview((current) => {
      if (current) URL.revokeObjectURL(current);
      return "";
    });
    setError("");
  }

  const title = booth?.eventName || booth?.name || BRAND.fr;
  const filePick = (className: string, label: ReactNode, disabled = false) => (
    <label className={className} aria-disabled={disabled}>
      {label}
      <input
        className="absolute inset-0 cursor-pointer opacity-0"
        type="file"
        accept={fileAccept}
        disabled={disabled}
        onChange={(e) => {
          void onUpload(e.target.files?.[0]);
          e.currentTarget.value = "";
        }}
      />
    </label>
  );

  return (
    <main className="kiosk-shell" onPointerDown={poke}>
      {error ? <p className="kiosk-toast">{error}</p> : null}

      {step === "attract" ? (
        <section className="relative min-h-dvh overflow-hidden">
          <div className="attract-stage">
            {(eventLook?.cover ? [["look", { cover: eventLook.cover }]] as const : covers).map(([name, look], index) =>
              look.cover ? (
                <img
                  key={name}
                  src={look.cover}
                  alt=""
                  className="attract-still"
                  data-on={eventLook || index === still % Math.max(covers.length, 1) ? "true" : undefined}
                  loading={index < 2 ? "eager" : "lazy"}
                  decoding="async"
                />
              ) : null,
            )}
          </div>
          <div className="scene-veil" />
          {eventLook ? (
            <FgiPoster
              photo={eventLook.guest}
              position={eventLook.portrait}
              className="look-fgi-poster"
            />
          ) : null}
          {operator ? (
            <Link className="attract-atelier" href={booth?.id ? `/app/booths/${booth.id}` : "/app"}>
              <Pair en={copy.atelier.en} fr={copy.atelier.fr} />
            </Link>
          ) : null}
          <div className="attract-copy">
            <div className="attract-desk">
              <div className="attract-brand">
                <img src={BRAND.crest} alt="" className="attract-crest" width={48} height={48} />
                <div className="attract-brand-copy">
                  <strong>{BRAND.fr}</strong>
                  <span>{BRAND.name}</span>
                </div>
              </div>
              <p className="eyebrow">{eventLook ? copy.lookPreview.fr : copy.attractHint.fr}</p>
              <h1 className="hero-title attract-title">{eventLook ? eventLook.title : title}</h1>
              <PathWhisper className="path-whisper-desk" />
              <p className="attract-line">
                {eventLook ? "Votre visage dans l’affiche FGI. Le lieu change autour de vous." : guestSubtitle(booth?.subtitle)}
              </p>
              <p className="pair-fr attract-line-en">{eventLook ? copy.lookPreview.en : copy.defaultSubtitle.en}</p>
              <div className="attract-cta">
                <button className="btn btn-gold attract-door" type="button" disabled={loading} onClick={() => { void goBright(); setError(""); setCamDenied(false); setFromLibrary(false); setStep("camera"); }}>
                  <Pair en={copy.createMemories.en} fr={copy.createMemories.fr} />
                </button>
                {filePick("btn btn-ghost attract-door relative cursor-pointer overflow-hidden", <Pair en={copy.library.en} fr={copy.library.fr} />, loading)}
              </div>
              {eventLook ? (
                <Link className="attract-change" href="/#mondes">
                  {copy.changeLook.fr}
                </Link>
              ) : null}
            </div>
          </div>
        </section>
      ) : null}

      {step === "camera" ? (
        <section className={camDenied && !lens.live && !askLens ? "cam-desk" : "camera-stage"}>
          <div className="camera-well" hidden={camDenied && !lens.live && !askLens}>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              onPlaying={() => setCamReady(true)}
              className={viewFacing === "user" ? "-scale-x-100" : ""}
            />
            <div className="camera-vignette" />
            {lensOpen && !counting ? <div className="face-guide" /> : null}
          </div>
          {lensOpen && !(camDenied && !lens.live) ? (
            <p className="cam-live"><i />{copy.live.fr}</p>
          ) : null}
          {count ? (
            <div className="kiosk-count">
              <b>{count}</b>
            </div>
          ) : null}
          {flash ? <div className="flash absolute inset-0 z-20 bg-white" /> : null}
          {camDenied && !lens.live && !askLens ? (
            <>
              <header className="cam-desk-copy">
                <KioskSteps at={1} />
                <p className="eyebrow mt-6">{copy.library.fr}</p>
                <h1 className="mt-4 text-5xl leading-[0.94]">{copy.upload.fr}</h1>
                <p className="pair-fr mt-3">{copy.camNeed.en}</p>
                <p className="mt-5 max-w-sm text-[1.05rem] leading-7 text-[#e8dfd0]">{copy.camNeed.fr}</p>
              </header>
              <div />
              <div className="cam-desk-dock">
                {filePick("btn btn-gold camera-ready relative w-full cursor-pointer overflow-hidden", <Pair en={copy.library.en} fr={copy.library.fr} />)}
                <button
                  className="btn btn-ghost mt-3 w-full"
                  type="button"
                  onClick={() => {
                    setError("");
                    setCamDenied(false);
                    setCamTick((value) => value + 1);
                  }}
                >
                  <Pair en={copy.retryCam.en} fr={copy.retryCam.fr} />
                </button>
                <button className="btn btn-quiet mt-3 w-full" type="button" onClick={() => { resetShot(); setStep("attract"); }}>
                  <Pair en={copy.back.en} fr={copy.back.fr} />
                </button>
              </div>
            </>
          ) : null}
          {askLens && !lens.live ? (
            <div className="lens-card">
              <p className="eyebrow">{copy.lensLive.fr}</p>
              <h1 className="mt-3 text-4xl leading-[1.05]">{copy.lensHint.fr}</h1>
              <p className="pair-fr mt-2">{copy.lensHint.en}</p>
              {lensQr ? <img src={lensQr} alt="" className="mt-5 w-36 bg-[#f4efe6] p-2" /> : null}
              <button className="btn btn-ghost mt-5 w-full" type="button" onClick={() => setAskLens(false)}>
                <Pair en={copy.lensLocal.en} fr={copy.lensLocal.fr} />
              </button>
            </div>
          ) : null}
          {!(camDenied && !lens.live && !askLens) && !askLens ? (
          <div className="camera-dock">
            {!online ? <p className="mb-3 text-center text-sm text-[#edd9a8]">{copy.offline.fr}</p> : null}
            <p className="camera-cue">{lensOpen ? (counting ? copy.holdStill.fr : copy.pose.fr) : copy.camWait.fr}</p>
            {counting ? (
              <button className="camera-cancel" type="button" onClick={cancelCountdown}>
                {copy.cancelShot.fr}
              </button>
            ) : (
              <button className="camera-shutter" type="button" aria-label={BRAND.short} disabled={!lensOpen} onClick={() => void countdownCapture()} />
            )}
            <div className="camera-tools">
              <button type="button" onClick={() => {
                if (lens.live) lens.sendFlip();
                else setFacing((value) => value === "user" ? "environment" : "user");
              }}>
                {copy.flip.fr}
              </button>
              <button type="button" onClick={() => setAskLens((value) => !value)}>{copy.lensLive.fr}</button>
              {filePick("relative cursor-pointer overflow-hidden", copy.library.fr)}
              <button type="button" onClick={() => { resetShot(); setStep("attract"); }}>{copy.back.fr}</button>
            </div>
          </div>
          ) : null}
        </section>
      ) : null}

      {step === "review" && preview ? (
        <section className="review-stage">
          <div className="review-well">
            <img src={preview} alt="" />
          </div>
          <div className="review-dock">
            <KioskSteps at={1} />
            <h2 className="review-ask">{copy.thisPhoto.fr}</h2>
            <p className="pair-fr">{copy.thisPhoto.en}</p>
            <div className="review-actions">
              <button className="btn btn-gold camera-ready" type="button" onClick={() => acceptPhoto()}>
                <Pair en={copy.useThis.en} fr={copy.useThis.fr} />
              </button>
              <button className="btn btn-ghost camera-ready" type="button" onClick={() => { resetShot(); setStep("camera"); }}>
                <Pair en={copy.again.en} fr={copy.again.fr} />
              </button>
            </div>
            <div className="camera-tools">
              {filePick("relative cursor-pointer overflow-hidden", copy.library.fr)}
              <button type="button" onClick={() => { resetShot(); setStep(fromLibrary ? "attract" : "camera"); }}>{copy.back.fr}</button>
            </div>
          </div>
        </section>
      ) : null}

      {step === "format" && preview ? (
        <section className="review-stage">
          <div className="review-well">
            <img src={preview} alt="" />
          </div>
          <div className="review-dock">
            <KioskSteps at={1} />
            <h2 className="review-ask">{copy.formatAsk.fr}</h2>
            <p className="pair-fr">{copy.formatAsk.en}</p>
            <div className="format-doors">
              <button className="btn btn-gold format-door" type="button" onClick={() => pickFormat(false)}>
                <Pair en={copy.formatPhoto.en} fr={copy.formatPhoto.fr} />
                <small>{copy.formatPhotoHint.fr}</small>
              </button>
              <button className="btn btn-ghost format-door" type="button" onClick={() => pickFormat(true)}>
                <Pair en={copy.formatFilm.en} fr={copy.formatFilm.fr} />
                <small>{copy.formatFilmHint.fr}</small>
              </button>
              <button className="btn btn-ghost format-door" type="button" onClick={() => pickFormat(true)}>
                <Pair en={copy.formatBoth.en} fr={copy.formatBoth.fr} />
                <small>{copy.formatBothHint.fr}</small>
              </button>
            </div>
            <button className="btn btn-quiet mt-3 w-full" type="button" onClick={() => setStep("review")}>
              <Pair en={copy.back.en} fr={copy.back.fr} />
            </button>
          </div>
        </section>
      ) : null}

      {step === "style" && preview ? (
        <section className="kiosk-desk">
          <header className="kiosk-desk-head">
            <KioskSteps at={2} />
            <div className="mt-5 flex items-end justify-between gap-4">
              <div>
                <p className="eyebrow">{copy.room(selected.length, lookCap).fr}</p>
                <h1 className="mt-3 text-4xl">{copy.pick.fr}</h1>
                <p className="pair-fr mt-2">{copy.pick.en}</p>
              </div>
              <button type="button" onClick={() => setStep(booth?.videoEnabled ? "format" : "review")} className="shrink-0">
                <img src={preview} alt="" className="kiosk-style-face" />
              </button>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <button className="chip" type="button" onClick={lucky}>
                {copy.lucky.fr}
              </button>
            </div>
          </header>
          <div className="kiosk-desk-scroll">
            <ThemePicker prompts={prompts} selected={selected} onToggle={toggleTheme} guest max={lookCap} />
            <input className="field mt-3" type="email" placeholder={copy.email.fr} value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
          </div>
          <div className="kiosk-desk-dock">
            <button className="btn btn-gold w-full" disabled={!selected.length} onClick={() => void submit()}>
              <Pair en={make.en} fr={make.fr} />
            </button>
            <button className="btn btn-quiet mt-3 w-full" type="button" onClick={() => setStep(booth?.videoEnabled ? "format" : "review")}>
              <Pair en={copy.back.en} fr={copy.back.fr} />
            </button>
          </div>
        </section>
      ) : null}

      {step === "sending" ? (
        <section className="kiosk-panel kiosk-fill">
          <div className="px-5 pt-5">
            <KioskSteps at={3} />
          </div>
          <DevelopingStage face={preview} remaining={selected.length} />
        </section>
      ) : null}

      {step === "queued" ? (
        <section className="kiosk-panel kiosk-fill px-5 pb-10">
          <KioskSteps at={3} />
          {preview ? <img src={preview} alt="" className="souvenir-still mt-6" /> : null}
          <p className="eyebrow mt-6">{copy.holding.fr}</p>
          <h1 className="mt-4 text-5xl">{copy.queued.fr}</h1>
          <p className="pair-fr mt-3">{copy.queued.en}</p>
          <p className="mt-5 text-[#c6bba8]">{copy.queuedHint.fr}</p>
          <button className="btn btn-gold mt-10 w-full" onClick={() => { resetShot(); setStep("attract"); }}>
            <Pair en={copy.next.en} fr={copy.next.fr} />
          </button>
        </section>
      ) : null}
    </main>
  );
}
