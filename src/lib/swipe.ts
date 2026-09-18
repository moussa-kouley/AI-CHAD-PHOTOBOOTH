import { useRef } from "react";

export function useSwipe(onLeft: () => void, onRight: () => void) {
  const x = useRef(0);
  return {
    onTouchStart(event: { changedTouches: ArrayLike<{ clientX: number }> }) {
      x.current = event.changedTouches[0].clientX;
    },
    onTouchEnd(event: { changedTouches: ArrayLike<{ clientX: number }> }) {
      const dx = event.changedTouches[0].clientX - x.current;
      if (Math.abs(dx) < 56) return;
      if (dx > 0) onRight();
      else onLeft();
    },
  };
}
