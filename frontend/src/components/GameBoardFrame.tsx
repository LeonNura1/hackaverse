/* ⬅  NOTE the `type` keyword on this import */
import type { PropsWithChildren } from "react";

export default function GameBoardFrame({ children }: PropsWithChildren) {
  return (
    <div
      className="relative p-3 rounded-[2.5rem] border-8"
      style={{
        borderColor: "var(--board-bg)",
        boxShadow: "0 0 40px rgba(0,0,0,.5)",
        background:
          "radial-gradient(circle at 30% 30%, rgba(255,255,255,.06) 0%, transparent 65%)",
      }}
    >
      {children}
    </div>
  );
}
