# WordLogic – Design Documentation: Sharing & Security

## 1. Goals & Requirements

This document outlines how to implement URL Sharing and Security for the WordLogic word game.

### Objectives:
- Allow users to share their game state via a URL.
- Ensure the recipient loads the same game state independently.
- The original player’s session should remain unaffected.
- The target word must never be discoverable** on the client.
- The URL must not expose the answer or game logic.

---

## 2. Architecture Overview

- The server is authoritative. It handles all scoring, session logic, and word management.
- The client is responsible only for input, rendering, and state transitions based on server responses.
- All shared game state is stored server-side. The client only receives a generated `shareId`.

---

## 3. Core Entities

| Entity     | Description |
|------------|-------------|
| `Session`  | Holds the current game state (rounds, used words, score) |
| `Round`    | Stores the word (server-only), guesses, and scoring result |
| `Snapshot` | A clone of a game state (excluding the word), used for sharing |
| `shareId`  | Opaque, secure ID (128-bit or UUID) that maps to a saved snapshot |

---

## 3. Key API Endpoints

| Endpoint               | Method | Description |
|------------------------|--------|-------------|
| `/api/session`         | POST   | Start a new session; server picks a random word |
| `/api/guess`           | POST   | Submit a guess; server returns letter states |
| `/api/next-round`      | POST   | Advance to next round |
| `/api/share`           | POST   | Save snapshot and return a unique `shareId` |
| `/api/share/:shareId`  | GET    | Load a shared snapshot and start a new session |

---

## 4. Data Flow

### Sharing Flow
1. Client sends `POST /api/share`
2. Server saves a copy of current session (excluding word)
3. Server returns `shareId`
4. Client generates URL like `/play/s/abc123`

### Receiving Flow
1. Recipient opens `/play/s/abc123`
2. Client sends `GET /api/share/abc123`
3. Server creates a new session from snapshot
4. Recipient sees shared game state and can continue

---

## 5. Security Considerations

- The target word is stored only on the server.
- All guess evaluations are done server-side.
- The client receives only per-cell result states (correct/present/absent).
- The `shareId` is a securely generated opaque ID.
- URLs contain no decodable or meaningful game state.
- Additional measures:
  - Rate limiting on guess submission endpoints.
  - Token signing to validate sessions.
  - Input validation and error logging.

---

## 6. Effort Estimates

| Task                               | Hours |
|------------------------------------|--------|
| Server setup (Express, storage)    | 4–6h   |
| Session & word state management    | 4–5h   |
| Snapshot & sharing logic           | 3–5h   |
| Client API integration (RTK Query) | 4–6h   |
| Security features (rate limit, etc.)| 3–4h  |
| Total Estimate                     | 19–29h |

---

This design enables a scalable and secure way to extend the POC into a fully sharable and production-ready game architecture.