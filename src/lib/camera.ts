export function cameraConstraints(facing: "user" | "environment"): MediaStreamConstraints {
  return {
    audio: false,
    video: {
      facingMode: { ideal: facing },
      width: { min: 640, ideal: 1080, max: 1920 },
      height: { min: 640, ideal: 1920, max: 2560 },
      frameRate: { ideal: 30 },
    },
  };
}
