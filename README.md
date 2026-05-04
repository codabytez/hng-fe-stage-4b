# WhisperBox

A secure, end-to-end encrypted messaging web application. Messages are encrypted in the browser before they leave your device — the server stores and relays only ciphertext and never has access to your plaintext messages or private keys.

**Live demo:** <https://hng-fe-stage-4b.vercel.app>
**Repository:** <https://github.com/codabytez/hng-fe-stage-4b>

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Tech Stack](#tech-stack)
3. [Encryption Flow](#encryption-flow)
4. [Key Management](#key-management)
5. [Security Trade-offs](#security-trade-offs)
6. [Known Limitations](#known-limitations)
7. [Getting Started](#getting-started)

---

## Architecture Overview

WhisperBox is a **frontend-only** application backed by a pre-built REST + WebSocket API. All cryptographic operations happen exclusively in the browser using the native [Web Crypto API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API). No cryptographic library dependencies — zero attack surface from third-party crypto code.

```ts
┌─────────────────────────────────────────────────────────────────────┐
│                          Browser (Client)                           │
│                                                                     │
│  ┌─────────────┐    ┌──────────────────┐    ┌───────────────────┐  │
│  │  React UI   │◄──►│  Zustand Stores  │◄──►│  Web Crypto API   │  │
│  │  (Vite/TSX) │    │  (auth, crypto,  │    │  (RSA-OAEP +      │  │
│  │             │    │   presence)      │    │   AES-GCM +       │  │
│  └──────┬──────┘    └──────────────────┘    │   PBKDF2)         │  │
│         │                                   └─────────┬─────────┘  │
│         │           ┌──────────────────┐              │            │
│         │           │    IndexedDB     │◄─────────────┘            │
│         │           │  (wrapped keys)  │  persist wrapped           │
│         │           └──────────────────┘  private key              │
│         │                                                           │
│  ┌──────▼──────────────────────────────────────────────────────┐   │
│  │                   Axios + WebSocket                          │   │
│  │   • Bearer token on every request                           │   │
│  │   • Silent token refresh interceptor (401 → /auth/refresh)  │   │
│  │   • WS: wss://whisperbox.koyeb.app/ws?token=<access_token>  │   │
│  └──────┬──────────────────────────────────────────────────────┘   │
└─────────┼───────────────────────────────────────────────────────────┘
          │  HTTPS / WSS — ciphertext only, never plaintext
          ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    WhisperBox API (koyeb.app)                       │
│                                                                     │
│   /auth/*   /users/*   /conversations/*   /messages   /ws          │
│                                                                     │
│   Stores: wrapped_private_key, pbkdf2_salt, public_key (SPKI),     │
│           payload.ciphertext, payload.iv,                           │
│           payload.encryptedKey, payload.encryptedKeyForSelf         │
│                                                                     │
│   Never sees: plaintext messages, raw private keys, passwords       │
└─────────────────────────────────────────────────────────────────────┘
```

### Component Structure

```ts
src/
├── components/
│   ├── app/               # Main app UI (shell, chat, sidebar)
│   │   ├── AppShell.tsx   # Two-panel layout, mounts WebSocket
│   │   ├── Sidebar.tsx    # Conversation list + search + logout
│   │   ├── ChatPanel.tsx  # Message thread + infinite scroll
│   │   ├── ChatHeader.tsx # Contact info + E2EE badge
│   │   ├── MessageBubble.tsx
│   │   ├── MessageInput.tsx
│   │   ├── E2EEBanner.tsx
│   │   ├── Avatar.tsx
│   │   └── ConversationItem.tsx
│   ├── auth/              # Login / Register forms
│   └── ui/                # Button, Input, ConfirmModal
├── crypto/                # All cryptographic primitives
│   ├── keys.ts            # RSA-OAEP key generation + import/export
│   ├── pbkdf2.ts          # Key wrapping / unwrapping
│   ├── encrypt.ts         # Hybrid encryption (AES-GCM + RSA-OAEP)
│   └── decrypt.ts         # Hybrid decryption
├── hooks/                 # Data-fetching and side-effect hooks
│   ├── useRegister.ts
│   ├── useLogin.ts
│   ├── useConversations.ts
│   ├── useMessages.ts
│   ├── useSendMessage.ts
│   └── useWebSocket.ts
├── store/                 # Zustand state
│   ├── auth.store.ts      # User session (persisted)
│   ├── crypto.store.ts    # Live CryptoKey objects (memory only)
│   └── presence.store.ts  # Online user IDs
├── services/              # Raw API calls (Axios)
├── pages/                 # Route-level components
└── routes/                # Router config + ProtectedRoute guard
```

---

## Tech Stack

| Layer        | Technology              | Reason                                                             |
| ------------ | ----------------------- | ------------------------------------------------------------------ |
| Framework    | React 19 + TypeScript   | Component model; strong typing for crypto payloads                 |
| Build        | Vite                    | Fast HMR; no SSR footgun (SSR would risk server-side key exposure) |
| Styling      | Tailwind CSS v4         | Utility-first; no runtime style injection                          |
| Routing      | React Router v7         | Nested route guards for auth + key-ready checks                    |
| Server state | TanStack Query v5       | Caching, infinite scroll, optimistic updates                       |
| Client state | Zustand                 | Lightweight; crypto store intentionally non-persistent             |
| Cryptography | Web Crypto API (native) | Zero third-party crypto dependencies                               |
| Key storage  | IndexedDB via `idb`     | Survives page refresh; not accessible cross-origin                 |
| HTTP         | Axios                   | Interceptor-based silent token refresh                             |
| Forms        | React Hook Form + Zod   | Schema validation before any API call                              |
| Font         | Geist                   | Clean monospace-adjacent legibility                                |

---

## Encryption Flow

WhisperBox uses **hybrid encryption**: RSA-OAEP (asymmetric) to protect an ephemeral AES-GCM key, and AES-GCM (symmetric) to encrypt the actual message. This gives you the key-distribution properties of asymmetric crypto with the performance of symmetric crypto.

### Registration — Key Generation

```ts
User fills in username, display_name, password
           │
           ▼
1. Generate RSA-OAEP key pair (4096-bit) in browser
   ┌─────────────────────────────────────────────┐
   │  crypto.subtle.generateKey({                │
   │    name: 'RSA-OAEP',                        │
   │    modulusLength: 4096,                     │
   │    hash: 'SHA-256'                          │
   │  }, extractable: true,                      │
   │  usages: ['encrypt','decrypt',              │
   │           'wrapKey','unwrapKey'])            │
   └─────────────────────────────────────────────┘
           │
           ▼
2. Export public key → SPKI (base64) → sent to server

3. Wrap private key for server storage:
   a. Generate random 16-byte PBKDF2 salt
   b. Derive AES-GCM-256 wrapping key from password:
      PBKDF2(password, salt, 310,000 iterations, SHA-256)
   c. Generate random 12-byte IV
   d. Wrap private key (PKCS8) with AES-GCM:
      wrappedKey = AES-GCM-256(privateKey, wrappingKey, iv)
   e. Prepend IV to wrappedKey → base64 → sent to server

4. POST /auth/register:
   { username, display_name, password,
     public_key: <spki_b64>,
     wrapped_private_key: <iv+wrapped_b64>,
     pbkdf2_salt: <salt_b64> }

5. On success:
   • Live CryptoKey objects → Zustand crypto store (memory only)
   • {wrappedPrivateKey, pbkdf2Salt, publicKeyJwk} → IndexedDB
   • {user, refreshToken, isAuthenticated, hasKeys} → localStorage
```

### Sending a Message

```ts
User types plaintext message and hits send
           │
           ▼
1. Fetch recipient's public key:
   GET /users/{recipientId}/public-key → SPKI (base64)
   Import SPKI → CryptoKey

2. Generate ephemeral 256-bit AES-GCM key:
   crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 })

3. Encrypt message with AES-GCM:
   • Random 96-bit IV
   • ciphertext = AES-GCM(plaintext, ephemeralKey, iv)

4. Wrap ephemeral AES key twice (RSA-OAEP):
   • encryptedKey        = RSA-OAEP(ephemeralKey, recipientPublicKey)
   • encryptedKeyForSelf = RSA-OAEP(ephemeralKey, senderPublicKey)

5. POST /messages:
   {
     to: recipientId,
     payload: {
       ciphertext:         <base64>,
       iv:                 <base64>,
       encryptedKey:       <base64>,  ← for recipient
       encryptedKeyForSelf: <base64>  ← for sender to read own msgs
     }
   }

   ⚠ Network tab shows only ciphertext — plaintext never transmitted
```

### Receiving a Message

```ts
WebSocket delivers message.receive event
           │
           ▼
1. Determine role:
   isSender = (message.from_user_id === currentUser.id)

2. Select correct wrapped AES key:
   if isSender → use payload.encryptedKeyForSelf
   else        → use payload.encryptedKey

3. Unwrap AES key using own RSA private key (from Zustand):
   ephemeralKey = RSA-OAEP-unwrap(encryptedKey, myPrivateKey)

4. Decrypt ciphertext:
   plaintext = AES-GCM-decrypt(ciphertext, ephemeralKey, iv)

5. Render plaintext in UI
   On any failure → render "[encrypted message — unable to decrypt]"
   (never crash, never show partial data)
```

### Login — Key Reconstruction

```ts
User submits username + password
           │
           ▼
1. POST /auth/login → returns { access_token, refresh_token,
                                user: { public_key, wrapped_private_key,
                                        pbkdf2_salt, ... } }

2. Re-derive PBKDF2 wrapping key from password + pbkdf2_salt

3. Extract IV (first 12 bytes) from wrapped_private_key
   Unwrap private key: AES-GCM-unwrap(wrappedKey, wrappingKey, iv)

4. Import public key from SPKI

5. setKeyPair(privateKey, publicKey) → Zustand crypto store
   storeKeyMaterial(...)              → IndexedDB (for page refresh)
```

---

## Key Management

### Key Lifecycle

```ts
                      Register
                         │
                    generateKeyPair()
                         │
              ┌──────────┴──────────┐
              │                     │
         publicKey              privateKey
              │                     │
       export SPKI            wrap with PBKDF2(password)
              │                     │
      sent to server         sent to server (wrapped)
              │                     │
       stored in DB          stored in DB (never raw)
              │                     │
              └──────────┬──────────┘
                         │
                  also stored in
                    IndexedDB
                  (for offline use /
                   page refresh)
```

### Page Refresh Recovery

Because `CryptoKey` objects cannot be serialized and the crypto store is intentionally not persisted, keys are lost on every page refresh. The recovery flow:

```ts
Page loads
    │
    ▼
ProtectedRoute checks:
  isAuthenticated && hasKeys → true (from localStorage)
  cryptoStore.isReady        → false (memory was cleared)
    │
    ▼
Redirect → /key-setup

User enters password
    │
    ▼
loadKeyMaterial() from IndexedDB
    │
    ├── No material found → /key-lost (keys unrecoverable)
    │
    └── Material found:
        unwrapPrivateKey(wrappedKey, salt, password)
            │
            ▼ (wrong password → show error, stay on screen)
            ▼ (correct password)
        importPublicKeyFromJwk(publicKeyJwk)
            │
            ▼
        setKeyPair → Zustand
            │
            ▼
        /key-ready → redirect to /
```

### Storage Map

| Data                                              | Where                  | Persisted                           |
| ------------------------------------------------- | ---------------------- | ----------------------------------- |
| `access_token`                                    | Zustand (memory)       | No — intentional; lost on refresh   |
| `refresh_token`                                   | Zustand + localStorage | Yes — used to get new access tokens |
| `isAuthenticated`, `hasKeys`                      | Zustand + localStorage | Yes                                 |
| `privateKey`, `publicKey` (live `CryptoKey`)      | Zustand (memory)       | No — cannot serialize `CryptoKey`   |
| `wrappedPrivateKey`, `pbkdf2Salt`, `publicKeyJwk` | IndexedDB              | Yes — used for key reconstruction   |
| Plaintext messages                                | Nowhere                | Never stored                        |

### Token Refresh

Access tokens expire after 15 minutes. The Axios response interceptor handles this transparently:

```ts
Request → 401 response
    │
    ▼
interceptor fires (deduplicated — one refresh at a time)
    │
    ▼
POST /auth/refresh { refresh_token }
    │
    ├── success → store new access_token, retry original request
    └── failure → logout() → redirect to /login
```

---

## Security Trade-offs

### What this design achieves

- **Zero plaintext on the wire.** Every message is AES-GCM encrypted before the HTTP request is made. The server stores and relays only base64-encoded ciphertext.
- **Zero raw private key on the server.** The private key is wrapped (encrypted) with a key derived from the user's password via PBKDF2 before it leaves the browser. The server cannot unwrap it without the user's password.
- **Forward-secrecy per message.** Each message uses an independently generated ephemeral AES-GCM key. Compromising one message's AES key does not affect any other message.
- **Sender can read own messages.** The ephemeral AES key is wrapped twice — once with the recipient's public key and once with the sender's own public key (`encryptedKeyForSelf`). This is required because the sender cannot decrypt their own messages otherwise (RSA-OAEP encryption is not deterministic).
- **Replay protection.** An in-memory sliding-window cache (`utils/replay.ts`) rejects messages with duplicate IDs or timestamps older than 5 minutes.

### Accepted trade-offs

| Trade-off                                                                                                                                                                                     | Reason                                                                                                                  |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| **Password = key.** Changing your password without re-encrypting all messages would make them unreadable. Password resets are not supported.                                                  | Fundamental property of password-based key wrapping — no server-side recovery possible by design.                       |
| **Single device.** Keys are stored in IndexedDB of the current browser. Signing in from a new browser re-derives keys from the server-stored wrapped key, but requires the original password. | Cross-device sync would require either a key server (defeats E2EE) or manual key export/import (out of scope).          |
| **No message deletion.** Deleting a message from the server doesn't guarantee deletion from the recipient's decrypted view or cached data.                                                    | The API does not expose a delete endpoint; enforcing deletion in E2EE systems is a hard problem.                        |
| **PBKDF2 over Argon2.** PBKDF2 with 310,000 iterations (SHA-256) is used because Web Crypto API does not support Argon2 natively.                                                             | Argon2 is memory-hard and preferable, but would require a WASM dependency.                                              |
| **4096-bit RSA-OAEP.** Larger key size means slower key generation (~1–3s) on registration.                                                                                                   | 4096-bit provides a larger security margin than 2048-bit. The delay is a one-time cost.                                 |
| **`access_token` in memory only.** A page refresh means the first API call gets a 401 and must silently refresh. There is a brief extra round-trip.                                           | Storing access tokens in localStorage or cookies exposes them to XSS or CSRF respectively. Memory is the safest option. |

---

## Known Limitations

1. **IndexedDB cleared = keys lost forever.** If the user clears browser storage (DevTools → Application → Clear site data), the IndexedDB entry for their wrapped key is deleted. The only recovery is signing in from another device that still has the IndexedDB entry, or re-registering (all previous messages become permanently unreadable). The app handles this gracefully with the `/key-lost` screen.

2. **No multi-tab support.** The in-memory crypto store (`useCryptoStore`) is not shared across browser tabs. Opening WhisperBox in a second tab requires re-entering the password on that tab.

3. **WebSocket reconnection.** The WebSocket connection is established once on mount. If the connection drops (network interruption), it is not automatically re-established until the user refreshes the page. Messages sent during the disconnection are not missed because the API flushes undelivered messages on the next WS connect.

4. **No read receipts.** The API does not expose a read-receipt mechanism. The delivery tick (✓) in the UI indicates the message was accepted by the server, not that it was read or decrypted by the recipient.

5. **No file attachments.** The attachment button in the message input is present in the UI but disabled. File encryption would require additional design (streaming AES-GCM, chunking) beyond the current scope.

6. **Key regeneration destroys message history.** If a user regenerates their RSA key pair (not currently exposed in the UI), all previous messages become permanently unreadable — there is no way to re-encrypt historical messages encrypted for the old public key.

7. **No perfect forward secrecy at the session level.** While each message uses an ephemeral AES key, the long-lived RSA key pair is reused across all messages. Compromise of the RSA private key would allow decryption of all past messages (since the ephemeral AES keys are stored alongside the ciphertext, wrapped with the RSA key). True PFS would require a Signal-style double-ratchet protocol.

8. **Username enumeration.** The `GET /users/search` endpoint returns users by username/display name. This is intentional (you need to find people to message them) but means usernames are discoverable.

---

## Getting Started

### Prerequisites

- Node.js 22+
- pnpm

### Install & run

```bash
git clone https://github.com/codabytez/hng-fe-stage-4b.git
cd hng-fe-stage-4b
pnpm install
pnpm dev
```

App runs at `http://localhost:5173`.

### Build

```bash
pnpm build
```

Output in `dist/`. Deploy the `dist/` folder to any static host (Vercel, Netlify, Cloudflare Pages).

### Environment

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

| Variable         | Default                            | Description          |
| ---------------- | ---------------------------------- | -------------------- |
| `VITE_API_URL`   | `https://whisperbox.koyeb.app`     | Backend base URL     |
| `VITE_WS_URL`    | `wss://whisperbox.koyeb.app/ws`    | WebSocket URL        |
