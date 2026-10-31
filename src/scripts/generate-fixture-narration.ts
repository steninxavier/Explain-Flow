import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { ElevenLabsNarrationProvider } from "../lib/elevenlabs-narration";
import { fixtureStoryPlan } from "../lib/story-plan.fixture";

const apiKey = process.env.ELEVENLABS_API_KEY;
const configuredVoiceId = process.env.ELEVENLABS_VOICE_ID;
const modelId = process.env.ELEVENLABS_MODEL_ID ?? "eleven_multilingual_v2";
const configuredSpeed = Number(process.env.ELEVENLABS_NARRATION_SPEED ?? "0.9");

async function generateFixtureNarration() {
  if (!apiKey) {
    throw new Error("Set ELEVENLABS_API_KEY in .env.local before generating narration.");
  }

  if (!Number.isFinite(configuredSpeed) || configuredSpeed < 0.7 || configuredSpeed > 1.2) {
    throw new Error("ELEVENLABS_NARRATION_SPEED must be between 0.7 and 1.2.");
  }

  const provider = new ElevenLabsNarrationProvider(apiKey, modelId, configuredSpeed);
  const selectedVoice = configuredVoiceId
    ? { voice_id: configuredVoiceId, name: "Configured voice" }
    : await provider.selectStandardVoice(fixtureStoryPlan.language);
  const narration = await provider.generate({
    text: fixtureStoryPlan.script,
    language: fixtureStoryPlan.language,
    voiceId: selectedVoice.voice_id
  });
  const destination = path.join(process.cwd(), "public", "narration", "explainflow-fixture.mp3");
  const alignmentDestination = path.join(process.cwd(), "public", "narration", "explainflow-fixture.alignment.json");
  const narrationEndSeconds = narration.alignment.characterEndTimesSeconds.at(-1) ?? 0;

  if (narrationEndSeconds > fixtureStoryPlan.targetDurationSeconds) {
    throw new Error(
      `Narration is ${narrationEndSeconds.toFixed(2)} seconds, longer than the ${fixtureStoryPlan.targetDurationSeconds}-second video target.`
    );
  }

  await mkdir(path.dirname(destination), { recursive: true });
  await writeFile(destination, narration.audio);
  await writeFile(alignmentDestination, JSON.stringify(narration.alignment));
  console.log(`Selected ElevenLabs voice: ${selectedVoice.name} (${selectedVoice.voice_id}).`);
  console.log(`Narration speed: ${configuredSpeed}x.`);
  console.log(`Narration duration: ${narrationEndSeconds.toFixed(2)} seconds.`);
  console.log(`Created private development narration fixture: ${destination}`);
}

generateFixtureNarration().catch((error: unknown) => {
  console.error("Narration generation failed:", error);
  process.exitCode = 1;
});
