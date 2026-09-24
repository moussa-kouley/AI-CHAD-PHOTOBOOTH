"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { keepScreenAwake, pulse } from "@/lib/feel";
import { iceConfig, openLensEvents, postLens, postLensShot, type LensPacket } from "@/lib/lens-client";
import { snapPortrait } from "@/lib/snap";
import { Pair, copy } from "@/lib/kiosk-copy";
import { canUseCamera, openUserMedia } from "@/lib/camera";

export default function LensPage() {
  const { token } = useParams<{ token: string }>();
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const pendingIce = useRef<RTCIceCandidateInit[]>([]);
  const [armed, setArmed] = useState(false);
  const [live, setLive] = useState(false);
  const [facing, setFacing] = useState<"user" | "environment">("user");
  const [flash, setFlash] = useState(false);
  const [error, setError] = useState("");
  const facingRef = useRef<"user" | "environment">("user");
  facingRef.current = facing;

  useEffect(() => {
    let release: (() => void) | undefined;
    void keepScreenAwake().then((stop) => {
      release = stop;
    });
    return () => release?.();
  }, []);

  useEffect(() => {
    if (!armed) return;
    let closed = false;

    async function openCamera(next: "user" | "environment") {
      streamRef.current?.getTracks().forEach((track) => track.stop());
      const stream = await openUserMedia(next);
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        void videoRef.current.play().catch(() => undefined);
      }
      const sender = pcRef.current?.getSenders().find((item) => item.track?.kind === "video");
      const track = stream.getVideoTracks()[0];
      if (sender && track) await sender.replaceTrack(track);
      else if (pcRef.current && track) pcRef.current.addTrack(track, stream);
      await postLens(token, { type: "facing", from: "lens", facing: next });
      return stream;
    }

    async function sendOffer() {
      const pc = pcRef.current;
      if (!pc || closed) return;
      if (pc.signalingState === "have-local-offer" && pc.localDescription) {
        await postLens(token, {
          type: "offer",
          from: "lens",
          sdp: { type: pc.localDescription.type, sdp: pc.localDescription.sdp },
        });
        return;
      }
      if (pc.signalingState !== "stable") return;
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      await postLens(token, {
        type: "offer",
        from: "lens",
        sdp: pc.localDescription
          ? { type: pc.localDescription.type, sdp: pc.localDescription.sdp }
          : offer,
      });
    }

    async function snapNow() {
      const video = videoRef.current;
      if (!video) return;
      pulse("flash");
      setFlash(true);
      window.setTimeout(() => setFlash(false), 280);
      const blob = await snapPortrait(video, facingRef.current === "user");
      if (blob) await postLensShot(token, blob);
    }

    async function onPacket(packet: LensPacket) {
      if (closed || packet.from !== "kiosk") return;
      if (packet.type === "hello") {
        await sendOffer();
        return;
      }
      if (packet.type === "flip") {
        const next = facingRef.current === "user" ? "environment" : "user";
        facingRef.current = next;
        setFacing(next);
        try {
          await openCamera(next);
        } catch {
          setError(`${copy.flipFail.fr} / ${copy.flipFail.en}`);
        }
        return;
      }
      if (packet.type === "shutter") {
        await snapNow();
        return;
      }
      if (packet.type === "ice" && packet.candidate) {
        const pc = pcRef.current;
        if (!pc) return;
        if (!pc.remoteDescription) {
          pendingIce.current.push(packet.candidate);
          return;
        }
        await pc.addIceCandidate(packet.candidate).catch(() => undefined);
        return;
      }
      if (packet.type === "answer" && packet.sdp) {
        const pc = pcRef.current;
        if (!pc) return;
        await pc.setRemoteDescription(packet.sdp);
        const queued = pendingIce.current;
        pendingIce.current = [];
        for (const candidate of queued) await pc.addIceCandidate(candidate).catch(() => undefined);
      }
    }

    const pc = new RTCPeerConnection(iceConfig());
    pcRef.current = pc;
    pc.onicecandidate = (event) => {
      void postLens(token, { type: "ice", from: "lens", candidate: event.candidate ? event.candidate.toJSON() : null });
    };
    pc.onconnectionstatechange = () => {
      if (pc.connectionState === "connected") setLive(true);
      if (pc.connectionState === "failed" || pc.connectionState === "disconnected") setLive(false);
    };

    const stop = openLensEvents(token, "lens", (packet) => void onPacket(packet));

    openCamera(facingRef.current)
      .then(async () => {
        await postLens(token, { type: "hello", from: "lens" });
        await sendOffer();
      })
      .catch(() => setError(`${copy.camAllow.fr} / ${copy.camAllow.en}`));

    return () => {
      closed = true;
      stop();
      streamRef.current?.getTracks().forEach((track) => track.stop());
      pc.close();
      pcRef.current = null;
      void postLens(token, { type: "bye", from: "lens" });
    };
  }, [armed, token]);

  return (
    <main className="kiosk-shell">
      {!armed ? (
        <section className="kiosk-panel kiosk-fill justify-end px-5 pb-10">
          <p className="eyebrow">{copy.lensLive.fr}</p>
          <h1 className="mt-5 text-5xl leading-[0.94]">{copy.lensTap.fr}</h1>
          <p className="pair-fr mt-3">{copy.lensTap.en}</p>
          <p className="mt-6 max-w-sm text-[#c6bba8]">{copy.lensHint.fr}</p>
          {error ? <p className="mt-6 text-amber-200">{error}</p> : null}
          <button className="btn btn-gold mt-10 w-full" type="button" onClick={() => { setError(""); setArmed(true); }}>
            <Pair en={copy.lensTap.en} fr={copy.lensTap.fr} />
          </button>
        </section>
      ) : (
        <section className="relative min-h-dvh">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className={`absolute inset-0 h-full w-full object-cover bg-transparent ${facing === "user" ? "-scale-x-100" : ""}`}
          />
          <div className="face-guide" />
          <div className="camera-vignette" />
          {flash ? <div className="flash absolute inset-0 z-20 bg-white" /> : null}
          {live ? <p className="cam-live"><i />{copy.live.fr}</p> : null}
          <div className="camera-dock">
            <p className="eyebrow">{live ? copy.live.fr : copy.linking.fr}</p>
            <h1 className="mt-3 text-4xl leading-[1.05]">{copy.lensHold.fr}</h1>
            <p className="pair-fr mt-2">{copy.lensHold.en}</p>
            {error ? <p className="mt-4 text-sm text-[#edd9a8]">{error}</p> : null}
            <button
              className="btn btn-ghost mt-8 w-full"
              type="button"
              onClick={() => {
                const next = facing === "user" ? "environment" : "user";
                setFacing(next);
                void openUserMedia(next)
                  .then(async (stream) => {
                    streamRef.current?.getTracks().forEach((track) => track.stop());
                    streamRef.current = stream;
                    if (videoRef.current) videoRef.current.srcObject = stream;
                    const sender = pcRef.current?.getSenders().find((item) => item.track?.kind === "video");
                    const track = stream.getVideoTracks()[0];
                    if (sender && track) await sender.replaceTrack(track);
                    await postLens(token, { type: "facing", from: "lens", facing: next });
                  })
                  .catch(() => setError(copy.flipFail.fr));
              }}
            >
              <Pair en={copy.flip.en} fr={copy.flip.fr} />
            </button>
          </div>
        </section>
      )}
    </main>
  );
}
