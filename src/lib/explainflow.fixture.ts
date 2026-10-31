import type { BrandSettings, StoryPlan } from "./story-plan";

export const explainFlowBrand: BrandSettings = {
  colors: ["#17233A", "#2D7668", "#F8F4EC"]
};

export const explainFlowStoryPlan: StoryPlan = {
  schemaVersion: "1",
  title: "How ExplainFlow Works",
  language: "en",
  targetDurationSeconds: 30,
  script:
    "Start with an idea or outline, in English or German. Add your colours, logo, and images. ExplainFlow turns it into a clear script and scene-by-scene storyboard. Review each scene, choose a voice, and approve. Then your idea becomes a branded motion-graphic video with captions and narration. Preview the finished video, download it in 720p, and share your message with the people who need it.",
  scenes: [
    {
      id: "idea-brand",
      order: 1,
      durationMs: 7500,
      narration: "Start with an idea or outline, in English or German. Add your colours, logo, and images.",
      caption: "Your idea, your brand.",
      visual: {
        template: "title",
        description: "An idea card flows into a small, personal brand kit with colour, logo, and image assets.",
        assetIds: []
      }
    },
    {
      id: "plan-review",
      order: 2,
      durationMs: 7500,
      narration: "ExplainFlow turns it into a clear script and scene-by-scene storyboard. Review each scene, choose a voice, and approve.",
      caption: "Review before you generate.",
      visual: {
        template: "concept",
        description: "A written outline becomes connected storyboard cards, a voice waveform, and an approval check.",
        assetIds: []
      }
    },
    {
      id: "approve-render",
      order: 3,
      durationMs: 7500,
      narration: "Then your idea becomes a branded motion-graphic video with captions and narration.",
      caption: "Story becomes motion.",
      visual: {
        template: "steps",
        description: "Storyboard cards funnel into a living landscape video player with diagrams, audio, and captions.",
        assetIds: []
      }
    },
    {
      id: "preview-next",
      order: 4,
      durationMs: 7500,
      narration: "Preview the finished video, download it in 720p, and share your message with the people who need it.",
      caption: "Preview, download, and share.",
      visual: {
        template: "summary",
        description: "A finished preview is downloaded and shared with the audience.",
        assetIds: []
      }
    }
  ]
};
