import MazeCanvas          from "./components/MazeCanvas";
import UnlockModal         from "./components/UnlockModal";
import WinScreen           from "./components/WinScreen";
import { useGame }         from "./store";
import useKeyboardMovement from "./hooks/useKeyboardMovement";

/* 🔧 fixed path spelling */
import GameBoardFrame from "./components/GameBoardFrame";

export default function App() {
  useKeyboardMovement();

  const unlocked      = useGame((s) => s.unlocked);
  const pendingUnlock = useGame((s) => s.pendingUnlock);

  const allDone = Object.values(unlocked).every(Boolean);

  return (
    <div
      className="w-screen h-screen flex items-center justify-center"
      style={{ background: "var(--bg-dark)" }}
    >
      {!allDone && (
        <GameBoardFrame>
          <MazeCanvas />
        </GameBoardFrame>
      )}
      {pendingUnlock && <UnlockModal charKey={pendingUnlock} />}
      {allDone && <WinScreen />}
    </div>
  );
}
