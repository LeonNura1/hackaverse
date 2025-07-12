/* -------------------------------------------------------
   src/hooks/useKeyboardMovement.ts
   ----------------------------------------------------- */
import { useEffect } from "react";
import { useGame }   from "../store";

export default function useKeyboardMovement() {
  const move = useGame((s) => s.move);

  useEffect(() => {
    function handle(e: KeyboardEvent) {
      /* 👇 Ignore when typing in any input/textarea/contentEditable */
      const t = e.target as HTMLElement | null;
      if (
        t &&
        (t.tagName === "INPUT" ||
          t.tagName === "TEXTAREA" ||
          t.isContentEditable)
      ) {
        return;
      }

      let dx = 0,
        dy = 0;
      switch (e.key) {
        case "ArrowUp":
        case "w":
        case "W":
          dy = -1;
          break;
        case "ArrowDown":
        case "s":
        case "S":
          dy = 1;
          break;
        case "ArrowLeft":
        case "a":
        case "A":
          dx = -1;
          break;
        case "ArrowRight":
        case "d":
        case "D":
          dx = 1;
          break;
        default:
          return; // other keys do nothing
      }

      move(dx, dy);
      e.preventDefault(); // stop page-scroll etc.
    }

    window.addEventListener("keydown", handle);
    return () => window.removeEventListener("keydown", handle);
  }, [move]);
}
