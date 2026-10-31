import React from "react";
import { interpolate, spring, useVideoConfig } from "remotion";

type RainStoryIllustrationProps = {
  sceneId: string;
  primary: string;
  accent: string;
  frame: number;
};

type Atmosphere = "warm" | "rising" | "cool" | "rain";

const vaporSeeds = Array.from({ length: 34 }, (_, index) => ({
  delay: (index * 23) % 176,
  x: 110 + ((index * 107) % 1010),
  size: 10 + ((index * 7) % 18),
  drift: ((index * 17) % 44) - 22
}));

const rainSeeds = Array.from({ length: 76 }, (_, index) => ({
  delay: (index * 29) % 154,
  x: 50 + ((index * 83) % 1175),
  length: 24 + ((index * 11) % 40),
  speed: 1.16 + ((index * 13) % 34) / 25,
  opacity: 0.28 + ((index * 19) % 40) / 100
}));

const rippleSeeds = Array.from({ length: 15 }, (_, index) => ({
  delay: (index * 31) % 96,
  x: 74 + ((index * 137) % 1110),
  y: 540 + ((index * 47) % 118),
  size: 32 + ((index * 29) % 75)
}));

const AtmosphericBackdrop: React.FC<{ atmosphere: Atmosphere; frame: number; accent: string }> = ({ atmosphere, frame, accent }) => {
  const palettes: Record<Atmosphere, string> = {
    warm: "linear-gradient(180deg, #F7F0E4 0%, #F7F3EB 49%, #DCEDE5 100%)",
    rising: "linear-gradient(180deg, #F8EDDA 0%, #F3F0E8 44%, #CDE6DE 100%)",
    cool: "linear-gradient(180deg, #EAF1EE 0%, #D5E6E0 53%, #B9D8CF 100%)",
    rain: "linear-gradient(180deg, #C5DBD4 0%, #DDE9E3 47%, #8DB7AD 100%)"
  };
  const drift = Math.sin(frame / 74) * 16;
  const glowScale = 1 + Math.sin(frame / 86) * 0.035;

  return (
    <>
      <div style={{ position: "absolute", inset: 0, background: palettes[atmosphere] }} />
      <div
        style={{
          position: "absolute",
          width: 780,
          height: 780,
          top: -390,
          right: -144,
          borderRadius: "50%",
          background: atmosphere === "rain" ? "rgba(45, 118, 104, 0.14)" : "rgba(255, 255, 255, 0.50)",
          transform: `translateX(${drift}px) scale(${glowScale})`
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 650,
          height: 300,
          left: -200,
          top: 82,
          borderRadius: "50%",
          background: atmosphere === "warm" ? "rgba(246, 200, 95, 0.16)" : "rgba(255, 255, 255, 0.20)",
          transform: `translateX(${-drift * 0.6}px) rotate(-10deg)`
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: 240,
          background: `linear-gradient(180deg, transparent, ${accent}16)`
        }}
      />
    </>
  );
};

const Sun: React.FC<{ frame: number; left: number; top: number; size?: number; opacity?: number }> = ({
  frame,
  left,
  top,
  size = 180,
  opacity = 1
}) => {
  const rayRotation = frame * 0.16;
  const pulse = 1 + Math.sin(frame / 35) * 0.022;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      style={{ position: "absolute", left, top, overflow: "visible", opacity, transform: `scale(${pulse})` }}
    >
      <g transform={`rotate(${rayRotation} 100 100)`} stroke="#E7AD39" strokeWidth="5" strokeLinecap="round" opacity="0.68">
        {Array.from({ length: 12 }, (_, index) => (
          <line key={index} x1="100" y1="22" x2="100" y2="4" transform={`rotate(${index * 30} 100 100)`} />
        ))}
      </g>
      <circle cx="100" cy="100" r="62" fill="rgba(246, 200, 95, 0.20)" />
      <circle cx="100" cy="100" r="47" fill="#F6C85F" />
      <circle cx="82" cy="81" r="15" fill="rgba(255, 255, 255, 0.25)" />
    </svg>
  );
};

const Hills: React.FC<{ frame: number; primary: string; accent: string; storm?: boolean }> = ({ frame, primary, accent, storm = false }) => {
  const farDrift = Math.sin(frame / 96) * 14;
  const nearDrift = Math.sin(frame / 72 + 1) * 24;
  return (
    <svg width="1280" height="270" viewBox="0 0 1280 270" style={{ position: "absolute", left: 0, top: 334, overflow: "visible" }}>
      <path
        d="M-80,207 C85,146 155,183 266,127 C374,72 491,155 604,110 C741,56 831,153 951,113 C1085,68 1162,134 1370,82 L1370,270 L-80,270 Z"
        fill={storm ? "#88AFA5" : "#BBD8CE"}
        opacity="0.62"
        transform={`translate(${farDrift} 0)`}
      />
      <path
        d="M-70,227 C100,167 206,220 325,152 C458,77 557,224 685,162 C819,94 914,209 1058,143 C1166,94 1263,139 1360,113 L1360,270 L-70,270 Z"
        fill={storm ? "#5E9186" : accent}
        opacity={storm ? "0.72" : "0.68"}
        transform={`translate(${nearDrift} 0)`}
      />
      <path d="M0,243 C210,205 392,253 608,215 C812,179 1013,236 1280,194 L1280,270 L0,270 Z" fill={primary} opacity={storm ? "0.24" : "0.12"} />
    </svg>
  );
};

const WaterSurface: React.FC<{ frame: number; accent: string; primary: string; top?: number; storm?: boolean }> = ({
  frame,
  accent,
  primary,
  top = 474,
  storm = false
}) => {
  const driftOne = Math.sin(frame / 32) * 19;
  const driftTwo = Math.sin(frame / 44 + 0.7) * 25;
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top, bottom: -4, overflow: "hidden", background: storm ? "#397D73" : accent }}>
      <svg width="1280" height="280" viewBox="0 0 1280 280" style={{ position: "absolute", top: -34, left: 0 }}>
        <path
          d="M-80,81 C81,28 203,126 362,67 C508,13 672,103 820,51 C993,-8 1090,100 1368,35 L1368,292 L-80,292 Z"
          fill={storm ? "#4D9085" : "#4D978A"}
          transform={`translate(${driftOne} 0)`}
        />
        <path
          d="M-60,129 C96,75 228,160 385,107 C532,57 709,169 875,109 C1040,49 1152,145 1350,90 L1350,292 L-60,292 Z"
          fill={storm ? "#2C6F67" : "#327D70"}
          transform={`translate(${-driftTwo} 0)`}
        />
        {[0, 1, 2, 3].map((index) => (
          <path
            key={index}
            d={`M-80,${44 + index * 43} C92,${14 + index * 43} 224,${83 + index * 43} 384,${47 + index * 43} C558,${6 + index * 43} 696,${92 + index * 43} 864,${48 + index * 43} C1036,${4 + index * 43} 1139,${84 + index * 43} 1360,${30 + index * 43}`}
            fill="none"
            stroke={index === 1 ? "rgba(255,255,255,0.44)" : `${primary}26`}
            strokeWidth={index === 1 ? 4 : 2}
            strokeLinecap="round"
            transform={`translate(${(index % 2 === 0 ? driftOne : -driftTwo) * (0.45 + index * 0.12)} 0)`}
          />
        ))}
      </svg>
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 70, background: "linear-gradient(180deg, rgba(255,255,255,0.16), transparent)" }} />
    </div>
  );
};

const Reeds: React.FC<{ frame: number; primary: string }> = ({ frame, primary }) => (
  <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 210, overflow: "hidden", opacity: 0.4 }}>
    {Array.from({ length: 22 }, (_, index) => {
      const left = index < 12 ? -14 + index * 21 : 1015 + (index - 12) * 25;
      const height = 65 + ((index * 17) % 92);
      return (
        <div
          key={index}
          style={{
            position: "absolute",
            left,
            bottom: -12,
            width: 5,
            height,
            borderRadius: 99,
            background: primary,
            transformOrigin: "bottom center",
            transform: `rotate(${Math.sin(frame / 31 + index) * 7}deg)`
          }}
        />
      );
    })}
  </div>
);

const VaporField: React.FC<{ frame: number; accent: string; strength?: number }> = ({ frame, accent, strength = 1 }) => (
  <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
    {vaporSeeds.map((seed, index) => {
      const phase = ((frame - seed.delay) % 176 + 176) % 176 / 176;
      const opacity = Math.sin(phase * Math.PI) * 0.6 * strength;
      return (
        <div
          key={index}
          style={{
            position: "absolute",
            left: seed.x + Math.sin(phase * Math.PI * 2 + index) * seed.drift,
            top: 520 - phase * (282 + (index % 4) * 24),
            width: seed.size * (0.7 + phase * 0.75),
            height: seed.size * (0.5 + phase * 0.45),
            borderRadius: "50%",
            background: index % 3 === 0 ? "rgba(255,255,255,0.92)" : `${accent}66`,
            boxShadow: "0 0 22px rgba(255,255,255,0.34)",
            filter: "blur(1px)",
            opacity,
            transform: `rotate(${index * 13 + phase * 65}deg)`
          }}
        />
      );
    })}
  </div>
);

const VaporStreams: React.FC<{ frame: number; accent: string; strength?: number }> = ({ frame, accent, strength = 1 }) => (
  <svg width="1280" height="720" viewBox="0 0 1280 720" style={{ position: "absolute", inset: 0, overflow: "visible", opacity: strength }}>
    <defs>
      <linearGradient id="vapor-stream" x1="0" y1="1" x2="0" y2="0">
        <stop stopColor={accent} stopOpacity="0.08" />
        <stop offset="0.6" stopColor="rgba(255,255,255,0.88)" stopOpacity="0.76" />
        <stop offset="1" stopColor="rgba(255,255,255,0)" stopOpacity="0" />
      </linearGradient>
    </defs>
    {[
      "M250 508 C220 422 330 385 302 272 C281 191 366 160 385 98",
      "M510 514 C470 420 584 382 548 281 C518 199 609 159 632 88",
      "M766 514 C818 432 717 379 765 275 C802 196 726 154 748 84",
      "M1018 506 C1070 431 973 377 1012 269 C1041 191 958 150 980 95"
    ].map((path, index) => (
      <path
        key={path}
        d={path}
        fill="none"
        stroke="url(#vapor-stream)"
        strokeWidth={15 - index}
        strokeLinecap="round"
        strokeDasharray="16 29"
        strokeDashoffset={-(frame * (3.8 + index * 0.25) + index * 42)}
        opacity={0.48 + index * 0.08}
      />
    ))}
  </svg>
);

const Cloud: React.FC<{
  frame: number;
  left: number;
  top: number;
  scale?: number;
  color?: string;
  shadow?: string;
  opacity?: number;
}> = ({ frame, left, top, scale = 1, color = "#F9FBFA", shadow = "rgba(32,40,39,0.16)", opacity = 1 }) => {
  const cloudId = `cloud-${Math.abs(Math.round(left))}-${Math.abs(Math.round(top))}`;
  const drift = Math.sin(frame / 42 + left / 200) * 5;
  return (
    <svg
      width="520"
      height="270"
      viewBox="0 0 520 270"
      style={{
        position: "absolute",
        left,
        top,
        overflow: "visible",
        transform: `translateY(${drift}px) scale(${scale})`,
        transformOrigin: "center center",
        opacity,
        filter: `drop-shadow(0 22px 22px ${shadow})`
      }}
    >
      <defs>
        <linearGradient id={cloudId} x1="126" y1="38" x2="383" y2="223" gradientUnits="userSpaceOnUse">
          <stop stopColor="rgba(255,255,255,0.96)" />
          <stop offset="1" stopColor={color} />
        </linearGradient>
      </defs>
      <ellipse cx="260" cy="222" rx="172" ry="20" fill="rgba(32,40,39,0.10)" />
      <path
        d="M78 210 C43 210 20 189 20 157 C20 121 46 96 80 94 C88 57 121 33 160 33 C192 33 219 48 238 75 C255 49 286 36 321 39 C363 42 393 73 399 111 C436 111 467 136 467 171 C467 195 448 211 422 213 L78 213 Z"
        fill={`url(#${cloudId})`}
      />
      <path
        d="M92 181 C85 145 106 111 145 101 C184 90 220 106 239 133 C267 97 317 92 354 116 C377 131 390 152 391 176 C335 165 269 180 210 188 C157 196 118 193 92 181 Z"
        fill="rgba(255,255,255,0.18)"
      />
    </svg>
  );
};

const CondensingDroplets: React.FC<{ frame: number; accent: string }> = ({ frame, accent }) => {
  const gather = interpolate(frame, [12, 142], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <>
      {Array.from({ length: 28 }, (_, index) => {
        const angle = (index / 28) * Math.PI * 2;
        const startRadius = 270 + (index % 5) * 24;
        const radius = startRadius * (1 - gather * 0.82);
        const size = 10 + (index % 4) * 4;
        return (
          <div
            key={index}
            style={{
              position: "absolute",
              left: 640 + Math.cos(angle) * radius,
              top: 290 + Math.sin(angle) * radius * 0.56 - gather * 20,
              width: size,
              height: size,
              borderRadius: "50%",
              background: index % 3 === 0 ? "#FFFFFF" : accent,
              boxShadow: "0 4px 13px rgba(45,118,104,0.22)",
              opacity: 0.18 + (1 - gather) * 0.6,
              transform: `scale(${0.8 + gather * 0.2})`
            }}
          />
        );
      })}
    </>
  );
};

const RainField: React.FC<{ frame: number; visibility: number }> = ({ frame, visibility }) => (
  <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none", opacity: visibility }}>
    {rainSeeds.map((seed, index) => {
      const phase = ((frame * seed.speed - seed.delay) % 158 + 158) % 158 / 158;
      return (
        <div
          key={index}
          style={{
            position: "absolute",
            left: seed.x - phase * 34,
            top: 224 + phase * 420,
            width: 2,
            height: seed.length,
            borderRadius: 99,
            background: "linear-gradient(180deg, rgba(255,255,255,0), rgba(255,255,255,0.92))",
            opacity: seed.opacity * Math.sin(Math.min(phase, 0.96) * Math.PI),
            transform: "rotate(8deg)"
          }}
        />
      );
    })}
  </div>
);

const RippleField: React.FC<{ frame: number; visibility: number }> = ({ frame, visibility }) => (
  <div style={{ position: "absolute", inset: 0, pointerEvents: "none", opacity: visibility }}>
    {rippleSeeds.map((seed, index) => {
      const phase = ((frame * 1.25 - seed.delay) % 96 + 96) % 96 / 96;
      return (
        <div
          key={index}
          style={{
            position: "absolute",
            left: seed.x,
            top: seed.y,
            width: seed.size,
            height: seed.size * 0.28,
            border: "2px solid rgba(255,255,255,0.58)",
            borderRadius: "50%",
            opacity: Math.sin(phase * Math.PI) * 0.74,
            transform: `scale(${0.35 + phase * 2.1})`,
            transformOrigin: "center center"
          }}
        />
      );
    })}
  </div>
);

const SunlitWater: React.FC<{ frame: number; primary: string; accent: string }> = ({ frame, primary, accent }) => {
  const { fps } = useVideoConfig();
  const entrance = spring({ frame: Math.max(0, frame - 4), fps, config: { damping: 28, stiffness: 46, mass: 1 } });
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", opacity: entrance }}>
      <AtmosphericBackdrop atmosphere="warm" frame={frame} accent={accent} />
      <div style={{ position: "absolute", inset: 0, transform: `translate(${Math.sin(frame / 85) * 7}px, ${Math.cos(frame / 98) * 3}px)` }}>
        <Sun frame={frame} left={882} top={65} size={212} />
        {[0, 1, 2].map((index) => (
          <div
            key={index}
            style={{
              position: "absolute",
              left: 667 + index * 89,
              top: 204,
              width: 330,
              height: 31,
              borderRadius: 99,
              background: "rgba(246, 200, 95, 0.22)",
              filter: "blur(5px)",
              opacity: 0.76 + Math.sin(frame / 42) * 0.12 - index * 0.13,
              transform: `rotate(-27deg) translateX(${Math.sin(frame / 28 + index) * 13}px)`
            }}
          />
        ))}
        <Hills frame={frame} primary={primary} accent={accent} />
        <WaterSurface frame={frame} primary={primary} accent={accent} />
        <Reeds frame={frame} primary={primary} />
      </div>
    </div>
  );
};

const Evaporation: React.FC<{ frame: number; primary: string; accent: string }> = ({ frame, primary, accent }) => {
  const { fps } = useVideoConfig();
  const entrance = spring({ frame: Math.max(0, frame - 6), fps, config: { damping: 26, stiffness: 48, mass: 1 } });
  const cameraLift = interpolate(frame, [0, 210], [0, -27], { extrapolateRight: "clamp" });
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", opacity: entrance }}>
      <AtmosphericBackdrop atmosphere="rising" frame={frame} accent={accent} />
      <div style={{ position: "absolute", inset: 0, transform: `translateY(${cameraLift}px) scale(1.045)`, transformOrigin: "center bottom" }}>
        <Sun frame={frame} left={928} top={45} size={176} opacity={0.93} />
        <Hills frame={frame} primary={primary} accent={accent} />
        <WaterSurface frame={frame} primary={primary} accent={accent} top={481} />
        <VaporStreams frame={frame} accent={accent} strength={0.9} />
        <VaporField frame={frame} accent={accent} strength={1} />
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 235, background: "linear-gradient(180deg, transparent, rgba(246,200,95,0.15))", mixBlendMode: "screen" }} />
    </div>
  );
};

const Condensation: React.FC<{ frame: number; primary: string; accent: string }> = ({ frame, primary, accent }) => {
  const { fps } = useVideoConfig();
  const cloudIn = spring({ frame: Math.max(0, frame - 42), fps, config: { damping: 22, stiffness: 42, mass: 1.2 } });
  const cameraScale = interpolate(frame, [0, 210], [1.025, 1.065], { extrapolateRight: "clamp" });
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
      <AtmosphericBackdrop atmosphere="cool" frame={frame} accent={accent} />
      <Sun frame={frame} left={932} top={67} size={148} opacity={0.24} />
      <Hills frame={frame} primary={primary} accent={accent} />
      <WaterSurface frame={frame} primary={primary} accent={accent} top={500} />
      <div style={{ position: "absolute", inset: 0, transform: `translateY(${Math.sin(frame / 80) * 4}px) scale(${cameraScale})`, transformOrigin: "center center" }}>
        <CondensingDroplets frame={frame} accent={accent} />
        <Cloud frame={frame} left={-56} top={90} scale={0.62} color="#C8DED6" shadow="rgba(45,118,104,0.10)" opacity={0.6} />
        <Cloud frame={frame} left={344} top={82} scale={1.03 * cloudIn} color="#EAF4F0" shadow="rgba(32,40,39,0.19)" opacity={cloudIn} />
        <Cloud frame={frame} left={890} top={166} scale={0.52} color="#C6DED6" shadow="rgba(45,118,104,0.10)" opacity={0.62} />
      </div>
    </div>
  );
};

const Rainfall: React.FC<{ frame: number; primary: string; accent: string }> = ({ frame, primary, accent }) => {
  const rainIn = interpolate(frame, [40, 82], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const sunReturn = interpolate(frame, [142, 205], [0, 0.3], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const cloudIn = interpolate(frame, [0, 40], [0.85, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const cameraScale = interpolate(frame, [0, 210], [1.07, 1], { extrapolateRight: "clamp" });
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
      <AtmosphericBackdrop atmosphere="rain" frame={frame} accent={accent} />
      <div style={{ position: "absolute", inset: 0, transform: `scale(${cameraScale})`, transformOrigin: "center center" }}>
        <Sun frame={frame} left={922} top={71} size={154} opacity={sunReturn} />
        <Hills frame={frame} primary={primary} accent={accent} storm />
        <WaterSurface frame={frame} primary={primary} accent={accent} top={470} storm />
        <Cloud frame={frame} left={350} top={48} scale={1.27 * cloudIn} color="#6F928A" shadow="rgba(22,48,45,0.30)" />
        <Cloud frame={frame} left={-88} top={188} scale={0.5} color="#9FBAB2" shadow="rgba(32,40,39,0.10)" opacity={0.58} />
        <Cloud frame={frame} left={915} top={176} scale={0.56} color="#9FBAB2" shadow="rgba(32,40,39,0.10)" opacity={0.58} />
        <RainField frame={frame} visibility={rainIn} />
        <RippleField frame={frame} visibility={rainIn} />
        <VaporField frame={frame + 76} accent={accent} strength={sunReturn * 0.48} />
      </div>
    </div>
  );
};

export const RainStoryIllustration: React.FC<RainStoryIllustrationProps> = ({ sceneId, primary, accent, frame }) => {
  if (sceneId === "evaporation") return <Evaporation frame={frame} primary={primary} accent={accent} />;
  if (sceneId === "condensation") return <Condensation frame={frame} primary={primary} accent={accent} />;
  if (sceneId === "rainfall-cycle") return <Rainfall frame={frame} primary={primary} accent={accent} />;
  return <SunlitWater frame={frame} primary={primary} accent={accent} />;
};
