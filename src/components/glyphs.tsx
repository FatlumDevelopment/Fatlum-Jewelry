import type { FinishPreview, GlyphKind, GrooveCode, MetalTone } from "@/lib/types";

export const TONE: Record<MetalTone, { light: string; mid: string; dark: string }> = {
  yellow: { light: "#F6E2A8", mid: "#E0B84A", dark: "#8C6A28" },
  white: { light: "#F7F5F1", mid: "#E4E1DB", dark: "#8E8C88" },
  rose: { light: "#F8D5C8", mid: "#E0A08E", dark: "#8E5648" },
  red: { light: "#F0C2B4", mid: "#C45A4A", dark: "#7A3028" },
  platinum: { light: "#F4F4F6", mid: "#D8D8DE", dark: "#7E8088" },
  silver: { light: "#F2F3F5", mid: "#C8C9CE", dark: "#6E7078" },
  palladium: { light: "#E4E5E8", mid: "#B0B2B6", dark: "#5C5E64" },
};

export function toneOf(hex: string): { light: string; mid: string; dark: string } {
  return { light: mix(hex, "#ffffff", 0.45), mid: hex, dark: mix(hex, "#1a140c", 0.45) };
}

function mix(hex: string, other: string, t: number) {
  const a = rgb(hex);
  const b = rgb(other);
  const c = a.map((v, i) => Math.round(v + (b[i]! - v) * t));
  return `#${c.map((v) => v.toString(16).padStart(2, "0")).join("")}`;
}
function rgb(hex: string) {
  const h = hex.replace("#", "");
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}

function MetalDefs({ uid, tone }: { uid: string; tone: MetalTone }) {
  const c = TONE[tone];
  return (
    <defs>
      <linearGradient id={`${uid}-m`} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor={c.light} />
        <stop offset="0.45" stopColor={c.mid} />
        <stop offset="1" stopColor={c.dark} />
      </linearGradient>
      <radialGradient id={`${uid}-s`} cx="35%" cy="30%" r="70%">
        <stop offset="0" stopColor="#fff" stopOpacity="0.7" />
        <stop offset="0.4" stopColor={c.light} stopOpacity="0.2" />
        <stop offset="1" stopColor={c.dark} stopOpacity="0.5" />
      </radialGradient>
    </defs>
  );
}

export function ProductGlyph({ uid, kind, tone, title }: { uid: string; kind: GlyphKind; tone: MetalTone; title: string }) {
  const fill = `url(#${uid}-m)`;
  return (
    <svg viewBox="0 0 320 240" role="img" aria-label={title} className="h-full w-full">
      <rect width="320" height="240" fill="#f6f3ee" />
      <ellipse cx="160" cy="196" rx="78" ry="12" fill="#1a1814" opacity="0.06" />
      <MetalDefs uid={uid} tone={tone} />
      {kind === "band" && <Band uid={uid} fill={fill} />}
      {kind === "solitaire" && <Solitaire uid={uid} fill={fill} />}
      {kind === "pave" && <Pave uid={uid} fill={fill} />}
      {kind === "signet" && <Signet uid={uid} fill={fill} />}
      {kind === "stack" && <Stack uid={uid} fill={fill} />}
      {kind === "chain" && <Chain fill={fill} />}
      {kind === "hoop" && <Hoops fill={fill} />}
      {kind === "stud" && <Studs uid={uid} fill={fill} />}
      {kind === "drop" && <Drop fill={fill} />}
      {kind === "locket" && <Locket uid={uid} fill={fill} />}
    </svg>
  );
}

function Band({ fill }: { uid: string; fill: string }) {
  return (
    <g>
      <ellipse cx="160" cy="124" rx="78" ry="36" fill="none" stroke={fill} strokeWidth="22" />
      <ellipse cx="160" cy="124" rx="78" ry="36" fill="none" stroke="white" strokeOpacity="0.35" strokeWidth="4" />
    </g>
  );
}
function Solitaire({ uid, fill }: { uid: string; fill: string }) {
  return (
    <g>
      <ellipse cx="160" cy="132" rx="74" ry="32" fill="none" stroke={fill} strokeWidth="14" />
      <polygon points="160,58 176,86 160,108 144,86" fill={`url(#${uid}-s)`} stroke="#1a1814" strokeOpacity="0.35" />
      <path d="M144 86 H176 M160 58 V108" stroke="#1a1814" strokeOpacity="0.25" />
    </g>
  );
}
function Pave({ uid, fill }: { uid: string; fill: string }) {
  const dots = [-40, -24, -8, 8, 24, 40];
  return (
    <g>
      <ellipse cx="160" cy="128" rx="78" ry="34" fill="none" stroke={fill} strokeWidth="16" />
      {dots.map((dx) => (
        <circle key={dx} cx={160 + dx} cy={100 + Math.abs(dx) * 0.18} r="4.2" fill="#f6f3ee" stroke={fill} strokeWidth="1.4" />
      ))}
    </g>
  );
}
function Signet({ fill }: { uid: string; fill: string }) {
  return (
    <g>
      <path d="M118 150c0-28 18-40 42-40s42 12 42 40v18H118z" fill={fill} />
      <ellipse cx="160" cy="118" rx="36" ry="26" fill={fill} stroke="#1a1814" strokeOpacity="0.2" />
      <ellipse cx="160" cy="118" rx="22" ry="14" fill="none" stroke="white" strokeOpacity="0.45" />
    </g>
  );
}
function Stack({ fill }: { uid: string; fill: string }) {
  return (
    <g>
      {[0, 16, 32].map((dy) => (
        <ellipse key={dy} cx={150 + dy * 0.3} cy={108 + dy} rx="70" ry="22" fill="none" stroke={fill} strokeWidth="8" />
      ))}
    </g>
  );
}
function Chain({ fill }: { fill: string }) {
  return (
    <g fill="none" stroke={fill} strokeWidth="7">
      {[-70, -35, 0, 35, 70].map((dx, i) => (
        <ellipse key={dx} cx={160 + dx} cy={120 + (i % 2 === 0 ? 0 : 8)} rx="16" ry="24" transform={`rotate(${i % 2 ? 18 : -18} ${160 + dx} ${120})`} />
      ))}
    </g>
  );
}
function Hoops({ fill }: { fill: string }) {
  return (
    <g fill="none" stroke={fill} strokeWidth="8">
      <circle cx="118" cy="124" r="36" />
      <circle cx="202" cy="124" r="36" />
      <path d="M118 88 v-16 M202 88 v-16" strokeWidth="4" />
    </g>
  );
}
function Studs({ uid, fill }: { uid: string; fill: string }) {
  return (
    <g>
      <circle cx="118" cy="120" r="18" fill={fill} />
      <circle cx="202" cy="120" r="18" fill={fill} />
      <circle cx="118" cy="120" r="7" fill={`url(#${uid}-s)`} />
      <circle cx="202" cy="120" r="7" fill={`url(#${uid}-s)`} />
    </g>
  );
}
function Drop({ fill }: { fill: string }) {
  return (
    <g>
      <path d="M160 70 v28" stroke={fill} strokeWidth="4" />
      <circle cx="160" cy="66" r="5" fill={fill} />
      <path d="M160 102c28 18 28 48 0 70c-28-22-28-52 0-70z" fill={fill} />
      <path d="M160 120c10 8 12 20 0 34" fill="none" stroke="white" strokeOpacity="0.4" />
    </g>
  );
}
function Locket({ uid, fill }: { uid: string; fill: string }) {
  return (
    <g>
      <path d="M160 62 v16" stroke={fill} strokeWidth="4" />
      <circle cx="160" cy="128" r="48" fill={fill} />
      <circle cx="160" cy="128" r="34" fill="none" stroke="white" strokeOpacity="0.4" />
      <path d="M160 104 v48" stroke="#1a1814" strokeOpacity="0.15" />
    </g>
  );
}

export function ProfileMark({ path, active }: { path: string; active?: boolean }) {
  return (
    <svg viewBox="0 0 100 64" className="h-14 w-full" aria-hidden>
      <path d={path} fill={active ? "#8a7049" : "#1a1814"} fillRule="evenodd" />
    </svg>
  );
}

export type PreviewRing = {
  hex: string;
  width_mm: number;
  height_mm: number;
  finish: FinishPreview;
  profile: string;
  stoneCode: "none" | "solitaire" | "channel" | "pave";
  stoneCount: number;
  stoneSize: number;
  groove: GrooveCode;
  engraving: string;
  fontFamily: string;
  fontVariant: "serif" | "script" | "sans" | "caps";
};

export function RingSketch({
  uid,
  rings,
  pair,
  label,
}: {
  uid: string;
  rings: PreviewRing[];
  pair: boolean;
  label: string;
}) {
  const list = (pair ? rings.slice(0, 2) : rings.slice(0, 1)).filter(Boolean);
  return (
    <svg viewBox="0 0 640 440" role="img" aria-label={label} className="h-auto w-full">
      <rect width="640" height="440" rx="28" fill="#f6f3ee" />
      <ellipse cx="320" cy="360" rx="180" ry="22" fill="#1a1814" opacity="0.05" />
      {list.map((ring, index) => (
        <RingLayer key={index} uid={`${uid}-${index}`} ring={ring} index={index} count={list.length} />
      ))}
    </svg>
  );
}

function RingLayer({ uid, ring, index, count }: { uid: string; ring: PreviewRing; index: number; count: number }) {
  const c = toneOf(ring.hex);
  const cx = 320 + (count === 2 ? (index === 0 ? -28 : 34) : 0);
  const cy = 210 + (count === 2 ? (index === 0 ? 16 : -10) : 0);
  const rx = 138;
  const ry = 54 + Math.min(10, ring.height_mm * 2);
  const sw = 12 + ring.width_mm * 3.2;
  const polish = ring.finish === "polish";
  const matte = ring.finish === "matte" || ring.finish === "sand" || ring.finish === "ice";
  return (
    <g>
      <defs>
        <linearGradient id={`${uid}-g`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={polish ? c.light : mix(c.light, c.mid, 0.35)} />
          <stop offset="0.5" stopColor={c.mid} />
          <stop offset="1" stopColor={c.dark} />
        </linearGradient>
        <pattern id={`${uid}-p`} width="10" height="10" patternUnits="userSpaceOnUse">
          {ring.finish === "brush" && <path d="M0 5 H10" stroke="white" strokeOpacity="0.35" />}
          {ring.finish === "hammer" && (
            <>
              <circle cx="3" cy="3" r="1.6" fill="white" opacity="0.35" />
              <circle cx="8" cy="7" r="1.3" fill="#1a1814" opacity="0.18" />
            </>
          )}
          {ring.finish === "ice" && (
            <>
              <circle cx="2" cy="2" r="0.7" fill="white" />
              <circle cx="7" cy="6" r="0.6" fill="white" opacity="0.7" />
            </>
          )}
          {ring.finish === "sand" && (
            <>
              <circle cx="2" cy="3" r="0.5" fill="#1a1814" opacity="0.25" />
              <circle cx="6" cy="7" r="0.45" fill="#1a1814" opacity="0.2" />
              <circle cx="8" cy="2" r="0.4" fill="white" opacity="0.4" />
            </>
          )}
        </pattern>
        <path id={`${uid}-eng`} d={`M ${cx - rx + sw * 0.55} ${cy} A ${rx - sw * 0.55} ${ry - sw * 0.28} 0 0 1 ${cx + rx - sw * 0.55} ${cy}`} fill="none" />
      </defs>
      <ellipse cx={cx} cy={cy + 8} rx={rx} ry={ry} fill="none" stroke={c.dark} strokeOpacity="0.18" strokeWidth={sw} />
      <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="none" stroke={`url(#${uid}-g)`} strokeWidth={sw} />
      {(ring.finish === "brush" || ring.finish === "hammer" || ring.finish === "ice" || ring.finish === "sand") && (
        <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="none" stroke={`url(#${uid}-p)`} strokeWidth={sw - 4} />
      )}
      {polish && <ellipse cx={cx} cy={cy - 6} rx={rx - 2} ry={ry - 4} fill="none" stroke="white" strokeOpacity="0.38" strokeWidth="3" />}
      {matte && <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="none" stroke={c.dark} strokeOpacity="0.12" strokeWidth={sw} />}
      {(ring.groove !== "none" || ring.profile === "konkav") && (
        <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="none" stroke={c.dark} strokeOpacity="0.45" strokeWidth={ring.groove === "u" ? 3.5 : 1.6} />
      )}
      <Stones cx={cx} cy={cy} rx={rx} ry={ry - sw * 0.15} ring={ring} />
      {ring.engraving && (
        <text fill={c.dark} fontSize={ring.fontVariant === "script" ? 18 : 13} fontFamily={ring.fontFamily} letterSpacing={ring.fontVariant === "caps" ? 2 : 0.4}>
          <textPath href={`#${uid}-eng`} startOffset="50%" textAnchor="middle">
            {ring.fontVariant === "caps" ? ring.engraving.toUpperCase() : ring.engraving}
          </textPath>
        </text>
      )}
    </g>
  );
}

function Stones({ cx, cy, rx, ry, ring }: { cx: number; cy: number; rx: number; ry: number; ring: PreviewRing }) {
  if (ring.stoneCode === "none") return null;
  const count = ring.stoneCode === "solitaire" ? 1 : Math.min(ring.stoneCount, 16);
  const stones = Array.from({ length: count }, (_, i) => {
    const t = count === 1 ? 0.5 : i / (count - 1);
    const theta = Math.PI + t * Math.PI;
    const x = cx + Math.cos(theta) * (rx - 4);
    const y = cy + Math.sin(theta) * (ry - 2);
    return { x, y };
  });
  const r = ring.stoneCode === "solitaire" ? 7 + ring.stoneSize : ring.stoneCode === "channel" ? 3.4 : 2.6;
  return (
    <g>
      {stones.map((stone, i) =>
        ring.stoneCode === "channel" ? (
          <rect key={i} x={stone.x - r} y={stone.y - r * 0.7} width={r * 2} height={r * 1.4} rx="0.6" fill="#f6f3ee" stroke="#1a1814" strokeOpacity="0.35" />
        ) : (
          <g key={i}>
            <circle cx={stone.x} cy={stone.y} r={r} fill="#fbfaf6" stroke="#1a1814" strokeOpacity="0.35" />
            <path d={`M ${stone.x - r} ${stone.y} H ${stone.x + r} M ${stone.x} ${stone.y - r} V ${stone.y + r}`} stroke="#8a7049" strokeOpacity="0.7" />
          </g>
        ),
      )}
    </g>
  );
}

export function SectionSketch({ path, hex, width, height, groove }: { path: string; hex: string; width: number; height: number; groove: GrooveCode }) {
  const sx = Math.min(1.15, 0.62 + width / 14);
  const sy = Math.min(1.25, 0.62 + height / 3.4);
  return (
    <svg viewBox="0 0 100 64" className="h-16 w-24" aria-hidden>
      <rect width="100" height="64" rx="8" fill="#fff" />
      <g transform={`translate(50 32) scale(${sx} ${sy}) translate(-50 -32)`}>
        <path d={path} fill={hex} fillRule="evenodd" stroke="#1a1814" strokeOpacity="0.25" />
        {groove === "u" && <rect x="42" y="16" width="16" height="8" rx="4" fill="#1a1814" opacity="0.35" />}
        {groove === "v" && <path d="M46 16 L50 26 L54 16 Z" fill="#1a1814" opacity="0.4" />}
      </g>
    </svg>
  );
}
