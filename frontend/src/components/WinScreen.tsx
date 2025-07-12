export default function WinScreen() {
  return (
    <div className="fixed inset-0 flex items-center justify-center">
      <div
        className="px-10 py-8 text-center"
        style={{
          background: "var(--card-bg)",
          borderRadius: "var(--card-radius)",
          boxShadow: "var(--card-shadow)",
        }}
      >
        <h1 className="text-3xl font-bold mb-2">You Unlocked Everyone! 🏆</h1>
        <p className="text-sm text-gray-600 mb-6">
          Thanks for playing this little demo.
        </p>
        <button
          className="rounded-md bg-[var(--primary)] px-6 py-2 text-white
                     transition hover:bg-[var(--primary-hover)]"
          onClick={() => window.location.reload()}
        >
          Play Again
        </button>
      </div>
    </div>
  );
}
