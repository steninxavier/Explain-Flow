export const assertNarrationAssetPair = (
  hasNarration: boolean,
  hasAlignment: boolean,
  narrationCommand: string
) => {
  if (hasNarration === hasAlignment) return;

  if (hasNarration) {
    throw new Error(`Narration timing is missing. Run ${narrationCommand} before rendering.`);
  }

  throw new Error(`Narration audio is missing. Run ${narrationCommand} before rendering.`);
};
