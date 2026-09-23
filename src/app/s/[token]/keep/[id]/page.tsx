"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Pair, copy } from "@/lib/kiosk-copy";
import { saveFramedImage, shareFramedImage, openFramedImage } from "@/lib/keep-file";
import { FILM_FILENAME, SOCIAL_FILENAME } from "@/lib/social";
import { readApiJson } from "@/lib/api-json";
import { BootScreen } from "@/components/boot-screen";
import { DevelopingStage } from "@/components/developing-stage";

type Generation = {
  id: string;
  kind: string;
  status: string;
  title: string;
  image: string | null;
  video: string | null;
};

type Session = {
  kioskPath: string | null;
  generations: Generation[];
};

export default function KeepPortraitPage() {
  const { token, id } = useParams<{ token: string; id: string }>();
  const [session, setSession] = useState<Session | null>(null);
  const [error, setError] = useState("");
  const [keeping, setKeeping] = useState(false);
  const [note, setNote] = useState("");

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
      const shot = data.session?.generations.find((item) => item.id === id);
      const pending = shot && (shot.status === "queued" || shot.status === "running");
      if (pending && !cancelled) window.setTimeout(() => void poll(), 2000);
    }
    void poll();
    return () => {
      cancelled = true;
    };
  }, [token, id]);

  const shot = session?.generations.find((item) => item.id === id);
  const file = shot?.kind === "video" ? shot.video : shot?.image;
  const filename = shot?.kind === "video" ? FILM_FILENAME : SOCIAL_FILENAME;
  const downloadUrl = file ? `${file}?download=1&name=${filename}` : "";

  async function keepOnPhone() {
    if (!file || keeping) return;
    setKeeping(true);
    setNote("");
    try {
      if (await shareFramedImage(file, filename)) {
        setNote(copy.keep.fr);
        return;
      }
      await saveFramedImage(downloadUrl || file, filename);
      setNote(copy.keep.fr);
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      openFramedImage(file);
    } finally {
      setKeeping(false);
    }
  }

  if (!session && !error) return <BootScreen label="Portrait…" />;

  return (
    <main className="keep-phone">
      <header className="keep-phone-head">
        <p className="eyebrow">{copy.keep.fr}</p>
        <h1>{shot?.title || copy.entering.fr}</h1>
        <p className="keep-phone-hint">
          <Pair en={copy.keepHint.en} fr={copy.keepHint.fr} />
        </p>
      </header>

      {error ? <p className="keep-phone-error">{error}</p> : null}

      {file ? (
        <figure className="keep-phone-frame">
          {shot?.kind === "video" ? (
            <video src={file} controls playsInline className="keep-phone-still" />
          ) : (
            <img src={file} alt={shot?.title || ""} className="keep-phone-still" />
          )}
        </figure>
      ) : shot?.status === "failed" ? (
        <p className="keep-phone-error">{copy.expired.fr}</p>
      ) : (
        <DevelopingStage compact remaining={1} />
      )}

      {file ? (
        <div className="keep-phone-actions">
          <button className="btn btn-gold camera-ready w-full" type="button" disabled={keeping} onClick={() => void keepOnPhone()}>
            <Pair en={copy.keepPhone.en} fr={copy.keepPhone.fr} />
          </button>
          <a className="btn btn-ghost w-full" href={downloadUrl} download={filename}>
            <Pair en={copy.keep.en} fr={copy.keep.fr} />
          </a>
          {note ? <p className="keep-phone-note">{note}</p> : null}
          <p className="souvenir-hold">
            <Pair en={copy.holdSave.en} fr={copy.holdSave.fr} />
          </p>
        </div>
      ) : null}

      <p className="keep-phone-back">
        <Link href={`/s/${token}`}>{copy.look.fr}</Link>
        {session?.kioskPath ? (
          <>
            {" · "}
            <Link href={session.kioskPath}>{copy.next.fr}</Link>
          </>
        ) : null}
      </p>
    </main>
  );
}
