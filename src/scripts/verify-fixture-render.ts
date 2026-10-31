import { getVideoMetadata } from "@remotion/renderer";
import path from "node:path";

const videoPath = path.join(process.cwd(), "output", "how-rain-forms-visual-story-de.mp4");

async function verifyFixtureRender() {
  const metadata = await getVideoMetadata(videoPath, { logLevel: "error" });
  const isCorrect =
    metadata.width === 1280 &&
    metadata.height === 720 &&
    Math.abs(metadata.durationInSeconds - 30) < 0.1 &&
    metadata.audioCodec !== null;

  if (!isCorrect) {
    throw new Error(
      `Unexpected video output: ${metadata.width}x${metadata.height}, ${metadata.durationInSeconds.toFixed(2)} seconds, audio: ${metadata.audioCodec ?? "missing"}.`
    );
  }

  console.log(
    `Verified ${videoPath}: ${metadata.width}x${metadata.height}, ${metadata.durationInSeconds.toFixed(2)} seconds, audio: ${metadata.audioCodec}.`
  );
}

verifyFixtureRender().catch((error: unknown) => {
  console.error("Render verification failed:", error);
  process.exitCode = 1;
});
