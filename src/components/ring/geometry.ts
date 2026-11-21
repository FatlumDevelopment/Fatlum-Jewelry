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
 * Round brilliant in a unit of girdle-diameter 1 (radius 0.5).
 * Table, 8 stars, 8 bezels, 16 upper-girdle facets, girdle, 16 lower-girdle facets, 8 pavilion mains.
 * Every face is its own triangle so the refraction shader sees a hard facet normal.
 */
export function roundBrilliant() {
  const out: number[] = [];
  const R = 0.5;
  const tableR = R * 0.57;
  const crownH = (R - tableR) * Math.tan((34.5 * Math.PI) / 180);
  const pavD = R * Math.tan((40.75 * Math.PI) / 180);
  const starR = tableR + (R - tableR) * 0.55;
  const gTop = 0.012;
  const gBot = -0.012;
  const crownY = gTop + crownH;
  const starY = gTop + crownH * 0.42;
  const breakR = R * 0.38;
  const breakY = -pavD * 0.62;
  const culetY = -pavD;
  const C: THREE.Vector3[] = [];
  const K: THREE.Vector3[] = [];
  const B: THREE.Vector3[] = [];
  const U: THREE.Vector3[] = [];
  const LB: THREE.Vector3[] = [];
  const LU: THREE.Vector3[] = [];
  const H: THREE.Vector3[] = [];
  for (let i = 0; i < 8; i++) {
    const bezel = (i / 8) * Math.PI * 2;
    const upper = bezel + Math.PI / 8;
    C.push(V(Math.cos(upper) * tableR, crownY, Math.sin(upper) * tableR));
    K.push(V(Math.cos(bezel) * starR, starY, Math.sin(bezel) * starR));
    B.push(V(Math.cos(bezel) * R, gTop, Math.sin(bezel) * R));
    U.push(V(Math.cos(upper) * R, gTop, Math.sin(upper) * R));
    LB.push(V(Math.cos(bezel) * R, gBot, Math.sin(bezel) * R));
    LU.push(V(Math.cos(upper) * R, gBot, Math.sin(upper) * R));
    H.push(V(Math.cos(upper) * breakR, breakY, Math.sin(upper) * breakR));
  }
  const culet = V(0, culetY, 0);
  const table = V(0, crownY, 0);
  for (let i = 0; i < 8; i++) {
    const n = (i + 1) % 8;
    const p = (i + 7) % 8;
    pushOut(out, table, C[i]!, C[n]!);
    pushOut(out, C[i]!, K[n]!, C[n]!);
    pushOut(out, K[i]!, U[p]!, B[i]!);
    pushOut(out, K[i]!, B[i]!, U[i]!);
    pushOut(out, B[i]!, U[i]!, LB[i]!);
    pushOut(out, U[i]!, LU[i]!, LB[i]!);
    pushOut(out, U[i]!, B[n]!, LU[i]!);
    pushOut(out, B[n]!, LB[n]!, LU[i]!);
    pushOut(out, LU[i]!, LB[i]!, H[i]!);
    pushOut(out, LU[i]!, H[i]!, LB[n]!);
    pushOut(out, LB[i]!, H[p]!, culet);
    pushOut(out, LB[i]!, culet, H[i]!);
  }
  return solid(out);
}

/** Slim round prong along +X. The tip curls in over a unit girdle. */
export function prongGeometry() {
  const curve = new THREE.CatmullRomCurve3([
    V(0.32, -0.22, 0),
    V(0.5, -0.04, 0),
    V(0.53, 0.02, 0),
    V(0.44, 0.07, 0),
  ]);
  return new THREE.TubeGeometry(curve, 16, 0.026, 8, false);
}

/** Cup under the stone. Pavilion sits inside it; the rim is just under the girdle. */
export function galleryGeometry() {
  const pts = [
    new THREE.Vector2(0.08, -0.54),
    new THREE.Vector2(0.14, -0.42),
    new THREE.Vector2(0.26, -0.28),
    new THREE.Vector2(0.4, -0.14),
    new THREE.Vector2(0.5, -0.02),
    new THREE.Vector2(0.46, 0.015),
    new THREE.Vector2(0.22, -0.16),
    new THREE.Vector2(0.1, -0.36),
    new THREE.Vector2(0.08, -0.54),
  ];
  const geo = new THREE.LatheGeometry(pts, 48);
  geo.computeVertexNormals();
  return geo;
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
  const steps = 18;
  const pts: THREE.Vector2[] = [];
  const lift = Math.min(0.28, width * 0.1);
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const y = -hw + width * t;
    const dome = Math.sin(Math.PI * t);
    pts.push(new THREE.Vector2(innerRadius + 0.03 + (1 - dome) * lift, y));
  }
  const cx = innerRadius + thickness * 0.4;
  const cr = thickness * 0.64;
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const y = hw - width * t;
    pts.push(new THREE.Vector2(cx + Math.sin(Math.PI * t) * cr, y));
  }
  pts.push(pts[0]!.clone());
  const geo = new THREE.LatheGeometry(pts, 256);
  geo.computeVertexNormals();
  return geo;
}

/** Round-brilliant diameter in millimetres. 1 ct is about 6.4 mm. */
export function caratDiameter(carat: number) {
  return 6.4 * Math.cbrt(Math.max(0.25, carat));
}

export function shapeScale(_shape: string): [number, number, number] {
  return [1, 1, 1];
}
