import { z } from "zod";

export const sceneTemplateSchema = z.enum([
  "title",
  "concept",
  "steps",
  "comparison",
  "summary"
]);

export const storyPlanSchema = z
  .object({
    schemaVersion: z.literal("1"),
    title: z.string().trim().min(3).max(100),
    language: z.enum(["en", "de"]),
    targetDurationSeconds: z.literal(30),
    script: z.string().trim().min(20).max(5000),
    scenes: z
      .array(
        z.object({
          id: z.string().trim().min(1).max(80),
          order: z.number().int().positive(),
          durationMs: z.number().int().positive().max(30_000),
          narration: z.string().trim().min(1).max(1200),
          caption: z.string().trim().min(1).max(240),
          visual: z.object({
            template: sceneTemplateSchema,
            description: z.string().trim().min(3).max(500),
            assetIds: z.array(z.string().trim().min(1).max(120)).max(5)
          })
        })
      )
      .min(2)
      .max(15)
  })
  .superRefine((plan, context) => {
    const ids = new Set<string>();
    let totalDurationMs = 0;

    plan.scenes.forEach((scene, index) => {
      totalDurationMs += scene.durationMs;
      if (ids.has(scene.id)) {
        context.addIssue({
          code: "custom",
          message: "Each scene ID must be unique.",
          path: ["scenes", index, "id"]
        });
      }
      ids.add(scene.id);

      if (scene.order !== index + 1) {
        context.addIssue({
          code: "custom",
          message: "Scene order must be sequential and start at 1.",
          path: ["scenes", index, "order"]
        });
      }
    });

    const targetDurationMs = plan.targetDurationSeconds * 1_000;
    if (totalDurationMs !== targetDurationMs) {
      context.addIssue({
        code: "custom",
        message: `Scene durations must total exactly ${targetDurationMs}ms; received ${totalDurationMs}ms.`,
        path: ["scenes"]
      });
    }
  });

export const brandSettingsSchema = z.object({
  colors: z.array(z.string().regex(/^#[0-9A-Fa-f]{6}$/)).min(2).max(5),
  name: z.string().trim().min(1).max(80).optional(),
  logoSrc: z.string().min(1).optional()
});

export type StoryPlan = z.infer<typeof storyPlanSchema>;
export type BrandSettings = z.infer<typeof brandSettingsSchema>;
