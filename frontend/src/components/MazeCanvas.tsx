/* -------------------------------------------------------
   src/components/MazeCanvas.tsx
   ----------------------------------------------------- */
import { Stage, Layer, Rect, Line } from "react-konva";
import { useEffect, useRef, useMemo } from "react";
import Konva from "konva";
import { useGame } from "../store";

/* ─── visual settings ────────────────────────────────── */
const TILE = 48;

/* Pull CSS vars → plain strings once (safe in SSR too) */
function useThemeColours() {
  return useMemo(() => {
    const css = getComputedStyle(document.documentElement);
    const grass = css.getPropertyValue("--tile-grass").trim() || "#7ac74f";
    const key   = css.getPropertyValue("--tile-key").trim()   || "#ffd93b";
    const border= css.getPropertyValue("--tile-border").trim()|| "#3d9970";
    const player= css.getPropertyValue("--player").trim()     || "#ff4136";
    return { grass, key, border, player };
  }, []);
}

/* ----------------------------------------------------- */
export default function MazeCanvas() {
  const maze   = useGame((s) => s.maze);
  const player = useGame((s) => s.player);

  const { grass, key, border, player: playerCol } = useThemeColours();

  /* fade-in layer */
  const layerRef = useRef<Konva.Layer>(null);
  useEffect(() => {
    layerRef.current?.to({ opacity: 1, duration: 0.4 });
  }, []);

  return (
    <Stage width={maze[0].length * TILE} height={maze.length * TILE}>
      <Layer ref={layerRef} opacity={0}>
        {maze.map((row, y) =>
          row.flatMap((cell, x) => {
            const gx = x * TILE;
            const gy = y * TILE;

            /* background tile */
            const tile = (
              <Rect
                key={`tile-${x}-${y}`}
                x={gx}
                y={gy}
                width={TILE}
                height={TILE}
                fill={cell.unlockKey ? key : grass}
                stroke={border}
                strokeWidth={1}
              />
            );

            /* walls */
            const walls = ["n", "e", "s", "w"]
              .map((dir, i) =>
                cell.walls[i] ? (
                  <Line
                    key={`wall-${x}-${y}-${dir}`}
                    points={
                      dir === "n"
                        ? [gx, gy, gx + TILE, gy]
                        : dir === "e"
                        ? [gx + TILE, gy, gx + TILE, gy + TILE]
                        : dir === "s"
                        ? [gx, gy + TILE, gx + TILE, gy + TILE]
                        : /* w */ [gx, gy, gx, gy + TILE]
                    }
                    stroke="#2e4d2c"
                    strokeWidth={2}
                  />
                ) : null
              )
              .filter(Boolean);

            return [tile, ...walls];
          })
        )}

        {/* player marker */}
        <Rect
          x={player.x * TILE + 8}
          y={player.y * TILE + 8}
          width={TILE - 16}
          height={TILE - 16}
          fill={playerCol}
          cornerRadius={4}
        />
      </Layer>
    </Stage>
  );
}
