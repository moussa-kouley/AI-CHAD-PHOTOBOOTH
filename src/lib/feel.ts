export function pulse(kind: "tap" | "count" | "flash" = "tap") {
  try {
    navigator.vibrate?.(kind === "flash" ? [20, 40, 80] : kind === "count" ? 35 : 18);
  } catch {
    // some browsers block vibration
  }
  if (kind === "tap") return;
  try {
    const audio = new AudioContext();
    const tone = audio.createOscillator();
    const gain = audio.createGain();
    tone.type = "sine";
    tone.frequency.value = kind === "flash" ? 1240 : 740;
    gain.gain.value = 0.035;
    tone.connect(gain);
    gain.connect(audio.destination);
    tone.start();
    gain.gain.exponentialRampToValueAtTime(0.0001, audio.currentTime + 0.09);
    tone.stop(audio.currentTime + 0.1);
  } catch {
    // autoplay or unsupported
  }
}

export async function goBright() {
  try {
    if (!document.fullscreenElement) await document.documentElement.requestFullscreen();
  } catch {
    // kiosk browsers often block this until a later tap
  }
}

export async function keepScreenAwake() {
  let lock: WakeLockSentinel | null = null;
  async function acquire() {
    try {
      lock = (await navigator.wakeLock?.request("screen")) ?? null;
    } catch {
      lock = null;
    }
  }
  await acquire();
  const relock = () => {
    if (document.visibilityState === "visible") void acquire();
  };
  document.addEventListener("visibilitychange", relock);
  return () => {
    document.removeEventListener("visibilitychange", relock);
    void lock?.release();
  };
}
