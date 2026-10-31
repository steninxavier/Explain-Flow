import React from "react";
import { interpolate, spring, useVideoConfig } from "remotion";

type EditorialStoryIllustrationProps = {
  sceneId: string;
  primary: string;
  accent: string;
  frame: number;
};

const labelStyle: React.CSSProperties = {
  fontSize: 16,
  fontWeight: 800,
  letterSpacing: 1.2,
  textTransform: "uppercase"
};

const Card: React.FC<{
  children: React.ReactNode;
  left: number;
  top: number;
  width: number;
  height: number;
  background: string;
  border: string;
  transform?: string;
  opacity?: number;
}> = ({ children, left, top, width, height, background, border, transform, opacity = 1 }) => (
  <div
    style={{
      position: "absolute",
      left,
      top,
      width,
      height,
      boxSizing: "border-box",
      borderRadius: 24,
      background,
      border,
      boxShadow: "0 18px 32px rgba(31, 38, 39, 0.08)",
      transform,
      opacity
    }}
  >
    {children}
  </div>
);

const FileTile: React.FC<{
  title: string;
  left: number;
  top: number;
  primary: string;
  accent: string;
  transform?: string;
  opacity?: number;
}> = ({ title, left, top, primary, accent, transform, opacity = 1 }) => (
  <div
    style={{
      position: "absolute",
      left,
      top,
      width: 112,
      height: 62,
      borderRadius: 14,
      background: "#FFFFFF",
      border: `1.5px solid ${primary}33`,
      boxShadow: "0 10px 18px rgba(31, 38, 39, 0.09)",
      transform,
      opacity,
      display: "flex",
      alignItems: "center",
      gap: 10,
      padding: "0 14px",
      boxSizing: "border-box"
    }}
  >
    <div style={{ width: 18, height: 18, borderRadius: 5, background: accent, flexShrink: 0 }} />
    <span style={{ color: primary, fontSize: 16, fontWeight: 800, whiteSpace: "nowrap" }}>{title}</span>
  </div>
);

export const EditorialStoryIllustration: React.FC<EditorialStoryIllustrationProps> = ({ sceneId, primary, accent, frame }) => {
  const { fps } = useVideoConfig();
  const enter = (delay: number) => spring({ frame: Math.max(0, frame - delay), fps, config: { damping: 22, stiffness: 62, mass: 0.9 } });
  const ramIn = enter(8);
  const ssdIn = enter(22);
  const actionIn = enter(38);
  const ease = (from: number, to: number, start: number, end: number) => interpolate(frame, [start, end], [from, to], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const cream = "#F6F1E9";
  const mint = "#DDF3EC";
  const ink = primary;
  const green = accent;

  if (sceneId === "ram-workspace") {
    return (
      <div style={{ width: 500, height: 360, position: "relative" }}>
        <Card left={28} top={45} width={205} height={260} background="#FFFFFF" border={`2px solid ${ink}99`} transform={`translateY(${(1 - ramIn) * 30}px)`} opacity={ramIn}>
          <div style={{ padding: 25, color: ink }}>
            <div style={{ ...labelStyle, opacity: 0.56 }}>Open now</div>
            <div style={{ marginTop: 25, width: 32, height: 32, borderRadius: 8, background: ink, display: "grid", placeItems: "center", color: "#FFFFFF", fontWeight: 900 }}>▦</div>
            <div style={{ marginTop: 15, fontSize: 29, fontWeight: 850, letterSpacing: -1 }}>RAM</div>
            <div style={{ marginTop: 10, fontSize: 17, lineHeight: 1.3, fontWeight: 600 }}>Open apps<br />Working memory</div>
          </div>
        </Card>
        <Card left={267} top={45} width={205} height={260} background={mint} border={`2px solid ${green}`} transform={`translateY(${(1 - ssdIn) * 30}px)`} opacity={ssdIn}>
          <div style={{ padding: 25, color: ink }}>
            <div style={{ ...labelStyle, opacity: 0.56 }}>Save for later</div>
            <div style={{ marginTop: 25, width: 32, height: 32, borderRadius: 8, background: "#FFFFFF", border: `1px solid ${green}`, display: "grid", placeItems: "center", color: ink, fontWeight: 900 }}>▤</div>
            <div style={{ marginTop: 15, fontSize: 29, fontWeight: 850, letterSpacing: -1 }}>SSD</div>
            <div style={{ marginTop: 10, fontSize: 17, lineHeight: 1.3, fontWeight: 600 }}>Saved files<br />Long-term storage</div>
          </div>
        </Card>
        <div style={{ position: "absolute", left: 30, bottom: 18, color: ink, fontSize: 18, fontWeight: 750, opacity: actionIn }}>Different jobs. One computer.</div>
      </div>
    );
  }

  if (sceneId === "ram-fast-access") {
    const documentX = ease(76, 225, 44, 132);
    const documentY = ease(142, 133, 44, 132);
    const connection = ease(0, 1, 25, 78);
    return (
      <div style={{ width: 500, height: 360, position: "relative" }}>
        <Card left={24} top={128} width={104} height={104} background="#FFFFFF" border={`2px solid ${ink}`} transform={`scale(${0.86 + actionIn * 0.14})`} opacity={actionIn}>
          <div style={{ display: "grid", placeItems: "center", height: "100%", color: ink }}>
            <span style={{ fontSize: 18, fontWeight: 900, letterSpacing: 1.2 }}>CPU</span>
          </div>
        </Card>
        <div style={{ position: "absolute", left: 126, top: 178, width: 122 * connection, height: 2, background: green, transformOrigin: "left center" }} />
        <Card left={220} top={50} width={244} height={264} background="#FFFFFF" border={`2px solid ${ink}`} transform={`translateY(${(1 - ramIn) * 26}px)`} opacity={ramIn}>
          <div style={{ padding: 23, color: ink }}>
            <div style={{ ...labelStyle, color: green }}>RAM workspace</div>
            <div style={{ marginTop: 23, height: 102, borderRadius: 17, background: cream, padding: 16, boxSizing: "border-box" }}>
              <div style={{ width: 72, height: 9, borderRadius: 99, background: `${ink}33` }} />
              <div style={{ marginTop: 12, width: 130, height: 9, borderRadius: 99, background: `${ink}1f` }} />
              <div style={{ marginTop: 12, width: 96, height: 9, borderRadius: 99, background: `${ink}1f` }} />
            </div>
            <div style={{ marginTop: 22, fontSize: 19, fontWeight: 750 }}>Active files stay close.</div>
          </div>
        </Card>
        <FileTile title="Lesson" left={documentX} top={documentY} primary={ink} accent={green} transform={`scale(${0.86 + actionIn * 0.14})`} opacity={actionIn} />
        {Array.from({ length: 3 }).map((_, index) => {
          const pulse = ((frame + index * 32) % 112) / 112;
          return <div key={index} style={{ position: "absolute", left: 145 + pulse * 64, top: 175 + index * 24, width: 9, height: 9, borderRadius: "50%", background: green, opacity: (1 - pulse) * 0.7 }} />;
        })}
      </div>
    );
  }

  if (sceneId === "ssd-storage") {
    const fileProgress = ease(0, 1, 28, 132);
    const powerOff = ease(0, 1, 142, 178);
    return (
      <div style={{ width: 500, height: 360, position: "relative" }}>
        <Card left={78} top={45} width={344} height={265} background={mint} border={`2px solid ${green}`} transform={`translateY(${(1 - ssdIn) * 28}px)`} opacity={ssdIn}>
          <div style={{ padding: 27, color: ink }}>
            <div style={{ ...labelStyle, color: green }}>SSD storage</div>
            <div style={{ marginTop: 25, height: 94, borderRadius: 16, background: "rgba(255,255,255,.82)", border: `1px solid ${green}55`, padding: 17, boxSizing: "border-box" }}>
              <div style={{ width: 90, height: 10, borderRadius: 99, background: `${ink}42` }} />
              <div style={{ marginTop: 13, width: 196, height: 10, borderRadius: 99, background: `${ink}20` }} />
              <div style={{ marginTop: 13, width: 140, height: 10, borderRadius: 99, background: `${ink}20` }} />
            </div>
            <div style={{ marginTop: 26, display: "flex", alignItems: "center", gap: 11, fontSize: 19, fontWeight: 800 }}>
              <div style={{ width: 20, height: 20, borderRadius: "50%", color: "#FFFFFF", background: green, display: "grid", placeItems: "center", fontSize: 13, transform: `scale(${0.75 + powerOff * 0.25})` }}>✓</div>
              Saved after shutdown
            </div>
          </div>
        </Card>
        <FileTile title="Lesson" left={20 + fileProgress * 175} top={141} primary={ink} accent={green} transform={`scale(${1 - fileProgress * 0.16})`} opacity={1 - fileProgress * 0.1} />
        <div style={{ position: "absolute", right: 42, top: 25, color: ink, fontSize: 27, fontWeight: 800, opacity: powerOff }}>⏻</div>
      </div>
    );
  }

  const documentX = ease(82, 292, 120, 238);
  return (
    <div style={{ width: 500, height: 360, position: "relative" }}>
      <Card left={24} top={56} width={205} height={236} background="#FFFFFF" border={`2px solid ${ink}99`} transform={`translateY(${(1 - ramIn) * 26}px)`} opacity={ramIn}>
        <div style={{ padding: 24, color: ink }}>
          <div style={{ ...labelStyle, opacity: 0.58 }}>Now</div>
          <div style={{ marginTop: 24, fontSize: 24, fontWeight: 850, letterSpacing: -0.8, whiteSpace: "nowrap" }}>Desk / RAM</div>
          <div style={{ marginTop: 18, width: 132, height: 72, borderRadius: 14, background: cream, border: `1px solid ${ink}1d` }} />
          <div style={{ marginTop: 10, fontSize: 17, fontWeight: 700 }}>Open task</div>
        </div>
      </Card>
      <Card left={271} top={56} width={205} height={236} background={mint} border={`2px solid ${green}`} transform={`translateY(${(1 - ssdIn) * 26}px)`} opacity={ssdIn}>
        <div style={{ padding: 24, color: ink }}>
          <div style={{ ...labelStyle, opacity: 0.58 }}>Later</div>
          <div style={{ marginTop: 24, fontSize: 24, fontWeight: 850, letterSpacing: -0.8, whiteSpace: "nowrap" }}>SSD storage</div>
          {[0, 1, 2].map((index) => <div key={index} style={{ marginTop: index === 0 ? 20 : 11, width: 132 - index * 19, height: 10, borderRadius: 99, background: `${ink}25` }} />)}
          <div style={{ marginTop: 10, fontSize: 17, fontWeight: 700 }}>Saved files</div>
        </div>
      </Card>
      <div style={{ position: "absolute", left: 230, top: 170, width: 42, height: 2, background: green, opacity: actionIn }} />
      <div style={{ position: "absolute", left: 260, top: 164, width: 12, height: 12, borderRight: `2px solid ${green}`, borderTop: `2px solid ${green}`, transform: "rotate(45deg)", opacity: actionIn }} />
      <FileTile title="Lesson" left={documentX} top={180} primary={ink} accent={green} opacity={actionIn} />
    </div>
  );
};
