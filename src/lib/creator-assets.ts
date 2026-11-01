export type CreatorAssetSources = Readonly<Record<string, string>>;

const normalizedSource = (source: string | undefined) => source?.trim() ?? "";

export const assertCreatorAssetSources = (
  assetIds: readonly string[],
  assetSources: CreatorAssetSources | undefined,
  context: string
) => {
  const missingAssetIds = [...new Set(assetIds)].filter(
    (assetId) => !normalizedSource(assetSources?.[assetId])
  );

  if (missingAssetIds.length > 0) {
    throw new Error(
      `Missing creator asset source for ${context}: ${missingAssetIds.join(", ")}.`
    );
  }
};

export const resolveCreatorAssetSources = (
  assetIds: readonly string[],
  assetSources: CreatorAssetSources | undefined
) => assetIds.map((assetId) => ({
  id: assetId,
  source: assetSources?.[assetId]!.trim()
}));
