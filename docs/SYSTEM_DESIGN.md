# ExplainFlow System Design — Version 1

**Status:** Approved target architecture; dashboard implementation has not started<br>
**Date:** 2026-10-30<br>
**Companion documents:** [PRD](./PRD.md) · [Pipeline technical design](./PIPELINE_TECHNICAL_DESIGN.md)

## 1. Purpose and confirmed decisions

This document defines the technical design for the ExplainFlow dashboard and
video-generation system. It is a target design, not a claim that the current
prototype already has production authentication, persistence, cloud storage,
Gemini planning, or a hosted render worker.

| Area | Version 1 decision |
| --- | --- |
| Accounts | Public email/password registration. No Google sign-in or invite-only access. |
| Roles | Normal users only. No admin dashboard. |
| Languages | English and German for dashboard UI and generated video content/narration. Source notes and video output may use either supported language independently. |
| Input | Idea text or pasted notes, selected colours, optional logo, optional creator images. |
| Review | Script and storyboard are editable and require explicit approval before rendering. |
| Generation limit | One retained completed video per verified user at a time. |
| Regeneration | No narration-only regeneration. A next generation becomes available only after the retained video is explicitly deleted or its 10-day expiry cleanup completes. |
| Technical failure | A failed job releases its temporary entitlement reservation. |
| Export | One 16:9, 1280 × 720 MP4 with captions and narration; fixed at 30 seconds. |
| Retention | Generated MP4 and narration audio expire after 10 days. Explicit deletion or expiry cleanup releases the held entitlement only after media cleanup succeeds. Creator assets remain until owner deletion. |
| Web host | Next.js on Vercel. |
| Render runtime | A Remotion-compatible runtime; final hosting provider intentionally deferred. |
| Database/storage | MongoDB metadata plus private Cloudflare R2 media. |
| Planning/narration | Gemini structured output and ElevenLabs, both server-side only. |

### 1.1 Retained-video entitlement rule

The entitlement is held only after the final MP4 reaches READY and uploads to
R2 successfully. A provider, render-runtime, or R2 failure leaves it
available. A successful creator owns one retained MP4/narration pair at a time,
not a permanent lifetime allowance.

- The creator can delete a completed video without deleting its project. The
  entitlement returns only after both MP4 and narration objects are removed or
  reconciled successfully.
- The 10-day expiry path uses the same cleanup/release rule. It does not free a
  second generation merely because an expiry timestamp was reached.
- While a video is retained or media deletion is pending, the product does not
  expose a second generation action.
- After explicit deletion or expiry cleanup, the immutable approved revision
  remains available for an edited or new generation request.
- Narration-only regeneration remains unavailable.
- The selected render runtime may make one bounded automatic retry of an unchanged approved
  revision. That is a technical recovery, not a second user generation.
- If it fails again, the project remains available for diagnosis, but Version 1
  does not expose unlimited manual retries.

## 2. Hosting and render-runtime boundary

Vercel is the preferred host for the dashboard, authentication, short Node API
actions, MongoDB access, and R2 signed URL issuance. The final host for rendering
and other CPU-heavy work is intentionally not chosen in Version 1 planning.

The following diagram defines a logical boundary, not a commitment to a specific
render-server provider:

~~~text
Browser
  │
  ▼
Vercel: Next.js dashboard + Node Route Handlers
  │       │              │
  │       │              ├── MongoDB
  │       ├── Gemini and ElevenLabs (server-side)
  │       └── Cloudflare R2 signed URLs
  │
  ▼
MongoDB-backed render-job queue
  │
  ▼
Render runtime/provider (to be selected)
  │
  ├── Reads one immutable render manifest
  ├── Renders in a temporary local workspace
  ├── Uploads MP4 to private R2
  └── Updates MongoDB job status
~~~

Remotion rendering requires Node.js, Chromium, CPU, memory, temporary disk, and
uninterrupted execution time for FFmpeg output. The dashboard must therefore
invoke rendering only through the immutable manifest/job boundary shown above.
Cloudflare Workers can perform lightweight edge/API work but are not the current
Remotion render runtime.

Before selecting the render host, run a controlled 30-second render spike against
the chosen runtime and record its duration, memory use, output correctness, and
failure behaviour. Vercel currently documents finite Hobby function resources and
personal/non-commercial use restrictions, which must be rechecked against the
actual pilot use before deployment.

References: [Vercel Hobby plan](https://vercel.com/docs/plans/hobby) ·
[Vercel Function limits](https://vercel.com/docs/functions/limitations) ·
[Vercel Terms](https://vercel.com/legal/terms)

## 3. Component responsibilities

| Component | Owns | Must not do |
| --- | --- | --- |
| Next.js dashboard | Bilingual UI, four-step flow, draft editing, status and downloads. | Contain provider, database, or R2 secrets. |
| Vercel Route Handlers | Authentication, authorization, validation, quotas, planning calls, jobs, signed intents. | Render MP4 files in a request. |
| Better Auth | Email/password sign-up, verified email, sessions, password reset. | Add Google OAuth in V1. |
| MongoDB | Users, projects, revisions, assets, entitlement, jobs, operational events. | Store media blobs. |
| Gemini adapter | Produces a constrained StoryPlan JSON draft. | Browse the web or bypass validation. |
| ElevenLabs adapter | Makes narration audio/alignment from the approved script. | Be callable from the browser. |
| Render runtime adapter | Claims one job, renders Remotion media, uploads R2, updates state. | Process arbitrary mutable dashboard data. |
| Cloudflare R2 | Private logo, image, narration, and MP4 objects. | Expose public bucket listings or permanent public URLs. |
| Daily cleanup | Expires media and reconciles R2 deletion. | Delete active project metadata. |

## 4. Dashboard flow and languages

~~~text
Sign up / sign in
  → select English or German dashboard UI
  → projects list
  → create project: brief + output language + brand assets
  → draft script and storyboard
  → edit, select a narration voice, and explicitly approve
  → one generation request
  → queued / rendering / ready / failed status
  → preview and download for 10 days
  → delete video or wait for expiry cleanup
  → create the next video when entitlement becomes available
~~~

- UI locale is stored in the user profile as en or de.
- Output language is stored in each project as en or de.
- Changing UI locale does not translate a project.
- Source-note language may be Auto-detect, English, or German. Gemini may
  translate/adapt it into either supported output language.
- Changing output language invalidates approval and creates a new editable draft.
- The creator selects an allowed narration voice for the chosen output language
  during review. Changing that voice invalidates approval.
- The dashboard is responsive, but Version 1 does not include a professional
  timeline editor.

## 5. State machines

### 5.1 Project state

~~~text
DRAFT → PLANNING → REVIEW_REQUIRED → APPROVED
  → GENERATION_QUEUED → GENERATING → READY

READY → MEDIA_DELETION_PENDING → APPROVED

PLANNING → PLAN_FAILED
GENERATION_QUEUED or GENERATING → GENERATION_FAILED
GENERATION_FAILED → GENERATION_QUEUED (worker-only, when attemptCount is below 2)

Any material edit from REVIEW_REQUIRED, APPROVED, or GENERATION_FAILED → DRAFT
~~~

READY means the sole retained export is downloadable. MEDIA_DELETION_PENDING
means a creator deletion or scheduled expiry has revoked new playback/download
actions while private R2 cleanup is underway. Once cleanup succeeds, the
project returns to APPROVED and its generation job records MEDIA_DELETED or
EXPIRED. The approved revision remains reusable, so the owner can edit,
re-approve, or create the next generation after entitlement release.

### 5.2 Retained-video entitlement

~~~text
AVAILABLE → RESERVED → HELD → RELEASING → AVAILABLE
                │
                └── AVAILABLE (technical failure/cancellation before READY)
~~~

The API atomically reserves the entitlement before it creates a job. The worker
holds it only after R2 confirms the completed MP4 upload. A creator deletion
and the expiry worker both transition the same held job to RELEASING; only
confirmed deletion/reconciliation of both MP4 and narration returns it to
AVAILABLE. This prevents two browser tabs or competing cleanup paths from
creating two retained videos.

## 6. MongoDB data design

MongoDB is the authorization source. Each project-owned record includes userId,
and every query is scoped by the authenticated session user.

| Collection | Core contents |
| --- | --- |
| Better Auth collections | User, password/account, session, email-verification, and reset records. |
| user_profiles | userId, uiLocale, timestamps. Better Auth remains authoritative for email verification. |
| projects | userId, title, outputLanguage, targetDurationSeconds: 30, status, currentDraftId/currentDraftVersion, activeApprovedRevisionId, approvalSequence. |
| project_drafts | One mutable draft per project: source-language selection/detection, brief, branding, StoryPlan, voice key, and version. |
| project_revisions | Immutable approved render snapshots: StoryPlan, brand, frozen narration voice/provider reference, asset snapshot, and revision hash. |
| assets | Project/user/revision IDs, private source/render/preview keys, type, MIME, bytes, mediaExpiresAt, lifecycle, and delete state. |
| generation_entitlements | userId, scope, AVAILABLE/RESERVED/HELD/RELEASING state, reservation, held-job reference, release reason/timestamps. |
| generation_jobs | User/project/revision IDs, status, render/deletion leases, attempts, safe error code, narration/export assets, media-deletion state. |
| audit_events | Minimal safe operational event, project/user reference, timestamp. |

Required indexes:

~~~text
projects:                { userId: 1, updatedAt: -1 }
project_revisions:       { projectId: 1, version: -1 }
project_drafts:          unique { projectId: 1 }
assets:                  { projectId: 1, lifecycle: 1 }
assets:                  { mediaExpiresAt: 1, lifecycle: 1 }
generation_entitlements: unique { userId: 1, scope: 1 }
generation_jobs:         { status: 1, queuedAt: 1 }
generation_jobs:         { "lease.until": 1, status: 1 }
generation_jobs:         { "mediaDeletion.state": 1, "mediaDeletion.requestedAt": 1 }
audit_events:            { projectId: 1, createdAt: -1 }
~~~

The entitlement scope is v1_single_retained_video. It is a dedicated collection and
unique index, rather than a mutable counter on the user record, to make the
one-video rule race-safe and auditable. See
[DATABASE_DESIGN.md](DATABASE_DESIGN.md) for canonical collection schemas,
additional idempotency indexes, and retention lifecycle rules.

## 7. Private R2 design

~~~text
users/{userId}/projects/{projectId}/assets/{assetId}/source
users/{userId}/projects/{projectId}/assets/{assetId}/safe-preview
users/{userId}/projects/{projectId}/generations/{generationJobId}/narration.mp3
users/{userId}/projects/{projectId}/generations/{generationJobId}/export.mp4
~~~

- R2 objects are private. MongoDB determines ownership.
- The API issues short-lived, single-purpose signed upload/download URLs only
  after session, ownership, state, MIME type, and size checks.
- Object keys are generated server-side; original filenames are never authority.
- Before rendering, the worker receives short-lived renderer-only URLs inside
  an immutable manifest.
- Project deletion queues deletion of its matching R2 prefix and records any
  reconciliation failure for retry.

## 8. API contract

All business endpoints use the Node.js runtime and require a Better Auth
session. [API_DESIGN.md](API_DESIGN.md) is the canonical endpoint, error,
upload-verification, and concurrency contract; the table below is a system
summary.

| Endpoint | Purpose | Required checks |
| --- | --- | --- |
| GET/PATCH /api/v1/me | Read/change safe profile preferences. | Session owner scope. |
| GET /api/v1/voices | List curated allowed voices for an output language. | Session; no arbitrary provider voice ID. |
| POST/GET /api/v1/projects | Create/list owner-scoped projects. | Verified user, fixed 30-second target, input schema. |
| GET/PATCH/DELETE /api/v1/projects/:id | Read, rename, or delete an owned project. | Ownership, state and deletion checks. |
| PATCH /api/v1/projects/:id/draft | Save a material draft edit. | Ownership, If-Match draft version, invalidate approval. |
| POST /api/v1/projects/:id/assets/upload-intents | Create scoped R2 upload action. | Ownership, allowed type/size/quota validation. |
| POST /api/v1/projects/:id/assets/:assetId/complete | Verify R2 upload before an asset becomes usable. | Ownership, object/MIME/checksum checks. |
| POST /api/v1/projects/:id/plan | Create draft script/storyboard. | Ownership, consent, rate limit, Gemini/Zod validation. |
| POST /api/v1/projects/:id/approve | Freeze an approved revision. | Complete valid draft and owned assets. |
| POST /api/v1/projects/:id/generation | Create a generation job when the retained-video entitlement is available. | Approved revision, atomic entitlement, idempotency key. |
| GET /api/v1/generations/:id | Poll generation status. | Job belongs to caller. |
| POST /api/v1/generations/:id/playback-intent | Get inline MP4 playback action. | READY, ownership, not expired. |
| POST /api/v1/generations/:id/download-intent | Get MP4 download action. | READY, ownership, not expired. |
| DELETE /api/v1/generations/:id | Delete a retained rendered video while keeping the project. | READY holder job, ownership, idempotent media-cleanup transition. |

There is deliberately no admin endpoint, global usage dashboard, or
narration-only regeneration endpoint in Version 1. A new full generation is
permitted only after explicit rendered-video deletion or 10-day expiry cleanup
has returned the entitlement to AVAILABLE.

The client sends an Idempotency-Key UUID when it starts generation. Repeating
the same user/project/approved-revision/key returns the existing job rather than
creating another job or entitlement reservation.

## 9. Processing pipelines

### 9.1 Planning

~~~text
Validated creator brief
  → verify session, consent, and rate limit
  → request Gemini structured JSON
  → Zod + semantic validation
  → store draft revision
  → project becomes REVIEW_REQUIRED
~~~

The planner may use only submitted text, selected settings, and creator assets.
It must not browse the web, use stock media, or present generated facts as
verified sources.

### 9.2 Approval

~~~text
Creator edits draft
  → server validates StoryPlan, branding, asset ownership, and allowed narration voice
  → explicit approve action
  → immutable revision + SHA-256 content hash
  → project becomes APPROVED
~~~

The renderer consumes only this immutable revision, never mutable dashboard
fields.

### 9.3 Asynchronous generation

~~~text
Generation request
  → reserve retained-video entitlement atomically
  → create QUEUED job and return HTTP 202

Render runtime claim
  → create narration + alignment using the approved narration voice
  → build read-only RenderManifest
  → selected render runtime produces a 30-second 720p MP4
  → upload MP4 privately to R2
  → mark job READY and entitlement HELD
  → set media expiration to completion + 10 days
~~~

The browser polls every 3–5 seconds while the job is active and stops/slows on
READY, GENERATION_FAILED, MEDIA_DELETED, or EXPIRED.

### 9.4 Render-runtime reliability

- Claim QUEUED jobs through MongoDB findOneAndUpdate with a lease.
- Refresh the lease during rendering. A later runtime instance may reclaim a stale lease
  after a crash.
- Permit a maximum of two attempts for the unchanged job: original plus one
  automatic technical retry.
- Render inside an isolated temporary directory; remove it after upload or safe
  failure handling.
- Store only safe error codes, such as TTS_UNAVAILABLE, RENDER_TIMEOUT,
  R2_UPLOAD_FAILED, and INVALID_MANIFEST.
- Use a deterministic R2 export key based on job ID so recovery does not create
  duplicate output.

## 10. 10-day retention

| Data | Retention | Behaviour after expiry |
| --- | --- | --- |
| Completed MP4 | 10 days | Revoke new playback/download actions, delete/reconcile from R2, then release entitlement. |
| Narration audio | 10 days | Delete/reconcile with its MP4 before entitlement release. |
| Creator assets | Until owner deletion | Retained as part of the saved project; subject to upload-size and storage limits. |
| Project/revision metadata | Until owner deletion | Show explicit-deletion/expired history; retain the approved revision for a later generation. |
| Audit events | Minimum operational period | Delete or aggregate; never store raw notes/secrets. |

Use both an R2 lifecycle rule for eventual deletion of completed export/narration
objects and an authenticated daily cleanup endpoint. It first claims the held
generation for media deletion, blocks future playback/download actions, deletes
or reconciles both objects, records EXPIRED, and only then releases the
entitlement. The creator-initiated video-deletion route uses the same state
machine with a different release reason. Daily scheduling is sufficient for a
10-day promise; it is not the render queue.

Reference: [Vercel cron usage and Hobby limits](https://vercel.com/docs/cron-jobs/usage-and-pricing)

## 11. Security and abuse controls

| Threat | Control |
| --- | --- |
| Automated registration/generation | Verified email, bot protection, route rate limits. |
| Duplicate multi-tab generation | Atomic entitlement reservation plus idempotency key. |
| Cross-user project/media access | Owner-scoped MongoDB queries and signed R2 actions. |
| Public media exposure | Private bucket, short-lived signed URLs, no browser storage credentials. |
| Premature entitlement release | Shared HELD → RELEASING cleanup claim; release only after MP4 and narration deletion/reconciliation. |
| Dangerous or oversized uploads | MIME allowlist, size cap, server-generated key, metadata checks. |
| Secret exposure | Provider keys only in Vercel/worker environment variables; never client code/logs. |
| Sensitive source material | Consent and UI warning prohibiting confidential, sensitive, and student personal data. |
| Unreviewed AI output | Explicit review/approval; material edits invalidate approval. |
| Provider/render-runtime outage | Safe status, bounded retry, preserved approved revision, no quota consumption on failure. |

No admin dashboard does not mean no operations data. Store minimal structured
events and use host/worker logs for diagnosis without exposing a staff-facing
Version 1 interface.

## 12. Environment boundary

~~~text
Vercel / Next.js server
  BETTER_AUTH_SECRET, BETTER_AUTH_URL, MONGODB_URI, GEMINI_API_KEY
  R2_ACCOUNT_ID, R2_BUCKET, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_ENDPOINT
  TURNSTILE_SECRET_KEY, email-provider credentials, INTERNAL_WORKER_TOKEN

Selected render runtime
  MONGODB_URI, R2 credentials, ELEVENLABS_API_KEY
  ELEVENLABS_MODEL_ID, INTERNAL_WORKER_TOKEN
~~~

The browser receives only public configuration, such as UI locale, upload
restrictions, and a public bot-protection site key. It never receives Gemini,
ElevenLabs, MongoDB, R2, or Better Auth secret values.

## 13. Launch gates

Do not enable public generation until:

1. Email/password sign-up, verification, reset, and tenant isolation have
   automated coverage.
2. Gemini produces valid English and German structured plans, while invalid
   output is rejected safely.
3. The selected ElevenLabs account/plan explicitly permits the intended public
   use. Local Free-plan narration is not proof of public/commercial eligibility.
4. R2 authorization, explicit video deletion, and 10-day expiry/release are
   tested with two separate users.
5. The selected render runtime repeatedly renders a correct 30-second fixture
   without the dashboard depending on a long synchronous request.
6. Simultaneous generation, explicit deletion, expiry cleanup, and failed jobs
   preserve the one-retained-video rule.
7. The actual Vercel plan matches the intended public use; Hobby is not treated
   as the permanent commercial SaaS host.

## 14. Implementation order

1. Better Auth email/password, verification, and bilingual UI locale handling.
2. MongoDB project/revision models, owner-scoped repositories, and entitlement.
3. Private R2 upload/download intents and deletion/retention metadata.
4. Gemini planning plus editable draft/review/approval APIs.
5. Choose and validate the render runtime/provider, then add its immutable
   manifest adapter, job queue, and 30-second 720p render path.
6. Responsive four-step dashboard and status/download UI.
7. Daily cleanup, end-to-end authorization tests, and launch-gate verification.

This order preserves the boundary between what has been proven locally (Remotion
fixtures) and what remains planned (the dashboard and hosted SaaS system).
