/* -------------------------------------------------------
   src/lib/maze.ts
   ----------------------------------------------------- */

export type PersonaKey =
  | "marie_curie"
  | "michelle_obama"
  | "malala_yousafzai"
  | "ada_lovelace"
  | "rosa_parks";

export interface Cell {
  walls: [0 | 1, 0 | 1, 0 | 1, 0 | 1]; // N, E, S, W
  unlockKey?: PersonaKey;              // set on five special tiles
  visited?: boolean;                   // internal flag during carving
}

/* ---------- utility ---------- */
function shuffle<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function isDeadEnd(cell: Cell) {
  return cell.walls.filter((w) => w === 1).length === 3;
}

/* ---------- maze generator ---------- */
export function generateMaze(w: number, h: number): Cell[][] {
  const grid: Cell[][] = Array.from({ length: h }, () =>
    Array.from({ length: w }, () => ({ walls: [1, 1, 1, 1] }))
  );

  function carve(x: number, y: number) {
    grid[y][x].visited = true;
    shuffle([0, 1, 2, 3]).forEach((dir) => {
      const [dx, dy] = [
        [0, -1],
        [1, 0],
        [0, 1],
        [-1, 0],
      ][dir];
      const nx = x + dx,
        ny = y + dy;
      if (
        ny >= 0 &&
        ny < h &&
        nx >= 0 &&
        nx < w &&
        !grid[ny][nx].visited
      ) {
        grid[y][x].walls[dir] = 0;              // knock out wall both sides
        grid[ny][nx].walls[(dir + 2) % 4] = 0;
        carve(nx, ny);
      }
    });
  }

  carve(0, 0);                                  // start from top-left

  /* ---------- place unlock tiles ---------- */
  const personaKeys: PersonaKey[] = [
    "marie_curie",
    "michelle_obama",
    "malala_yousafzai",
    "ada_lovelace",
    "rosa_parks",
  ];

  const allCells = grid.flat();
  const deadEnds = allCells.filter(isDeadEnd);
  shuffle(deadEnds)
    .slice(0, personaKeys.length)
    .forEach((cell, i) => (cell.unlockKey = personaKeys[i]));

  return grid;
}
