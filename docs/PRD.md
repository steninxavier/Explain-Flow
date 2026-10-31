# Product Requirements Document: ExplainFlow

**Status:** Draft, Version 1 free-tool SaaS release scope<br>
**Last updated:** 2026-10-30<br>
**Product name:** ExplainFlow<br>
**Tagline:** From idea to clear video.

## 1. Product summary

ExplainFlow is a real, free-to-use SaaS product built with free-tier tools. It helps a person teach an idea or convey a message clearly to another person. Any person can create an account, supply an idea or teaching notes, choose English or German, then review an AI-produced script and storyboard before generating a branded, narrated 30-second motion-graphics video.

The Version 1 product deliberately creates clear, template-driven educational explainers instead of cinematic AI-generated footage. The creator remains responsible for the message: the application must require review and approval of both the script and the storyboard before rendering a downloadable video.

### Product positioning

**ExplainFlow — From idea to clear video.**

Primary homepage message: **Turn your ideas into clear, branded motion-graphic videos.**

## 2. Problem and opportunity

Educators, course creators, and subject-matter experts often know what they want to teach but do not have the time or video-editing ability to turn their explanation into a concise visual lesson. Creating a short explainer normally requires scripting, visual planning, narration, branding, animation, rendering, and export.

This product removes the blank-timeline problem while preserving creator control. It turns teaching content into a proposed visual narrative and a polished, short video only after the creator has reviewed it.

## 3. Product goal

Enable an educator or course creator to go from an idea or pasted teaching notes to a reviewed, branded, 30-second educational explainer video that can be downloaded in 720p.

### Release model

Version 1 is an openly available, free SaaS release built with selected free-tier tools. It provides the complete ExplainFlow experience: account creation, project saving, script and storyboard generation, review, video generation, and download.

- Anyone can register with email/password and use the available Version 1 features for free.
- There is no subscription, payment, or billing flow in Version 1. This is not an access restriction; it means every registered user has free access to the available features.
- The product is intentionally built as a real user-facing SaaS experience, with accounts, saved projects, generation, review, and downloads.
- The initial release may be improved, redesigned, or expanded after feedback and technical results are reviewed.
- Moving beyond free-tier tools or introducing paid plans is a future product decision; it requires a fresh review of provider terms, privacy, operating costs, and scale.

### Success looks like

- A new creator can complete the four-step flow without video-editing expertise.
- The creator can correct the AI's wording or visuals before a render starts.
- The final video communicates only the creator's submitted teaching content, using their chosen colours, logo, and supplied images.
- Registered users can complete the full flow and give actionable feedback.
- The Version 1 release operates within deliberately enforced free-tier quotas and does not depend on a paid AI-video-generation service.

## 4. Target users

### Primary users

- **Educators:** teachers, tutors, trainers, and instructors explaining a concept, process, or lesson.
- **Course creators:** people creating short introductions, lesson summaries, module explainers, or concept recaps for an online course.

### Secondary users

- Subject-matter experts who need to communicate an idea clearly to an audience but do not identify as video creators.

### Jobs to be done

When I need to teach or explain an idea, I want to turn my own notes into a concise, branded visual video, so that someone can understand the message without my having to learn video-editing software.

## 5. Version 1 scope

### 5.1 Supported languages

Generated script, storyboard text, captions, and narration must support:

- English
- German

The creator chooses one output language per project. Source notes may be
English or German independently of that choice. Gemini translates and adapts
between the two supported languages before the creator reviews the resulting
script and storyboard. A project may still be duplicated later to create a
separate version in the other supported language.

### 5.2 Inputs

Version 1 accepts only:

- A short idea or topic entered by the creator.
- Teaching notes pasted into the application.
- A target audience, learning or communication goal, tone, and selected output language.
- Creator-provided brand colours.
- An optional creator-provided logo.
- Optional creator-provided images.

The product must not fetch stock media, use third-party image libraries, or invent factual teaching content in Version 1. Abstract shapes, typography, diagrams, and motion effects may be generated from the submitted text and selected colours, but every logo, photograph, and teaching claim must originate with the creator.

### 5.3 Output specification

The generated output must be:

- 30 seconds long.
- 16:9 landscape.
- 1280 x 720 pixels (720p).
- A downloadable MP4 video with narration and captions.
- A branded motion-graphics explainer based on a selected template, creator colours, optional logo, and optional creator images.

## 6. Core user flow

The product experience is intentionally four steps.

### Step 1: Idea

1. A user signs in or creates an account.
2. The user starts a new video project.
3. The user enters either an idea or pasted teaching notes.
4. The user selects source-note language (Auto-detect, English, or German),
   output language (English or German), audience, objective, tone, colours,
   and optional logo/images. Version 1 uses a fixed 30-second output duration.
5. The user confirms that they own or have permission to use the submitted content and that the notes do not contain confidential, sensitive, or student personal data.

### Step 2: Storyboard

1. The system creates a proposed script sized for the fixed 30-second duration.
2. The system creates a scene-by-scene storyboard with narration, on-screen text, visual description, and the creator-provided asset to use when applicable.
3. The default storyboard contains a short introduction, a clear explanation, and a conclusion or call to action appropriate to the creator's goal.
4. The system makes it clear that this is a draft derived from the creator's input, not a source of authority.

### Step 3: Review

1. The user can edit the script directly.
2. The user can edit scene titles, on-screen text, visual descriptions, order, and scene timing.
3. The user can replace or remove an uploaded image, change colours, and add or remove the optional logo.
4. The application must show a preview of the approved visual direction.
5. The user selects an available narration voice for the chosen language.
6. The user must explicitly approve the script, storyboard, and narration voice before the Generate action becomes available.
7. Any material change after approval must return the project to the review state.

### Step 4: Generate and download

1. The system renders the approved project as a 720p landscape video, including narration, captions, scene animations, creator colours, logo, and supplied images.
2. The system shows generation progress and a clear failure/retry state.
3. The user can preview the completed result and download the MP4.
4. While a completed video is retained, the user cannot generate a second
   video. The user can explicitly delete the completed video; after its MP4 and
   narration audio are removed, one video entitlement becomes available again.
5. When the 10-day retention cleanup removes a completed video, the entitlement
   also becomes available again. A technical failure preserves the project and
   does not hold the entitlement.
6. Narration-only regeneration remains unavailable in Version 1.

## 7. Functional requirements

### 7.1 Authentication and accounts

| ID | Requirement |
| --- | --- |
| AUTH-01 | Any user can create an account and sign in with an email address and password. Public self-service registration is available in Version 1. |
| AUTH-02 | Email/password accounts must use verified email ownership before they can access saved projects or generation. The product must not disable verification merely to work around free-tier email limits. |
| AUTH-03 | Users can sign out and reset a forgotten password through a secure verified-email flow. |
| AUTH-04 | A user can access only their own projects, uploaded assets, and generated video records. |
| AUTH-05 | Account creation and generation requests must be protected against automated abuse with server-enforced rate limits and bot protection. These safeguards must not require an invite or payment. |

### 7.2 Project creation

| ID | Requirement |
| --- | --- |
| PROJ-01 | A user can create, rename, reopen, and delete their own projects. |
| PROJ-02 | Each project stores input text, settings, script draft, storyboard, approved state, asset references, and export history. |
| PROJ-03 | A project requires an idea or teaching notes before storyboard generation. |
| PROJ-04 | A project requires a selected output language: English or German. |
| PROJ-05 | Every Version 1 project uses a fixed target duration of 30 seconds; the user does not select a duration. |
| PROJ-06 | A project requires one or more creator-selected colours. A logo and images remain optional. |
| PROJ-07 | A user can delete a project. Deletion must remove its project metadata, associated uploaded assets, and generated exports; if it removes a retained completed video, it returns the entitlement only after MP4/narration cleanup succeeds. |
| PROJ-08 | A user can delete their own completed rendered video without deleting the project. The project retains its editable draft and approved revision after video-media cleanup completes. |

### 7.3 AI script and storyboard generation

| ID | Requirement |
| --- | --- |
| AI-01 | The system generates a concise draft script from the submitted idea or teaching notes and selected project settings. |
| AI-02 | The system generates a structured storyboard from that script. Each scene includes narration, on-screen text, visual direction, and timing. |
| AI-03 | The system must respect the selected output language for script, captions, and narration, and may translate/adapt English source notes to German output or German source notes to English output. |
| AI-04 | The system must not claim that generated statements are verified facts. It must instruct the user to review factual accuracy. |
| AI-05 | The system must not use web search, external stock media, uploaded PDFs, URLs, or documents in Version 1. |
| AI-06 | The service must apply server-enforced, configurable fair-use limits and display a useful message when a shared free-tier quota is unavailable. Every registered user may use the available features for free; safeguards exist only to protect the service from automated abuse and exhausted provider quotas. |

### 7.4 Review and approval

| ID | Requirement |
| --- | --- |
| REV-01 | The user can edit every script and storyboard field before generation. |
| REV-02 | The user can add, remove, and reorder storyboard scenes while the total timing remains exactly 30 seconds. |
| REV-03 | The system must block rendering until the user explicitly approves the current script, storyboard, and narration voice. |
| REV-04 | Changes to approved script, scenes, timing, brand settings, assets, or narration voice invalidate approval. |
| REV-05 | The review screen clearly identifies all creator-provided images and logo assets used by each scene. |

### 7.5 Motion graphics, narration, and export

| ID | Requirement |
| --- | --- |
| VIDEO-01 | The product provides a small, curated set of educational motion-graphics templates. |
| VIDEO-02 | Templates must use the creator's chosen colours and optional logo; they must not impose a fixed product brand on the exported video. |
| VIDEO-03 | Templates may use animated text, shapes, diagrams, icons created from basic geometry, transitions, captions, and creator-provided images. |
| VIDEO-04 | The system creates narration in the selected language using a provider whose terms permit this commercial embedded product use. |
| VIDEO-05 | The system renders an MP4 at 1280 x 720 in 16:9 landscape. |
| VIDEO-06 | The user can preview and download a successfully rendered export. |
| VIDEO-07 | The system retains sufficient project/export status to let a user distinguish queued, generating, completed, failed, video-deletion-pending, explicitly deleted, expired, and quota-blocked exports. |
| VIDEO-08 | Finished MP4 exports and their narration audio remain downloadable for 10 days. Explicit creator deletion or 10-day expiry revokes future playback/download access and removes the media from private storage. |
| VIDEO-09 | A verified user can retain only one completed video at a time. The entitlement returns only after both the MP4 and narration audio are deleted or reconciled successfully, whether deletion was requested by the creator or caused by 10-day expiry. |

## 8. UX and content principles

- **Teach clearly, not decoratively.** Every scene must serve comprehension.
- **Creator control before automation.** A render is never produced from an unreviewed AI draft.
- **User-owned visual identity.** The creator determines the colours, logo, and images used in the video.
- **No generic stock look.** Version 1 uses no third-party stock library or default corporate logo.
- **Accessible communication.** Every finished video includes readable captions. Templates must have legible contrast and avoid motion that prevents reading.
- **Make uncertainty visible.** The product reminds the creator that they are responsible for reviewing factual statements.

## 9. Free-tier and technical constraints

Version 1 is a real product release designed to use free-tier tools. These constraints are product requirements, not shortcuts to remove later.

| Area | Requirement / decision |
| --- | --- |
| Script and storyboard AI | Gemini API free-tier use is permitted only with a clear disclosure that unpaid use has data-handling constraints. The UI must prohibit confidential, sensitive, or student personal data. |
| Motion graphics | Remotion is the preferred motion-graphics framework for project previews and controlled scene templates. Its free license must be rechecked if the organization grows beyond its eligibility threshold. |
| Narration | ElevenLabs Free may be evaluated only where its current terms permit the use. It must be replaced or separately licensed before it is used for commercial output or a paid offering. |
| File storage | Cloudflare R2 Standard is the selected object store for creator-provided logos/images and generated MP4 exports. The application database stores only metadata and object references, never media blobs. |
| Rendering | Rendering must stay within free-tier infrastructure limits. The system allows one retained completed Version 1 video per verified user at a time, avoids unbounded queues, and fails safely when a provider quota is exhausted. |
| Hosting | Version 1 may use eligible free-tier hosting. Before changing the product's business model or scale, recheck that the selected hosting plan permits the intended use. |
| R2 usage | Use Standard storage only. Its current free allowance is 10 GB-month of storage, 1 million Class A operations, and 10 million Class B operations per month; downloads have no egress charge. R2 requires a subscription checkout and can incur charges after these allowances. |
| R2 security | Store objects under a user/project-specific prefix. Access must go through an authenticated Next.js API that verifies project ownership; buckets and object keys must not be publicly listable. |
| Storage limits | Enforce a configurable per-user storage quota, upload-size limits, and storage-usage warnings before the shared free allowance is exhausted. |
| Data | Keep only the minimum text, project metadata, brand assets, and exports necessary. Offer user-controlled project deletion. |
| Credentials | AI, email-delivery, storage, and narration keys are server-side secrets and must never be exposed in browser code. |

## 10. Privacy, safety, and content rights

- The user must confirm they own or are allowed to use all submitted text, logos, and images.
- The application must not be positioned as a source of educational truth or professional advice.
- The review stage must visibly remind users to validate factual claims, calculations, names, and examples.
- The application must disclose the free AI provider's data-use limitations before an input is sent.
- Users must be able to delete their project and its associated stored
  assets/exports, or delete a completed rendered video while keeping its
  project.
- Input validation and abuse protections must be implemented before public registration and generation are enabled.

## 11. Non-functional requirements

- The dashboard and editor must work on current desktop and mobile browsers. Version 1 uses a simple, mobile-friendly scene workflow rather than a professional timeline editor.
- The product must show understandable loading, quota, retry, and error states.
- User data access must be tenant-isolated at the database and storage policy layers.
- The review and export workflow must be recoverable after a browser refresh or transient service failure.
- Rendering jobs must be idempotent so retries do not create ambiguous duplicate exports.
- The application must log operational failures without logging input text, credentials, or private asset URLs unnecessarily.

## 12. Success metrics for the initial release

- Number of registered users who create a storyboard after creating a project.
- Percentage of storyboard projects that reach explicit approval.
- Percentage of approved projects that finish a successful render and download.
- Median time from project creation to first downloadable video.
- Number of user-initiated edits before approval, used as a signal that review is useful rather than ignored.
- Free-tier quota failures and rendering failures, monitored separately.

## 13. Out of scope for Version 1

- PDF, URL, document, slide, or video uploads as source material.
- Automatic web research or source verification.
- Stock-photo/video search or third-party media sourcing.
- AI-generated cinematic footage, image-to-video, avatars, or voice cloning.
- 60- or 90-second output in Version 1.
- Portrait, square, or social-media export formats.
- 1080p/4K export.
- Languages other than English and German, or multilingual audio tracks in one project.
- Narration-only regeneration or multiple retained completed videos for one user.
- A free-form professional timeline editor, collaboration, comments, workspaces, payments, subscriptions, or team administration.
- Native mobile applications or a professional timeline-style mobile editor.

## 14. Future versions

### Next content-input expansion

- PDF, URL, and document ingestion.
- Source extraction and citations visible during review.
- Additional inputs such as course slides and lesson outlines.

### Future video capabilities

- Additional aspect ratios and 1080p export.
- More editable templates, animations, and reusable brand profiles.
- Professional paid narration options and additional languages.
- Team collaboration, approval workflows, subscriptions, and paid plans after the free-tool SaaS release demonstrates demand.

### Future account capabilities

- Google OAuth and other social sign-in methods, if user demand justifies their additional setup and maintenance.

## 15. Acceptance criteria for the Version 1 release

1. Any user can create and verify an email/password account without an invitation or payment.
2. A signed-in user can create a project from an idea or pasted teaching notes
   in English or German and choose either supported language for the generated
   video.
3. The system produces an editable script and scene-by-scene storyboard for the fixed 30-second output.
4. The user cannot generate a video until explicitly approving the current script and storyboard.
5. The video uses only the user's chosen colours, optional logo, optional uploaded images, and template-generated text/geometry; it does not source stock media.
6. A completed export is a downloadable 1280 x 720, 16:9 MP4 with narration and captions.
7. A user cannot access another user's project, images, or export records.
8. The application warns users about free-tier AI data handling and prohibits confidential, sensitive, and student personal data.
9. Quota exhaustion and failed renders present a safe, understandable error rather than silently losing the project.
10. The implementation contains no client-exposed provider secrets and follows the selected providers' commercial-use terms.
11. Explicit completed-video deletion revokes access, removes both MP4 and
    narration audio, and restores the user's entitlement only after cleanup
    succeeds.
12. Automatic 10-day expiry removes both MP4 and narration audio, preserves
    lightweight project/export history, and restores the user's entitlement
    only after cleanup succeeds.
