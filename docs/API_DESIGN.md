# ExplainFlow API Design — Version 1

**Status:** Approved pre-UI design

**Last updated:** 2026-10-30

## 1. Purpose and status

This document is the canonical browser-facing API contract for ExplainFlow
Version 1. It is written for a Next.js application using Node.js Route
Handlers, Better Auth, MongoDB, Gemini, ElevenLabs, Remotion, and private
Cloudflare R2 storage.

It describes an **internal REST API** used only by the ExplainFlow dashboard.
It is not a public developer platform: there are no customer API keys,
third-party integrations, webhooks, admin APIs, or browser access to provider
credentials in Version 1.

The final render host remains deliberately undecided. The browser API creates
and observes generation jobs; a trusted render-runtime adapter claims and
processes those jobs outside the browser request path.

## 2. Confirmed Version 1 contract

| Area | API rule |
| --- | --- |
| Authentication | Email/password sessions through Better Auth. No Google sign-in. |
| API style | Internal JSON REST API at /api/v1. The browser authenticates with its secure session cookie; it never sends a user ID as authority. |
| Languages | Source notes may be auto-detected, English, or German. Output video language is independently English or German. Gemini may translate and adapt between the two supported languages. |
| Video | Exactly one 30-second, 1280 × 720, 16:9 MP4 with captions and narration. No duration field is accepted from the client. |
| Review | A user edits a mutable draft, selects a curated allowed voice, and explicitly approves it before generation. Approval produces an immutable render snapshot. |
| Entitlement | One retained successful Version 1 video per user at a time. A technical failure releases its reservation; explicit media deletion or 10-day expiry cleanup releases a held entitlement. |
| Retry | The worker may make one automatic technical retry, for two attempts total. There is no browser retry or narration-only regeneration endpoint. |
| Assets | One PNG/JPEG/SVG logo up to 5 MB; up to five PNG/JPEG/WebP images up to 10 MB each. Assets are private in R2. |
| Retention | Creator assets and project metadata remain until the owner deletes the project. Completed MP4 and narration audio expire after 10 days; cleanup then returns the entitlement. |
| Roles | Normal users only. There is no administrator dashboard or administrator API in Version 1. |

## 3. API conventions

### 3.1 Route groups

| Route group | Owner | Notes |
| --- | --- | --- |
| /api/auth/* | Better Auth | Sign-up, sign-in, sign-out, verification, password reset, and session handling. These routes follow Better Auth rather than this business API document. |
| /api/v1/* | ExplainFlow | Authenticated product API described below. |
| Worker and cleanup operations | Server-only service boundary | Not browser routes and never callable using a normal user session. |

All business routes run in the Node.js runtime. They return
application/json, use UTF-8, and include Cache-Control: no-store unless a
response specifically returns a short-lived signed R2 action.

### 3.2 Identity, ownership, and timestamps

- The server obtains the current user only from the Better Auth session.
- A client-supplied userId, project owner, R2 object key, provider voice ID,
  or expiration time is ignored or rejected.
- IDs are opaque strings. The implementation should use one application ID
  format consistently and store the exact Better Auth user ID as userId.
- Timestamps are ISO 8601 UTC strings in API responses.
- All project, draft, revision, asset, and job queries include userId on the
  server. A foreign resource is returned as NOT_FOUND rather than revealing
  that it exists.

### 3.3 Locale and content language

The UI locale and the video language are intentionally separate:

| Field | Values | Meaning |
| --- | --- | --- |
| uiLocale | en, de | Dashboard labels and messages. Stored on the user profile. |
| sourceLanguage | auto, en, de | Creator selection for the pasted brief or notes. Auto is the default. |
| detectedSourceLanguage | en, de, null | Server/Gemini result. Informational only; never overrides an explicit creator selection without notice. |
| outputLanguage | en, de | Language of generated script, storyboard, captions, and narration. Stored on the project and frozen in an approved revision. |

An English note may produce a German video and a German note may produce an
English video. A UI-locale change never translates a project.

### 3.4 Response envelope and errors

Successful reads return resource JSON directly. Mutating endpoints return the
updated resource or a job/action wrapper. Errors use one safe envelope:

~~~json
{
  "error": {
    "code": "DRAFT_VERSION_CONFLICT",
    "messageKey": "errors.draftVersionConflict",
    "fieldErrors": {
      "expectedDraftVersion": "stale"
    },
    "requestId": "req_..."
  }
}
~~~

- code is stable and machine-readable.
- messageKey lets the dashboard present English or German copy without
  translating provider errors in the API.
- fieldErrors is present only for safe validation failures.
- requestId is safe to show to the user and is stored with operational logs.
- Provider responses, secrets, raw stack traces, temporary R2 URLs, and
  unreviewed source notes never appear in an error response.

### 3.5 Concurrency and idempotency

- Draft mutations and approval use an If-Match header containing the current
  draft ETag, for example If-Match: "draft-12". The server returns a new ETag
  after a successful change.
- Generation requires a UUID Idempotency-Key header. A repeat with the same
  user, operation, and key returns the existing job. Reusing a key with a
  different request fingerprint returns IDEMPOTENCY_KEY_REUSED.
- DELETE project is idempotent. Repeating it returns the existing deletion
  operation rather than performing a second cleanup.

## 4. Authentication and profile API

Better Auth owns account endpoints under /api/auth/*. ExplainFlow does not
write its account, password, session, or verification records directly.

Verified email ownership is required in Version 1 before a user can access
saved projects or generation. The email sender/provider choice is still a
launch configuration decision, not an API-design decision. Until that provider
is selected, product routes must preserve this requirement rather than
silently bypass it.

| Method and path | Purpose | Success |
| --- | --- | --- |
| GET /api/v1/me | Return safe user/profile data, UI locale, and entitlement summary. | 200 |
| PATCH /api/v1/me | Change uiLocale only. | 200 |

Example GET /api/v1/me response:

~~~json
{
  "user": {
    "id": "usr_...",
    "email": "creator@example.com",
    "emailVerified": true
  },
  "profile": {
    "uiLocale": "de"
  },
  "entitlement": {
    "scope": "v1_single_retained_video",
    "state": "AVAILABLE"
  }
}
~~~

## 5. Read-only creative configuration

| Method and path | Purpose | Success |
| --- | --- | --- |
| GET /api/v1/voices?language=en|de | Return the curated narration voice list valid for one output language. | 200 |
| GET /api/v1/templates | Return the small server-approved template catalogue. | 200 |

The voice response exposes a stable ExplainFlow voiceKey, display name,
language, and preview metadata only. The browser never receives or submits an
arbitrary ElevenLabs voice ID. The server maps voiceKey to a provider ID, then
stores both the safe selection and resolved provider reference in the approved
revision.

## 6. Project and draft API

### 6.1 Project resource

A project is a user-owned container. It has exactly one mutable draft and, when
approved, one active immutable approved revision. Project list responses do not
include the creator's raw notes or full storyboard.

~~~json
{
  "id": "prj_...",
  "title": "How rain forms",
  "outputLanguage": "de",
  "targetDurationSeconds": 30,
  "status": "REVIEW_REQUIRED",
  "currentDraftVersion": 7,
  "activeApprovedRevisionId": null,
  "latestGenerationJobId": null,
  "retainedGenerationJobId": null,
  "createdAt": "2026-10-30T10:00:00.000Z",
  "updatedAt": "2026-10-30T10:05:00.000Z"
}
~~~

Project status values are:

| Status | Meaning | Creator action |
| --- | --- | --- |
| DRAFT | Draft needs a plan or material edits made an approval invalid. | Edit, upload assets, create a plan. |
| PLANNING | Gemini planning is running. | Read status; do not overwrite the active plan request. |
| REVIEW_REQUIRED | An editable script/storyboard is ready for review. | Edit, choose voice, approve. |
| PLAN_FAILED | Planning did not produce a safe valid draft. | Correct input and request a new plan. |
| APPROVED | Immutable active revision is eligible for one generation request when the entitlement is AVAILABLE. | Generate or make a material edit. |
| GENERATION_QUEUED | A worker has not started the approved generation. | Read status only. |
| GENERATING | Narration/render work is active. | Read status only. |
| GENERATION_FAILED | The job reached a terminal technical failure; no permitted automatic retry remains. | Edit and re-approve before a new request; no retry button exists. |
| READY | The sole retained MP4 is available until explicit deletion or 10-day expiry. | View, download, rename, or delete the video. |
| MEDIA_DELETION_PENDING | Playback/download access is revoked while creator deletion or expiry cleanup removes media. | Read status only. |
| DELETING | Owner requested deletion and storage cleanup is in progress. | Read deletion status only. |

While READY or MEDIA_DELETION_PENDING, material draft editing and a second
generation are blocked because the user already has a retained completed video.
Once deletion or expiry cleanup succeeds, the project returns to APPROVED and
the released entitlement allows editing, re-approval, or a next generation.

### 6.2 Draft resource

The draft contains mutable creator input and editable planning output:

~~~json
{
  "version": 7,
  "source": {
    "text": "Water warms, becomes vapour, then cools...",
    "language": "auto",
    "detectedLanguage": "en"
  },
  "brief": {
    "audience": "Young learners",
    "objective": "Explain the water cycle",
    "tone": "clear and friendly"
  },
  "outputLanguage": "de",
  "brand": {
    "colors": ["#1F6F8B", "#D9F0F5"],
    "logoAssetId": "ast_...",
    "imageAssetIds": ["ast_..."]
  },
  "storyPlan": {
    "schemaVersion": "1",
    "script": "...",
    "scenes": [
      {
        "id": "scene_1",
        "order": 1,
        "durationMs": 6000,
        "narration": "...",
        "caption": "...",
        "visual": {
          "template": "concept",
          "description": "...",
          "assetIds": []
        }
      }
    ]
  },
  "narration": {
    "voiceKey": "de_clear_female_01"
  },
  "template": {
    "id": "educational-explainer-v1",
    "version": "1"
  },
  "consents": {
    "creatorContentRightsAccepted": true,
    "sensitiveDataNoticeAccepted": true,
    "policyVersion": "v1"
  }
}
~~~

Validation rules:

- source.text, audience, objective, tone, script, captions, and narration are
  plain text; unsupported HTML, URLs used as source material, external-media
  instructions, and provider fields are rejected.
- colors contain one to five valid hex colour values.
- outputLanguage is en or de. targetDurationSeconds is server-owned and always
  30.
- scene durations are positive and sum to exactly 30,000 milliseconds.
- Every asset reference must be an AVAILABLE asset owned by the same user and
  project.
- narration.voiceKey must be in the curated list for outputLanguage.
- template.id/version must be in the server-approved template catalogue.
- A draft cannot be approved without source text, consent, valid branding,
  complete StoryPlan, selected allowed voice, and selected allowed template.

### 6.3 Project endpoints

| Method and path | Purpose | Request / response highlights |
| --- | --- | --- |
| POST /api/v1/projects | Create a blank project and its one mutable draft. | Body: title. Returns 201 project. |
| GET /api/v1/projects | List caller-owned non-deleted projects. | Cursor pagination; returns summaries only. |
| GET /api/v1/projects/{projectId} | Read project, current draft, approved-revision summary, and safe asset/job summaries. | Returns ETag for the current draft. |
| PATCH /api/v1/projects/{projectId} | Rename a project. | Body: title. Does not invalidate approval. |
| PATCH /api/v1/projects/{projectId}/draft | Update material draft fields. | Requires If-Match; returns draft and new ETag. Material changes invalidate active approval. |
| POST /api/v1/projects/{projectId}/plan | Ask Gemini for a structured plan from the current draft. | Requires If-Match and current consent; performs this bounded planning call synchronously and returns 200 with the saved draft/StoryPlan. |
| POST /api/v1/projects/{projectId}/approve | Validate and freeze the current draft into an immutable revision. | Requires If-Match; returns 200 active approved revision. |
| DELETE /api/v1/projects/{projectId} | Request project/media deletion. | Returns 202 with DELETING state. |

The planning endpoint may only use submitted notes, creator settings, and
creator-provided assets. It must not browse the web, use stock media, claim
factual verification, or pull documents and URLs into Version 1.

The route sets PLANNING before it calls Gemini, then commits either
REVIEW_REQUIRED with the validated result or PLAN_FAILED with a safe error code
before it returns. If a browser refreshes during the request, GET project
remains the source of truth. A stale PLANNING timeout is reconciled to
PLAN_FAILED rather than leaving a project permanently blocked.

Changing source text, source-language selection, output language, brief,
branding, visual asset references, script/storyboard, scene timing, template,
or narration voice is material. The server clears activeApprovedRevisionId,
marks the previous approval superseded, and returns the project to DRAFT.

## 7. Asset API

Uploads use a two-phase, direct-to-private-R2 flow. An upload intent is not
permission to use an asset in a render.

| Method and path | Purpose | Success |
| --- | --- | --- |
| POST /api/v1/projects/{projectId}/assets/upload-intents | Validate a requested upload and create one short-lived R2 upload action. | 201 |
| POST /api/v1/projects/{projectId}/assets/{assetId}/complete | Verify the uploaded object server-side and mark it AVAILABLE. | 200 |
| POST /api/v1/projects/{projectId}/assets/{assetId}/view-intent | Issue a short-lived owner-only view action for a usable asset. | 200 |
| DELETE /api/v1/projects/{projectId}/assets/{assetId} | Remove an unused creator asset and schedule object cleanup. | 204 |

### 7.1 Upload-intent request

~~~json
{
  "kind": "LOGO",
  "filename": "school-logo.svg",
  "contentType": "image/svg+xml",
  "contentLength": 212345,
  "sha256": "optional-client-checksum"
}
~~~

The API creates a server-generated assetId and object key, records an
expiring upload intent, and returns a single-purpose signed PUT action. It
enforces these limits before issuing the action:

| Kind | Allowed MIME types | Limit |
| --- | --- | --- |
| LOGO | image/png, image/jpeg, image/svg+xml | One per project, 5 MB maximum |
| IMAGE | image/png, image/jpeg, image/webp | Up to five per project, 10 MB maximum each |

The completion endpoint checks the R2 object exists, is within size limits,
matches its expected MIME type and magic bytes where applicable, and has the
server-computed checksum expected by the application. It rejects and cleans up
unverified or mismatched objects.

Raw SVG is never rendered directly into the dashboard. Before an SVG becomes
AVAILABLE, the server must sanitize and rasterize it, or otherwise create a
safe render/preview derivative. Scripts, foreign-object content, external
references, and unsafe SVG features are rejected.

An asset referenced by the active approved revision or an in-progress
generation cannot be physically removed. The API returns ASSET_IN_USE until
the user makes a new draft that removes the reference or the job becomes
terminal.

## 8. Generation and download API

| Method and path | Purpose | Success |
| --- | --- | --- |
| POST /api/v1/projects/{projectId}/generation | Atomically reserve the available retained-video entitlement and create one job. | 202 |
| GET /api/v1/generations/{generationId} | Poll owner-visible job progress and safe failure state. | 200 |
| POST /api/v1/generations/{generationId}/playback-intent | Issue a short-lived inline MP4 playback action when READY. | 200 |
| POST /api/v1/generations/{generationId}/download-intent | Issue a short-lived signed MP4 download action when READY. | 200 |
| DELETE /api/v1/generations/{generationId} | Delete a retained rendered video while keeping its project/draft/revision. | 202 |

Generation request:

~~~json
{
  "approvedRevisionId": "rev_..."
}
~~~

Required headers:

~~~text
Idempotency-Key: 550e8400-e29b-41d4-a716-446655440000
~~~

The server derives the project owner and verifies all of the following in one
critical operation:

1. The project is APPROVED and the submitted revision is its active approved
   revision.
2. The revision is immutable, complete, internally valid, and still owns every
   referenced asset.
3. The user's entitlement is AVAILABLE.
4. No other active generation exists for the project.
5. The caller has not already used the same idempotency key for a different
   request.

It then sets the entitlement to RESERVED, creates one GENERATION_QUEUED job,
and returns:

~~~json
{
  "generation": {
    "id": "gen_...",
    "status": "GENERATION_QUEUED",
    "attemptCount": 0,
    "maxAttempts": 2,
    "projectId": "prj_...",
    "approvedRevisionId": "rev_..."
  }
}
~~~

The browser polls every three to five seconds while a generation is active.
There is no POST retry or narration-only regeneration route. A new full
generation is allowed only after the retained video was explicitly deleted or
the 10-day expiry cleanup returned the entitlement to AVAILABLE.

Playback and download intents are valid only for a short time and only when the
job is READY and the media expiration time has not passed. A playback intent
uses an inline media disposition; a download intent uses an attachment
disposition. A deleted or expired export returns 410 EXPORT_UNAVAILABLE.

DELETE generation accepts only the owner's READY job that currently holds the
user's entitlement. It returns 202 with MEDIA_DELETION_PENDING, blocks new
playback/download intents immediately, and keeps the entitlement unavailable
while trusted cleanup removes both MP4 and narration objects. When cleanup
succeeds, the job becomes MEDIA_DELETED, the project returns to APPROVED, and
the entitlement becomes AVAILABLE. Repeating the delete request is idempotent.
Already-issued signed URLs are intentionally short-lived and expire naturally.
If R2 cleanup fails, the job remains pending and a second generation stays
blocked until reconciliation succeeds.

A repeat DELETE for the same MEDIA_DELETION_PENDING job returns the existing
pending deletion operation rather than failing state validation. DELETE for a
different historical job remains a safe state conflict.

## 9. Server-only worker and cleanup boundary

The render adapter is a trusted server component, not a user-facing API.
Whether it ultimately runs locally, on a worker, or on a separate compatible
render provider, it must implement these internal operations:

| Operation | Required behaviour |
| --- | --- |
| Claim next job | Atomically claim one GENERATION_QUEUED job whose attempt count is below the two-attempt maximum, with a lease token and expiry. |
| Renew lease | Refresh only the claim owned by that worker. |
| Build narration | Use the approved revision's frozen voice/provider reference; never mutable draft data. |
| Build manifest | Resolve a read-only manifest with short-lived renderer-only asset URLs. |
| Complete job | Upload MP4 privately, then atomically set job READY and entitlement HELD only if the worker lease is valid and the project is still active rather than DELETING. |
| Fail job | Record a safe code. Requeue once if retryable and attempts remain; otherwise release the matching RESERVED entitlement. |
| Delete/expire media | Atomically claim the held job for media cleanup, revoke new intents, remove/reconcile MP4 and narration, then mark MEDIA_DELETED or EXPIRED and release the matching entitlement. |
| Delete project | Stop/cancel a non-final job where possible; if it owns held media, run the same media-release flow before hard-deleting project-owned data. |

Remote worker calls, if introduced later, require a separate service credential
and replay protection. They must never accept a Better Auth user session as
authority.

## 10. HTTP status and error catalogue

| Status | Code examples | Meaning |
| --- | --- | --- |
| 400 | MALFORMED_JSON, INVALID_IDEMPOTENCY_KEY | Request cannot be parsed or required protocol data is malformed. |
| 401 | UNAUTHENTICATED | No valid session. |
| 403 | EMAIL_VERIFICATION_REQUIRED | Account email is not verified, which is required for Version 1 project/generation access. |
| 404 | PROJECT_NOT_FOUND, ASSET_NOT_FOUND, GENERATION_NOT_FOUND | Missing resource or resource not owned by caller. |
| 409 | DRAFT_VERSION_CONFLICT, APPROVAL_REQUIRED, APPROVAL_STALE, GENERATION_IN_PROGRESS, ENTITLEMENT_HELD, MEDIA_DELETION_PENDING, IDEMPOTENCY_KEY_REUSED, ASSET_IN_USE | Valid request conflicts with current state. |
| 410 | EXPORT_UNAVAILABLE, UPLOAD_INTENT_EXPIRED | Resource once existed but is no longer usable. |
| 422 | VALIDATION_FAILED, INVALID_STORY_PLAN, UNSUPPORTED_ASSET_TYPE, ASSET_TOO_LARGE, ASSET_VERIFICATION_FAILED | Parsed request fails domain validation. |
| 429 | RATE_LIMITED, FAIR_USE_LIMIT_REACHED | Caller or shared service limit is temporarily exhausted. |
| 503 | PLANNER_UNAVAILABLE, NARRATION_UNAVAILABLE, RENDER_CAPACITY_UNAVAILABLE | A dependency is unavailable; no unsafe partial result is exposed. |

Generation failures reported after job creation use the GET generation response,
not a raw provider error:

~~~json
{
  "generation": {
    "id": "gen_...",
    "status": "GENERATION_FAILED",
    "attemptCount": 2,
    "maxAttempts": 2,
    "failure": {
      "code": "RENDER_TIMEOUT",
      "messageKey": "generation.renderTimeout"
    }
  }
}
~~~

## 11. Authorization and security rules

- All database queries are owner-scoped. Authorization does not rely on a
  hidden client field or R2 path convention alone.
- R2 is private. The API issues short-lived upload, view, renderer, and
  download actions only after validating session, ownership, state, MIME type,
  size, and retention.
- Cookie-authenticated state-changing routes require same-origin validation and
  CSRF protection. POST, PATCH, and DELETE calls must validate an
  application-issued anti-CSRF token or an equivalent Better Auth-supported
  mechanism; SameSite cookies alone are not the only protection.
- Route handlers and workers use server-side environment variables for Gemini,
  ElevenLabs, R2, MongoDB, and any mail provider. No provider secret is sent to
  the dashboard or logged.
- Rate limits and bot protection apply to sign-up, planning, upload intent,
  upload completion, generation, playback/download intents, and deletion routes.
- Raw creator notes, image URLs, audio URLs, and secrets are excluded from
  routine audit logs.
- The user must explicitly accept content-rights and sensitive-data notices
  before notes are sent to Gemini.

## 12. UI states this API must support

The future Google Stitch designs should include clear visual states for:

- unverified account and verification-required access;
- empty project list and project creation;
- editable draft, planning in progress, and plan failure;
- review-required, voice selection, and approval confirmation;
- queued, generating, ready, video-deletion-pending, explicitly deleted, and
  expired export;
- retained, releasing, and available entitlement;
- upload validation, upload verification, asset-in-use, and deletion-in-progress;
- completed-video deletion confirmation and media-cleanup-pending status;
- owner-only project deletion confirmation.

The API must make each state recoverable after a browser refresh. It must never
force the UI to guess whether a render, upload, or approval succeeded.
