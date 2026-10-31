# ExplainFlow: Pipeline Technical Design and Prototype Plan

**Status:** Proposed pre-dashboard design<br>
**Date:** 2026-10-30
**Companion document:** [PRD](./PRD.md)

## 1. Purpose

This document defines the technical pipeline to prove before building the ExplainFlow dashboard or polished user interface.

The prototype must demonstrate one complete, reliable path:

> Approved structured content + creator-owned media → narrated 1280 × 720 MP4 → private R2 storage → authorized download.

It is not a prototype of the visual dashboard. It is a prototype of the product's riskiest technical capabilities: structured planning, review-safe rendering, narration, private media storage, and recovery from failure.

## 2. Design principles

1. **A render always uses an approved snapshot.** The renderer must never read a mutable draft directly.
2. **The AI proposes; the user approves.** Gemini may create a script and storyboard draft, but it cannot automatically render a user-facing video.
3. **Media is private by default.** Logos, images, narration, and exports never live in a public bucket.
4. **The product owns the workflow, not a provider's response format.** Provider integrations sit behind small adapters.
5. **Prove the renderer before building the dashboard.** A visually polished UI is not useful if a reliable 720p MP4 cannot be produced.
6. **Free-tier limits are enforced server-side.** The browser never receives provider keys and cannot bypass usage rules.

## 3. Reference architecture

The production-facing reference architecture uses Next.js in the Node.js runtime for the application API, MongoDB for metadata, and Cloudflare R2 for media storage. The initial renderer runs locally; its eventual hosted runtime remains a deliberate decision after the prototype proves which rendering route is viable.

```text
Future browser UI
       |
       v
Next.js application and Route Handlers (Node.js runtime)
  |         |          |          |             |
  |         |          |          |             +-- Better Auth: email/password sessions
  |         |          |          +---------------- Gemini Planner adapter
  |         |          +--------------------------- ElevenLabs prototype narration adapter
  |         +-------------------------------------- MongoDB: metadata and job state
  |
  +----------------------------------------------- Cloudflare R2: private assets and exports
       |
       v
Renderer adapter
  |-- Prototype: local Node + Remotion renderer
  |-- Candidate: browser-side Remotion web renderer
  `-- Later, if required: dedicated Node-compatible render service
       |
       v
R2 export object + MongoDB status update
       |
       v
Authenticated Next.js download endpoint
```

### 3.1 Chosen and pending components

| Area | Design decision | Prototype role |
| --- | --- | --- |
| Web UI | Next.js, React, and TypeScript; no dashboard is built during the pipeline prototype | None beyond an optional developer-only test page. |
| API | Next.js Route Handlers running in the Node.js runtime | Expose small JSON endpoints or use local scripts. |
| Authentication | Better Auth with verified email/password only and its MongoDB adapter | Add after the core render path works. |
| Project metadata | MongoDB | Start with a local MongoDB instance, then test the chosen hosted MongoDB deployment. |
| Asset/export storage | Cloudflare R2 Standard | Upload one private fixture and one rendered MP4. |
| Planning | Gemini API with structured JSON output | Produce and validate a `StoryPlan`. |
| Narration | ElevenLabs standard voices | Use Free-plan credits only for local/private prototype narration. Before public use, require a paid commercial plan, approved grant, or a replacement provider. |
| Motion graphics | Remotion | Create one controlled 720p educational template. |
| Hosting | A Node.js-compatible host, selected later | Do not make public hosting a prerequisite for proving the pipeline. |

### 3.2 Rendering decision

The Version 1 user-facing product is fixed at 30-second output. The current
reusable prototype contract may retain 60- and 90-second values for a future
expansion, but the Version 1 dashboard/API must accept and render only 30 seconds.
The final render-runtime host remains deliberately undecided.

Remotion offers two viable rendering routes:

- **Local/server rendering:** `@remotion/renderer` produces the MP4 in a Node-compatible environment. This is the prototype default because it is deterministic and works independently of the end user's device.
- **Browser rendering:** `@remotion/web-renderer` can render in the browser using WebCodecs. It avoids a render server but has browser and HTML-feature limitations; support must be checked before each render.

The first prototype uses local/server rendering. It creates a clear baseline MP4 and separates video correctness from browser capability. Browser-side rendering is a later optimization, not an assumption.

Remotion documents browser rendering through `renderMediaOnWeb()` and notes its WebCodecs/browser requirements. It also documents that codec support must be checked for the chosen browser and output combination. [Client-side rendering](https://www.remotion.dev/docs/client-side-rendering) · [Video formats](https://www.remotion.dev/docs/miscellaneous/video-formats)

## 4. Domain model and state machine

### 4.1 Project state

```text
DRAFT
  → PLANNING
  → REVIEW_REQUIRED
  → APPROVED
  → GENERATION_QUEUED
  → GENERATING
  → READY
  → MEDIA_DELETION_PENDING
  → APPROVED

Failure paths:
PLANNING      → PLAN_FAILED
GENERATION_QUEUED → GENERATION_FAILED
GENERATING        → GENERATION_FAILED

Any material draft edit from REVIEW_REQUIRED, APPROVED, or GENERATION_FAILED
  → DRAFT (the one mutable draft is updated; older approved snapshots remain immutable)
```

`READY` describes a project with its sole retained Version 1 downloadable
export. While READY or MEDIA_DELETION_PENDING, material edits and a second
generation are blocked. Explicit video deletion or 10-day expiry cleanup removes
the media, returns the entitlement to AVAILABLE, and returns the project to
APPROVED with its immutable revision preserved.

### 4.2 Immutable approval snapshot

At approval, the API creates an immutable `project_revision` record containing the exact script, storyboard, brand settings, selected assets, and narration choice. It calculates a content hash from that snapshot.

The generation job stores:

- `project_id`
- `revision_id`
- `revision_hash`
- `renderer_version`
- `idempotency_key`

If the same approved revision and idempotency key are requested again, the API
returns the existing in-progress or completed generation job rather than
starting a duplicate render.

## 5. Data contracts

### 5.1 `StoryPlan` contract

Gemini must return structured JSON, never free-form markup that the application attempts to parse heuristically. Gemini supports JSON Schema structured outputs; ExplainFlow must still validate every response with Zod before saving it. [Gemini structured outputs](https://ai.google.dev/gemini-api/docs/structured-output)

```ts
type StoryPlan = {
  schemaVersion: "1";
  title: string;
  language: "en" | "de";
  targetDurationSeconds: 30;
  script: string;
  scenes: Array<{
    id: string;
    order: number;
    durationMs: number;
    narration: string;
    caption: string;
    visual: {
      template: "title" | "concept" | "steps" | "comparison" | "summary";
      description: string;
      assetIds: string[];
    };
  }>;
};
```

The application validates:

- Supported language and duration only.
- Scene count and scene order.
- Positive durations whose total is exactly the fixed 30-second target within
  a small configured tolerance.
- Every referenced asset belongs to the same project and user.
- The output contains no unsupported HTML, URLs, stock-media instructions, or hidden provider fields.

### 5.2 `RenderManifest` contract

The renderer receives a fully resolved, read-only manifest rather than database credentials or access to mutable project data.

```ts
type RenderManifest = {
  schemaVersion: "1";
  generationJobId: string;
  projectId: string;
  revisionId: string;
  revisionHash: string;
  output: { width: 1280; height: 720; fps: 30; format: "mp4" };
  brand: { colors: string[]; logoUrl?: string };
  scenes: StoryPlan["scenes"];
  narration: { audioUrl: string; language: "en" | "de"; voiceId: string };
};
```

Asset and narration URLs are short-lived, renderer-specific URLs. They must not expose a public R2 bucket.

## 6. Storage design

### 6.1 MongoDB collections

| Table | Purpose |
| --- | --- |
| Better Auth collections | Users, sessions, verification records, and password-authentication data managed by Better Auth's MongoDB adapter. |
| `projects` | Project owner, title, selected output language/duration, current status, mutable-draft reference, active approved revision, and timestamps. |
| `project_drafts` | Exactly one mutable draft per project: source-language selection/detection, brief, branding, StoryPlan, selected voice key, and version. |
| `project_revisions` | Immutable approved render snapshots, version number, approval time, frozen voice/provider reference, asset snapshot, and content hash. |
| `assets` | Asset metadata only: owner/project IDs, R2 key, MIME type, byte count, kind, and deletion state. |
| `generation_jobs` | Generation/revision linkage, job status, renderer version, R2 output/narration assets, failure code, lease, retry count, and timestamps. |
| `usage_counters` | Per-user planning/render/storage quota counters by time window. |
| `audit_events` | Minimal non-sensitive operational events such as `plan_created`, `approved`, `render_failed`, and `export_deleted`. |

### 6.2 R2 object layout

```text
users/{userId}/projects/{projectId}/assets/{assetId}/source
users/{userId}/projects/{projectId}/assets/{assetId}/safe-preview
users/{userId}/projects/{projectId}/generations/{generationJobId}/narration.mp3
users/{userId}/projects/{projectId}/generations/{generationJobId}/export.mp4
```

Rules:

- Use R2 Standard storage only.
- R2 objects remain private; neither bucket listing nor direct public URLs are enabled.
- MongoDB is the authorization source. Every asset/export request first checks that `project.user_id` matches the authenticated user.
- Project deletion queues removal of all matching R2 objects and removes their MongoDB records only after deletion succeeds or is reconciled.
- Upload, storage, and export-size limits are checked before object creation.

For browser uploads and downloads, the API may issue a short-lived R2 presigned URL after ownership and quota checks. R2 documents that presigned URLs grant a single scoped operation and should be treated as bearer tokens. [R2 presigned URLs](https://developers.cloudflare.com/r2/api/s3/presigned-urls/)

## 7. API and pipeline boundaries

These endpoints describe the future API contract. The prototype can call them through scripts, HTTP clients, or a tiny developer-only form; no dashboard is required.

| Endpoint | Purpose | Key checks |
| --- | --- | --- |
| POST /api/v1/projects | Create a draft project. | Authenticated owner, fixed 30-second target, input size. |
| POST /api/v1/projects/:id/plan | Request a script and storyboard draft. | Ownership, consent flag, rate limit, Gemini request, Zod validation. |
| PATCH /api/v1/projects/:id/draft | Save a creator edit to the one mutable draft. | Ownership, If-Match version, invalidates approval. |
| POST /api/v1/projects/:id/approve | Create the immutable approved revision. | Ownership, complete StoryPlan, fixed-duration check, selected assets valid. |
| POST /api/v1/projects/:id/assets/upload-intents | Create a scoped upload action. | Ownership, type/size/quota validation. |
| POST /api/v1/projects/:id/assets/:assetId/complete | Verify an uploaded object before use. | Ownership, R2 object/MIME/checksum validation. |
| POST /api/v1/projects/:id/generation | Create or retrieve an idempotent generation job. | Approved revision, ownership, atomic entitlement, idempotency key. |
| GET /api/v1/generations/:id | Poll generation status. | Ownership. |
| POST /api/v1/generations/:id/playback-intent | Get a short-lived inline MP4 playback action. | READY. |
| POST /api/v1/generations/:id/download-intent | Get a short-lived download action. | READY. |
| DELETE /api/v1/generations/:id | Delete retained MP4/narration while retaining project data. | READY holder job, ownership, idempotent cleanup transition. |
| DELETE /api/v1/projects/:id | Delete project assets, exports, and metadata. | Ownership and deletion reconciliation. |

### 7.1 Planning pipeline

```text
Validated brief
  → Check consent and user quota
  → Build a constrained Gemini prompt
  → Request StoryPlan JSON schema output
  → Zod and semantic validation
  → Save draft revision
  → Project state = REVIEW_REQUIRED
```

The planner prompt must state that it may use only the submitted idea/notes and selected settings; it must not claim factual verification or introduce external sources.

### 7.2 Approval pipeline

```text
Creator edits draft
  → API validates draft
  → Creator explicitly approves
  → API creates immutable approved revision + revision hash
  → Project state = APPROVED
```

### 7.3 Generation pipeline

```text
Approved revision
  → Atomically reserve entitlement and create idempotent generation job
  → Project/job state = GENERATION_QUEUED
  → Create narration from approved script
  → Create RenderManifest with scoped media URLs
  → Renderer creates 1280 × 720 MP4
  → Upload MP4 to private R2 key
  → Update job = READY, project = READY, entitlement = HELD
  → Authenticated user gets time-limited download action
```

On any failure, store a safe error code and retain the approved revision. The
worker may make one automatic technical retry, for two total attempts. There
is no explicit browser retry or narration-only regeneration action. A new full
generation becomes possible only after explicit media deletion or retention
expiry cleanup returns the entitlement to AVAILABLE.

### 7.4 Media-removal pipeline

~~~text
Creator DELETE video or 10-day expiry
  → atomically claim HELD entitlement/job for release
  → revoke future playback/download actions
  → delete/reconcile MP4 and narration in private R2
  → mark job MEDIA_DELETED or EXPIRED
  → project returns to APPROVED
  → entitlement returns to AVAILABLE
~~~

If either media object cannot be removed or reconciled, keep the job in
MEDIA_DELETION_PENDING and the entitlement unavailable until a trusted cleanup
retry succeeds.

## 8. Prototype plan

### Prototype 0: Rendering spike

**Goal:** Prove that Remotion can create the required MP4 before any service or dashboard code is built.

Build only:

- One `ExplainerTemplate` composition at 1280 × 720 and 30 FPS.
- A hand-authored `StoryPlan` fixture with four scenes and creator-selected colours.
- One local logo/image fixture owned by the project.
- A deterministic local narration audio fixture.
- A command that renders `output/explainflow-prototype.mp4`.

Pass conditions:

- The file is MP4, 1280 × 720, and exactly the target duration.
- Captions and narration stay synchronized.
- A missing image or audio file produces an explicit failed render, not a silent incomplete output.
- Changing the fixture's colours/logo visibly changes the output.

**Do not build:** authentication, MongoDB persistence, R2, Gemini, account screens, dashboard, payment, or a general editor.

### Prototype 1: Structured planning spike

**Goal:** Prove that an idea can become a safe, editable `StoryPlan`.

Build only:

- `StoryPlan` Zod schema and semantic validators.
- A server-side `PlannerProvider` interface.
- A Gemini implementation that returns JSON-schema structured output.
- Fixture tests for English and German ideas.
- A script/HTTP request that writes a validated JSON file, ready for Prototype 0's renderer.

Pass conditions:

- Invalid, incomplete, or semantically impossible model output is rejected with a controlled error.
- A successful plan contains only the supported scene templates and target duration.
- The raw Gemini key never appears in browser code, generated output, or logs.

### Prototype 2: Narration and private media spike

**Goal:** Prove private media upload/download and confirm a narration provider before user-facing UI exists.

Build only:

- An `NarrationProvider` interface with a fixture implementation.
- An ElevenLabs standard-voice implementation used only with the developer's Free-plan credits for local/private prototype narration.
- Local R2 simulation through Wrangler, followed by one real R2 Standard bucket test.
- Upload of a logo fixture and upload of one MP4 export under the R2 key convention.
- Authenticated Worker-mediated or short-lived presigned upload/download actions.

Pass conditions:

- An unauthenticated or wrong-owner request cannot download another user's fixture.
- Upload MIME type, file size, and project ownership are checked before storage.
- A completed output can be downloaded from R2 without exposing an API secret or public bucket listing.
- The team records ElevenLabs' language support, the Free-plan limitation, and the required commercial-plan or grant decision before any public narration use.

### Prototype 3: Approval and job reliability spike

**Goal:** Prove the review gate, async status model, retry behavior, and export idempotency.

Build only:

- Local MongoDB collections for projects, project_drafts, project_revisions,
  generation_jobs, generation_entitlements, and usage counters.
- Next.js Route Handlers or scripts that create a draft, approve a revision,
  request generation, poll status, delete a retained video, and delete a project.
- A local renderer adapter that consumes only `RenderManifest`.
- Failure simulation for narration, renderer, R2 upload, and retry.

Pass conditions:

- A draft cannot render.
- An edit after approval updates the one mutable draft and leaves the old
  approved snapshot immutable.
- Repeating a generation request with the same idempotency key produces one
  generation job and one render attempt.
- A failed generation never deletes the approved revision or previously
  completed export.
- Explicit video deletion removes/reconciles MP4 plus narration and releases
  the entitlement only after cleanup succeeds.
- Ten-day expiry uses the same media-removal path and releases the entitlement.
- An R2 deletion failure keeps the entitlement unavailable and is retried safely.
- Project deletion removes both MongoDB records and R2 fixture objects, using
  the same entitlement-release path when it removes retained media.

### Prototype 4: Production-readiness gate

Only after Prototypes 0–3 pass, build the actual application foundation:

1. Better Auth email/password integration with verified email and password reset.
2. Turnstile, rate limits, and user storage/render quota enforcement.
3. Responsive project dashboard and four-step project creation flow.
4. Mobile-friendly scene review controls.
5. Export status and download UI.

## 9. Test plan before dashboard work

| Test area | Required checks |
| --- | --- |
| Render correctness | 30-second fixture video; 1280 × 720; captions; narration; user colour/logo/image behavior. |
| Planning correctness | Valid English/German JSON plans; schema failure; duration mismatch; unsupported scene type; no external-source claims. |
| Authorization | Owner can access project; another test user cannot read, upload to, download from, or delete it. |
| Storage | Correct private R2 key; rejected file type/oversize upload; explicit video deletion and project deletion cleanup; no public listing. |
| Reliability | TTS failure; renderer failure; R2 upload/deletion failure; retry; duplicate generation/delete request; expiry cleanup; browser/API refresh during status polling. |
| Quotas | Planning and render quota exhaustion result in a clear error and no partial export. |
| Security | No provider secret in client bundle, URL, or logs; request validation; rate limit and bot-protection coverage. |

## 10. Prototype exit criteria

Do not begin dashboard or polished UI work until all of the following are true:

1. A fixed approved fixture renders repeatedly to a correct 720p MP4.
2. Gemini produces a validated `StoryPlan` for English and German examples, with bad outputs safely rejected.
3. ElevenLabs standard voices have produced a successful local/private prototype narration, and the production commercial-plan, grant, or replacement-provider decision is recorded.
4. Assets and exports can be saved privately to R2 and accessed only by the owning test user.
5. The approval gate and idempotent export flow are proven with automated tests.
6. Failed generations preserve project data and report an understandable status.
7. The team has written down the final render-runtime decision: local/server renderer, browser renderer, or a dedicated render service.

## 11. Open decisions and deliberate non-decisions

| Topic | Current position | Decision needed before public release |
| --- | --- | --- |
| Final render runtime | Prototype locally with `@remotion/renderer`; evaluate browser rendering separately. | Keep the host undecided until a candidate repeatedly produces the required 30-second, 720p output within the pilot's limits. |
| Narration provider | ElevenLabs standard voices are selected for local/private prototype narration using the developer's Free-plan credits. | Obtain a paid commercial plan or approved grant before enabling public user narration; otherwise select a replacement provider. |
| Public frontend host | Not selected for this design. | Choose a host whose plan terms permit ExplainFlow's actual use. |
| Domain | No custom domain required for the prototype. | Obtain and configure one only when desired. |
| R2 retention | Creator assets remain until project deletion. Completed MP4/narration media expires after 10 days while lightweight project metadata remains visible. | Implement private-media cleanup/reconciliation and communicate the 10-day expiry in product policy. |
| Email delivery | Better Auth will manage auth logic; it does not eliminate the need for a verified-email delivery service. | Select a compatible provider and configure verification/reset flows. |

## 12. Not in the prototype

- A public landing page, dashboard, visual design system, or onboarding UI.
- A generic drag-and-drop timeline editor.
- Multiple video templates beyond the one required to prove the path.
- Stock media, PDFs, URLs, documents, image-to-video, avatars, and voice cloning.
- Subscription or payment logic.
- Vercel/production hosting setup before the technical pipeline passes.
