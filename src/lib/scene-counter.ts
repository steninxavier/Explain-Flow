export const formatSceneCounter = (sceneIndex: number, sceneCount: number) => {
  if (!Number.isInteger(sceneIndex) || sceneIndex < 0) {
    throw new Error("Scene index must be a non-negative integer.");
  }

  if (!Number.isInteger(sceneCount) || sceneCount < 1 || sceneIndex >= sceneCount) {
    throw new Error("Scene count must include the current scene.");
  }

  return `${String(sceneIndex + 1).padStart(2, "0")} / ${String(sceneCount).padStart(2, "0")}`;
};
