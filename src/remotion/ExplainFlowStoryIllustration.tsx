import React from "react";
import { interpolate, spring, useVideoConfig } from "remotion";

type ExplainFlowStoryIllustrationProps = {
  sceneId: string;
  primary: string;
  accent: string;
  frame: number;
};

const ink = "#17233A";
const teal = "#2D7668";
const paper = "#F8F4EC";
const coral = "#EA896E";
const indigo = "#6861D9";
const mist = "#DCECE6";
const sand = "#E8DED0";

const seeds = Array.from({ length: 42 }, (_, index) => ({
  x: 30 + ((index * 97) % 1210),
  y: 28 + ((index * 59) % 665),
  size: 3 + ((index * 13) % 7),
  delay: (index * 17) % 150,
  color: [teal, indigo, coral, "#D9B869"][index % 4]
}));

const styleText = {
  fontFamily: "Arial, Helvetica, sans-serif",
  color: ink
} as const;

const StudioBackdrop: React.FC<{ frame: number; tint?: string }> = ({ frame, tint = paper }) => {
  const drift = Math.sin(frame / 84) * 15;
  return (
    <>
      <div style={{ position: "absolute", inset: 0, background: `linear-gradient(135deg, ${tint} 0%, #FDFBF7 48%, #EAF2EF 100%)` }} />
      <div style={{ position: "absolute", width: 720, height: 720, left: -365 + drift, top: -388, borderRadius: "50%", background: "rgba(45,118,104,0.12)" }} />
      <div style={{ position: "absolute", width: 560, height: 450, right: -250 - drift, bottom: -212, borderRadius: "48%", background: "rgba(104,97,217,0.10)", transform: "rotate(-20deg)" }} />
      <svg width="1280" height="720" viewBox="0 0 1280 720" style={{ position: "absolute", inset: 0, opacity: 0.28 }}>
        {Array.from({ length: 14 }, (_, index) => (
          <line key={`v-${index}`} x1={index * 100 - 20} y1="0" x2={index * 100 - 20} y2="720" stroke={ink} strokeWidth="1" opacity="0.08" />
        ))}
        {Array.from({ length: 8 }, (_, index) => (
          <line key={`h-${index}`} x1="0" y1={index * 104 + 18} x2="1280" y2={index * 104 + 18} stroke={ink} strokeWidth="1" opacity="0.08" />
        ))}
      </svg>
      {seeds.map((seed, index) => {
        const phase = (((frame - seed.delay) % 150) + 150) % 150 / 150;
        return (
          <div
            key={index}
            style={{
              position: "absolute",
              left: seed.x + Math.sin(phase * Math.PI * 2 + index) * 13,
              top: seed.y + Math.cos(phase * Math.PI * 2 + index) * 8,
              width: seed.size,
              height: seed.size,
              borderRadius: "50%",
              background: seed.color,
              opacity: 0.10 + Math.sin(phase * Math.PI) * 0.22
            }}
          />
        );
      })}
    </>
  );
};

const TinyLabel: React.FC<{ children: React.ReactNode; color?: string; opacity?: number }> = ({ children, color = ink, opacity = 0.58 }) => (
  <div style={{ ...styleText, color, opacity, fontSize: 12, fontWeight: 800, letterSpacing: 1.65, textTransform: "uppercase" }}>
    {children}
  </div>
);

const PaperCard: React.FC<{
  left: number;
  top: number;
  width: number;
  height: number;
  children: React.ReactNode;
  opacity?: number;
  transform?: string;
  background?: string;
  radius?: number;
  shadow?: string;
}> = ({ left, top, width, height, children, opacity = 1, transform, background = "rgba(255,255,255,0.82)", radius = 24, shadow = "0 20px 42px rgba(23,35,58,0.12)" }) => (
  <div
    style={{
      position: "absolute",
      left,
      top,
      width,
      height,
      boxSizing: "border-box",
      overflow: "hidden",
      borderRadius: radius,
      background,
      border: "1px solid rgba(23,35,58,0.09)",
      boxShadow: shadow,
      opacity,
      transform,
      transformOrigin: "center center"
    }}
  >
    {children}
  </div>
);

const ColorDrop: React.FC<{ left: number; top: number; color: string; scale?: number; opacity?: number }> = ({ left, top, color, scale = 1, opacity = 1 }) => (
  <div
    style={{
      position: "absolute",
      left,
      top,
      width: 26,
      height: 26,
      borderRadius: "50%",
      background: color,
      boxShadow: `0 8px 16px ${color}55`,
      opacity,
      transform: `scale(${scale})`
    }}
  />
);

const ImageTile: React.FC<{ left: number; top: number; scale?: number; opacity?: number }> = ({ left, top, scale = 1, opacity = 1 }) => (
  <div
    style={{
      position: "absolute",
      left,
      top,
      width: 120,
      height: 90,
      overflow: "hidden",
      borderRadius: 15,
      background: "linear-gradient(145deg, #C7E2D8, #EEF7F3)",
      boxShadow: "0 12px 22px rgba(23,35,58,0.12)",
      opacity,
      transform: `scale(${scale})`
    }}
  >
    <div style={{ position: "absolute", width: 74, height: 74, left: 58, top: -24, borderRadius: "50%", background: "#F7CF72", opacity: 0.8 }} />
    <svg width="120" height="90" viewBox="0 0 120 90" style={{ position: "absolute", inset: 0 }}>
      <path d="M0 76 L30 47 L51 66 L77 36 L120 74 L120 90 L0 90 Z" fill="#59A18E" opacity="0.92" />
      <path d="M0 80 L36 57 L61 78 L88 50 L120 79 L120 90 L0 90 Z" fill="#2D7668" opacity="0.86" />
    </svg>
  </div>
);

const CheckMark: React.FC<{ size?: number; color?: string }> = ({ size = 32, color = "#FFFFFF" }) => (
  <svg width={size} height={size} viewBox="0 0 32 32">
    <path d="M7 16.5 L13 22.5 L25.5 9.5" fill="none" stroke={color} strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const IdeaBrand: React.FC<{ frame: number; primary: string; accent: string }> = ({ frame, primary, accent }) => {
  const { fps } = useVideoConfig();
  const noteIn = spring({ frame: Math.max(0, frame - 5), fps, config: { damping: 22, stiffness: 54, mass: 0.92 } });
  const brandIn = spring({ frame: Math.max(0, frame - 48), fps, config: { damping: 21, stiffness: 50, mass: 0.92 } });
  const scan = interpolate(frame, [55, 152], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const noteShift = interpolate(frame, [0, 150], [0, 34], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const streamOpacity = interpolate(frame, [46, 58, 168, 192], [0, 0.9, 0.9, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const labelIn = interpolate(frame, [18, 42], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
      <StudioBackdrop frame={frame} />
      <div style={{ position: "absolute", left: 104, top: 154, opacity: labelIn }}>
        <TinyLabel color={primary}>Start simply</TinyLabel>
        <div style={{ ...styleText, marginTop: 8, fontSize: 21, fontWeight: 750, letterSpacing: -0.45 }}>Your idea enters the flow.</div>
      </div>

      <PaperCard
        left={103 + noteShift}
        top={238}
        width={378}
        height={310}
        opacity={noteIn * (1 - scan * 0.18)}
        transform={`rotate(${(1 - noteIn) * -5}deg) translateY(${(1 - noteIn) * 28}px)`}
      >
        <div style={{ position: "absolute", left: 28, top: 25 }}><TinyLabel>Idea</TinyLabel></div>
        <div style={{ ...styleText, position: "absolute", left: 28, top: 64, fontSize: 25, fontWeight: 760, letterSpacing: -0.7 }}>Why does rain fall?</div>
        {[0, 1, 2].map((index) => (
          <div
            key={index}
            style={{
              position: "absolute",
              left: 28,
              top: 122 + index * 25,
              width: [258, 214, 270][index],
              height: 8,
              borderRadius: 99,
              background: index === 0 ? `${accent}55` : "rgba(23,35,58,0.14)"
            }}
          />
        ))}
        <div style={{ position: "absolute", left: 28, bottom: 26, display: "flex", gap: 9 }}>
          {["EN", "DE"].map((language, index) => (
            <div key={language} style={{ padding: "7px 10px", borderRadius: 10, color: index === 0 ? "#FFFFFF" : primary, background: index === 0 ? accent : "rgba(23,35,58,0.07)", ...styleText, fontSize: 12, fontWeight: 800, letterSpacing: 0.8 }}>{language}</div>
          ))}
        </div>
        <div style={{ position: "absolute", right: 22, bottom: 22, width: 46, height: 46, borderRadius: 16, display: "grid", placeItems: "center", background: `${accent}18` }}>
          <svg width="24" height="24" viewBox="0 0 24 24"><path d="M4 12h13M12 5l7 7-7 7" fill="none" stroke={accent} strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </div>
      </PaperCard>

      <svg width="1280" height="720" viewBox="0 0 1280 720" style={{ position: "absolute", inset: 0, opacity: streamOpacity }}>
        <path d="M468 395 C580 323 649 481 751 390" fill="none" stroke={accent} strokeWidth="3" strokeDasharray="8 13" strokeLinecap="round" />
        <path d="M468 407 C590 354 650 449 751 407" fill="none" stroke={coral} strokeWidth="2" strokeDasharray="4 17" strokeDashoffset={-frame * 2.5} opacity="0.72" />
      </svg>
      {[0, 1, 2, 3, 4].map((index) => {
        const progress = (((frame - 62 - index * 15) % 92) + 92) % 92 / 92;
        const x = 480 + progress * 265;
        const y = 396 - Math.sin(progress * Math.PI) * (index % 2 === 0 ? 52 : 30);
        return <ColorDrop key={index} left={x} top={y} color={[accent, coral, indigo, "#D9B869", accent][index]} scale={0.38 + Math.sin(progress * Math.PI) * 0.48} opacity={streamOpacity * Math.sin(progress * Math.PI)} />;
      })}

      <PaperCard
        left={748}
        top={145}
        width={406}
        height={408}
        opacity={brandIn}
        transform={`translateY(${(1 - brandIn) * 32}px) scale(${0.92 + brandIn * 0.08})`}
        background="rgba(253,251,247,0.91)"
        shadow="0 27px 55px rgba(23,35,58,0.15)"
      >
        <div style={{ position: "absolute", left: 30, top: 26 }}><TinyLabel color={primary}>Brand kit</TinyLabel></div>
        <div style={{ position: "absolute", right: 27, top: 23, width: 42, height: 42, borderRadius: "50%", background: accent, display: "grid", placeItems: "center", boxShadow: `0 11px 22px ${accent}55` }}><span style={{ color: "#FFFFFF", fontFamily: "Arial, Helvetica, sans-serif", fontSize: 18, fontWeight: 800 }}>E</span></div>
        <div style={{ position: "absolute", left: 30, top: 78, width: 148, height: 120, borderRadius: 20, background: `linear-gradient(145deg, ${accent}, #58A795)`, overflow: "hidden" }}>
          <div style={{ position: "absolute", left: 18, top: 19, color: "rgba(255,255,255,0.78)", fontFamily: "Arial, Helvetica, sans-serif", fontSize: 11, fontWeight: 800, letterSpacing: 1.25 }}>YOUR LOGO</div>
          <div style={{ position: "absolute", left: 19, bottom: 17, color: "#FFFFFF", fontFamily: "Arial, Helvetica, sans-serif", fontSize: 30, fontWeight: 800, letterSpacing: -1 }}>EF</div>
          <div style={{ position: "absolute", right: -18, bottom: -34, width: 108, height: 108, border: "2px solid rgba(255,255,255,0.35)", borderRadius: "50%" }} />
        </div>
        <ImageTile left={212} top={78} scale={1} opacity={brandIn} />
        <div style={{ position: "absolute", left: 30, top: 226 }}><TinyLabel>Colours</TinyLabel></div>
        {[accent, coral, indigo, "#D9B869"].map((color, index) => {
          const pop = spring({ frame: Math.max(0, frame - (92 + index * 8)), fps, config: { damping: 18, stiffness: 80, mass: 0.7 } });
          return <ColorDrop key={color} left={30 + index * 48} top={260} color={color} scale={pop} opacity={pop} />;
        })}
        <div style={{ position: "absolute", left: 30, right: 30, bottom: 37, height: 54, borderRadius: 15, background: `${primary}08`, display: "flex", alignItems: "center", padding: "0 16px", gap: 10 }}>
          <div style={{ width: 9, height: 9, borderRadius: "50%", background: accent, boxShadow: `0 0 0 5px ${accent}18` }} />
          <div style={{ ...styleText, fontSize: 15, fontWeight: 750 }}>Ready to make it yours</div>
        </div>
      </PaperCard>
    </div>
  );
};

const StoryboardTile: React.FC<{ left: number; top: number; index: number; frame: number; primary: string; accent: string }> = ({ left, top, index, frame, primary, accent }) => {
  const { fps } = useVideoConfig();
  const inAmount = spring({ frame: Math.max(0, frame - (24 + index * 19)), fps, config: { damping: 20, stiffness: 61, mass: 0.78 } });
  const colors = [accent, indigo, coral];
  const highlight = colors[index];
  const tilt = [-4, 2, -2][index];
  return (
    <PaperCard
      left={left}
      top={top}
      width={220}
      height={260}
      opacity={inAmount}
      transform={`translateY(${(1 - inAmount) * 38}px) rotate(${tilt + (1 - inAmount) * 6}deg)`}
      radius={21}
      shadow="0 17px 32px rgba(23,35,58,0.11)"
    >
      <div style={{ position: "absolute", left: 18, top: 16 }}><TinyLabel color={primary}>{String(index + 1).padStart(2, "0")}</TinyLabel></div>
      <div style={{ position: "absolute", left: 18, top: 48, width: 184, height: 116, overflow: "hidden", borderRadius: 14, background: index === 0 ? "#DCECE6" : index === 1 ? "#ECE9FF" : "#F8E2D9" }}>
        {index === 0 ? (
          <>
            <div style={{ position: "absolute", width: 68, height: 68, right: 16, top: -17, borderRadius: "50%", background: "#F4C66F" }} />
            <svg width="184" height="116" viewBox="0 0 184 116"><path d="M0 94 L43 58 L76 86 L117 36 L184 91 L184 116 L0 116 Z" fill={accent} opacity="0.82" /><path d="M0 99 L36 70 L70 95 L131 56 L184 97 L184 116 L0 116 Z" fill="#276C61" /></svg>
          </>
        ) : index === 1 ? (
          <>
            <div style={{ position: "absolute", left: 19, top: 25, width: 72, height: 72, borderRadius: "50%", border: `9px solid ${indigo}44` }} />
            <div style={{ position: "absolute", left: 44, top: 50, width: 22, height: 22, borderRadius: "50%", background: indigo }} />
            {[0, 1, 2, 3].map((node) => <div key={node} style={{ position: "absolute", left: 118 + (node % 2) * 28, top: 28 + Math.floor(node / 2) * 32, width: 14, height: 14, borderRadius: "50%", background: node === 3 ? indigo : "#BFB8FA" }} />)}
            <svg width="184" height="116" viewBox="0 0 184 116" style={{ position: "absolute", inset: 0 }}><path d="M82 59 C110 28 125 40 146 37 M82 59 C110 85 128 74 146 69" fill="none" stroke={indigo} strokeWidth="2" strokeDasharray="4 6" /></svg>
          </>
        ) : (
          <>
            <svg width="184" height="116" viewBox="0 0 184 116"><path d="M0 89 C31 66 53 99 81 66 C112 29 139 85 184 39 L184 116 L0 116 Z" fill={coral} opacity="0.72" /><path d="M0 102 C36 74 58 105 90 73 C118 44 142 95 184 62" fill="none" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" /></svg>
            {[0, 1, 2, 3, 4].map((bar) => <div key={bar} style={{ position: "absolute", left: 19 + bar * 25, bottom: 15, width: 10, height: 12 + ((bar * 9) % 31), borderRadius: 8, background: "#FFFFFF", opacity: 0.8 }} />)}
          </>
        )}
      </div>
      {[0, 1].map((line) => <div key={line} style={{ position: "absolute", left: 18, top: 188 + line * 18, height: 7, width: line === 0 ? 138 : 103, borderRadius: 99, background: line === 0 ? `${highlight}55` : "rgba(23,35,58,0.12)" }} />)}
      <div style={{ position: "absolute", left: 18, bottom: 18, width: 25, height: 7, borderRadius: 99, background: highlight }} />
    </PaperCard>
  );
};

const PlanReview: React.FC<{ frame: number; primary: string; accent: string }> = ({ frame, primary, accent }) => {
  const { fps } = useVideoConfig();
  const sourceIn = spring({ frame: Math.max(0, frame - 3), fps, config: { damping: 22, stiffness: 55, mass: 0.9 } });
  const reviewIn = spring({ frame: Math.max(0, frame - 105), fps, config: { damping: 19, stiffness: 52, mass: 0.83 } });
  const scanX = interpolate(frame, [16, 113], [0, 335], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const beamOpacity = interpolate(frame, [12, 24, 118, 137], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
      <StudioBackdrop frame={frame} tint="#F8F5F0" />
      <PaperCard left={83} top={160} width={350} height={389} opacity={sourceIn} transform={`translateX(${(1 - sourceIn) * -34}px)`} background="rgba(253,251,247,0.84)">
        <div style={{ position: "absolute", left: 29, top: 27 }}><TinyLabel>Story plan</TinyLabel></div>
        <div style={{ position: "absolute", left: 29, top: 73, width: 236, height: 13, borderRadius: 99, background: primary }} />
        {[0, 1, 2, 3, 4, 5].map((line) => <div key={line} style={{ position: "absolute", left: 29, top: 118 + line * 31, width: [250, 216, 266, 182, 238, 152][line], height: 8, borderRadius: 99, background: line === 2 ? `${accent}6E` : "rgba(23,35,58,0.14)" }} />)}
        <div style={{ position: "absolute", left: 29, right: 29, bottom: 29, height: 53, borderRadius: 14, background: `${accent}15`, display: "flex", alignItems: "center", gap: 11, padding: "0 15px" }}>
          <div style={{ width: 10, height: 10, borderRadius: "50%", background: accent }} />
          <div style={{ ...styleText, fontSize: 14, fontWeight: 720 }}>Plan is becoming visual</div>
        </div>
      </PaperCard>
      <div style={{ position: "absolute", left: 411 + scanX, top: 146, width: 4, height: 420, borderRadius: 99, opacity: beamOpacity, background: accent, boxShadow: `0 0 0 13px ${accent}16, 0 0 33px ${accent}88` }} />
      <svg width="1280" height="720" viewBox="0 0 1280 720" style={{ position: "absolute", inset: 0, opacity: 0.62 }}>
        <path d="M430 282 C473 272 493 254 524 243" fill="none" stroke={accent} strokeWidth="3" strokeDasharray="8 10" strokeDashoffset={-frame * 2} />
        <path d="M430 355 C474 360 496 363 520 382" fill="none" stroke={indigo} strokeWidth="3" strokeDasharray="8 10" strokeDashoffset={-frame * 1.6} />
        <path d="M430 434 C486 462 514 473 540 493" fill="none" stroke={coral} strokeWidth="3" strokeDasharray="8 10" strokeDashoffset={-frame * 1.3} />
      </svg>
      <StoryboardTile left={520} top={133} index={0} frame={frame} primary={primary} accent={accent} />
      <StoryboardTile left={710} top={218} index={1} frame={frame} primary={primary} accent={accent} />
      <StoryboardTile left={900} top={126} index={2} frame={frame} primary={primary} accent={accent} />

      <PaperCard left={786} top={508} width={359} height={110} opacity={reviewIn} transform={`translateY(${(1 - reviewIn) * 20}px)`} background="rgba(255,255,255,0.92)" radius={19} shadow="0 17px 32px rgba(23,35,58,0.10)">
        <div style={{ position: "absolute", left: 20, top: 18 }}><TinyLabel>Review & approve</TinyLabel></div>
        <div style={{ position: "absolute", left: 20, bottom: 23, display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 42, height: 42, display: "grid", placeItems: "center", borderRadius: 14, background: `${indigo}15` }}>
            <svg width="25" height="25" viewBox="0 0 25 25"><path d="M4 13 C6 5 8 21 10 13 C12 4 14 22 16 12 C18 7 20 18 22 11" fill="none" stroke={indigo} strokeWidth="2" strokeLinecap="round" /></svg>
          </div>
          <div style={{ display: "flex", gap: 3, alignItems: "center" }}>
            {Array.from({ length: 20 }, (_, index) => <div key={index} style={{ width: 3, height: 8 + Math.abs(Math.sin(frame / 8 + index * 0.7)) * 20, borderRadius: 99, background: index % 3 === 0 ? accent : `${primary}66` }} />)}
          </div>
          <div style={{ width: 38, height: 38, borderRadius: "50%", marginLeft: 5, background: accent, display: "grid", placeItems: "center", boxShadow: `0 8px 18px ${accent}44` }}><CheckMark size={25} /></div>
        </div>
      </PaperCard>
    </div>
  );
};

const RenderPlayer: React.FC<{ frame: number; primary: string; accent: string }> = ({ frame, primary, accent }) => {
  const { fps } = useVideoConfig();
  const playerIn = spring({ frame: Math.max(0, frame - 36), fps, config: { damping: 21, stiffness: 46, mass: 1 } });
  const playPulse = 1 + Math.sin(frame / 24) * 0.045;
  const progress = ((frame - 45) % 174 + 174) % 174 / 174;
  return (
    <PaperCard left={404} top={147} width={562} height={372} opacity={playerIn} transform={`scale(${0.87 + playerIn * 0.13}) translateY(${(1 - playerIn) * 20}px)`} background="#FEFDFC" radius={29} shadow="0 28px 62px rgba(23,35,58,0.18)">
      <div style={{ position: "absolute", left: 24, top: 23, right: 24, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <TinyLabel color={primary}>Your video</TinyLabel>
        <div style={{ display: "flex", gap: 6 }}>
          {["#F4C66F", coral, accent].map((color) => <div key={color} style={{ width: 8, height: 8, borderRadius: "50%", background: color }} />)}
        </div>
      </div>
      <div style={{ position: "absolute", left: 24, top: 58, width: 514, height: 220, overflow: "hidden", borderRadius: 20, background: `linear-gradient(135deg, ${mist} 0%, #F3F8F4 100%)` }}>
        <div style={{ position: "absolute", left: -30, bottom: -20, width: 290, height: 170, borderRadius: "50% 50% 0 0", background: `${accent}CC`, transform: `rotate(-6deg)` }} />
        <div style={{ position: "absolute", right: -44, bottom: -46, width: 310, height: 185, borderRadius: "50% 50% 0 0", background: `${indigo}D6`, transform: "rotate(11deg)" }} />
        <svg width="514" height="220" viewBox="0 0 514 220" style={{ position: "absolute", inset: 0 }}>
          <path d="M0 173 C81 119 128 181 217 125 C304 71 381 174 514 98" fill="none" stroke="rgba(255,255,255,0.74)" strokeWidth="5" strokeLinecap="round" />
          <path d="M0 189 C79 138 132 190 214 148 C310 101 384 188 514 128" fill="none" stroke="rgba(255,255,255,0.36)" strokeWidth="3" strokeDasharray="8 11" strokeDashoffset={-frame * 2.4} />
        </svg>
        {[0, 1, 2].map((index) => <div key={index} style={{ position: "absolute", left: 32 + index * 76, top: 34 + (index % 2) * 22, width: 34, height: 34, borderRadius: "50%", border: "2px solid rgba(255,255,255,0.65)", opacity: 0.44 + Math.sin(frame / 22 + index) * 0.18 }} />)}
        <div style={{ position: "absolute", left: 223, top: 73, width: 72, height: 72, borderRadius: "50%", background: "rgba(255,255,255,0.92)", display: "grid", placeItems: "center", transform: `scale(${playPulse})`, boxShadow: "0 12px 26px rgba(23,35,58,0.18)" }}>
          <svg width="28" height="28" viewBox="0 0 28 28"><path d="M10 7 L22 14 L10 21 Z" fill={primary} /></svg>
        </div>
        <div style={{ position: "absolute", left: 116, right: 116, bottom: 16, height: 27, borderRadius: 9, background: "rgba(248,244,236,0.88)", display: "flex", alignItems: "center", justifyContent: "center", color: ink, fontFamily: "Arial, Helvetica, sans-serif", fontSize: 12, fontWeight: 750 }}>A clear idea, in motion.</div>
      </div>
      <div style={{ position: "absolute", left: 27, right: 27, bottom: 28, height: 35, display: "flex", alignItems: "center", gap: 11 }}>
        <div style={{ width: 10, height: 10, borderRadius: "50%", background: accent, boxShadow: `0 0 0 5px ${accent}1C` }} />
        <div style={{ flex: 1, height: 5, borderRadius: 99, overflow: "hidden", background: `${primary}14` }}><div style={{ width: `${18 + progress * 72}%`, height: "100%", borderRadius: 99, background: accent }} /></div>
        <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
          {Array.from({ length: 11 }, (_, index) => <div key={index} style={{ width: 2, height: 7 + Math.abs(Math.sin(frame / 6 + index)) * 13, borderRadius: 99, background: index % 3 === 0 ? coral : `${primary}65` }} />)}
        </div>
      </div>
    </PaperCard>
  );
};

const ApproveRender: React.FC<{ frame: number; primary: string; accent: string }> = ({ frame, primary, accent }) => {
  const { fps } = useVideoConfig();
  const ringIn = spring({ frame: Math.max(0, frame - 2), fps, config: { damping: 22, stiffness: 42, mass: 1.05 } });
  const cardFade = interpolate(frame, [10, 43, 133, 170], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const renderIn = spring({ frame: Math.max(0, frame - 10), fps, config: { damping: 18, stiffness: 55, mass: 0.9 } });
  const orbit = frame * 0.48;

  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
      <StudioBackdrop frame={frame} tint="#F6F4FB" />
      <div style={{ position: "absolute", left: 279, top: 68, width: 720, height: 600, borderRadius: "50%", border: `2px solid ${accent}2E`, transform: `scale(${ringIn}) rotate(${orbit * 0.05}deg)` }} />
      <div style={{ position: "absolute", left: 354, top: 142, width: 570, height: 445, borderRadius: "50%", border: `24px solid ${indigo}0D`, transform: `scale(${0.9 + ringIn * 0.1})` }} />
      <div style={{ position: "absolute", left: 105, top: 171, opacity: renderIn }}><TinyLabel color={primary}>Approve once</TinyLabel><div style={{ ...styleText, marginTop: 8, fontSize: 21, fontWeight: 750, letterSpacing: -0.45 }}>Then watch it come alive.</div></div>
      {[0, 1, 2, 3].map((index) => {
        const progress = interpolate(frame, [12 + index * 16, 116 + index * 16], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        const startX = [116, 1000, 162, 1014][index];
        const startY = [298, 286, 506, 489][index];
        const endX = 618 + (index % 2) * 22;
        const endY = 315 + Math.floor(index / 2) * 24;
        return (
          <div key={index} style={{ position: "absolute", left: startX + (endX - startX) * progress, top: startY + (endY - startY) * progress, width: 106, height: 69, borderRadius: 16, overflow: "hidden", background: [mist, "#ECE9FF", "#F8E2D9", "#E8F0C9"][index], opacity: cardFade, transform: `rotate(${[-10, 8, 8, -8][index] * (1 - progress)}deg) scale(${0.8 + (1 - progress) * 0.16})`, boxShadow: "0 13px 22px rgba(23,35,58,0.11)" }}>
            <div style={{ position: "absolute", left: 12, top: 12, width: 47, height: 5, borderRadius: 99, background: [accent, indigo, coral, "#A4B752"][index] }} />
            <div style={{ position: "absolute", left: 12, bottom: 12, width: 77, height: 22, borderRadius: 8, background: "rgba(255,255,255,0.75)" }} />
          </div>
        );
      })}
      <RenderPlayer frame={frame} primary={primary} accent={accent} />
      <div style={{ position: "absolute", left: 1010, top: 190, width: 103, height: 103, borderRadius: "50%", border: `2px dashed ${accent}77`, transform: `rotate(${frame * 0.75}deg)`, opacity: renderIn }} />
      {[0, 1, 2, 3, 4, 5].map((index) => {
        const angle = (index * 60 + orbit) * Math.PI / 180;
        return <ColorDrop key={index} left={1061 + Math.cos(angle) * 62} top={241 + Math.sin(angle) * 53} color={[accent, coral, indigo, "#D9B869", accent, indigo][index]} scale={0.28 + (index % 2) * 0.1} opacity={renderIn * 0.78} />;
      })}
    </div>
  );
};

const PreviewNext: React.FC<{ frame: number; primary: string; accent: string }> = ({ frame, primary, accent }) => {
  const { fps } = useVideoConfig();
  const previewIn = spring({ frame: Math.max(0, frame - 4), fps, config: { damping: 22, stiffness: 48, mass: 0.98 } });
  const downloadIn = spring({ frame: Math.max(0, frame - 75), fps, config: { damping: 19, stiffness: 58, mass: 0.82 } });
  const shareIn = spring({ frame: Math.max(0, frame - 132), fps, config: { damping: 20, stiffness: 49, mass: 0.9 } });
  const cursorX = interpolate(frame, [20, 164], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
      <StudioBackdrop frame={frame} tint="#F8F4EC" />
      <div style={{ position: "absolute", left: 92, top: 138, opacity: previewIn }}><TinyLabel color={primary}>Finish with control</TinyLabel><div style={{ ...styleText, marginTop: 8, fontSize: 21, fontWeight: 750, letterSpacing: -0.45 }}>Preview, download, and share.</div></div>
      <PaperCard left={91} top={220} width={528} height={309} opacity={previewIn} transform={`translateY(${(1 - previewIn) * 28}px) scale(${0.94 + previewIn * 0.06})`} background="rgba(255,255,255,0.87)" radius={27} shadow="0 24px 52px rgba(23,35,58,0.13)">
        <div style={{ position: "absolute", left: 23, top: 21 }}><TinyLabel>Preview</TinyLabel></div>
        <div style={{ position: "absolute", left: 23, top: 54, width: 482, height: 181, borderRadius: 17, overflow: "hidden", background: "linear-gradient(135deg, #DCECE6, #E8E5FF)" }}>
          <svg width="482" height="181" viewBox="0 0 482 181" style={{ position: "absolute", inset: 0 }}>
            <path d="M0 138 C63 98 123 152 191 106 C262 58 335 151 482 84 L482 181 L0 181 Z" fill={accent} opacity="0.80" />
            <path d="M0 160 C74 115 125 171 203 132 C289 89 358 166 482 106" fill="none" stroke="rgba(255,255,255,0.74)" strokeWidth="4" strokeDasharray="9 12" strokeDashoffset={-frame * 2.2} />
          </svg>
          <div style={{ position: "absolute", left: 204, top: 55, width: 70, height: 70, borderRadius: "50%", display: "grid", placeItems: "center", background: "rgba(255,255,255,0.90)", boxShadow: "0 10px 21px rgba(23,35,58,0.14)" }}><svg width="26" height="26" viewBox="0 0 28 28"><path d="M10 7 L22 14 L10 21 Z" fill={primary} /></svg></div>
          <div style={{ position: "absolute", left: 119, right: 119, bottom: 14, height: 26, borderRadius: 8, background: "rgba(248,244,236,0.88)", display: "flex", alignItems: "center", justifyContent: "center", color: ink, fontFamily: "Arial, Helvetica, sans-serif", fontSize: 11, fontWeight: 750 }}>Your message, clearly told.</div>
        </div>
        <div style={{ position: "absolute", left: 25, right: 25, bottom: 29, height: 21, display: "flex", alignItems: "center", gap: 9 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: accent }} />
          <div style={{ flex: 1, height: 5, borderRadius: 99, background: `${primary}14`, overflow: "hidden" }}><div style={{ width: `${14 + cursorX * 78}%`, height: "100%", borderRadius: 99, background: accent }} /></div>
          {[0, 1, 2, 3].map((marker) => <div key={marker} style={{ width: 3, height: 13, borderRadius: 3, background: marker === 3 ? coral : `${primary}44` }} />)}
        </div>
      </PaperCard>
      <div style={{ position: "absolute", left: 669, top: 282, opacity: downloadIn, transform: `translateX(${(1 - downloadIn) * -18}px)` }}>
        <div style={{ width: 93, height: 93, borderRadius: 27, background: accent, display: "grid", placeItems: "center", boxShadow: `0 20px 32px ${accent}44` }}>
          <svg width="42" height="42" viewBox="0 0 42 42"><path d="M21 7 V26 M13 20 L21 28 L29 20 M10 34 H32" fill="none" stroke="#FFFFFF" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </div>
        <div style={{ ...styleText, marginTop: 13, marginLeft: 5, fontSize: 13, fontWeight: 800, letterSpacing: 0.8, color: primary }}>MP4 · 720P</div>
      </div>
      <svg width="1280" height="720" viewBox="0 0 1280 720" style={{ position: "absolute", inset: 0, opacity: downloadIn }}>
        <path d="M619 374 C647 374 654 332 671 328" fill="none" stroke={accent} strokeWidth="3" strokeDasharray="8 10" />
      </svg>
      <PaperCard left={828} top={205} width={254} height={316} opacity={shareIn} transform={`translateY(${(1 - shareIn) * 28}px) rotate(${(1 - shareIn) * 3}deg)`} background="rgba(253,251,247,0.90)" radius={24} shadow="0 20px 40px rgba(23,35,58,0.12)">
        <div style={{ position: "absolute", left: 22, top: 22 }}><TinyLabel>Share ready</TinyLabel></div>
        <div style={{ position: "absolute", left: 58, top: 76, width: 138, height: 126, opacity: shareIn }}>
          <svg width="138" height="126" viewBox="0 0 138 126" style={{ position: "absolute", inset: 0 }}>
            <path d="M34 70 C55 57 72 44 97 33 M36 73 C58 81 72 88 99 93" fill="none" stroke={accent} strokeWidth="4" strokeDasharray="7 8" strokeDashoffset={-frame * 2.3} strokeLinecap="round" opacity="0.72" />
          </svg>
          {[{ x: 20, y: 53, color: accent, size: 49 }, { x: 84, y: 12, color: indigo, size: 43 }, { x: 89, y: 74, color: coral, size: 46 }].map((node, index) => {
            const pulse = 1 + Math.sin(frame / 18 + index * 1.7) * 0.05;
            return <div key={index} style={{ position: "absolute", left: node.x, top: node.y, width: node.size, height: node.size, borderRadius: "50%", background: node.color, display: "grid", placeItems: "center", boxShadow: `0 12px 20px ${node.color}44`, transform: `scale(${pulse})` }}><div style={{ width: node.size * 0.34, height: node.size * 0.34, borderRadius: "50%", background: "rgba(255,255,255,0.88)" }} /></div>;
          })}
        </div>
        <div style={{ position: "absolute", left: 23, right: 23, bottom: 22, height: 59, borderRadius: 15, background: `${accent}12`, display: "flex", alignItems: "center", gap: 10, padding: "0 13px" }}>
          <div style={{ width: 33, height: 33, borderRadius: 11, display: "grid", placeItems: "center", background: accent }}><svg width="19" height="19" viewBox="0 0 20 20"><path d="M4 10 H15 M11 6 L15 10 L11 14" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg></div>
          <div style={{ ...styleText, fontSize: 12, fontWeight: 750, lineHeight: 1.2 }}>Your story, ready to share</div>
        </div>
      </PaperCard>
    </div>
  );
};

export const ExplainFlowSceneTransition: React.FC<{ sceneIndex: number; frame: number; primary: string; accent: string }> = ({ sceneIndex, frame, primary, accent }) => {
  const reveal = interpolate(frame, [0, 20], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  if (sceneIndex === 0) return null;
  if (sceneIndex === 1) {
    return (
      <div style={{ position: "absolute", inset: 0, zIndex: 10, overflow: "hidden", background: paper, transform: `translateX(${-(1 - reveal) * 1320}px)` }}>
        {Array.from({ length: 13 }, (_, index) => <div key={index} style={{ position: "absolute", left: -24 + ((index * 121) % 1260), top: 28 + ((index * 79) % 680), width: 126, height: 78, borderRadius: 17, background: [mist, "#ECE9FF", "#F7E1D7"][index % 3], transform: `rotate(${(index % 3 - 1) * 11}deg)`, boxShadow: "0 8px 17px rgba(23,35,58,0.08)" }} />)}
      </div>
    );
  }
  if (sceneIndex === 2) {
    return (
      <div style={{ position: "absolute", inset: 0, zIndex: 10, overflow: "hidden", background: "#F1F0FB", transform: `translateY(${-(1 - reveal) * 760}px)` }}>
        <div style={{ position: "absolute", left: 284, top: -190, width: 720, height: 720, borderRadius: "50%", border: `76px solid ${accent}`, opacity: 0.92 }} />
        <div style={{ position: "absolute", left: 364, top: -110, width: 560, height: 560, borderRadius: "50%", border: `44px solid ${indigo}`, opacity: 0.72 }} />
      </div>
    );
  }
  return (
    <div style={{ position: "absolute", inset: 0, zIndex: 10, overflow: "hidden", background: primary, transform: `translateX(${(1 - reveal) * 1320}px)` }}>
      <div style={{ position: "absolute", left: 268, top: 104, width: 744, height: 500, borderRadius: 44, background: paper, transform: `rotate(${(1 - reveal) * 9}deg)`, boxShadow: "0 28px 60px rgba(0,0,0,0.2)" }} />
      <div style={{ position: "absolute", left: 381, top: 183, width: 518, height: 300, borderRadius: 28, background: `linear-gradient(135deg, ${mist}, #E9E6FF)` }} />
    </div>
  );
};

export const ExplainFlowStoryIllustration: React.FC<ExplainFlowStoryIllustrationProps> = ({ sceneId, primary, accent, frame }) => {
  if (sceneId === "plan-review") return <PlanReview frame={frame} primary={primary} accent={accent} />;
  if (sceneId === "approve-render") return <ApproveRender frame={frame} primary={primary} accent={accent} />;
  if (sceneId === "preview-next") return <PreviewNext frame={frame} primary={primary} accent={accent} />;
  return <IdeaBrand frame={frame} primary={primary} accent={accent} />;
};
