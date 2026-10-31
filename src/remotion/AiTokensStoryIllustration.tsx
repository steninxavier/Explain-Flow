import React from "react";
import { interpolate, spring, useVideoConfig } from "remotion";

type AiTokensStoryIllustrationProps = {
  sceneId: string;
  primary: string;
  accent: string;
  frame: number;
};

const tokenPalette = ["#6E5AE6", "#1D9E8A", "#E879A9", "#E6A63E", "#4977E8"];

const floatingSeeds = Array.from({ length: 46 }, (_, index) => ({
  x: 30 + ((index * 97) % 1214),
  y: 42 + ((index * 71) % 618),
  size: 3 + ((index * 11) % 8),
  delay: (index * 19) % 124,
  color: tokenPalette[index % tokenPalette.length]
}));

const networkNodes = [
  { x: 316, y: 250 }, { x: 447, y: 164 }, { x: 587, y: 243 }, { x: 731, y: 154 },
  { x: 858, y: 258 }, { x: 391, y: 392 }, { x: 543, y: 447 }, { x: 689, y: 374 }, { x: 826, y: 435 }
];

const connections = [[0, 1], [0, 2], [0, 5], [1, 2], [1, 3], [2, 3], [2, 5], [2, 6], [3, 4], [3, 7], [4, 7], [4, 8], [5, 6], [6, 7], [6, 8], [7, 8]];

const TokenBackdrop: React.FC<{ frame: number; primary: string; accent: string }> = ({ frame, primary, accent }) => {
  const drift = Math.sin(frame / 74) * 18;
  return (
    <>
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(145deg, #F8F7FF 0%, #E9E5FF 51%, #DCE9FF 100%)" }} />
      <div style={{ position: "absolute", width: 740, height: 740, right: -260, top: -340, borderRadius: "50%", background: `${accent}22`, transform: `translateX(${drift}px) scale(${1 + Math.sin(frame / 96) * 0.03})` }} />
      <div style={{ position: "absolute", width: 540, height: 310, left: -170, bottom: -104, borderRadius: "50%", background: "rgba(29,158,138,0.12)", transform: `translateX(${-drift * 0.6}px) rotate(-14deg)` }} />
      <svg width="1280" height="720" viewBox="0 0 1280 720" style={{ position: "absolute", inset: 0, opacity: 0.25 }}>
        {Array.from({ length: 13 }, (_, index) => <line key={`v-${index}`} x1={index * 110 - 40} y1="0" x2={index * 110 - 40} y2="720" stroke={primary} strokeWidth="1" opacity="0.14" />)}
        {Array.from({ length: 8 }, (_, index) => <line key={`h-${index}`} x1="0" y1={index * 105 + 14} x2="1280" y2={index * 105 + 14} stroke={primary} strokeWidth="1" opacity="0.14" />)}
      </svg>
      {floatingSeeds.map((seed, index) => {
        const phase = ((frame - seed.delay) % 124 + 124) % 124 / 124;
        return <div key={index} style={{ position: "absolute", left: seed.x + Math.sin(phase * Math.PI * 2 + index) * 16, top: seed.y + Math.cos(phase * Math.PI * 2 + index) * 11, width: seed.size, height: seed.size, borderRadius: "50%", background: seed.color, opacity: 0.12 + Math.sin(phase * Math.PI) * 0.22 }} />;
      })}
    </>
  );
};

const TokenChip: React.FC<{
  label: string;
  left: number;
  top: number;
  color: string;
  scale?: number;
  opacity?: number;
  rotation?: number;
  compact?: boolean;
  bright?: boolean;
}> = ({ label, left, top, color, scale = 1, opacity = 1, rotation = 0, compact = false, bright = false }) => (
  <div
    style={{
      position: "absolute",
      left,
      top,
      minWidth: compact ? 56 : 82,
      padding: compact ? "9px 12px" : "13px 18px",
      borderRadius: compact ? 13 : 17,
      boxSizing: "border-box",
      color: bright ? "#FFFFFF" : "#171A3A",
      background: bright ? color : "rgba(255,255,255,0.82)",
      border: `1.5px solid ${bright ? color : `${color}55`}`,
      boxShadow: bright ? `0 18px 28px ${color}55` : "0 13px 24px rgba(28,31,67,0.10)",
      fontFamily: "Arial, Helvetica, sans-serif",
      fontSize: compact ? 16 : 19,
      fontWeight: 750,
      letterSpacing: -0.25,
      textAlign: "center",
      opacity,
      transform: `scale(${scale}) rotate(${rotation}deg)`,
      transformOrigin: "center center"
    }}
  >
    {label}
  </div>
);

const TokenizeInput: React.FC<{ frame: number; primary: string; accent: string }> = ({ frame, primary, accent }) => {
  const { fps } = useVideoConfig();
  const promptIn = spring({ frame: Math.max(0, frame - 5), fps, config: { damping: 24, stiffness: 54, mass: 0.9 } });
  const scanX = interpolate(frame, [34, 116], [-60, 890], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const promptOpacity = interpolate(frame, [74, 128], [1, 0.08], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const chips = [
    { label: "How", color: tokenPalette[0], x: 182, y: 352 },
    { label: "does", color: tokenPalette[1], x: 365, y: 329 },
    { label: "AI", color: tokenPalette[4], x: 542, y: 365 },
    { label: "learn", color: tokenPalette[2], x: 692, y: 334 },
    { label: "?", color: tokenPalette[3], x: 900, y: 360 }
  ];
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
      <TokenBackdrop frame={frame} primary={primary} accent={accent} />
      <div style={{ position: "absolute", left: 150, top: 251, width: 980, height: 150, borderRadius: 26, background: "rgba(255,255,255,0.76)", border: `1px solid ${primary}18`, boxShadow: "0 28px 56px rgba(35,29,93,0.13)", opacity: promptOpacity * promptIn, transform: `translateY(${(1 - promptIn) * 34}px)` }}>
        <div style={{ position: "absolute", left: 43, top: 49, color: primary, fontFamily: "Arial, Helvetica, sans-serif", fontSize: 37, fontWeight: 700, letterSpacing: -1.2 }}>How does AI learn?</div>
        <div style={{ position: "absolute", right: 31, top: 39, width: 65, height: 65, borderRadius: 18, background: accent, display: "grid", placeItems: "center", color: "#FFFFFF", fontFamily: "Arial, Helvetica, sans-serif", fontSize: 27, fontWeight: 800 }}>→</div>
      </div>
      <div style={{ position: "absolute", left: 158 + scanX, top: 233, width: 5, height: 188, borderRadius: 99, background: accent, boxShadow: `0 0 0 12px ${accent}18, 0 0 38px ${accent}88`, opacity: interpolate(frame, [30, 42, 118, 138], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) }} />
      {chips.map((chip, index) => {
        const chipIn = spring({ frame: Math.max(0, frame - (88 + index * 10)), fps, config: { damping: 19, stiffness: 76, mass: 0.72 } });
        return <TokenChip key={chip.label} label={chip.label} color={chip.color} left={chip.x} top={chip.y} scale={0.56 + chipIn * 0.44} opacity={chipIn} rotation={(1 - chipIn) * (index % 2 === 0 ? -14 : 14)} />;
      })}
      <svg width="1280" height="720" viewBox="0 0 1280 720" style={{ position: "absolute", inset: 0, opacity: interpolate(frame, [110, 160], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) }}>
        <path d="M158 494 C348 564 546 468 720 534 C876 594 1010 536 1122 474" fill="none" stroke={accent} strokeWidth="3" strokeDasharray="8 13" strokeLinecap="round" opacity="0.62" />
      </svg>
    </div>
  );
};

const TokenPieces: React.FC<{ frame: number; primary: string; accent: string }> = ({ frame, primary, accent }) => {
  const { fps } = useVideoConfig();
  const centerIn = spring({ frame: Math.max(0, frame - 10), fps, config: { damping: 22, stiffness: 52, mass: 1 } });
  const orbit = frame * 0.92;
  const examples = [
    { label: "word", token: "cloud", color: tokenPalette[0], left: 130, top: 247 },
    { label: "part", token: "read  ing", color: tokenPalette[1], left: 767, top: 173 },
    { label: "mark", token: ",", color: tokenPalette[2], left: 830, top: 426 },
    { label: "space", token: "↔", color: tokenPalette[3], left: 234, top: 464 }
  ];
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
      <TokenBackdrop frame={frame} primary={primary} accent={accent} />
      <div style={{ position: "absolute", left: 410, top: 168, width: 460, height: 382, borderRadius: "50%", border: `2px solid ${accent}44`, transform: `scale(${centerIn})`, opacity: 0.84 }} />
      <div style={{ position: "absolute", left: 486, top: 242, width: 308, height: 234, borderRadius: 42, background: "rgba(255,255,255,0.70)", border: `1px solid ${primary}14`, boxShadow: "0 20px 45px rgba(35,29,93,0.12)", transform: `scale(${0.82 + centerIn * 0.18})` }}>
        <div style={{ position: "absolute", left: 28, top: 29, color: primary, fontFamily: "Arial, Helvetica, sans-serif", fontSize: 15, fontWeight: 800, letterSpacing: 1.8, textTransform: "uppercase", opacity: 0.62 }}>small pieces</div>
        <TokenChip label="token" color={accent} left={91} top={101} bright scale={1.18 + Math.sin(frame / 28) * 0.04} />
      </div>
      {examples.map((example, index) => {
        const phase = (orbit + index * 87) * Math.PI / 180;
        const inAmount = spring({ frame: Math.max(0, frame - (24 + index * 13)), fps, config: { damping: 20, stiffness: 64, mass: 0.8 } });
        const x = example.left + Math.cos(phase) * 12;
        const y = example.top + Math.sin(phase) * 9;
        return (
          <div key={example.label} style={{ position: "absolute", left: x, top: y, opacity: inAmount, transform: `translateY(${(1 - inAmount) * 20}px)` }}>
            <div style={{ marginLeft: 9, marginBottom: 8, color: primary, fontFamily: "Arial, Helvetica, sans-serif", fontSize: 14, fontWeight: 750, letterSpacing: 1.2, textTransform: "uppercase", opacity: 0.56 }}>{example.label}</div>
            <TokenChip label={example.token} color={example.color} left={0} top={0} compact bright={index !== 3} />
          </div>
        );
      })}
      {Array.from({ length: 10 }, (_, index) => {
        const angle = index * 36 + frame * 1.15;
        const radians = angle * Math.PI / 180;
        return <div key={index} style={{ position: "absolute", left: 640 + Math.cos(radians) * 270, top: 357 + Math.sin(radians) * 170, width: 9, height: 9, borderRadius: "50%", background: tokenPalette[index % tokenPalette.length], opacity: 0.55 }} />;
      })}
    </div>
  );
};

const ContextNetwork: React.FC<{ frame: number; primary: string; accent: string }> = ({ frame, primary, accent }) => {
  const { fps } = useVideoConfig();
  const networkIn = spring({ frame: Math.max(0, frame - 7), fps, config: { damping: 22, stiffness: 46, mass: 1 } });
  const focus = interpolate(frame, [104, 178], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const tokenInputs = [
    { label: "How", color: tokenPalette[0], startX: 84, startY: 160, endX: 292, endY: 230 },
    { label: "AI", color: tokenPalette[4], startX: 1030, startY: 176, endX: 842, endY: 240 },
    { label: "learn", color: tokenPalette[2], startX: 104, startY: 500, endX: 383, endY: 385 }
  ];
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
      <TokenBackdrop frame={frame} primary={primary} accent={accent} />
      <svg width="1280" height="720" viewBox="0 0 1280 720" style={{ position: "absolute", inset: 0, opacity: networkIn }}>
        {connections.map(([from, to], index) => {
          const a = networkNodes[from];
          const b = networkNodes[to];
          return <line key={`${from}-${to}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={index % 3 === 0 ? accent : primary} strokeWidth={index % 3 === 0 ? 3 : 2} opacity={0.18 + (index % 4) * 0.08} strokeDasharray="8 13" strokeDashoffset={-frame * (1.4 + (index % 3) * 0.2)} />;
        })}
        <path d="M290 512 C456 624 759 624 936 504" fill="none" stroke={accent} strokeWidth="4" opacity="0.28" strokeDasharray="10 18" strokeDashoffset={-frame * 3} />
      </svg>
      {networkNodes.map((node, index) => {
        const pulse = 1 + Math.sin(frame / 18 + index) * 0.11 + (index === 7 ? focus * 0.35 : 0);
        return <div key={index} style={{ position: "absolute", left: node.x - 19, top: node.y - 19, width: 38, height: 38, borderRadius: "50%", background: index === 7 ? accent : "#FFFFFF", border: `2px solid ${index === 7 ? accent : `${accent}66`}`, boxShadow: `0 0 ${20 + focus * 22}px ${index === 7 ? `${accent}88` : `${accent}33`}`, transform: `scale(${pulse * networkIn})`, opacity: networkIn }} />;
      })}
      {tokenInputs.map((token, index) => {
        const travel = interpolate(frame, [24 + index * 15, 132 + index * 15], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        return <TokenChip key={token.label} label={token.label} color={token.color} left={token.startX + (token.endX - token.startX) * travel} top={token.startY + (token.endY - token.startY) * travel} compact bright scale={0.9} opacity={0.92} />;
      })}
      {["0.42", "−0.18", "0.77", "0.06"].map((value, index) => {
        const inAmount = spring({ frame: Math.max(0, frame - (96 + index * 12)), fps, config: { damping: 20, stiffness: 74, mass: 0.7 } });
        return <div key={value} style={{ position: "absolute", left: 882 + (index % 2) * 116, top: 302 + Math.floor(index / 2) * 75, width: 92, padding: "10px 0", borderRadius: 12, background: "rgba(255,255,255,0.72)", border: `1px solid ${accent}33`, color: primary, fontFamily: "Arial, Helvetica, sans-serif", fontSize: 17, fontWeight: 750, textAlign: "center", opacity: inAmount, transform: `translateY(${(1 - inAmount) * 18}px)` }}>{value}</div>;
      })}
      <div style={{ position: "absolute", left: 837, top: 218, width: 280, height: 280, borderRadius: "50%", border: `2px solid ${accent}44`, transform: `scale(${0.7 + focus * 0.3})`, opacity: 0.22 + focus * 0.38 }} />
    </div>
  );
};

const ResponseLoop: React.FC<{ frame: number; primary: string; accent: string }> = ({ frame, primary, accent }) => {
  const { fps } = useVideoConfig();
  const loop = (frame % 138) / 138;
  const selectedCandidate = Math.floor((frame / 46) % 3);
  const candidates = ["clear", "useful", "next"];
  const answerTokens = ["AI", "builds", "answers", "one", "token", "at", "a", "time", "."];
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
      <TokenBackdrop frame={frame} primary={primary} accent={accent} />
      <div style={{ position: "absolute", left: 177, top: 127, width: 420, height: 420, borderRadius: "50%", border: `2px solid ${accent}44`, transform: `rotate(${frame * 0.24}deg)` }} />
      <div style={{ position: "absolute", left: 238, top: 188, width: 298, height: 298, borderRadius: "50%", border: `12px solid ${accent}22`, boxShadow: `inset 0 0 45px ${accent}18` }} />
      <div style={{ position: "absolute", left: 309, top: 259, width: 156, height: 156, borderRadius: "50%", background: accent, boxShadow: `0 24px 48px ${accent}55`, display: "grid", placeItems: "center", color: "#FFFFFF", fontFamily: "Arial, Helvetica, sans-serif", fontSize: 18, fontWeight: 800, letterSpacing: 1.2, transform: `scale(${1 + Math.sin(frame / 22) * 0.04})` }}>PREDICT</div>
      {candidates.map((candidate, index) => {
        const angle = -72 + index * 72 + frame * 0.12;
        const radians = angle * Math.PI / 180;
        const chosen = index === selectedCandidate;
        return <TokenChip key={candidate} label={candidate} color={tokenPalette[index + 1]} left={367 + Math.cos(radians) * 242} top={307 + Math.sin(radians) * 188} compact bright={chosen} scale={chosen ? 1.18 : 0.86} opacity={chosen ? 1 : 0.42} rotation={Math.sin(frame / 23 + index) * 5} />;
      })}
      <svg width="1280" height="720" viewBox="0 0 1280 720" style={{ position: "absolute", inset: 0 }}>
        <path d="M540 336 C676 315 675 202 787 216 C904 230 871 369 741 391" fill="none" stroke={accent} strokeWidth="4" strokeDasharray="10 16" strokeDashoffset={-frame * 3.4} strokeLinecap="round" opacity="0.72" />
        <path d="M757 190 l24 25 l-31 13" fill="none" stroke={accent} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" opacity="0.72" />
      </svg>
      <div style={{ position: "absolute", left: 674, top: 182, width: 464, height: 267, borderRadius: 28, background: "rgba(255,255,255,0.76)", border: `1px solid ${primary}14`, boxShadow: "0 24px 52px rgba(35,29,93,0.13)", overflow: "hidden" }}>
        <div style={{ position: "absolute", left: 28, top: 25, color: primary, fontFamily: "Arial, Helvetica, sans-serif", fontSize: 14, fontWeight: 800, letterSpacing: 1.8, textTransform: "uppercase", opacity: 0.54 }}>response</div>
        {answerTokens.map((token, index) => {
          const tokenIn = spring({ frame: Math.max(0, frame - (24 + index * 16)), fps, config: { damping: 19, stiffness: 70, mass: 0.74 } });
          const x = 30 + (index % 4) * 99;
          const y = 85 + Math.floor(index / 4) * 78;
          return <TokenChip key={`${token}-${index}`} label={token} color={index === answerTokens.length - 1 ? tokenPalette[3] : tokenPalette[index % tokenPalette.length]} left={x} top={y} compact bright={index === answerTokens.length - 1} scale={0.7 + tokenIn * 0.3} opacity={tokenIn} />;
        })}
      </div>
      <div style={{ position: "absolute", left: 663, top: 505, width: 492, height: 3, borderRadius: 99, background: `${accent}33`, overflow: "hidden" }}><div style={{ width: `${loop * 100}%`, height: "100%", background: accent, borderRadius: 99 }} /></div>
    </div>
  );
};

export const AiTokenSceneTransition: React.FC<{ sceneIndex: number; frame: number; primary: string; accent: string }> = ({ sceneIndex, frame, primary, accent }) => {
  const reveal = interpolate(frame, [0, 18], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  if (sceneIndex === 0) return null;
  if (sceneIndex === 1) {
    return <div style={{ position: "absolute", inset: 0, zIndex: 10, overflow: "hidden", background: primary, transform: `translateY(${-(1 - reveal) * 760}px)` }}>{Array.from({ length: 20 }, (_, index) => <div key={index} style={{ position: "absolute", left: 48 + ((index * 109) % 1160), top: 56 + ((index * 83) % 610), width: 70 + ((index * 17) % 80), height: 34, borderRadius: 11, background: tokenPalette[index % tokenPalette.length], transform: `rotate(${(index % 3 - 1) * 12}deg)` }} />)}</div>;
  }
  if (sceneIndex === 2) {
    return <div style={{ position: "absolute", inset: 0, zIndex: 10, overflow: "hidden", background: "#E3DEFF", transform: `translateX(${(1 - reveal) * 1320}px)` }}>{networkNodes.map((node, index) => <div key={index} style={{ position: "absolute", left: node.x - 27, top: node.y - 27, width: 54, height: 54, borderRadius: "50%", background: index % 3 === 0 ? accent : "#FFFFFF", boxShadow: `0 0 0 14px ${accent}18` }} />)}</div>;
  }
  return <div style={{ position: "absolute", inset: 0, zIndex: 10, overflow: "hidden", background: primary, transform: `translateY(${(1 - reveal) * 760}px)` }}><div style={{ position: "absolute", left: 298, top: 17, width: 690, height: 690, borderRadius: "50%", border: `46px solid ${accent}`, boxShadow: `0 0 0 22px ${accent}44` }} /></div>;
};

export const AiTokensStoryIllustration: React.FC<AiTokensStoryIllustrationProps> = ({ sceneId, primary, accent, frame }) => {
  if (sceneId === "token-pieces") return <TokenPieces frame={frame} primary={primary} accent={accent} />;
  if (sceneId === "context-network") return <ContextNetwork frame={frame} primary={primary} accent={accent} />;
  if (sceneId === "response-loop") return <ResponseLoop frame={frame} primary={primary} accent={accent} />;
  return <TokenizeInput frame={frame} primary={primary} accent={accent} />;
};
