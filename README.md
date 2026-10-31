# ExplainFlow

**From idea to clear video.**

This repository begins with ExplainFlow's pipeline Prototype 0: a fixed, branded, 30-second, 1280 × 720 educational explainer that is rendered locally with Remotion. It deliberately proves rendering before the product dashboard, authentication, project storage, Gemini planning, or production deployment are added.

## What is included

- A strict, reusable `StoryPlan` schema with duration and scene-order validation.
- A 30-second German rain-formation fixture with four scenes.
- A Remotion `ExplainerTemplate` composition: 16:9, 1280 × 720, 30 FPS, caption-led motion graphics, and creator-selected colours.
- An optional ElevenLabs narration adapter. It produces a local development audio fixture only when you run the narration command with your own environment variables.
- A local MP4 render command that writes `output/how-rain-forms-visual-story-de.mp4`.

## Set up

1. Install dependencies:

   ```powershell
   npm install
   ```

2. Render the silent visual fixture:

   ```powershell
   npm run render:fixture
   ```

   The result is `output/how-rain-forms-visual-story-de.mp4`.

3. Optional: create an ElevenLabs narration fixture for private development.

   Copy `.env.example` to `.env.local`, then set `ELEVENLABS_API_KEY` and `ELEVENLABS_VOICE_ID`. Do not commit `.env.local`.

   ```powershell
   npm run narration:fixture
   npm run render:fixture
   ```

   The renderer automatically includes `public/narration/explainflow-fixture.mp3` when it exists.

4. Inspect the small prototype status page:

   ```powershell
   npm run dev
   ```

   Open `http://localhost:3000`.

## Important current boundary

The ElevenLabs integration is intentionally limited to local/private development while using Free-plan credits. It must not be enabled for public user output until ExplainFlow has a commercial-use-eligible ElevenLabs plan, approved grant, or replacement narration provider.

## Next prototype stages

1. Gemini structured planning with the same `StoryPlan` contract.
2. Private Cloudflare R2 assets and exports.
3. MongoDB-backed approval snapshots, render jobs, and idempotency.
4. Better Auth and the actual responsive product dashboard.

See [the pipeline technical design](docs/PIPELINE_TECHNICAL_DESIGN.md) for the approved sequence and pass conditions.
