import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";
import { existsSync } from "node:fs";
import { mkdir, readFile } from "node:fs/promises";
import path from "node:path";
import { buildFallbackTiming, buildSyncedTiming } from "../lib/caption-timing";
import {
  explainFlowAssetSources,
  explainFlowBrand,
  explainFlowStoryPlan
} from "../lib/explainflow.fixture";
import type { CharacterAlignment } from "../lib/narration";
import { assertNarrationAssetPair } from "../lib/render-preflight";
import { storyPlanSchema } from "../lib/story-plan";

const projectRoot = process.cwd();
const outputDirectory = path.join(projectRoot, "output");
const outputLocation = path.join(outputDirectory, "explainflow-product-explainer-en.mp4");
const narrationPath = path.join(projectRoot, "public", "narration", "explainflow-en.mp3");
const alignmentPath = path.join(projectRoot, "public", "narration", "explainflow-en.alignment.json");

async function renderExplainFlow() {
  console.log("Preparing ExplainFlow product explainer render.");
  const storyPlan = storyPlanSchema.parse(explainFlowStoryPlan);
  console.log("Validated ExplainFlow story plan.");
  const fps = 30;
  await mkdir(outputDirectory, { recursive: true });

  const hasNarration = existsSync(narrationPath);
  const hasAlignment = existsSync(alignmentPath);
  console.log(`Narration: ${hasNarration ? "found" : "not found"}; timing: ${hasAlignment ? "found" : "not found"}.`);
  assertNarrationAssetPair(hasNarration, hasAlignment, "npm run narration:explainflow");

  const timing = hasAlignment
    ? buildSyncedTiming(
        storyPlan,
        JSON.parse(await readFile(alignmentPath, "utf8")) as CharacterAlignment,
        fps
      )
    : buildFallbackTiming(storyPlan, fps);

  console.log("Bundling Remotion composition.");
  const serveUrl = await bundle({
    entryPoint: path.join(projectRoot, "src", "remotion", "index.ts")
  });
  const inputProps = {
    storyPlan,
    brand: explainFlowBrand,
    assetSources: explainFlowAssetSources,
    visualTheme: "explainflow" as const,
    ...timing,
    ...(hasNarration ? { narrationAudioSrc: "narration/explainflow-en.mp3" } : {})
  };
  const composition = await selectComposition({ serveUrl, id: "ExplainFlowExplainer", inputProps });

  console.log("Rendering ExplainFlow MP4.");
  await renderMedia({
    composition,
    serveUrl,
    codec: "h264",
    outputLocation,
    inputProps
  });

  console.log("Created " + outputLocation);
}

renderExplainFlow().catch((error: unknown) => {
  console.error("Render failed:", error);
  process.exitCode = 1;
});
