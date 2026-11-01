# ExplainFlow — Project Status

**Last updated:** 1 November 2026<br>
**Overall status:** Pipeline prototype validated; SaaS dashboard implementation has not started.

ExplainFlow is a real SaaS product concept for turning an idea or outline into a clear, branded motion-graphic explainer. The local prototype has proven the controlled video-rendering path. The user-facing product experience—accounts, projects, AI planning, review, storage, and hosted generation—remains the next implementation phase.

## Current milestone

**Prototype 0: local render pipeline — complete and validated.**

The project can create fixed, template-driven 30-second explainers locally. It is not yet a deployable multi-user dashboard or a public production service.

## Completed and verified

| Area | Status | Evidence |
| --- | --- | --- |
| Product, system, pipeline, API, and database designs | Complete | `PRD.md`, `SYSTEM_DESIGN.md`, `PIPELINE_TECHNICAL_DESIGN.md`, `API_DESIGN.md`, and `DATABASE_DESIGN.md` are the Version 1 design baseline. |
| Remotion motion-graphics pipeline | Complete | Controlled 16:9, 1280 × 720, 30 FPS templates are implemented. |
| Story-plan validation | Complete | The Zod `StoryPlan` contract checks scene order and exact total duration before rendering. |
| Renderer correctness guards | Complete | The local verifier rejects 60/90-second Version 1 plans, mismatched narration/alignment files, and caption cues that exceed the 900-frame composition. |
| Creator logo and scene assets | Complete for local renderer inputs | Optional logo sources and approved scene-asset source mappings now render in the composition. R2 uploads and project-owned asset records remain unimplemented. |
| English and German example content | Complete | Local German rain, English AI tokens, and English ExplainFlow explainer fixtures are available. |
| ElevenLabs prototype narration | Complete for local/private development | The provider generates MP3 narration with timestamp alignment using server-side environment variables. |
| Caption-timing generation | Complete in the local pipeline | Caption cues and scene timing are derived from ElevenLabs character alignment when narration is present. |
| ExplainFlow product explainer | Verified | `output/explainflow-product-explainer-en.mp4` is 1280 × 720, exactly 30.00 seconds, and includes AAC audio. Its revised ending focuses only on previewing, downloading, and sharing. |

## What exists in code today

- A static Next.js Prototype 0 status page.
- Reusable Remotion compositions, illustrations, scene transitions, and brand-colour input.
- Local renderer support for supplied logo and per-scene asset source mappings, with a sample logo and illustration fixture.
- Local scripts to generate narration, render MP4 files, and verify media metadata.
- Local narration fixtures and rendered output files.
- No user-facing data is persisted by the current prototype.

## Version 1 product design decisions

These decisions are agreed in the design documents but are **not yet implemented**:

- Email/password authentication with Better Auth; no Google sign-in.
- English and German for both dashboard UI and generated-video narration. Source notes and output language may differ.
- A fixed 30-second, 16:9, 720p MP4 export.
- Creator-selected colours, logo, and images only; no stock-media library.
- A required script and storyboard review/approval step before generation.
- One retained completed video per user at a time, enforced by an entitlement record.
- Private R2 storage for creator assets and generated media, with owner-checked download access.
- No subscription, payment, admin dashboard, narration-only regeneration, or Google login in Version 1.

## Not implemented yet

| Area | Current status |
| --- | --- |
| Responsive dashboard, editor, and project list | Not built |
| Better Auth registration, sign-in, verification, password reset, and sessions | Not built |
| MongoDB connection, schemas, migrations, transactions, and audit records | Not built |
| Internal `/api/v1` Route Handlers | Not built |
| Gemini structured script/storyboard planning | Not built |
| Editable script and storyboard review UI | Not built |
| Cloudflare R2 uploads, private objects, signed downloads, and cleanup | Not built |
| Generation queue, entitlement enforcement, retries, and job-status polling | Not built |
| Hosted renderer and Vercel deployment configuration | Not built |
| Abuse protection, rate limits, automated tests, and production observability | Not built |

## Clarification about media retention

The current product explainer deliberately does **not** mention user deletion or a 10-day expiry. Its closing message is preview, download, and share.

The system and database design documents still contain a future Version 1 media-retention and entitlement model. That is an unimplemented technical design decision, not behavior currently available in the prototype and not part of the explainer's public message.

## Next milestone

**Create the dashboard UI design in Google Stitch, then build the dashboard foundation.**

1. Translate the approved PRD, API design, and database design into desktop and mobile dashboard screens in Google Stitch.
2. Add Better Auth and a MongoDB connection.
3. Implement authenticated project create/list/read flows with strict owner scoping.
4. Add the Gemini planning endpoint and the script/storyboard review screen.
5. Persist an immutable approved revision before connecting uploads and rendering.
6. Add private R2 asset storage, generation jobs, and the selected hosted-rendering strategy.

## Known constraints and launch gates

- ElevenLabs and Gemini require server-only environment configuration and are subject to free-tier quotas and current provider terms.
- ElevenLabs is validated only for local/private prototype narration. Its public/commercial eligibility must be confirmed before user-facing production narration is enabled.
- Rendering has been proven locally only. Vercel/serverless or worker-rendering behavior has not been validated.
- Remotion reported a Zod package-version warning during a local still render. The completed MP4 renders successfully, but Remotion-related dependencies and Zod should be pinned and revalidated before production hardening.
- There is no automated application test suite or deployed environment verification yet.

## Useful local commands

```powershell
npm run narration:explainflow
npm run render:explainflow
npm run verify:explainflow
```

The current product explainer output is `output/explainflow-product-explainer-en.mp4`.
