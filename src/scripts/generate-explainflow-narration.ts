import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { ElevenLabsNarrationProvider } from "../lib/elevenlabs-narration";
import { explainFlowStoryPlan } from "../lib/explainflow.fixture";

const apiKey = process.env.ELEVENLABS_API_KEY;
const configuredVoiceId = process.env.ELEVENLABS_EXPLAINFLOW_VOICE_ID;
const modelId = process.env.ELEVENLABS_MODEL_ID ?? "eleven_multilingual_v2";
const configuredSpeed = Number(process.env.ELEVENLABS_NARRATION_SPEED ?? "0.9");

async function generateExplainFlowNarration() {
  if (!apiKey) {
    throw new Error("Set ELEVENLABS_API_KEY in .env.local before generating narration.");
  }

  if (!Number.isFinite(configuredSpeed) || configuredSpeed < 0.7 || configuredSpeed > 1.2) {
    throw new Error("ELEVENLABS_NARRATION_SPEED must be between 0.7 and 1.2.");
  }

  const provider = new ElevenLabsNarrationProvider(apiKey, modelId, configuredSpeed);
  const selectedVoice = configuredVoiceId
    ? { voice_id: configuredVoiceId, name: "Configured ExplainFlow voice" }
    : await provider.selectStandardVoice(explainFlowStoryPlan.language);
  const narration = await provider.generate({
    text: explainFlowStoryPlan.script,
    language: explainFlowStoryPlan.language,
    voiceId: selectedVoice.voice_id
  });
  const destination = path.join(process.cwd(), "public", "narration", "explainflow-en.mp3");
  const alignmentDestination = path.join(process.cwd(), "public", "narration", "explainflow-en.alignment.json");
  const narrationEndSeconds = narration.alignment.characterEndTimesSeconds.at(-1) ?? 0;

  if (narrationEndSeconds > explainFlowStoryPlan.targetDurationSeconds) {
    throw new Error(
      `Narration is ${narrationEndSeconds.toFixed(2)} seconds, longer than the ${explainFlowStoryPlan.targetDurationSeconds}-second video target.`
    );
  }

  await mkdir(path.dirname(destination), { recursive: true });
  await writeFile(destination, narration.audio);
  await writeFile(alignmentDestination, JSON.stringify(narration.alignment));
  console.log(`Selected ElevenLabs voice: ${selectedVoice.name} (${selectedVoice.voice_id}).`);
  console.log(`Narration speed: ${configuredSpeed}x.`);
  console.log(`Narration duration: ${narrationEndSeconds.toFixed(2)} seconds.`);
  console.log(`Created narration fixture: ${destination}`);
}

generateExplainFlowNarration().catch((error: unknown) => {
  console.error("Narration generation failed:", error);
  process.exitCode = 1;
});
