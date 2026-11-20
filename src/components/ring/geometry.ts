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

/** Round brilliant in a unit box: girdle diameter 1, table up, y up. */
export function roundBrilliant() {
  const R = 0.5;
  const out: number[] = [];
  const table = ringOf(8, R * 0.56, 0.16, Math.PI / 8);
  const crown = ringOf(16, R, 0.02);
  const girdle = ringOf(16, R, -0.02);
  const mid = ringOf(8, R * 0.42, -0.28);
  const culet = V(0, -0.44, 0);
  fan(out, V(0, 0.16, 0), table);
  for (let i = 0; i < 8; i++) {
    const t0 = table[i]!;
    const t1 = table[(i + 1) % 8]!;
    const g0 = crown[i * 2]!;
    const g1 = crown[i * 2 + 1]!;
    const g2 = crown[(i * 2 + 2) % 16]!;
    pushFace(out, t0, g1, t1);
    pushFace(out, t0, g0, g1);
    pushFace(out, t1, g1, g2);
  }
  bridge(out, crown, girdle);
  for (let i = 0; i < 8; i++) {
    const a = girdle[i * 2]!;
    const b = girdle[i * 2 + 1]!;
    const c = girdle[(i * 2 + 2) % 16]!;
    const m = mid[i]!;
    const n = mid[(i + 1) % 8]!;
    pushFace(out, a, m, b);
    pushFace(out, b, m, c);
    pushFace(out, m, n, c);
  }
  fan(out, culet, mid, true);
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
  const s = 0.46;
  const table = 0.26;
  const crown = 0.18;
  const pav = -0.42;
  const t = [V(-table, crown, -table), V(table, crown, -table), V(table, crown, table), V(-table, crown, table)];
  const g = [V(-s, 0.02, -s), V(s, 0.02, -s), V(s, 0.02, s), V(-s, 0.02, s)];
  const b = [V(-s, -0.02, -s), V(s, -0.02, -s), V(s, -0.02, s), V(-s, -0.02, s)];
  const culet = V(0, pav, 0);
  const out: number[] = [];
  fan(out, V(0, crown, 0), t);
  bridge(out, t, g);
  bridge(out, g, b);
  fan(out, culet, b, true);
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

export function shapeScale(shape: string): [number, number, number] {
  switch (shape) {
    case "oval": return [0.82, 0.9, 1.22];
    case "pear": return [0.8, 0.88, 1.2];
    case "emerald": return [0.92, 0.86, 1.15];
    case "princess": return [0.96, 1.02, 0.96];
    case "cushion": return [1.02, 0.94, 1.02];
    default: return [1, 1, 1];
  }
}
