"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import QRCode from "qrcode";
import { CopyButton } from "@/components/copy-button";
import { FRAME_ALIASES, FRAMES } from "@/lib/frames";
import { FrameChooser, FrameHero } from "@/components/frame-chooser";
import { compressLogo } from "@/lib/offline-queue";
import { ThemePicker } from "@/components/theme-picker";
import { LookBuilder } from "@/components/look-builder";
import { brandSchema, parseBrand } from "@/lib/brand-schema";
import { CAT_FR, copy } from "@/lib/kiosk-copy";
import { studio } from "@/lib/studio-copy";

type Prompt = { id: string; title: string; category: string; scope?: string; body?: string };
type Booth = {
  id: string;
  name: string;
  publicToken: string;
  videoEnabled: boolean;
  isActive: boolean;
  promptMode: string;
  deliveryMode: string;
  brand: string;
  selectedPrompts: string;
};

export default function BoothEditorPage() {
  const params = useParams<{ id: string }>();
  const [booth, setBooth] = useState<Booth | null>(null);
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [qr, setQr] = useState("");
  const [lensQr, setLensQr] = useState("");
  const [saved, setSaved] = useState("");
  const [preview, setPreview] = useState("");
  const [proving, setProving] = useState(false);
  const [brand, setBrand] = useState({
    frame: "strip",
    eventName: "",
    subtitle: "",
    signature: "",
    showTitle: false,
    primary: "#c8a25a",
    logoDataUrl: "",
    consentText: "",
  });
  const [selected, setSelected] = useState<string[]>([]);
  const [focusLook, setFocusLook] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [ready, setReady] = useState(false);
  const [promptMode, setPromptMode] = useState("user_chooses");
  const [deliveryMode, setDeliveryMode] = useState("download");
  const [name, setName] = useState("");
  const [room, setRoom] = useState<"print" | "looks" | "night">("print");
  const skipHydrate = useRef(true);
  const proofGen = useRef(0);
  const draft = useRef({
    name: "",
    selected: [] as string[],
    brand,
    isActive: true,
    videoEnabled: true,
    promptMode: "user_chooses",
    deliveryMode: "download",
  });
  draft.current = { name, selected, brand, isActive, videoEnabled, promptMode, deliveryMode };

  const origin = typeof window === "undefined" ? "" : window.location.origin;
  const kioskUrl = booth ? `${origin}/kiosk/${booth.publicToken}` : "";
  const galleryUrl = booth ? `${origin}/g/${booth.publicToken}` : "";
  const lensUrl = booth ? `${origin}/kiosk/${booth.publicToken}/lens` : "";

  useEffect(() => {
    Promise.all([
      fetch(`/api/booths/${params.id}`).then((r) => r.json()),
      fetch("/api/prompts").then((r) => r.json()),
    ]).then(([boothData, promptData]) => {
      const found = boothData.booth as Booth | undefined;
      if (!found) return;
      setBooth(found);
      setName(found.name);
      setIsActive(found.isActive);
      setVideoEnabled(found.videoEnabled);
      setPromptMode(found.promptMode);
      setDeliveryMode(found.deliveryMode);
      setPrompts(promptData.prompts || []);
      setBrand(parseBrand(found.brand || "{}"));
      try {
        setSelected(JSON.parse(found.selectedPrompts || "[]"));
      } catch {
        setSelected([]);
      }
      setReady(true);
    });
  }, [params.id]);

  useEffect(() => {
    if (!kioskUrl) return;
    QRCode.toDataURL(kioskUrl, { width: 320, margin: 1, color: { dark: "#111111", light: "#ffffff" } }).then(setQr);
  }, [kioskUrl]);

  useEffect(() => {
    if (!lensUrl) return;
    QRCode.toDataURL(lensUrl, { width: 280, margin: 1, color: { dark: "#111111", light: "#ffffff" } }).then(setLensQr);
  }, [lensUrl]);

  const selectedSet = useMemo(() => new Set(selected), [selected]);

  async function persist(overrides?: {
    selected?: string[];
    brand?: typeof brand;
    name?: string;
    isActive?: boolean;
    videoEnabled?: boolean;
    promptMode?: string;
    deliveryMode?: string;
  }) {
    if (!booth || !ready) return false;
    setSaved(studio.dress.saving);
    const snap = { ...draft.current, ...overrides };
    const parsedBrand = brandSchema.safeParse({
      ...snap.brand,
      frame: FRAME_ALIASES[snap.brand.frame] || snap.brand.frame,
    });
    if (!parsedBrand.success) {
      setSaved(parsedBrand.error.issues[0]?.message || studio.dress.saveFrameFail);
      return false;
    }
    const response = await fetch(`/api/booths/${booth.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: snap.name,
        videoEnabled: snap.videoEnabled,
        isActive: snap.isActive,
        promptMode: snap.promptMode,
        deliveryMode: snap.deliveryMode,
        selectedPrompts: snap.selected,
        brand: parsedBrand.data,
      }),
    });
    const data = await response.json().catch(() => ({}));
    setSaved(response.ok ? studio.dress.saved : data.error || studio.dress.saveFail);
    return response.ok;
  }

  function setLooks(next: string[]) {
    setSelected(next);
    draft.current = { ...draft.current, selected: next };
    void persist({ selected: next });
  }

  function updateBrand(patch: Partial<typeof brand>) {
    const next = { ...brand, ...patch };
    setBrand(next);
    draft.current = { ...draft.current, brand: next };
    void persist({ brand: next });
  }

  function mergePack(ids: string[]) {
    setLooks([...new Set([...selected, ...ids])]);
  }

  function clearLooks() {
    setLooks([]);
  }

  useEffect(() => {
    if (!ready || !booth) return;
    if (skipHydrate.current) {
      skipHydrate.current = false;
      return;
    }
    const id = window.setTimeout(() => {
      void persist();
    }, 400);
    return () => window.clearTimeout(id);
  }, [name, brand.subtitle, brand.signature, brand.eventName, brand.consentText, brand.primary]);

  useEffect(() => {
    const flush = () => {
      if (ready && booth) void persist();
    };
    const onHide = () => {
      if (document.visibilityState === "hidden") flush();
    };
    window.addEventListener("pagehide", flush);
    document.addEventListener("visibilitychange", onHide);
    return () => {
      window.removeEventListener("pagehide", flush);
      document.removeEventListener("visibilitychange", onHide);
    };
  }, [ready, booth]);

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await persist();
  }

  async function onLogo(file?: File) {
    if (!file) return;
    const logoDataUrl = await compressLogo(file);
    updateBrand({ logoDataUrl });
  }

  async function previewFrame() {
    if (!booth) return;
    const gen = ++proofGen.current;
    setProving(true);
    setSaved("");
    try {
      const response = await fetch(`/api/booths/${booth.id}/preview`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brand: draft.current.brand }),
      });
      if (gen !== proofGen.current) return;
      if (!response.ok) {
        setSaved(studio.dress.proofFail);
        return;
      }
      const blob = await response.blob();
      setPreview((current) => {
        if (current) URL.revokeObjectURL(current);
        return URL.createObjectURL(blob);
      });
    } finally {
      if (gen === proofGen.current) setProving(false);
    }
  }

  useEffect(() => {
    if (!ready || !booth || room !== "print") return;
    const id = window.setTimeout(() => {
      void previewFrame();
    }, 480);
    return () => window.clearTimeout(id);
  }, [ready, booth, room, brand.frame, brand.logoDataUrl, brand.primary, brand.signature, brand.showTitle, brand.eventName]);

  const ink = brand.primary.startsWith("#") ? brand.primary : `#${brand.primary}`;
  const packs = [
    ["Atelier", "Atelier"],
    ["XR", "XR"],
    ["Birthday", "Birthday"],
    ["Wedding", "Wedding"],
    ["Party", "Party"],
    ["Baby", "Baby"],
    ["Grad", "Grad"],
    ["Horizon", "Horizon"],
  ] as const;

  if (!booth) {
    return (
      <main className="py-16">
        <p className="eyebrow">{studio.dress.studio}</p>
        <h1 className="mt-3">{studio.dress.opening}</h1>
      </main>
    );
  }

  return (
    <form onSubmit={save}>
      <header className="studio-head">
        <div>
          <p className="eyebrow">{isActive ? studio.dress.onFloor : studio.dress.dark}</p>
          <h1>{name || studio.dress.untitled}</h1>
        </div>
        <div className="studio-actions">
          <div className="seg">
            <button type="button" data-on={isActive} onClick={() => { setIsActive(true); draft.current = { ...draft.current, isActive: true }; void persist({ isActive: true }); }}>{studio.dress.live}</button>
            <button type="button" data-on={!isActive} onClick={() => { setIsActive(false); draft.current = { ...draft.current, isActive: false }; void persist({ isActive: false }); }}>{studio.dress.darkBtn}</button>
          </div>
          {saved ? <p className="studio-saved">{saved}</p> : <p className="studio-saved text-[#9c9588]">{studio.dress.autosave}</p>}
          <button
            className="btn btn-gold"
            type="button"
            onClick={async () => {
              const ok = await persist();
              if (ok) window.location.assign(`/kiosk/${booth.publicToken}`);
            }}
          >
            {studio.dress.openKiosk}
          </button>
        </div>
      </header>

      <nav className="studio-tabs" aria-label={studio.dress.tabsAria}>
        <button type="button" data-on={room === "print"} onClick={() => setRoom("print")}>{studio.dress.tabPrint}</button>
        <button type="button" data-on={room === "looks"} onClick={() => setRoom("looks")}>{studio.dress.tabLooks}</button>
        <button type="button" data-on={room === "night"} onClick={() => setRoom("night")}>{studio.dress.tabNight}</button>
      </nav>

      {room === "print" ? (
        <div className="studio-print">
          {preview ? (
            <figure className="studio-hero">
              <img src={preview} alt={studio.dress.proofAlt} className="w-full shadow-[0_24px_80px_rgba(0,0,0,0.45)]" />
              <figcaption>{studio.dress.souvenirCaption}</figcaption>
            </figure>
          ) : (
            <FrameHero value={brand.frame} paperInk={ink} logo={brand.logoDataUrl} title={brand.signature || brand.eventName} />
          )}

          <div>
            <section className="plate">
              <p className="eyebrow">{studio.dress.event}</p>
              <h2>{studio.dress.screenSays}</h2>
              <div className="mt-6 grid gap-4">
                <label className="field-wrap">
                  <span>{studio.dress.boothName}</span>
                  <input className="field" value={name} onChange={(e) => setName(e.target.value)} placeholder={studio.dress.boothNamePh} required minLength={2} />
                </label>
                <label className="field-wrap">
                  <span>{studio.dress.kioskLine}</span>
                  <input className="field" value={brand.subtitle} onChange={(e) => setBrand({ ...brand, subtitle: e.target.value })} placeholder={studio.dress.kioskLinePh} />
                </label>
              </div>
            </section>

            <section className="plate">
              <p className="eyebrow">{studio.dress.paper}</p>
              <h2>{studio.dress.thePrint}</h2>
              <p className="plate-lead">{studio.dress.paperLead}</p>
              <div className="mt-5">
                <FrameChooser
                  className="studio-frames"
                  value={brand.frame}
                  paperInk={ink}
                  logo={brand.logoDataUrl}
                  title={brand.signature || brand.eventName}
                  onChange={(frame) => updateBrand({ frame })}
                />
              </div>
              <div className="mt-6 grid gap-4">
                <label className="field-wrap">
                  <span>{studio.dress.signature}</span>
                  <input className="field" value={brand.signature} onChange={(e) => setBrand({ ...brand, signature: e.target.value })} placeholder={studio.dress.signaturePh} maxLength={60} />
                </label>
                <label className="field-wrap">
                  <span>{studio.dress.optionalTitle}</span>
                  <input className="field" value={brand.eventName} onChange={(e) => setBrand({ ...brand, eventName: e.target.value })} placeholder={studio.dress.optionalTitlePh} maxLength={80} />
                </label>
                <div className="seg w-full">
                  <button type="button" data-on={!brand.showTitle} onClick={() => updateBrand({ showTitle: false })}>{studio.dress.markOnly}</button>
                  <button type="button" data-on={brand.showTitle} onClick={() => updateBrand({ showTitle: true })}>{studio.dress.addLine}</button>
                </div>
              </div>
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <label className="field-wrap w-auto">
                  <span>{studio.dress.ink}</span>
                  <input
                    className="h-11 w-14 cursor-pointer border border-[rgba(232,220,196,0.14)] bg-transparent p-1"
                    type="color"
                    value={ink}
                    onChange={(e) => setBrand({ ...brand, primary: e.target.value })}
                  />
                </label>
                {brand.logoDataUrl ? (
                  <figure className="mark-plate">
                    <img src={brand.logoDataUrl} alt="" />
                  </figure>
                ) : null}
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <label className="btn btn-ghost relative cursor-pointer overflow-hidden">
                  {brand.logoDataUrl ? studio.dress.replaceLogo : studio.dress.uploadLogo}
                  <input className="absolute inset-0 cursor-pointer opacity-0" type="file" accept="image/png,image/jpeg,image/webp" onChange={(e) => void onLogo(e.target.files?.[0])} />
                </label>
                <button className="btn btn-gold" type="button" disabled={proving} onClick={() => void previewFrame()}>
                  {proving ? studio.dress.makingProof : studio.dress.proofPrint}
                </button>
              </div>
            </section>
          </div>
        </div>
      ) : null}

      {room === "looks" ? (
        <div>
          <section className="plate">
            <p className="eyebrow">{studio.dress.looks}</p>
            <h2>{studio.dress.guestsTap}</h2>
            <p className="plate-lead">
              {selected.length ? studio.dress.looksCount(selected.length) : studio.dress.looksNone}
            </p>
            <div className="pack-row">
              {packs.map(([, category]) => (
                <button
                  key={category}
                  type="button"
                  className="chip"
                  onClick={() =>
                    mergePack(
                      prompts
                        .filter((item) => {
                          if (category === "Horizon") return ["Horizon", "Chad", "Tchad"].includes(item.category);
                          if (category === "XR") return ["XR", "Spatial"].includes(item.category);
                          return item.category === category;
                        })
                        .map((item) => item.id),
                    )
                  }
                >
                  {CAT_FR[category] || category}
                </button>
              ))}
              <button type="button" className="chip" onClick={() => clearLooks()}>{studio.dress.clear}</button>
            </div>
            <div className="mt-6">
              <ThemePicker
                prompts={prompts}
                selected={[...selectedSet]}
                focus={focusLook}
                onToggle={(id) => setLooks(selected.includes(id) ? selected.filter((item) => item !== id) : [...selected, id])}
                onRemove={(id) => {
                  setPrompts((current) => current.filter((item) => item.id !== id));
                  setSelected((current) => current.filter((item) => item !== id));
                  void fetch(`/api/prompts?id=${id}`, { method: "DELETE" });
                }}
              />
            </div>
          </section>
          <section className="plate">
            <LookBuilder
              onBuilt={async (prompt) => {
                const nextSelected = selected.includes(prompt.id) ? selected : [...selected, prompt.id];
                setPrompts((current) => current.some((item) => item.id === prompt.id) ? current : [...current, prompt]);
                setFocusLook(prompt.category);
                setLooks(nextSelected);
              }}
            />
          </section>
        </div>
      ) : null}

      {room === "night" ? (
        <div className="night-grid">
          <section className="plate plate-tonight">
            <p className="eyebrow">{studio.dress.tonight}</p>
            <h2>{studio.dress.ready}</h2>
            <ul className="ready-list">
              <li data-on="true">
                {FRAMES.find((item) => item.id === brand.frame)?.name || "Folio"}
                <b>{studio.dress.print}</b>
              </li>
              <li data-on="true">
                {selected.length ? studio.dress.nLooks(selected.length) : studio.dress.everyLook}
                <b>{studio.dress.looksLabel}</b>
              </li>
              <li data-on={isActive}>
                {isActive ? studio.dress.onFloor : studio.dress.stillDark}
                <b>{studio.dress.liveLabel}</b>
              </li>
            </ul>
            <p className="eyebrow mt-8">{copy.doors.fr}</p>
            <ol className="night-path">
              <li>
                <b>1</b>
                <div>
                  <strong>Photo</strong>
                  <span>{copy.pathPhoto.fr}</span>
                </div>
              </li>
              <li>
                <b>2</b>
                <div>
                  <strong>Lieu</strong>
                  <span>{promptMode === "automatic" ? copy.pathPlaceAuto.fr : copy.pathPlaceGuest.fr}</span>
                </div>
              </li>
              <li>
                <b>3</b>
                <div>
                  <strong>Cliché</strong>
                  <span>{copy.pathPrint.fr}</span>
                </div>
              </li>
            </ol>
            <button
              className="btn btn-gold mt-6 w-full"
              type="button"
              onClick={async () => {
                const ok = await persist();
                if (ok) window.location.assign(`/kiosk/${booth.publicToken}`);
              }}
            >
              {studio.dress.openKiosk}
            </button>
            <p className="plate-lead">{studio.dress.laptopIsBooth}</p>
            {qr || lensQr ? (
              <div className="qr-pair mt-6">
                {qr ? (
                  <figure>
                    <img src={qr} alt={studio.dress.kiosk} />
                    <figcaption>{studio.dress.laptop}</figcaption>
                  </figure>
                ) : null}
                {lensQr ? (
                  <figure>
                    <img src={lensQr} alt={studio.dress.phone} />
                    <figcaption>{studio.dress.phone}</figcaption>
                  </figure>
                ) : null}
              </div>
            ) : null}
            <p className="mt-4 break-all text-xs text-[#9c9588]">{kioskUrl}</p>
            <div className="night-links">
              <CopyButton value={kioskUrl} label={studio.dress.copyBooth} />
              <CopyButton value={lensUrl} label={studio.dress.copyLens} />
              <CopyButton value={galleryUrl} label={studio.dress.copyWall} />
              <Link className="btn btn-ghost" href={`/kiosk/${booth.publicToken}/lens`}>{studio.dress.openLens}</Link>
              <Link className="btn btn-ghost" href={galleryUrl}>{studio.dress.openWall}</Link>
              <Link className="btn btn-ghost" href={`${galleryUrl}?live=1`}>{studio.dress.playWall}</Link>
            </div>
          </section>

          <section className="plate">
            <p className="eyebrow">{studio.dress.run}</p>
            <h2>{studio.dress.howNight}</h2>
            <div className="mt-6 grid gap-3">
              <div className="seg w-full">
                <button type="button" data-on={promptMode === "user_chooses"} onClick={() => { setPromptMode("user_chooses"); draft.current = { ...draft.current, promptMode: "user_chooses" }; void persist({ promptMode: "user_chooses" }); }}>{studio.dress.guestPicks}</button>
                <button type="button" data-on={promptMode === "automatic"} onClick={() => { setPromptMode("automatic"); draft.current = { ...draft.current, promptMode: "automatic" }; void persist({ promptMode: "automatic" }); }}>{studio.dress.wePick}</button>
              </div>
              <div className="seg w-full">
                <button type="button" data-on={deliveryMode === "download"} onClick={() => { setDeliveryMode("download"); draft.current = { ...draft.current, deliveryMode: "download" }; void persist({ deliveryMode: "download" }); }}>{studio.dress.qrKeep}</button>
                <button type="button" data-on={deliveryMode === "email"} onClick={() => { setDeliveryMode("email"); draft.current = { ...draft.current, deliveryMode: "email" }; void persist({ deliveryMode: "email" }); }}>{studio.dress.askEmail}</button>
              </div>
              <div className="seg w-full">
                <button type="button" data-on={!videoEnabled} onClick={() => { setVideoEnabled(false); draft.current = { ...draft.current, videoEnabled: false }; void persist({ videoEnabled: false }); }}>{studio.dress.stillsOnly}</button>
                <button type="button" data-on={videoEnabled} onClick={() => { setVideoEnabled(true); draft.current = { ...draft.current, videoEnabled: true }; void persist({ videoEnabled: true }); }}>{studio.dress.addFilm}</button>
              </div>
              <label className="field-wrap mt-2">
                <span>{studio.dress.consent}</span>
                <textarea className="field min-h-24" value={brand.consentText} onChange={(e) => setBrand({ ...brand, consentText: e.target.value })} placeholder={studio.dress.consentPh} />
              </label>
            </div>
          </section>
        </div>
      ) : null}
    </form>
  );
}
