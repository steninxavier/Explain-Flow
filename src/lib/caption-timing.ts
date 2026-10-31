import type { CharacterAlignment } from "./narration";
import type { StoryPlan } from "./story-plan";

export type CaptionCue = {
  sceneId: string;
  text: string;
  startFrame: number;
  endFrame: number;
};

export type SceneTiming = {
  sceneId: string;
  startFrame: number;
  durationInFrames: number;
};

export type SyncedTiming = {
  captionCues: CaptionCue[];
  sceneTimings: SceneTiming[];
};

type TimedWord = {
  text: string;
  startCharacter: number;
  endCharacter: number;
  startSeconds: number;
  endSeconds: number;
};

const toTimedWords = (alignment: CharacterAlignment): TimedWord[] => {
  const words: TimedWord[] = [];
  let text = "";
  let startCharacter = -1;

  const addWord = (endCharacter: number) => {
    if (startCharacter === -1 || text.length === 0) return;
    words.push({
      text,
      startCharacter,
      endCharacter,
      startSeconds: alignment.characterStartTimesSeconds[startCharacter],
      endSeconds: alignment.characterEndTimesSeconds[endCharacter]
    });
    text = "";
    startCharacter = -1;
  };

  alignment.characters.forEach((character, index) => {
    if (/\s/.test(character)) {
      addWord(index - 1);
      return;
    }

    if (startCharacter === -1) startCharacter = index;
    text += character;
  });

  addWord(alignment.characters.length - 1);
  return words;
};

const splitSceneRanges = (storyPlan: StoryPlan, alignedText: string) => {
  let searchStart = 0;
  return storyPlan.scenes.map((scene) => {
    const startCharacter = alignedText.indexOf(scene.narration, searchStart);
    if (startCharacter === -1) {
      throw new Error(`Could not match narration timing for scene "${scene.id}".`);
    }
    const endCharacter = startCharacter + scene.narration.length;
    searchStart = endCharacter;
    return { sceneId: scene.id, startCharacter, endCharacter };
  });
};

const cueWords = (sceneId: string, words: TimedWord[], fps: number): CaptionCue[] => {
  const cues: CaptionCue[] = [];
  let current: TimedWord[] = [];

  const addCue = () => {
    if (current.length === 0) return;
    const first = current[0];
    const last = current.at(-1)!;
    cues.push({
      sceneId,
      text: current.map((word) => word.text).join(" "),
      startFrame: Math.floor(first.startSeconds * fps),
      endFrame: Math.max(Math.ceil(last.endSeconds * fps) + 4, Math.floor(first.startSeconds * fps) + 1)
    });
    current = [];
  };

  words.forEach((word) => {
    current.push(word);
    const endsPhrase = /[.!?]$/.test(word.text);
    const reachesReadableCaptionLength = current.length >= 8;
    if (endsPhrase || reachesReadableCaptionLength) addCue();
  });
  addCue();
  return cues;
};

export const buildSyncedTiming = (storyPlan: StoryPlan, alignment: CharacterAlignment, fps: number): SyncedTiming => {
  const alignedText = alignment.characters.join("");
  if (alignedText !== storyPlan.script) {
    throw new Error("Narration timing text does not match the approved script.");
  }

  const words = toTimedWords(alignment);
  const ranges = splitSceneRanges(storyPlan, alignedText);
  const totalFrames = storyPlan.targetDurationSeconds * fps;
  const sceneWords = ranges.map((range) => words.filter(
    (word) => word.startCharacter >= range.startCharacter && word.endCharacter < range.endCharacter
  ));

  if (sceneWords.some((wordsForScene) => wordsForScene.length === 0)) {
    throw new Error("Narration timing did not include words for every scene.");
  }

  const sceneStartFrames = sceneWords.map((wordsForScene, index) => (
    index === 0 ? 0 : Math.floor(wordsForScene[0].startSeconds * fps)
  ));
  const sceneTimings = storyPlan.scenes.map((scene, index) => {
    const startFrame = sceneStartFrames[index];
    const endFrame = sceneStartFrames[index + 1] ?? totalFrames;
    return {
      sceneId: scene.id,
      startFrame,
      durationInFrames: Math.max(1, endFrame - startFrame)
    };
  });

  return {
    sceneTimings,
    captionCues: sceneWords.flatMap((wordsForScene, index) => cueWords(storyPlan.scenes[index].id, wordsForScene, fps))
  };
};

export const buildFallbackTiming = (storyPlan: StoryPlan, fps: number): SyncedTiming => {
  let startFrame = 0;
  const sceneTimings = storyPlan.scenes.map((scene) => {
    const durationInFrames = Math.round((scene.durationMs / 1000) * fps);
    const timing = { sceneId: scene.id, startFrame, durationInFrames };
    startFrame += durationInFrames;
    return timing;
  });

  return {
    sceneTimings,
    captionCues: storyPlan.scenes.map((scene, index) => ({
      sceneId: scene.id,
      text: scene.narration,
      startFrame: sceneTimings[index].startFrame,
      endFrame: sceneTimings[index].startFrame + sceneTimings[index].durationInFrames
    }))
  };
};
