/* -------------------------------------------------------
   src/store.ts     (zustand global state)
   ----------------------------------------------------- */
import { create } from "zustand";
import { generateMaze, type Cell } from "./lib/maze";

/* ①  — keep it exported */
export type PersonaKey =
  | "marie_curie"
  | "michelle_obama"
  | "malala_yousafzai"
  | "ada_lovelace"
  | "rosa_parks";

export interface GameState {
  maze: Cell[][];
  player: { x: number; y: number };

  unlocked: Record<PersonaKey, boolean>;
  sessions: Record<PersonaKey, string | null>;

  pendingUnlock: PersonaKey | null;  // ⬅ shown in UnlockModal

  move       : (dx: number, dy: number) => void;
  saveSession: (k: PersonaKey, id: string) => void;  // ⬅ replaces old “unlock”
}

export const useGame = create<GameState>((set, get) => ({
  maze   : generateMaze(15, 15),
  player : { x: 0, y: 0 },

  unlocked: {
    marie_curie     : false,
    michelle_obama  : false,
    malala_yousafzai: false,
    ada_lovelace    : false,
    rosa_parks      : false,
  },
  sessions: {
    marie_curie     : null,
    michelle_obama  : null,
    malala_yousafzai: null,
    ada_lovelace    : null,
    rosa_parks      : null,
  },

  pendingUnlock: null,

  move: (dx, dy) => {
    const { player, maze } = get();
    const nx = player.x + dx;
    const ny = player.y + dy;
    if (ny < 0 || ny >= maze.length || nx < 0 || nx >= maze[0].length) return;

    const dir = dx === 1 ? 1 : dx === -1 ? 3 : dy === 1 ? 2 : 0;
    if (maze[player.y][player.x].walls[dir] === 1) return;

    /* did we step on a key tile? */
    const dest = maze[ny][nx];
    set({
      player       : { x: nx, y: ny },
      pendingUnlock: dest.unlockKey ?? null,
    });
  },

  /* ② — store the backend session_id once /start returns */
  saveSession: (k, id) =>
    set((s) => ({ sessions: { ...s.sessions, [k]: id } })),
}));
