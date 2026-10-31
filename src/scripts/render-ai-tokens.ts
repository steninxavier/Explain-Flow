import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";
import { existsSync } from "node:fs";
import { mkdir, readFile } from "node:fs/promises";
import path from "node:path";
import { aiTokensBrand, aiTokensStoryPlan } from "../lib/ai-tokens.fixture";
import { buildFallbackTiming, buildSyncedTiming } from "../lib/caption-timing";
import type { CharacterAlignment } from "../lib/narration";
import { storyPlanSchema } from "../lib/story-plan";

const projectRoot = process.cwd();
const outputDirectory = path.join(projectRoot, "output");
const outputLocation = path.join(outputDirectory, "how-ai-tokens-work-en.mp4");
const narrationPath = path.join(projectRoot, "public", "narration", "ai-tokens-en.mp3");
const alignmentPath = path.join(projectRoot, "public", "narration", "ai-tokens-en.alignment.json");

async function renderAiTokens() {
  console.log("Preparing AI tokens render.");
  const storyPlan = storyPlanSchema.parse(aiTokensStoryPlan);
  console.log("Validated AI tokens story plan.");
  const fps = 30;
  await mkdir(outputDirectory, { recursive: true });
  console.log("Prepared output directory.");

  const hasNarration = existsSync(narrationPath);
  const hasAlignment = existsSync(alignmentPath);
  console.log(`Narration: ${hasNarration ? "found" : "not found"}; timing: ${hasAlignment ? "found" : "not found"}.`);
  if (hasNarration && !hasAlignment) {
    throw new Error("Narration timing is missing. Run npm run narration:ai-tokens before rendering.");
  }

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
    brand: aiTokensBrand,
    visualTheme: "tokens" as const,
    ...timing,
    ...(hasNarration ? { narrationAudioSrc: "narration/ai-tokens-en.mp3" } : {})
  };
  console.log("Selecting AI tokens composition.");
  const composition = await selectComposition({ serveUrl, id: "AiTokensExplainer", inputProps });

  console.log("Rendering AI tokens MP4.");
  await renderMedia({
    composition,
    serveUrl,
    codec: "h264",
    outputLocation,
    inputProps
  });

  console.log("Created " + outputLocation);
}

renderAiTokens().catch((error: unknown) => {
  console.error("Render failed:", error);
  process.exitCode = 1;
});
