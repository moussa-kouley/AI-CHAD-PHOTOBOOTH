"use client";

import { useCallback, useEffect, useRef, useState, type RefObject } from "react";
import {
  iceConfig,
  openLensEvents,
  postLens,
  waitForLensShot,
  type LensPacket,
} from "./lens-client";

export function useBoothLens(token: string | undefined, videoRef: RefObject<HTMLVideoElement | null>) {
  const [live, setLive] = useState(false);
  const [facing, setFacing] = useState<"user" | "environment">("user");
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const remoteRef = useRef<MediaStream | null>(null);
  const pendingIce = useRef<RTCIceCandidateInit[]>([]);

  const attach = useCallback((stream?: MediaStream | null) => {
    const next = stream || remoteRef.current;
    if (!next || !videoRef.current) return;
    videoRef.current.srcObject = next;
    void videoRef.current.play().catch(() => undefined);
  }, [videoRef]);

  useEffect(() => {
    if (!token) return;
    let closed = false;

    function ensurePc() {
      if (pcRef.current && pcRef.current.signalingState !== "closed") return pcRef.current;
      const pc = new RTCPeerConnection(iceConfig());
      pc.onicecandidate = (event) => {
        void postLens(token!, {
          type: "ice",
          from: "kiosk",
          candidate: event.candidate ? event.candidate.toJSON() : null,
        });
      };
      pc.ontrack = (event) => {
        const stream = event.streams[0] || new MediaStream([event.track]);
        remoteRef.current = stream;
        setLive(true);
        attach(stream);
      };
      pc.onconnectionstatechange = () => {
        if (pc.connectionState === "connected") setLive(true);
        if (pc.connectionState === "failed" || pc.connectionState === "disconnected" || pc.connectionState === "closed") {
          window.setTimeout(() => {
            if (pcRef.current === pc && pc.connectionState !== "connected") setLive(false);
          }, 1800);
        }
      };
      pcRef.current = pc;
      return pc;
    }

    async function onPacket(packet: LensPacket) {
      if (closed || packet.from !== "lens") return;
      if (packet.type === "facing" && packet.facing) setFacing(packet.facing);
      if (packet.type === "bye") {
        setLive(false);
        remoteRef.current = null;
        pcRef.current?.close();
        pcRef.current = null;
        return;
      }
      if (packet.type === "hello") {
        void postLens(token!, { type: "hello", from: "kiosk" });
        return;
      }
      if (packet.type === "ice" && packet.candidate) {
        const pc = ensurePc();
        if (!pc.remoteDescription) {
          pendingIce.current.push(packet.candidate);
          return;
        }
        await pc.addIceCandidate(packet.candidate).catch(() => undefined);
        return;
      }
      if (packet.type === "offer" && packet.sdp) {
        const pc = ensurePc();
        await pc.setRemoteDescription(packet.sdp);
        const queued = pendingIce.current;
        pendingIce.current = [];
        for (const candidate of queued) await pc.addIceCandidate(candidate).catch(() => undefined);
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        await postLens(token!, {
          type: "answer",
          from: "kiosk",
          sdp: pc.localDescription ? { type: pc.localDescription.type, sdp: pc.localDescription.sdp } : answer,
        });
      }
    }

    const stop = openLensEvents(token, "kiosk", (packet) => void onPacket(packet));
    void postLens(token, { type: "hello", from: "kiosk" });

    return () => {
      closed = true;
      stop();
      pcRef.current?.close();
      pcRef.current = null;
    };
  }, [token, attach]);

  const sendFlip = useCallback(() => {
    if (!token || !live) return;
    void postLens(token, { type: "flip", from: "kiosk" });
  }, [token, live]);

  const shutter = useCallback(async () => {
    if (!token || !live) return null;
    await postLens(token, { type: "shutter", from: "kiosk" });
    return waitForLensShot(token, 8000);
  }, [token, live]);

  return { live, facing, attach, sendFlip, shutter, remoteStream: remoteRef };
}
