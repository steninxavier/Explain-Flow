import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";
import { existsSync } from "node:fs";
import { mkdir, readFile } from "node:fs/promises";
import path from "node:path";
import { buildFallbackTiming, buildSyncedTiming } from "../lib/caption-timing";
import type { CharacterAlignment } from "../lib/narration";
import { assertNarrationAssetPair } from "../lib/render-preflight";
import { fixtureBrand, fixtureStoryPlan } from "../lib/story-plan.fixture";
import { storyPlanSchema } from "../lib/story-plan";

const projectRoot = process.cwd();
const outputDirectory = path.join(projectRoot, "output");
const outputLocation = path.join(outputDirectory, "how-rain-forms-visual-story-de.mp4");
const narrationPath = path.join(projectRoot, "public", "narration", "explainflow-fixture.mp3");
const alignmentPath = path.join(projectRoot, "public", "narration", "explainflow-fixture.alignment.json");

async function renderFixture() {
  const storyPlan = storyPlanSchema.parse(fixtureStoryPlan);
  const fps = 30;
  await mkdir(outputDirectory, { recursive: true });

  const hasNarration = existsSync(narrationPath);
  const hasAlignment = existsSync(alignmentPath);
  assertNarrationAssetPair(hasNarration, hasAlignment, "npm run narration:fixture");

  const timing = hasAlignment
    ? buildSyncedTiming(
        storyPlan,
        JSON.parse(await readFile(alignmentPath, "utf8")) as CharacterAlignment,
        fps
      )
    : buildFallbackTiming(storyPlan, fps);

  const serveUrl = await bundle({
    entryPoint: path.join(projectRoot, "src", "remotion", "index.ts")
  });
  const inputProps = {
    storyPlan,
    brand: fixtureBrand,
    ...timing,
    ...(hasNarration ? { narrationAudioSrc: "narration/explainflow-fixture.mp3" } : {})
  };
  const composition = await selectComposition({ serveUrl, id: "ExplainerTemplate", inputProps });

  await renderMedia({
    composition,
    serveUrl,
    codec: "h264",
    outputLocation,
    inputProps,
    onProgress: ({ progress }) => process.stdout.write(`\\rRendering ${(progress * 100).toFixed(0)}%`)
  });

  process.stdout.write(`\\nCreated ${outputLocation}\\n`);
}

renderFixture().catch((error: unknown) => {
  console.error("Render failed:", error);
  process.exitCode = 1;
});
