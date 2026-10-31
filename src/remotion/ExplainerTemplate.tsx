import React from "react";
import {
  AbsoluteFill,
  Audio,
  Sequence,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig
} from "remotion";
import type { CaptionCue, SceneTiming } from "../lib/caption-timing";
import type { BrandSettings, StoryPlan } from "../lib/story-plan";
import { AiTokenSceneTransition, AiTokensStoryIllustration } from "./AiTokensStoryIllustration";
import { ExplainFlowSceneTransition, ExplainFlowStoryIllustration } from "./ExplainFlowStoryIllustration";
import { RainStoryIllustration } from "./RainStoryIllustration";

type VisualTheme = "rain" | "tokens" | "explainflow";

export type ExplainerTemplateProps = {
  storyPlan: StoryPlan;
  brand: BrandSettings;
  narrationAudioSrc?: string;
  captionCues?: CaptionCue[];
  sceneTimings?: SceneTiming[];
  visualTheme?: VisualTheme;
};

const sceneLabels: Record<string, string> = {
  "sun-warms-water": "Sonnenwärme",
  evaporation: "Verdunstung",
  condensation: "Kondensation",
  "rainfall-cycle": "Niederschlag",
  "idea-brand": "Your idea",
  "plan-review": "Plan and review",
  "approve-render": "Render",
  "preview-next": "Preview and download"
};

const SceneTransition: React.FC<{ sceneIndex: number; frame: number; accent: string; primary: string; visualTheme: VisualTheme }> = ({ sceneIndex, frame, accent, primary, visualTheme }) => {
  if (visualTheme === "tokens") {
    return <AiTokenSceneTransition sceneIndex={sceneIndex} frame={frame} primary={primary} accent={accent} />;
  }

  if (visualTheme === "explainflow") {
    return <ExplainFlowSceneTransition sceneIndex={sceneIndex} frame={frame} primary={primary} accent={accent} />;
  }

  const reveal = interpolate(frame, [0, 20], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp"
  });

  if (sceneIndex === 0) return null;

  if (sceneIndex === 1) {
    return (
      <svg
        width="1280"
        height="920"
        viewBox="0 0 1280 920"
        style={{ position: "absolute", inset: 0, zIndex: 10, transform: `translateY(${-(1 - reveal) * 940}px)` }}
      >
        <path d="M0,120 C170,24 328,165 500,85 C675,2 814,156 1002,70 C1145,12 1235,86 1280,58 L1280,920 L0,920 Z" fill={accent} />
        <path d="M0,214 C161,130 357,254 519,168 C709,67 864,246 1059,150 C1178,92 1248,150 1280,127 L1280,920 L0,920 Z" fill="#2B6B61" opacity="0.86" />
        <path d="M0,301 C180,229 318,344 496,263 C673,185 851,354 1035,254 C1147,194 1226,241 1280,216" fill="none" stroke="rgba(255,255,255,0.48)" strokeWidth="7" strokeLinecap="round" />
      </svg>
    );
  }

  if (sceneIndex === 2) {
    return (
      <div style={{ position: "absolute", inset: 0, zIndex: 10, overflow: "hidden", transform: `translateX(${(1 - reveal) * 1320}px)` }}>
        <div style={{ position: "absolute", inset: 0, background: "#D7E8E2" }} />
        {[{ left: -124, top: 110, size: 500 }, { left: 220, top: -92, size: 640 }, { left: 702, top: 150, size: 520 }].map((cloud, index) => (
          <div
            key={index}
            style={{
              position: "absolute",
              left: cloud.left,
              top: cloud.top,
              width: cloud.size,
              height: cloud.size * 0.48,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.78)",
              boxShadow: "0 18px 36px rgba(45,118,104,0.12)"
            }}
          />
        ))}
      </div>
    );
  }

  return (
    <div style={{ position: "absolute", inset: 0, zIndex: 10, overflow: "hidden", transform: `translateY(${(1 - reveal) * 760}px)` }}>
      <div style={{ position: "absolute", inset: 0, background: "#668D84" }} />
      {Array.from({ length: 34 }, (_, index) => (
        <div
          key={index}
          style={{
            position: "absolute",
            left: 24 + ((index * 71) % 1220),
            top: -30 + ((index * 47) % 700),
            width: 3,
            height: 64 + ((index * 13) % 72),
            borderRadius: 99,
            background: "rgba(255,255,255,0.54)",
            transform: "rotate(8deg)"
          }}
        />
      ))}
    </div>
  );
};

const ExplainerScene: React.FC<{
  scene: StoryPlan["scenes"][number];
  sceneIndex: number;
  sceneDurationInFrames: number;
  brand: BrandSettings;
  visualTheme: VisualTheme;
}> = ({ scene, sceneIndex, sceneDurationInFrames, brand, visualTheme }) => {
  const frame = useCurrentFrame();
  const labelOpacity = interpolate(frame, [8, 20, 62, 88], [0, 0.75, 0.75, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp"
  });
  const cameraScale = 1.018 - Math.min(frame / sceneDurationInFrames, 1) * 0.018;
  const primary = brand.colors[0] ?? "#202827";
  const accent = brand.colors[1] ?? "#2D7668";

  return (
    <AbsoluteFill style={{ background: brand.colors[2] ?? "#F6F1E9", overflow: "hidden" }}>
      <div
        style={{
          position: "absolute",
          inset: -10,
          transform: `scale(${cameraScale})`,
          transformOrigin: "center center"
        }}
      >
        {visualTheme === "tokens" ? (
          <AiTokensStoryIllustration sceneId={scene.id} primary={primary} accent={accent} frame={frame} />
        ) : visualTheme === "explainflow" ? (
          <ExplainFlowStoryIllustration sceneId={scene.id} primary={primary} accent={accent} frame={frame} />
        ) : (
          <RainStoryIllustration sceneId={scene.id} primary={primary} accent={accent} frame={frame} />
        )}
      </div>
      <SceneTransition sceneIndex={sceneIndex} frame={frame} accent={accent} primary={primary} visualTheme={visualTheme} />

      <div
        style={{
          position: "absolute",
          left: 54,
          top: 38,
          display: "flex",
          alignItems: "center",
          gap: 13,
          color: primary,
          fontFamily: "Arial, Helvetica, sans-serif",
          fontSize: 14,
          fontWeight: 700,
          letterSpacing: 1.45,
          opacity: labelOpacity,
          textTransform: "uppercase"
        }}
      >
        <span style={{ opacity: 0.62 }}>ExplainFlow</span>
        <span style={{ width: 4, height: 4, borderRadius: "50%", background: accent }} />
        <span>{String(sceneIndex + 1).padStart(2, "0")} / 04</span>
        <span style={{ color: accent }}>{sceneLabels[scene.id] ?? scene.caption}</span>
      </div>
    </AbsoluteFill>
  );
};

const CaptionTrack: React.FC<{ captionCues: CaptionCue[] }> = ({ captionCues }) => {
  const frame = useCurrentFrame();
  const activeCue = captionCues.filter((cue) => frame >= cue.startFrame && frame < cue.endFrame).at(-1);

  if (!activeCue) return null;

  const enter = interpolate(frame, [activeCue.startFrame, activeCue.startFrame + 5], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp"
  });
  const exit = interpolate(frame, [activeCue.endFrame - 5, activeCue.endFrame], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp"
  });

  return (
    <div
      style={{
        position: "absolute",
        left: 60,
        right: 60,
        bottom: 34,
        display: "flex",
        justifyContent: "flex-start",
        opacity: Math.min(enter, exit),
        transform: `translateY(${(1 - enter) * 7}px)`,
        zIndex: 20
      }}
    >
      <div
        style={{
          maxWidth: 570,
          padding: "9px 12px 10px",
          borderRadius: 11,
          color: "#202827",
          background: "rgba(246, 241, 233, 0.78)",
          boxShadow: "0 10px 28px rgba(32, 40, 39, 0.08)",
          backdropFilter: "blur(12px)",
          fontFamily: "Arial, Helvetica, sans-serif",
          fontSize: 16,
          fontWeight: 600,
          letterSpacing: -0.08,
          lineHeight: 1.28
        }}
      >
        {activeCue.text}
      </div>
    </div>
  );
};

export const ExplainerTemplate: React.FC<ExplainerTemplateProps> = ({
  storyPlan,
  brand,
  narrationAudioSrc,
  captionCues = [],
  sceneTimings,
  visualTheme = "rain"
}) => {
  const { fps } = useVideoConfig();
  let fallbackStartFrame = 0;
  const timings = storyPlan.scenes.map((scene) => {
    const durationInFrames = Math.round((scene.durationMs / 1000) * fps);
    const fallback = { sceneId: scene.id, startFrame: fallbackStartFrame, durationInFrames };
    fallbackStartFrame += durationInFrames;
    return sceneTimings?.find((timing) => timing.sceneId === scene.id) ?? fallback;
  });

  return (
    <AbsoluteFill style={{ background: brand.colors[2] ?? "#F6F1E9" }}>
      {narrationAudioSrc ? <Audio src={staticFile(narrationAudioSrc)} /> : null}
      {storyPlan.scenes.map((scene, index) => (
        <Sequence
          key={scene.id}
          from={timings[index].startFrame}
          durationInFrames={timings[index].durationInFrames}
        >
          <ExplainerScene
            scene={scene}
            sceneIndex={index}
            sceneDurationInFrames={timings[index].durationInFrames}
            brand={brand}
            visualTheme={visualTheme}
          />
        </Sequence>
      ))}
      <CaptionTrack captionCues={captionCues} />
    </AbsoluteFill>
  );
};
