import type { BrandSettings, StoryPlan } from "./story-plan";

export const aiTokensBrand: BrandSettings = {
  colors: ["#171A3A", "#6E5AE6", "#F5F3FF"]
};

export const aiTokensStoryPlan: StoryPlan = {
  schemaVersion: "1",
  title: "How AI Tokens Work",
  language: "en",
  targetDurationSeconds: 30,
  script:
    "AI models do not read words like people. A tokenizer splits your text into pieces called tokens. A token can be a word, part of one, punctuation, or a space. Each becomes a number. Using the tokens already in context, the model predicts the most likely next token. It repeats that step, one token at a time, to build a response. That simple loop is how AI generates text.",
  scenes: [
    {
      id: "tokenize-input",
      order: 1,
      durationMs: 7500,
      narration: "AI models do not read words like people. A tokenizer splits your text into pieces called tokens.",
      caption: "Text becomes tokens.",
      visual: {
        template: "title",
        description: "A scan line turns a sentence into a stream of token chips.",
        assetIds: []
      }
    },
    {
      id: "token-pieces",
      order: 2,
      durationMs: 7500,
      narration: "A token can be a word, part of one, punctuation, or a space.",
      caption: "Tokens are flexible pieces.",
      visual: {
        template: "concept",
        description: "Words, word parts, punctuation, and spaces take their own visual forms.",
        assetIds: []
      }
    },
    {
      id: "context-network",
      order: 3,
      durationMs: 7500,
      narration: "Each becomes a number. Using the tokens already in context, the model predicts the most likely next token.",
      caption: "Context helps predict the next token.",
      visual: {
        template: "steps",
        description: "Token chips move through a pattern network and focus on likely candidates.",
        assetIds: []
      }
    },
    {
      id: "response-loop",
      order: 4,
      durationMs: 7500,
      narration: "It repeats that step, one token at a time, to build a response. That simple loop is how AI generates text.",
      caption: "One token at a time becomes a response.",
      visual: {
        template: "summary",
        description: "Selected tokens join an answer while the prediction loop continues.",
        assetIds: []
      }
    }
  ]
};
