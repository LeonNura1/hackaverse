/* src/components/UnlockModal.tsx */
import { useEffect, useState } from "react";
import { useGame, type PersonaKey } from "../store";

const API = "http://localhost:5000";

export default function UnlockModal({ charKey }: { charKey: PersonaKey }) {
  const [text, setText] = useState("");
  const [log, setLog]   = useState<{ role: "user" | "assistant"; content: string }[]>([]);
  const [loading, setLoading] = useState(false);

  /* one field per hook */
  const sessions    = useGame((s) => s.sessions);
  const saveSession = useGame((s) => s.saveSession);

  /* 1 — ensure we have a session_id */
  useEffect(() => {
    if (sessions[charKey]) return;

    (async () => {
      setLoading(true);
      try {
        const res  = await fetch(`${API}/start`, {
          method : "POST",
          headers: { "Content-Type": "application/json" },
          body   : JSON.stringify({ character: charKey }),
        });
        const data = await res.json();
        if (data.session_id) {
          saveSession(charKey, data.session_id);
          setLog([{ role: "assistant", content: data.message }]);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, [charKey, sessions, saveSession]);

  /* 2 — send chat turn */
  async function send() {
    const msg = text.trim();
    if (!msg) return;

    const sid = sessions[charKey];
    if (!sid) return;

    setLog((l) => [...l, { role: "user", content: msg }]);
    setText("");
    setLoading(true);

    try {
      const res  = await fetch(`${API}/chat`, {
        method : "POST",
        headers: { "Content-Type": "application/json" },
        body   : JSON.stringify({ session_id: sid, message: msg }),
      });
      const data = await res.json();
      setLog((l) => [...l, { role: "assistant", content: data.message }]);
    } catch {
      setLog((l) => [...l, { role: "assistant", content: "⚠️ network error" }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl w-[90vw] max-w-md shadow-xl">
        <h2 className="text-xl font-semibold mb-4 text-center capitalize">
          {charKey.replaceAll("_", " ")}
        </h2>

        {/* log */}
        <div className="h-64 overflow-y-auto border rounded-md p-3 mb-4 bg-gray-50 text-sm whitespace-pre-wrap">
          {log.map((m, i) => (
            <p key={i} className={m.role === "user" ? "text-right" : ""}>
              {m.role === "user" ? <strong>You: </strong> : null}
              {m.content}
            </p>
          ))}
          {loading && <p className="italic text-gray-500">…thinking</p>}
        </div>

        {/* input */}
        <div className="flex gap-2">
          <input
            className="flex-1 border rounded px-2 py-1"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
            placeholder="Ask your question…"
            disabled={loading || !sessions[charKey]}
          />
          <button
            className="bg-blue-600 text-white px-4 rounded disabled:opacity-40"
            onClick={send}
            disabled={loading || !text.trim() || !sessions[charKey]}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
