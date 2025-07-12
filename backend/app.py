# ────────────────────────────────────────────────────────────────
#  Trailblazer Chat  —  Flask backend powered by *local* Ollama
# ────────────────────────────────────────────────────────────────
"""
Prereqs
───────
1. Install Ollama →  https://ollama.com/download
2. Pull a model once (e.g. 8-b Llama 3)         →  `ollama pull llama3:8b`
3. Start the Ollama REST server                 →  `ollama serve`
4. In another terminal:  pip install flask flask-cors openai
5. Run this file:                               →  python app.py

Endpoints
──────────
GET  /characters                       → list personas
POST /start      {character key}       → new session + greeting
POST /chat       {session_id, message,
                  [character]}         → chat + (optional) persona switch
"""

import os, uuid, openai
from typing import Dict, List
from flask import Flask, request, jsonify
from flask_cors import CORS

# ───────────────────────────
#  1.  Point OpenAI client at Ollama
# ───────────────────────────
openai.api_key  = "ollama-local"               # dummy string
openai.base_url = "http://127.0.0.1:11434/v1/"  # Ollama’s OpenAI-style API
MODEL_NAME      = "llama3:latest"                     # or "llama3:8b", "phi3:mini", …

# ───────────────────────────
#  2.  Personas
# ───────────────────────────
CHARACTERS: Dict[str, Dict[str, str]] = {
    "marie_curie": {
        "display": "Marie Curie",
        "system": (
            "You are Marie Curie (1867-1934), the pioneering physicist and chemist "
            "who discovered radioactivity and won two Nobel Prizes. You speak with "
            "humility, scientific precision, and a gentle, encouraging tone. Use "
            "first-person singular (‘I’). Reference historical events only up to "
            "1934; discuss modern topics hypothetically. Keep replies under 150 words."
        ),
    },
    "michelle_obama": {
        "display": "Michelle Obama",
        "system": (
            "You are Michelle Obama (born 1964), lawyer, author, and former First "
            "Lady of the United States. You speak warmly and motivationally, "
            "encouraging young people—especially women—to pursue education and "
            "healthy living. Use first-person singular (‘I’). Keep replies under "
            "150 words."
        ),
    },
    "malala_yousafzai": {
        "display": "Malala Yousafzai",
        "system": (
            "You are Malala Yousafzai (born 1997), Pakistani activist for girls’ "
            "education and the youngest Nobel laureate. You speak with clarity, "
            "hope, and unwavering commitment to education and human rights. Use "
            "first-person singular. Replies ≤150 words."
        ),
    },
    "ada_lovelace": {
        "display": "Ada Lovelace",
        "system": (
            "You are Ada Lovelace (1815-1852), English mathematician known for your "
            "work on Charles Babbage's Analytical Engine—considered the first "
            "computer programmer. You speak with intellectual curiosity and "
            "Victorian-era politeness. Use first-person singular. Replies ≤150 words."
        ),
    },
    "rosa_parks": {
        "display": "Rosa Parks",
        "system": (
            "You are Rosa Parks (1913-2005), American civil-rights activist whose "
            "refusal to give up her bus seat became pivotal in the civil-rights "
            "movement. You speak calmly, firmly, and with moral clarity, encouraging "
            "equality and perseverance. Use first-person singular. Replies ≤150 words."
        ),
    },
}
DEFAULT_CHAR = "marie_curie"

# ───────────────────────────
#  3.  In-memory session store
# ───────────────────────────
SESSIONS: Dict[str, Dict[str, List[Dict[str, str]]]] = {}
MAX_TURNS = 12  # keep token context small

# ───────────────────────────
#  4.  Local-LLM helper
# ───────────────────────────
def call_llm(system_prompt: str, history: List[Dict[str, str]]) -> str:
    """Send chat history to the local Llama via Ollama/OpenAI protocol."""
    messages = [{"role": "system", "content": system_prompt}] + history
    resp = openai.chat.completions.create(
        model=MODEL_NAME,
        messages=messages,
        max_tokens=220,
        temperature=0.7,
        top_p=0.95,
    )
    return resp.choices[0].message.content.strip()

# ───────────────────────────
#  5.  Flask app & routes
# ───────────────────────────
app = Flask(__name__)
CORS(app)

@app.get("/characters")
def list_chars():
    return jsonify([{"key": k, "display": v["display"]} for k, v in CHARACTERS.items()])

@app.post("/start")
def start():
    data = request.get_json(force=True) or {}
    char_key = data.get("character", DEFAULT_CHAR)
    if char_key not in CHARACTERS:
        return jsonify({"error": "unknown character"}), 400

    session_id = uuid.uuid4().hex
    SESSIONS[session_id] = {"character": char_key, "history": []}

    greeting = call_llm(
        CHARACTERS[char_key]["system"],
        [{"role": "user", "content": "Please greet me briefly."}],
    )
    return jsonify({"session_id": session_id, "message": greeting})

@app.post("/chat")
def chat():
    data       = request.get_json(force=True) or {}
    session_id = data.get("session_id")
    user_msg   = (data.get("message") or "").strip()

    if session_id not in SESSIONS:
        return jsonify({"error": "invalid session"}), 400
    if not user_msg:
        return jsonify({"error": "empty message"}), 400

    # Optional persona switch
    new_char   = data.get("character")
    switch_note = None
    if new_char:
        if new_char not in CHARACTERS:
            return jsonify({"error": "unknown character"}), 400
        SESSIONS[session_id]["character"] = new_char
        switch_note = f"Switched to {CHARACTERS[new_char]['display']}."

    # Append user turn
    hist = SESSIONS[session_id]["history"]
    hist.append({"role": "user", "content": user_msg})

    char_key = SESSIONS[session_id]["character"]
    assistant_msg = call_llm(CHARACTERS[char_key]["system"], hist)

    hist.append({"role": "assistant", "content": assistant_msg})
    SESSIONS[session_id]["history"] = hist[-MAX_TURNS:]

    resp = {"character": CHARACTERS[char_key]["display"], "message": assistant_msg}
    if switch_note:
        resp["note"] = switch_note
    return jsonify(resp)

# ───────────────────────────
#  6.  Run
# ───────────────────────────
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.getenv("PORT", 5000)), threaded=True)
