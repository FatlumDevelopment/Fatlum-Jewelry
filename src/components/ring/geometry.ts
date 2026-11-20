import * as THREE from "three";

const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

function pushFace(out: number[], a: THREE.Vector3, b: THREE.Vector3, c: THREE.Vector3) {
  out.push(a.x, a.y, a.z, b.x, b.y, b.z, c.x, c.y, c.z);
}

function fan(out: number[], center: THREE.Vector3, ring: THREE.Vector3[], flip = false) {
  for (let i = 0; i < ring.length; i++) {
    const n = ring[(i + 1) % ring.length]!;
    const p = ring[i]!;
    if (flip) pushFace(out, center, n, p);
    else pushFace(out, center, p, n);
  }
}

function bridge(out: number[], top: THREE.Vector3[], bottom: THREE.Vector3[], flip = false) {
  const n = top.length;
  for (let i = 0; i < n; i++) {
    const a = top[i]!;
    const b = top[(i + 1) % n]!;
    const c = bottom[i]!;
    const d = bottom[(i + 1) % n]!;
    if (flip) {
      pushFace(out, a, c, b);
      pushFace(out, b, c, d);
    } else {
      pushFace(out, a, b, c);
      pushFace(out, b, d, c);
    }
  }
}

function ringOf(count: number, radius: number, y: number, offset = 0) {
  return Array.from({ length: count }, (_, i) => {
    const a = offset + (i / count) * Math.PI * 2;
    return V(Math.cos(a) * radius, y, Math.sin(a) * radius);
  });
}

function solid(positions: number[]) {
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geo.computeVertexNormals();
  geo.computeBoundingSphere();
  return geo;
}

/** Keep each triangle facing outward so flat shading reads as a facet. */
function pushOut(out: number[], a: THREE.Vector3, b: THREE.Vector3, c: THREE.Vector3) {
  const n = b.clone().sub(a).cross(c.clone().sub(a));
  const mid = a.clone().add(b).add(c);
  if (n.dot(mid) < 0) pushFace(out, a, c, b);
  else pushFace(out, a, b, c);
}

/**
 * Round brilliant, girdle diameter 1, table up.
 * Crown: table, 8 stars, 8 bezels. Pavilion: 16 lower facets to a culet.
 */
export function roundBrilliant() {
  const R = 0.5;
  const tableR = R * 0.54;
  const crownY = 0.168;
  const breakY = 0.078;
  const breakR = R * 0.86;
  const gTop = 0.014;
  const gBot = -0.016;
  const pavBreakY = -0.22;
  const pavBreakR = R * 0.34;
  const culetY = -0.43;
  const N = 8;
  const out: number[] = [];
  const table: THREE.Vector3[] = [];
  const stars: THREE.Vector3[] = [];
  const upper: THREE.Vector3[] = [];
  const lower: THREE.Vector3[] = [];
  const pav: THREE.Vector3[] = [];
  for (let i = 0; i < N; i++) {
    const a = (i / N) * Math.PI * 2;
    const mid = a + Math.PI / N;
    table.push(V(Math.cos(mid) * tableR, crownY, Math.sin(mid) * tableR));
    stars.push(V(Math.cos(a) * breakR, breakY, Math.sin(a) * breakR));
    pav.push(V(Math.cos(a) * pavBreakR, pavBreakY, Math.sin(a) * pavBreakR));
  }
  for (let i = 0; i < N * 2; i++) {
    const a = (i / (N * 2)) * Math.PI * 2;
    upper.push(V(Math.cos(a) * R, gTop, Math.sin(a) * R));
    lower.push(V(Math.cos(a) * R, gBot, Math.sin(a) * R));
  }
  const tableCenter = V(0, crownY + 0.001, 0);
  const culet = V(0, culetY, 0);
  for (let i = 0; i < N; i++) pushOut(out, tableCenter, table[i]!, table[(i + 1) % N]!);
  for (let i = 0; i < N; i++) {
    const t0 = table[i]!;
    const t1 = table[(i + 1) % N]!;
    const star = stars[i]!;
    const starNext = stars[(i + 1) % N]!;
    const gL = upper[(i * 2) % (N * 2)]!;
    const gM = upper[(i * 2 + 1) % (N * 2)]!;
    const gR = upper[(i * 2 + 2) % (N * 2)]!;
    pushOut(out, t0, star, t1);
    pushOut(out, t0, gL, star);
    pushOut(out, star, gL, gM);
    pushOut(out, t1, star, gM);
    pushOut(out, t1, gM, gR);
    pushOut(out, star, gR, starNext);
  }
  for (let i = 0; i < N * 2; i++) {
    const u0 = upper[i]!;
    const u1 = upper[(i + 1) % (N * 2)]!;
    const l0 = lower[i]!;
    const l1 = lower[(i + 1) % (N * 2)]!;
    pushOut(out, u0, u1, l1);
    pushOut(out, u0, l1, l0);
  }
  for (let i = 0; i < N; i++) {
    const a = lower[i * 2]!;
    const b = lower[i * 2 + 1]!;
    const c = lower[(i * 2 + 2) % (N * 2)]!;
    const p = pav[i]!;
    const q = pav[(i + 1) % N]!;
    pushOut(out, a, p, b);
    pushOut(out, b, p, c);
    pushOut(out, p, q, c);
    pushOut(out, p, culet, q);
  }
  return solid(out);
}

/** Tapered claw that hooks over a unit-girdle stone. Sits on +X and is rotated into place. */
export function clawGeometry() {
  const out: number[] = [];
  const rings = [
    { x: 0.58, y: -0.34, r: 0.055 },
    { x: 0.54, y: -0.16, r: 0.04 },
    { x: 0.51, y: 0.0, r: 0.03 },
    { x: 0.49, y: 0.1, r: 0.022 },
    { x: 0.42, y: 0.16, r: 0.02 },
    { x: 0.36, y: 0.2, r: 0.032 },
  ];
  const sides = 8;
  const circles = rings.map((ring) => Array.from({ length: sides }, (_, i) => {
    const a = (i / sides) * Math.PI * 2;
    return V(ring.x, ring.y + Math.sin(a) * ring.r, Math.cos(a) * ring.r);
  }));
  for (let s = 0; s < circles.length - 1; s++) {
    for (let i = 0; i < sides; i++) {
      const a = circles[s]![i]!;
      const b = circles[s]![(i + 1) % sides]!;
      const c = circles[s + 1]![i]!;
      const d = circles[s + 1]![(i + 1) % sides]!;
      pushOut(out, a, b, c);
      pushOut(out, b, d, c);
    }
  }
  const tip = V(0.33, 0.23, 0);
  const last = circles[circles.length - 1]!;
  for (let i = 0; i < sides; i++) pushOut(out, last[i]!, last[(i + 1) % sides]!, tip);
  return solid(out);
}

function warp(geo: THREE.BufferGeometry, fn: (x: number, y: number, z: number) => [number, number, number]) {
  const p = geo.attributes.position!;
  for (let i = 0; i < p.count; i++) {
    const [x, y, z] = fn(p.getX(i), p.getY(i), p.getZ(i));
    p.setXYZ(i, x, y, z);
  }
  p.needsUpdate = true;
  geo.computeVertexNormals();
  geo.computeBoundingSphere();
  return geo;
}

export function ovalBrilliant() {
  return warp(roundBrilliant(), (x, y, z) => [x * 0.78, y * 0.92, z * 1.28]);
}

export function cushionBrilliant() {
  return warp(roundBrilliant(), (x, y, z) => {
    const r = Math.hypot(x, z);
    if (r < 1e-5) return [x, y, z];
    const ang = Math.atan2(z, x);
    const n = 3.1;
    const c = Math.cos(ang);
    const s = Math.sin(ang);
    const nx = Math.sign(c) * Math.pow(Math.abs(c), 2 / n);
    const nz = Math.sign(s) * Math.pow(Math.abs(s), 2 / n);
    const len = Math.hypot(nx, nz) || 1;
    return [(nx / len) * r * 1.02, y * 0.95, (nz / len) * r * 1.02];
  });
}

export function pearBrilliant() {
  return warp(roundBrilliant(), (x, y, z) => {
    const pinch = z > 0 ? Math.max(0.12, 1 - 0.85 * (z / 0.5)) : 1;
    return [x * pinch * 0.9, y * 0.9, z > 0 ? z * 1.35 : z * 0.95];
  });
}

export function princessCut() {
  const crown = 0.16;
  const out: number[] = [];
  const sq = (half: number, y: number) => [
    V(-half, y, -half), V(half, y, -half), V(half, y, half), V(-half, y, half),
  ];
  const table = sq(0.22, crown);
  const brk = sq(0.36, crown * 0.42);
  const girdle = sq(0.48, 0.012);
  const lower = sq(0.48, -0.012);
  const pav = sq(0.2, -0.24);
  const culet = V(0, -0.42, 0);
  for (let i = 0; i < 4; i++) pushOut(out, V(0, crown, 0), table[i]!, table[(i + 1) % 4]!);
  for (let i = 0; i < 4; i++) {
    pushOut(out, table[i]!, brk[i]!, table[(i + 1) % 4]!);
    pushOut(out, table[(i + 1) % 4]!, brk[i]!, brk[(i + 1) % 4]!);
    pushOut(out, brk[i]!, girdle[i]!, brk[(i + 1) % 4]!);
    pushOut(out, brk[(i + 1) % 4]!, girdle[i]!, girdle[(i + 1) % 4]!);
    pushOut(out, girdle[i]!, lower[i]!, girdle[(i + 1) % 4]!);
    pushOut(out, lower[(i + 1) % 4]!, lower[i]!, girdle[(i + 1) % 4]!);
    pushOut(out, lower[i]!, pav[i]!, lower[(i + 1) % 4]!);
    pushOut(out, lower[(i + 1) % 4]!, pav[i]!, pav[(i + 1) % 4]!);
    pushOut(out, pav[i]!, culet, pav[(i + 1) % 4]!);
  }
  return solid(out);
}

export function emeraldCut() {
  const out: number[] = [];
  const steps: { y: number; hx: number; hz: number; ch: number }[] = [
    { y: 0.2, hx: 0.28, hz: 0.4, ch: 0.08 },
    { y: 0.12, hx: 0.38, hz: 0.52, ch: 0.1 },
    { y: 0.02, hx: 0.46, hz: 0.64, ch: 0.12 },
    { y: -0.02, hx: 0.46, hz: 0.64, ch: 0.12 },
    { y: -0.14, hx: 0.36, hz: 0.5, ch: 0.09 },
    { y: -0.28, hx: 0.22, hz: 0.3, ch: 0.06 },
    { y: -0.4, hx: 0.06, hz: 0.08, ch: 0.02 },
  ];
  const oct = (step: (typeof steps)[number]) => {
    const { y, hx, hz, ch } = step;
    return [
      V(-hx + ch, y, -hz),
      V(hx - ch, y, -hz),
      V(hx, y, -hz + ch),
      V(hx, y, hz - ch),
      V(hx - ch, y, hz),
      V(-hx + ch, y, hz),
      V(-hx, y, hz - ch),
      V(-hx, y, -hz + ch),
    ];
  };
  const rings = steps.map(oct);
  fan(out, V(0, steps[0]!.y, 0), rings[0]!);
  for (let i = 0; i < rings.length - 1; i++) bridge(out, rings[i]!, rings[i + 1]!);
  fan(out, V(0, steps[steps.length - 1]!.y, 0), rings[rings.length - 1]!, true);
  return solid(out);
}

const cache = new Map<string, THREE.BufferGeometry>();

export function gemGeometry(shape: string) {
  const key = shape;
  const hit = cache.get(key);
  if (hit) return hit;
  const geo =
    shape === "princess" ? princessCut()
    : shape === "oval" ? ovalBrilliant()
    : shape === "emerald" ? emeraldCut()
    : shape === "pear" ? pearBrilliant()
    : shape === "cushion" ? cushionBrilliant()
    : roundBrilliant();
  cache.set(key, geo);
  return geo;
}

export function bandGeometry(innerRadius: number, width: number, thickness: number) {
  const hw = width / 2;
  const steps = 10;
  const pts: THREE.Vector2[] = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const y = -hw + width * t;
    const dome = Math.sin(Math.PI * t);
    pts.push(new THREE.Vector2(innerRadius + 0.04 + (1 - dome) * 0.16, y));
  }
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const y = hw - width * t;
    const dome = Math.sin(Math.PI * t);
    pts.push(new THREE.Vector2(innerRadius + thickness * (0.78 + 0.22 * dome), y));
  }
  pts.push(pts[0]!.clone());
  const geo = new THREE.LatheGeometry(pts, 96);
  geo.computeVertexNormals();
  return geo;
}

export function caratDiameter(carat: number) {
  return 6.5 * Math.cbrt(Math.max(0.25, carat));
}

export function shapeScale(_shape: string): [number, number, number] {
  return [1, 1, 1];
}
