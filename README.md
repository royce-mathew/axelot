<div align="center">

<img src="public/axolotl.svg" alt="Axelot" width="160" />

# Axelot

<strong>Collaborative, AI‑augmented document & knowledge workspace powered by Next.js 16, Firebase, Yjs & TipTap.</strong>

[![CI Status](https://img.shields.io/badge/build-passing-brightgreen?style=flat-square)](#)
[![License: AGPL v3](https://img.shields.io/badge/License-AGPL_v3-blue.svg?style=flat-square)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square)](#)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square)](#)
[![Firebase](https://img.shields.io/badge/Firebase-Admin%20&%20Client-FFCA28?style=flat-square)](#)
[![Yjs](https://img.shields.io/badge/CRDT-Yjs-007acc?style=flat-square)](#)

</div>

## Table of Contents

- [Overview](#overview)
- [Quick Start](#quick-start)
- [Environment & API keys](#environment--api-keys)
- [Architecture](#architecture)
- [Trending Algorithm](#trending-algorithm)
- [Security Notes](#security-notes)
- [Contribution Guidelines](#contribution-guidelines)
- [License](#license)

## Overview

Axelot is a modern, real‑time collaborative document platform combining:

- Rich text editing (TipTap 3) with tables, math (KaTeX), code blocks & autocompletion.
- AI assisted content generation & transformation via OpenRouter models.
- Multi‑provider authentication (Google, GitHub, Email/Password) with enforced email verification.
- Real‑time presence & conflict‑free syncing (Yjs + WebRTC + Firestore persistence).
- Trending discovery, user dashboards, search and profile pages.

## Quick Start

```bash
pnpm install
cp .env.local.example .env.local # then fill in required values
pnpm dev
```

Navigate to http://localhost:3000.

### Environment & API keys

This project requires several API keys and credentials. Copy `.env.local.example` to `.env.local` and fill in the values before running the app locally or deploying.

```bash
cp .env.local.example .env.local
```

Below are short instructions for obtaining each key and how to set them (original content preserved and extended):

- **NEXTAUTH_SECRET**
  - Used by NextAuth to sign session cookies. Generate a random 32-byte base64 string:
    - macOS / Linux / WSL / Git Bash:
      ```bash
      openssl rand -base64 32
      ```
    - PowerShell (Windows):
      ```powershell
      [Convert]::ToBase64String((1..32|%{Get-Random -Maximum 256}) -as [byte[]])
      ```

- **Google OAuth (AUTH_GOOGLE_ID, AUTH_GOOGLE_SECRET)**
  - Google Cloud Console → APIs & Services → Credentials → Create Credentials → OAuth client ID.
  - App type: Web application. Redirect URI: `http://localhost:3000/api/auth/callback/google` (plus production URL later).
  - Paste values into env vars.

- **GitHub OAuth (AUTH_GITHUB_ID, AUTH_GITHUB_SECRET)**
  - GitHub → Settings → Developer settings → OAuth Apps → New OAuth App.
  - Callback URL: `http://localhost:3000/api/auth/callback/github` (add production later).
  - Paste values into env vars.

- **Firebase client config (NEXT*PUBLIC_FIREBASE*\*)**
  - Firebase Console → Project settings → Your apps → Web app config.
  - Copy apiKey, authDomain, projectId, storageBucket, messagingSenderId, appId.
  - Public values (safe in client bundle).

- **Firebase Admin SDK (FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY, FIREBASE_PROJECT_ID)**
  - Firebase Console → Project settings → Service accounts → Generate new private key (JSON).
  - Set `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, and format `FIREBASE_PRIVATE_KEY` with newline escapes:
    ```env
    FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEv...\n-----END PRIVATE KEY-----\n"
    ```
  - Keep secret: never commit.

- **NEXT_PUBLIC_ANALYTICS_ID**
  - Optional Google Analytics / GA4 Measurement ID.

- **CRON_SECRET**
  - Random string protecting cron endpoint. Supply in Vercel project env + local dev.

- **OPENROUTER_API_KEY**
  - Obtain from OpenRouter (or compatible gateway) & paste.

### Docker

This project includes a production-ready Dockerfile based on Next.js' official "with-docker" example, adapted for pnpm and standalone output.

Build and run locally:

```powershell
docker build -t axelot:dev .
docker run --rm -p 3000:3000 --env-file .env.local axelot:dev
```

Notes:

- Do not bake secrets into images; supply env via `--env-file` or your platform's secret manager.
- Container binds to `0.0.0.0:3000`.

## Architecture

High‑level flow:

1. User authenticates through NextAuth (OAuth or credentials). Credentials flow validates against Firestore `users` + `credentials` collections; verified email required.
2. A Firebase custom token is minted server‑side and attached to the session for secure client SDK usage.
3. Document editing uses TipTap bound to a Yjs document; Yjs sync layer uses WebRTC for peer mesh and can persist snapshots/metadata in Firestore.
4. AI endpoints proxy to OpenRouter streaming completions (serverless route handler streaming Response.body).
5. Trending computation cron (Vercel) calls a protected route updating scores based on recency, views and activity.
6. Frontend pages under `src/app/(app)` provide dashboard, search, stories, per‑user documents, etc.

### Data & Realtime Components

- Firestore collections: `users`, `credentials`, `documents` (inferred), trending metadata fields: `viewCount`, `trendingScore`, `trendingLastComputed`, timestamps.
- Yjs provider utilities in `src/lib/y-fire/` manage awareness, graph propagation & WebRTC signaling.

## Mermaid Diagrams

TipTap includes Mermaid diagram support for authoring and preview:

- Author mode: insert a Mermaid block via Insert → “Mermaid Diagram” or type ```mermaid then Enter. You’ll see and edit the code only.
- Preview/read‑only mode: the Mermaid code block is hidden; only the rendered diagram is shown.
- Theme awareness: diagrams render in light/dark to match the app theme.

Example snippet:

```mermaid
flowchart TD
  A[Start] --> B{Choice}
  B -->|Yes| C[Continue]
  B -->|No| D[Stop]
```

## Trending Algorithm

The trending score (see `src/lib/trending-algorithm.ts`) blends recency, logarithmic view scaling, and activity boosts:

- Recency decay: recent updates get temporary boosts.
- View count: `log10(views + 1) * 4` caps runaway popularity.
- Activity: additional boost for fresh edits (first 1–6 hours).
  Cron job periodically recalculates selective or full sets via `/api/trending/update` with modes `all | recent | stats`.

## Cron & Background Jobs

- Defined in `vercel.json`:
  ```json
  {
    "crons": [
      { "path": "/api/trending/update?mode=recent", "schedule": "0 0 * * *" }
    ]
  }
  ```
- Protected by `Authorization: Bearer <CRON_SECRET>` header.
- Manual trigger supported via GET/POST.

## Security Notes

- Credentials provider enforces email verification before login success.
- Firestore Admin private key kept only in env (AGPL implies network users get source, not secrets).
- Cron endpoint guarded by secret bearer token.
- Passwords hashed with bcryptjs; Zod schema validation to mitigate malformed input.
- JWT session enrichment adds `firebaseToken` for secure client SDK access.

## Contribution Guidelines

1. Fork & create a feature branch (`feat/your-thing`).
2. Add or update tests/docs where relevant (future improvement area: add formal test suite; currently focus on type safety).
3. Run `pnpm lint` and `pnpm format` before committing.
4. Conventional commits encouraged (Commitlint enforced). Example: `feat(editor): add math inline rendering`.
5. Open a PR; describe motivation & screenshots if UI related.

## License

Distributed under the AGPL-3.0 License. See `LICENSE` for more information.
