<!--
  Axelot API & Platform Reference (Enterprise Grade)
  This document intentionally verbose (~5x baseline) to enable onboarding,
  auditing, and integration work across engineering, security, data, and SRE.
-->

<div align="center">
  <h1>Axelot Platform & API Reference</h1>
  <i>Collaborative editing, AI augmentation, and real‑time at scale</i>
  <br/>
  <br/>
  <a href="https://nextjs.org/"><img alt="Next.js" src="https://img.shields.io/badge/Next.js-16.0.3-black?logo=nextdotjs" /></a>
  <a href="https://www.typescriptlang.org/"><img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white" /></a>
  <a href="https://firebase.google.com/docs/admin/setup"><img alt="Firebase Admin" src="https://img.shields.io/badge/Firebase%20Admin-13.6-FFCA28?logo=firebase&logoColor=black" /></a>
  <a href="./LICENSE"><img alt="License" src="https://img.shields.io/badge/License-AGPL--3.0-blue.svg" /></a>
  <img alt="Vercel Cron" src="https://img.shields.io/badge/Cron-Vercel-000000?logo=vercel&logoColor=white" />
  <img alt="PRs welcome" src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg" />
  <br/>
  <sub>
    <b>Quick Links:</b>
    <a href="#http-endpoints-inventory">Endpoints</a> •
    <a href="#endpoint-specifications">Specs</a> •
    <a href="#authentication--identity">Auth</a> •
    <a href="#data-model-firestore-collections">Data Model</a> •
    <a href="#real-time-collaboration-protocol-yjs--fireprovider--webrtc">Real‑Time</a> •
    <a href="#ai-integration-openrouter-proxy">AI</a>
  </sub>
</div>

> Date: 2025-11-19  
> Scope: HTTP Routes, Server Actions, Firestore Data Model, Real‑Time Collaboration (Yjs + WebRTC), Auth, Background Jobs, AI Proxy, Security & Ops.  
> Namespace: All HTTP endpoints are under Next.js App Router `/api/*` unless otherwise noted. Real‑time and server actions are invoked internally but documented here for completeness.

---
## Master Table of Contents
<details>
<summary><b>Expand / Collapse</b></summary>

1. [Executive Overview](#executive-overview)
2. [High-Level Architecture](#high-level-architecture)
3. [Authentication & Identity](#authentication--identity)
4. [Authorization Model](#authorization-model)
5. [Data Model: Firestore Collections](#data-model-firestore-collections)
6. [Firestore Security Rules Summary](#firestore-security-rules-summary)
7. [Firestore Index Strategy](#firestore-index-strategy)
8. [Server Actions (App Router “use server” APIs)](#server-actions-app-router-use-server-apis)
9. [HTTP Endpoints Inventory](#http-endpoints-inventory)
10. [Endpoint Specifications](#endpoint-specifications)
11. [AI Integration (OpenRouter Proxy)](#ai-integration-openrouter-proxy)
12. [Real‑Time Collaboration Protocol (Yjs + FireProvider + WebRTC)](#real-time-collaboration-protocol-yjs--fireprovider--webrtc)
13. [Trending Score Computation Pipeline](#trending-score-computation-pipeline)
14. [Username Utility & Profile Services](#username-utility--profile-services)
15. [Error and Status Conventions](#error-and-status-conventions)
16. [Streaming Patterns (SSE & Raw Streams)](#streaming-patterns-sse--raw-streams)
17. [Versioning & Deprecation Policy](#versioning--deprecation-policy)
18. [Rate Limiting & Quotas (Planned)](#rate-limiting--quotas-planned)
19. [Security Hardening & Recommendations](#security-hardening--recommendations)
20. [Observability & Operational Metrics](#observability--operational-metrics)
21. [Environment Configuration](#environment-configuration)
22. [OpenAPI Skeleton](#openapi-skeleton)
23. [Change Log](#change-log)
24. [Glossary](#glossary)

</details>

---
## Executive Overview
Axelot delivers a collaborative story/document platform with:
- Multi‑provider authentication (OAuth: Google/GitHub + Credentials).
- Real‑time collaborative editing backed by Yjs, transported over WebRTC and Firestore signaling.
- AI augmentation (completion & text transformation) via OpenRouter.
- Periodic trending score recalculation for public discoverability.
- Fine-grained access control (owner, readAccess, writeAccess lists) enforced at Firestore layer.

Design priorities: Low latency collaboration, secure credential segregation, horizontal scalability (stateless serverless routes), and future extensibility (planned versioning & quotas).

---
## High-Level Architecture
```
Client (Next.js + React + TipTap Editor)
   |-- Auth (NextAuth: cookies + JWT) -> Session includes firebaseToken
   |-- AI Requests -> /api/completion | /api/text-transform -> OpenRouter
   |-- View Tracking -> /api/document/view -> Firestore (stories.viewCount)
   |-- Collaboration -> FireProvider (Firestore + WebRTC mesh + Yjs updates)
   |-- Story Discovery -> getHomepageStories (Server Action)

Serverless (Next.js App Router) Layers:
   /api/auth/[...nextauth] -> NextAuth core (Firestore Adapter)
   /api/auth/verify-email -> Email verification toggle
   /api/completion -> Stream proxy to OpenRouter
   /api/text-transform -> SSE transform stream (OpenRouter base)
   /api/document/view -> Auth’d view count increment
   /api/trending/update -> Cron-secured trending compute/statistics

Background Jobs:
   Vercel Cron (Bearer secret) -> /api/trending/update?mode=recent
   (Optional) manual POST for full recompute

Data Layer:
   Firestore Collections: users, credentials (server-only), stories, stories/{storyId}/instances, accounts, sessions.
   Collaboration signaling & ephemeral handshake docs inside stories/{id}/instances/*

Real-Time Mesh:
   Graph generation -> peers selection -> WebRTC handshake docs (calls/answers subcollections) -> encrypted data channel -> Yjs updates.
```

---
## Authentication & Identity
> [!NOTE]
> Sessions use JWT strategy. Session callback embeds a short‑lived Firebase Custom Token (`session.firebaseToken`) for client exchange → Firebase ID token, enabling protected API calls.

Mechanisms employed:

| Mechanism | Transport | Purpose | Source |
|-----------|-----------|---------|--------|
| NextAuth OAuth (Google/GitHub) | Cookie (HTTPOnly) + JWT session | Primary federated identity | `/api/auth/[...nextauth]` |
| NextAuth Credentials | Cookie + JWT | Email/password sign-in (requires emailVerified) | `/api/auth/[...nextauth]` |
| Firebase Custom Token | Added to NextAuth session | Enables client issuance of Firebase ID token for Firestore secure ops | NextAuth session callback |
| Firebase ID Token | Bearer header | AuthZ for protected Firestore-backed endpoint `/api/document/view` | Client after firebaseToken exchange |
| Cron Secret | Bearer header | Secures scheduled maintenance endpoint `/api/trending/update` | Environment variable |

Session Enrichment Flow:
1. User authenticates (provider or credentials).  
2. NextAuth `jwt` callback attaches `sub` (user id) & optional `username`.  
3. `session` callback issues Firebase Custom Token via Admin SDK -> `session.firebaseToken`.  
4. Client exchanges custom token for Firebase ID token using Firebase client SDK; stores ephemeral token for subsequent Bearer operations.

Identity Considerations:
- Username may be null until set; helpers in `username-utils.ts` enforce uniqueness & reserved list.
- Credentials users blocked until `emailVerified === true` (email verification route updates flag).
- Sessions employ JWT strategy for stateless scaling.

---
## Authorization Model
Access tiers for stories:
| Role/Condition | Capabilities |
|----------------|-------------|
| Owner (`owner == uid`) | Full CRUD, archival, access list management. |
| Write Access (`uid ∈ writeAccess[]`) | Update content, collaborate real-time, limited metadata edits. |
| Read Access (`uid ∈ readAccess[]`) | View content & participate depending on design (collab read). |
| Public (`isPublic == true`) | Anonymous read permitted (rules allow get). |
| Archived (`isArchived == true`) | Hidden from regular listing, counts for trending skip logic. |

Enforcement Layer:
- Firestore Security Rules (primary source of truth).  
- Server endpoints rely on ID token verification (`/api/document/view`) or secret (`/api/trending/update`).  
- Credentials endpoints rely on NextAuth’s built-in provider gating.

---
## Data Model: Firestore Collections
### users
Fields (typical): `email`, `name`, `emailVerified`, `image`, `username`, `bio`, `createdAt`, `updatedAt`.
Access: Public read, self write only.

### credentials (server-only)
Fields: `userId`, `passwordHash`, timestamps.
Access: Denied to client; only Admin SDK (NextAuth Credentials provider). Increased isolation reduces accidental leakage.

### stories
Core collaborative documents.
Representative Schema:
```json
{
  "owner": "<uid>",
  "authorNames": ["Alice", "Bob"],
  "title": "My Story",
  "description": "Optional summary",
  "slug": "my-story",
  "created": <Timestamp>,
  "lastUpdated": <Timestamp>,
  "tags": ["fiction"],
  "viewCount": 42,
  "trendingScore": 0.873,
  "isPublic": true,
  "readAccess": ["uid3"],
  "writeAccess": ["uid2"],
  "lastUpdatedBy": "uid2",
  "isArchived": false,
  "trendingLastComputed": <Timestamp>
}
```
Subcollections:
- `instances/*` (real-time collaboration mesh:
  - `calls/{peerUid}` ephemeral signaling documents.
  - `answers/{peerUid}` ephemeral responses.
  - Additional encryption / handshake metadata.
)

### sessions / accounts (NextAuth adapter)
Used internally by FirestoreAdapter; client access denied by rules.

### indexes
Defined in `firebase/firestore.indexes.json` to optimize queries sorting by `created`, `lastUpdated`, filtering `isPublic`, `isArchived`, and `owner` for personalized dashboards & trending recomputation.

---
## Firestore Security Rules Summary
Source: `firebase/firestore.rules`.
Key Constraints:
| Collection | Read | Write | Notes |
|-----------|------|-------|-------|
| stories | Public if `isPublic` OR owner/readAccess/writeAccess | Owner or writeAccess (update), owner only (delete) | Fine-grained arrays for access control. |
| stories/instances/* | Authenticated read/write | Real-time handshake + Yjs updates; performance oriented. |
| users | All read | Self write | Public profiles. |
| credentials | None | None | Admin SDK only. |
| sessions/accounts | None | None | NextAuth internal state. |

Validation on create (stories): must include mandatory keys & correct types (booleans + list types).

---
## Firestore Index Strategy
Indexes improve feed & compute jobs:
1. `(isPublic ASC, created DESC)` recent publishing feed.  
2. `(isPublic ASC, lastUpdated DESC)` activity-based sorting.  
3. `(owner ASC, lastUpdated DESC)` per-user dashboard / last edits.  
4. `(isPublic ASC, isArchived ASC, lastUpdated DESC)` trending candidate selection excluding archived.

Operational Impact: Reduces read amplification during cron trending recalculations; ensures deterministic ordering for homepage server action.

---
## Server Actions (App Router “use server” APIs)
These run server-side, not exposed as REST endpoints but functionally act like internal RPC.

### `getHomepageStories()` (`src/app/(app)/actions.ts`)
Purpose: Assemble homepage payload with recent and trending stories.
Flow:
1. Query public stories ordered by `created DESC` limit 6.  
2. Query public stories ordered by `trendingScore DESC` limit 6.  
3. Return `{ recent, trending }` arrays.
Errors: Returns empty arrays on failure (logs to console). No exception propagation to caller component.

### `signUpAction(formData)` (`src/app/(app)/auth/sign-up/actions.ts`)
Purpose: Secure user creation with validation & credential segregation.
Steps:
1. Extract `name`, `email`, `password`.  
2. Validate via Zod `signUpSchema`.  
3. Ensure email unique (`users` query).  
4. Insert `users` doc with `emailVerified: false`.  
5. Hash password -> store in `credentials/{userId}`.  
6. Return success with email; client initiates verification flow.
Failure Modes: Validation (ZodError), data race (duplicate email), general exception -> structured `{ success: false, error }`.

---
## HTTP Endpoints Inventory
> [!TIP]
> Keep client paths aligned with server routes. See “Client Integration Notes” below for two places to update.

| Method(s) | Path | Category | Auth | Stream | Idempotent | Notes |
|-----------|------|----------|------|--------|-----------|-------|
| GET/POST | `/api/auth/[...nextauth]` | Auth | Cookie/JWT | N | Varies | Provider callbacks & session mgmt. |
| POST | `/api/auth/verify-email` | Auth Utility | None | N | Y (flag set) | Sets `emailVerified=true` if user exists. |
| POST | `/api/completion` | AI | None | Raw | N | Proxy to OpenRouter; requires model param. |
| POST | `/api/document/view` | Telemetry | Firebase ID | N | Y (increment) | Increments view counter; eventual consistency. |
| POST | `/api/text-transform` | AI | None | SSE | N | Streams transformation chunks. |
| GET/POST | `/api/trending/update` | Maintenance | Cron Secret | N | N | Batch recompute or stats. |

---
## Endpoint Specifications
### Authentication Aggregator `/api/auth/[...nextauth]`
Provider Matrix:
| Provider | Scope | Linking | Risk Controls |
|----------|-------|--------|---------------|
| Google | profile, email | Dangerous linking allowed | Email trust via provider token |
| GitHub | user:email | Dangerous linking allowed | Public email fallback |
| Credentials | Internal | Disallowed until email verified | Password hash + emailVerified flag |

JWT Session Structure (simplified):
```json
{
  "sub": "<uid>",
  "username": "<username?>",
  "firebaseToken": "<custom-token>",
  "iat": 1731970000,
  "exp": 1731973600
}
```
Security Considerations: CSRF mitigated by NextAuth built-in protections; recommend enabling PKCE for OAuth providers (default). Credentials route guarded through validation + timing-safe password verification.

### Email Verification `/api/auth/verify-email` (POST)
Idempotent: Repeating request keeps `emailVerified: true`.
Future Enhancement: Add signed verification token pattern to avoid direct API toggling.

### AI Completion `/api/completion` (POST)
External Call: `https://openrouter.ai/api/v1/chat/completions` with `stream: true`.
Timeout Behavior: Relies on platform default; consider explicit AbortController for enterprise resiliency.
Observability: Recommend counting tokens & latency histogram per `model`.

### Document View Tracking `/api/document/view` (POST)
Concurrency: Firestore atomic `increment(1)` ensures thread-safe count.
Audit: Could append view events to BigQuery (future) for analytics beyond simple counter.

### Text Transform `/api/text-transform` (POST)
Protocol: SSE.
Event Format:
```text
data: {"type":"content","content":"partial string"}\n\n
```
Potential Extension: Introduce event types `meta`, `done`, `error` for structured client handling.

### Trending Update `/api/trending/update` (GET/POST)
Modes & Capacity:
| Mode | Purpose | Volume Strategy |
|------|---------|----------------|
| all | Full recompute (up to 500 batch commit cycle) | Off-peak scheduling recommended |
| recent | Delta recompute (last N hours, default 24) | Daily or hourly Cron |
| stats | Monitoring metrics only | Frequent safe invocation |
Performance: Batching logic commits after reaching batchSize or end. Skips recompute if `shouldRecomputeTrendingScore(document)` false.

---
### Client Integration Notes (UI → API mapping)
- TipTap Text Transform dialog (`text-transform-dialog.tsx`) currently calls `POST /api/openrouter/text-transform`, while the implemented route is `POST /api/text-transform`. Align by either:
  - Updating the dialog to use `/api/text-transform` (recommended), or
  - Adding an alias route at `/api/openrouter/text-transform` that forwards to the existing handler.
- AI Autocomplete config (`utils/config.ts`) sets `apiEndpoint: "/api/complete"`, but the implemented endpoint is `POST /api/completion`. Align by changing `apiEndpoint` to `/api/completion`.
- useDocumentView hook posts to `/api/document/view` with `Authorization: Bearer <firebaseToken>` which matches the implemented route and server-side token verification.

---
## AI Integration (OpenRouter Proxy)
Endpoints: `/api/completion`, `/api/text-transform`.
Common Request Envelope:
```json
{
  "model": "openai/gpt-4o-mini",
  "prompt": "<text>",
  "max_tokens": 128,
  "temperature": 0.8
}
```
Security:
- Secret: `OPENROUTER_API_KEY` (server only). Do not expose client-side.
- Consider per-user rate & cost tracking.
Resilience:
- Retries currently absent (single pass). For enterprise SLA, implement exponential backoff & circuit breaker (e.g., fast fail on repeated gateway errors).

Client Paths:
- Autocomplete: change `apiEndpoint` from `/api/complete` → `/api/completion`.
- Transform: change Text Transform dialog from `/api/openrouter/text-transform` → `/api/text-transform`.

---
## Real‑Time Collaboration Protocol (Yjs + FireProvider + WebRTC)
Components:
| Layer | Responsibility |
|-------|---------------|
| FireProvider (`provider.ts`) | Orchestrates mesh, caches updates, batching -> Firestore persistence. |
| WebRtc (`webrtc.ts`) | Peer data channels, encryption handshake, zombie detection. |
| Awareness Protocol | Presence / cursors sync via `awareness.update`. |
| IndexedDB (idb-keyval) | Local cache for offline & recovery. |

Lifecycle:
1. `init()` -> Firestore snapshot subscription for base content.  
2. Instance creation -> assign `uid`, compute time offset.  
3. Mesh tracking builds directed graph of peers (senders/receivers).  
4. WebRTC handshake via Firestore ephemeral docs `calls/` & `answers/`.  
5. Data Channel established -> encrypted Yjs updates propagate.  
6. Local updates batched in cache (merge up to `maxCacheUpdates`) -> flush -> peers + Firestore save queue.

Encryption:
`generateKey(callerUid, peerUid)` produces a symmetric key used to encrypt data payloads (see `encryptData`/`decryptData`).

Zombie Peer Handling:
- Timer (30s) per connection; failure to connect triggers `killZombie` -> removes stale instance doc; peer destroyed.

Persistence Strategy:
- Firestore save defers if recent peer saved (optimizes write cost).  
- Local IndexedDB cleared after successful Firestore commit.

Failure Modes & Mitigations:
| Scenario | Mitigation |
|----------|-----------|
| Peer graph fragmentation | Reconnect debounce -> `reconnect()` logic. |
| Permission denied (doc removed) | `onDeleted()` callback to surface UI state. |
| High update churn | Cache merges + threshold flush reduce channel spam. |

Scaling Considerations:
- For very large rooms, refine mesh algorithm (present star or partial broadcast).  
- Introduce selective awareness broadcasting to reduce bandwidth.

Related Firestore Collections:
- `stories/{id}/instances`: Handshake channel for peers (`calls/*`, `answers/*`).
- `stories/{id}`: Document state persisted (encoded Yjs update bytes under `content` via `Bytes`).

---
## Trending Score Computation Pipeline
Functions (`trending-jobs.ts`):
| Function | Purpose |
|----------|---------|
| `updateTrendingScores(db, batchSize)` | Full pass update across public, non-archived stories; recompute if `shouldRecomputeTrendingScore`. |
| `updateRecentTrendingScores(db, hoursBack)` | Delta updates for efficiency. |
| `getTrendingStats(db)` | Monitoring summary: totals, needingUpdate, recentlyUpdated. |

Performance Controls:
- Batch size max 500 (Firestore limit).  
- Skips: documents not needing recompute reduce Firestore write ops.  
- Duration logged for observability; recommend adding structured logs.

---
## Data Converters & Types
Converters define strict read/write mapping to Firestore for type safety and query performance:
- `lib/converters/document.ts` → `Document` schema with optional denormalized fields (`authorNames`, trending metrics). Provides helpers: `documentRef(id)`, `documentsByOwnerRef(ownerId)`, `publicDocumentsRef()`, `allDocumentsRef()`.
- `lib/converters/user.ts` → `User` schema; public readable, self-writable per rules. Helpers: `userRef(userId)`, `usersCollectionRef()`.

Types:
- `types/document.ts` → full contract for collaborative stories (ownership, visibility, timestamps, tags, trending metrics).
- `types/user.ts` → public user profile contract.

Contract Guarantee: Converters only persist optional fields when defined, minimizing sparse-index bloat and accidental null writes.

---
## Username Utility & Profile Services
Helpers in `username-utils.ts`:
| Function | Description |
|----------|-------------|
| `isValidUsername` | Regex validation (3–20 chars, alnum + `_`/`-`). |
| `isFirebaseId` | Distinguish raw user IDs (length 28). |
| `isUsernameParam` | Detect prefixed parameter (`@username`). |
| `stripUsernamePrefix` | Remove leading `@`. |
| `isUsernameAvailable` | Firestore query for uniqueness. |
| `getUserIdByUsername` | Resolve ID from username. |
| `generateUsernameFromName` | Base suggestion (sanitization). |
| `generateUniqueUsername` | Incremental fallback strategy (up to 1000 attempts). |
| `isReservedUsername` | Prevent conflicting system paths (e.g., `admin`, `api`). |

Enterprise Note: Add caching (e.g., Redis) for high-frequency availability checks to reduce Firestore reads.

---
## Session Shape Augmentation
File: `types/next-auth.d.ts` augments NextAuth types:
- `session.user.id` and optional `session.user.username` always present for authenticated users.
- `session.firebaseToken?: string` carries Firebase Custom Token issued server-side (via Admin SDK in `auth.ts` session callback). Clients exchange it for a Firebase ID token to call protected endpoints like `/api/document/view`.

---
## Error and Status Conventions
Unified Error Envelope:
```json
{ "error": "<message>", "code": "<optional-code>", "details": {"field": "issue"} }
```
Current Implementation: Minimal `{ error: string }`; recommended extension for machine parsing.

Mapping:
| HTTP | Semantics | Typical Source |
|------|-----------|----------------|
| 200 | Success | Normal operation |
| 202 | Accepted (Future) | Async AI job or long-running recompute |
| 400 | Validation failure / missing fields | Email verify, AI param checks |
| 401 | Missing/invalid credential | Firebase token absent, Cron secret mismatch |
| 403 | Authenticated but forbidden | Non-owner destructive attempt (future) |
| 404 | Entity not found | Email not found, user slug missing |
| 409 | Conflict (Future) | Duplicate username race |
| 429 | Rate limit (Future) | AI quota exceeded |
| 500 | Unhandled server error | Trending batch failure, external API error |

---
## Streaming Patterns (SSE & Raw Streams)
| Endpoint | Type | Transport | Framing | Consumer Guidance |
|----------|------|----------|---------|-------------------|
| `/api/completion` | Raw stream | Fetch body reader | Plain text chunks | Accumulate & tokenize after final chunk. |
| `/api/text-transform` | SSE | EventSource | `data: {json}` lines | Append progressive transform; detect completion when stream closes. |

Backpressure: Browser’s streaming reader handles flow-control; ensure client sets reasonable `AbortController` for UX cancellations.

---
## Route Protection Middleware
File: `src/proxy.ts` implements a guard for matched paths (configured `matcher: ["/stories"]`). If no NextAuth session is found, it redirects to `GET /api/auth/signin?callbackUrl=<original>` ensuring unauthenticated users are routed through NextAuth before accessing protected app pages.

---
## Versioning & Deprecation Policy
Current: Single implicit version (`/api/*`).
Planned:
| Phase | Action |
|-------|--------|
| v1 Launch | Freeze existing contracts; introduce `/api/v1/*`. |
| v1+1 | Add new endpoints to `/api/v1`; keep backward compatibility. |
| Deprecation | Announce 90-day window; emit `Deprecation` header in responses. |

Semantic Guidelines: Avoid breaking field removals; add new optional fields only until new version cut.

---
## Rate Limiting & Quotas (Planned)
Targets:
- Per-user per-minute token usage for AI.
- Per-IP sign-up throttle (exponential backoff).  
- Cron endpoint guarding via secret rotation schedule.
Instrumentation base: Use edge middleware or upstream reverse proxy (e.g., Cloudflare Workers) for distributed counters.

---
## Security Hardening & Recommendations
Controls Implemented:
- Credential isolation: password hashes segregated in `credentials` (no client rule access).  
- Firebase Rules enforce least privilege for stories & collaboration.  
- Cron secret gating prevents arbitrary trending recompute.

Recommended Enhancements:
| Category | Suggestion | Rationale |
|----------|------------|-----------|
| Secrets | Automatic rotation & vault storage | Mitigate leaked token risk |
| Auth | Add OAuth PKCE enforcement review | Defense-in-depth |
| Data | Field-level encryption for sensitive story metadata | Compliance scenarios |
| AI | Usage metering + anomaly detection | Cost & abuse management |
| WebRTC | DTLS fingerprint validation logging | Trace potential MITM attempts |
| Supply Chain | Lock dependency versions & enable SCA scanning | Vulnerability management |

---
## Observability & Operational Metrics
Metrics to instrument:
| Domain | Metric | Type |
|--------|--------|------|
| Auth | SignInSuccess, SignInFailure | Counter |
| AI | TokensRequested, CompletionLatency | Counter/Histogram |
| Stories | ViewsIncremented, TrendingRecomputeDuration | Counter/Histogram |
| Collaboration | PeerConnectionsActive, ZombiePeersCleaned | Gauge/Counter |
| Errors | Http4xx, Http5xx | Counter |

Logging Standards:
- Structured JSON logs `{ ts, level, route, durationMs, error }`.
- PII redaction: exclude raw email/password; log userId only.
Tracing: Add request-id header propagation for multi-hop debugging (client->API->OpenRouter).

---
## Environment Configuration
| Variable | Scope | Description | Exposure |
|----------|-------|-------------|---------|
| `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` | Server | OAuth credentials | Secret |
| `AUTH_GITHUB_ID` / `AUTH_GITHUB_SECRET` | Server | OAuth credentials | Secret |
| `OPENROUTER_API_KEY` | Server | AI provider key | Secret |
| `CRON_SECRET` | Server | Protect trending update endpoint | Secret |
| `FIREBASE_PROJECT_ID` | Server (Admin SDK) | Firebase project id | Secret |
| `FIREBASE_CLIENT_EMAIL` | Server (Admin SDK) | Service account client email | Secret |
| `FIREBASE_PRIVATE_KEY` | Server (Admin SDK) | Service account private key (preserve newlines) | Secret |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Client | Firebase config key | Public |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Client | Firebase domain | Public |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Client | Project id used in Firestore paths | Public |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Client | Storage bucket | Public |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Client | Messaging sender id | Public |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Client | Firebase app id | Public |

Secret Management Policy (Recommended): Use platform secrets manager; audit quarterly; enforce minimum length & entropy for `CRON_SECRET` (>=32 chars).

---
## OpenAPI Skeleton
> This is a condensed illustrative excerpt; full generated schema can be automated later.
```yaml
openapi: 3.1.0
info:
  title: Axelot API
  version: 0.1.0
paths:
  /api/auth/verify-email:
    post:
      summary: Verify user email
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [email]
              properties:
                email:
                  type: string
      responses:
        '200': { description: Email verified }
        '400': { description: Missing email }
        '404': { description: User not found }
  /api/document/view:
    post:
      security: [{ firebaseIdToken: [] }]
      summary: Increment document view counter
      requestBody:
        content:
          application/json:
            schema:
              type: object
              properties:
                documentId: { type: string }
      responses:
        '200': { description: Success }
  /api/trending/update:
    get:
      security: [{ cronSecret: [] }]
      parameters:
        - in: query
          name: mode
          schema: { type: string, enum: [all, recent, stats] }
      responses:
        '200': { description: Trending update result }
components:
  securitySchemes:
    firebaseIdToken:
      type: http
      scheme: bearer
    cronSecret:
      type: http
      scheme: bearer
```

---
## Change Log
| Date | Change |
|------|--------|
| 2025-11-19 | Initial draft & enterprise expansion (v0.1). |

---
## Glossary
| Term | Definition |
|------|------------|
| Yjs | CRDT framework enabling concurrent editing without central lock. |
| Awareness | Yjs protocol for presence metadata (cursors, users). |
| WebRTC | Peer-to-peer transport; used for low-latency Yjs update propagation. |
| FireProvider | Custom orchestrator integrating Firestore persistence with Yjs + WebRTC mesh. |
| Cron Secret | Shared bearer token securing scheduled maintenance endpoint. |
| Trending Score | Computed metric for story ranking based on recency & engagement. |
| Server Action | Next.js app router server-side function invoked by components (`use server`). |
| Increment | Firestore atomic field update increasing numeric value. |

---
**Next Steps**: Generate full OpenAPI spec, implement rate limiting, add structured error codes, and integrate metrics emission. For changes, update both spec & this reference in same PR.

<!-- End of Enterprise API Reference -->
