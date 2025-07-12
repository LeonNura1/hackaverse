# hackaverse

## 1. create / activate your venv
python -m venv venv
source venv/bin/activate      # Windows: venv\Scripts\activate

## 2. install everything
pip install -r requirements.txt

# Trailblazer Chat – API Reference

> Local Flask backend powered by Ollama (Llama 3 or compatible model)

---

## Base URL

```
http://localhost:5000
```

(Replace host/port if you deploy elsewhere.)

---

## Endpoints

| Method   | Path          | Purpose                                                   |
| -------- | ------------- | --------------------------------------------------------- |
| **GET**  | `/characters` | List all available personas (key & display name).         |
| **POST** | `/start`      | Begin a chat session for a chosen persona & get greeting. |
| **POST** | `/chat`       | Continue the conversation; can switch persona mid‑chat.   |

---

### 1 · `GET /characters`

```http
GET /characters
```

**Response – 200 OK**

```json
[
  { "key": "marie_curie",      "display": "Marie Curie" },
  { "key": "michelle_obama",   "display": "Michelle Obama" },
  { "key": "malala_yousafzai", "display": "Malala Yousafzai" },
  { "key": "ada_lovelace",     "display": "Ada Lovelace" },
  { "key": "rosa_parks",       "display": "Rosa Parks" }
]
```

---

### 2 · `POST /start`

```http
POST /start
Content-Type: application/json
```

```json
{
  "character": "michelle_obama"
}
```

| Field       | Type   | Required | Notes                                                                    |
| ----------- | ------ | -------- | ------------------------------------------------------------------------ |
| `character` | string | yes      | Persona key from `/characters`. Defaults to **marie\_curie** if omitted. |

**Response – 200 OK**

```json
{
  "session_id": "8c5bfce0e95f4d34b7c54560c8e6b977",
  "message": "Hello there! I'm delighted to chat with you…"
}
```

---

### 3 · `POST /chat`

```http
POST /chat
Content-Type: application/json
```

```json
{
  "session_id": "8c5bfce0e95f4d34b7c54560c8e6b977",
  "message": "What advice do you have for young women entering tech?",
  "character": "ada_lovelace"  // optional switch
}
```

| Field        | Type   | Required | Notes                                     |
| ------------ | ------ | -------- | ----------------------------------------- |
| `session_id` | string | yes      | ID returned by **/start**.                |
| `message`    | string | yes      | User’s prompt.                            |
| `character`  | string | no       | Switch persona for this and future turns. |

**Response – 200 OK**

```json
{
  "character": "Michelle Obama",
  "message": "First, know that your voice matters and your ideas have value…",
  "note": "Switched to Ada Lovelace."  // only present when switching
}
```

---

## Error responses

| Status | Example cause                         | Body                               |
| ------ | ------------------------------------- | ---------------------------------- |
| 400    | unknown character, invalid session ID | `{ "error": "unknown character" }` |
| 500    | LLM backend error (model won’t load)  | `{ "error": "internal" }`          |

---

### Curl quick‑start

```bash
# Start a session with Michelle Obama
aid=$(curl -s -X POST http://localhost:5000/start \
          -H "Content-Type: application/json" \
          -d '{"character":"michelle_obama"}' | jq -r .session_id)

# Ask a question
curl -s -X POST http://localhost:5000/chat \
     -H "Content-Type: application/json" \
     -d "{\"session_id\":\"$aid\",\"message\":\"Any advice?\"}" | jq
```
