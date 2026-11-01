import assert from "node:assert/strict";
import { buildSyncedTiming } from "../lib/caption-timing";
import {
  assertCreatorAssetSources,
  resolveCreatorAssetSources
} from "../lib/creator-assets";
import type { CharacterAlignment } from "../lib/narration";
import { assertNarrationAssetPair } from "../lib/render-preflight";
import { formatSceneCounter } from "../lib/scene-counter";
import { storyPlanSchema, type StoryPlan } from "../lib/story-plan";

const script = "Alpha beta. Gamma delta.";

const validPlan: StoryPlan = {
  schemaVersion: "1",
  title: "Renderer contract fixture",
  language: "en",
  targetDurationSeconds: 30,
  script,
  scenes: [
    {
      id: "first",
      order: 1,
      durationMs: 15_000,
      narration: "Alpha beta.",
      caption: "First scene.",
      visual: { template: "title", description: "First test scene.", assetIds: [] }
    },
    {
      id: "second",
      order: 2,
      durationMs: 15_000,
      narration: "Gamma delta.",
      caption: "Second scene.",
      visual: { template: "summary", description: "Second test scene.", assetIds: [] }
    }
  ]
};

const createAlignment = (text: string): CharacterAlignment => {
  const characters = Array.from(text);
  const characterDurationSeconds = 30 / characters.length;
  return {
    characters,
    characterStartTimesSeconds: characters.map((_, index) => index * characterDurationSeconds),
    characterEndTimesSeconds: characters.map((_, index) => (index + 1) * characterDurationSeconds)
  };
};

const run = () => {
  storyPlanSchema.parse(validPlan);

  for (const unsupportedDuration of [60, 90]) {
    const unsupportedPlan = {
      ...validPlan,
      targetDurationSeconds: unsupportedDuration,
      scenes: validPlan.scenes.map((scene) => ({
        ...scene,
        durationMs: unsupportedDuration * 500
      }))
    };
    assert.throws(() => storyPlanSchema.parse(unsupportedPlan));
  }

  assert.doesNotThrow(() => assertNarrationAssetPair(false, false, "npm run narration:test"));
  assert.doesNotThrow(() => assertNarrationAssetPair(true, true, "npm run narration:test"));
  assert.throws(() => assertNarrationAssetPair(true, false, "npm run narration:test"));
  assert.throws(() => assertNarrationAssetPair(false, true, "npm run narration:test"));

  assert.equal(formatSceneCounter(0, 3), "01 / 03");
  assert.equal(formatSceneCounter(11, 15), "12 / 15");

  assert.doesNotThrow(() => assertCreatorAssetSources(["lesson"], { lesson: "fixtures/lesson.svg" }, "test scene"));
  assert.deepEqual(resolveCreatorAssetSources(["lesson"], { lesson: "fixtures/lesson.svg" }), [
    { id: "lesson", source: "fixtures/lesson.svg" }
  ]);
  assert.throws(() => assertCreatorAssetSources(["missing"], {}, "test scene"));

  const fps = 30;
  const timing = buildSyncedTiming(validPlan, createAlignment(script), fps);
  const totalFrames = validPlan.targetDurationSeconds * fps;
  assert.ok(timing.captionCues.length > 0);
  assert.ok(timing.captionCues.every((cue) => cue.startFrame >= 0 && cue.endFrame > cue.startFrame));
  assert.ok(timing.captionCues.every((cue) => cue.endFrame <= totalFrames));
  assert.equal(timing.captionCues.at(-1)?.endFrame, totalFrames);

  console.log("Verified renderer contracts: duration, narration pairing, assets, counters, and caption bounds.");
};

run();
