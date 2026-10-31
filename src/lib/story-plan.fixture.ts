import type { BrandSettings, StoryPlan } from "./story-plan";

export const fixtureBrand: BrandSettings = {
  colors: ["#202827", "#2D7668", "#F6F1E9"]
};

export const fixtureStoryPlan: StoryPlan = {
  schemaVersion: "1",
  title: "Wie entsteht Regen?",
  language: "de",
  targetDurationSeconds: 30,
  script:
    "Regen beginnt mit der Sonne. Sie erwärmt Wasser in Seen, Flüssen und Meeren. Ein Teil verdunstet und steigt als unsichtbarer Wasserdampf auf. In kühlerer Luft kondensiert der Dampf zu winzigen Tropfen und bildet Wolken. Werden die Tropfen darin zu schwer, fallen sie als Regen zur Erde. Dort sammelt sich das Wasser wieder – und der Kreislauf beginnt von vorn. So entsteht Regen.",
  scenes: [
    {
      id: "sun-warms-water",
      order: 1,
      durationMs: 7500,
      narration: "Regen beginnt mit der Sonne. Sie erwärmt Wasser in Seen, Flüssen und Meeren.",
      caption: "Die Sonne erwärmt Wasser.",
      visual: { template: "title", description: "Licht trifft auf Seen, Flüsse und Meere.", assetIds: [] }
    },
    {
      id: "evaporation",
      order: 2,
      durationMs: 7500,
      narration: "Ein Teil verdunstet und steigt als unsichtbarer Wasserdampf auf.",
      caption: "Wasserdampf steigt auf.",
      visual: { template: "concept", description: "Wärme verwandelt Wasser in unsichtbaren Dampf.", assetIds: [] }
    },
    {
      id: "condensation",
      order: 3,
      durationMs: 7500,
      narration: "In kühlerer Luft kondensiert der Dampf zu winzigen Tropfen und bildet Wolken.",
      caption: "Wolken entstehen.",
      visual: { template: "steps", description: "Kühle Luft formt aus Dampf winzige Wassertröpfchen.", assetIds: [] }
    },
    {
      id: "rainfall-cycle",
      order: 4,
      durationMs: 7500,
      narration: "Werden die Tropfen darin zu schwer, fallen sie als Regen zur Erde. Dort sammelt sich das Wasser wieder – und der Kreislauf beginnt von vorn. So entsteht Regen.",
      caption: "Regen fällt zur Erde.",
      visual: { template: "summary", description: "Das Wasser kehrt zurück und der Kreislauf beginnt erneut.", assetIds: [] }
    }
  ]
};
