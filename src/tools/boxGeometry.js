/**
 * Finger-jointed (box joint) laser cut box geometry.
 *
 * Box occupies [0,W] x [0,H] x [0,D] (x = width, y = height, z = depth).
 * Every box edge is shared by two panels. Along the edge the edge is split in
 * an odd number of segments; the higher priority panel keeps the material on
 * even segments, the other panel on odd segments. Because the number of
 * segments is odd and both ends belong to the same panel for all three edges
 * meeting at a corner, every corner cube is owned by exactly one panel.
 */

const PRIORITY = { plate: 3, fb: 2, side: 1 };
const GAP = 0.2; // lid clearance (mm)

export const DEFAULT_BOX = { width: 200, height: 100, depth: 150, thickness: 3, tab: 20 };

export const sanitizeBox = (raw) => {
  const num = (v, d) => (Number.isFinite(parseFloat(v)) ? parseFloat(v) : d);
  const thickness = Math.min(20, Math.max(0.5, num(raw.thickness, DEFAULT_BOX.thickness)));
  const min = Math.max(20, thickness * 6);
  return {
    width: Math.min(2000, Math.max(min, num(raw.width, DEFAULT_BOX.width))),
    height: Math.min(2000, Math.max(min, num(raw.height, DEFAULT_BOX.height))),
    depth: Math.min(2000, Math.max(min, num(raw.depth, DEFAULT_BOX.depth))),
    thickness,
    tab: Math.min(200, Math.max(thickness * 1.5, num(raw.tab, DEFAULT_BOX.tab))),
  };
};

const segCount = (length, tab) => {
  let n = Math.round(length / tab);
  if (n % 2 === 0) n += 1;
  return Math.max(3, n);
};

/** Per-segment inward offsets for one panel edge. */
const edgeOffsets = (edge, t, tab) => {
  if (!edge) return [{ a: 0, b: 1, d: 0 }];
  const n = segCount(edge.length, tab);
  const out = [];
  for (let i = 0; i < n; i += 1) {
    const wins = edge.mine > edge.other ? i % 2 === 0 : i % 2 === 1;
    out.push({ a: i / n, b: (i + 1) / n, d: wins ? 0 : t });
  }
  return out;
};

/** Build a closed rectilinear outline (CCW, y up) for a w x h panel. */
const buildOutline = (w, h, edges, t, tab) => {
  // order: bottom (left->right), right (up), top (right->left), left (down)
  const defs = [
    { L: w, u: [1, 0], n: [0, 1], o: [0, 0] },
    { L: h, u: [0, 1], n: [-1, 0], o: [w, 0] },
    { L: w, u: [-1, 0], n: [0, -1], o: [w, h] },
    { L: h, u: [0, -1], n: [1, 0], o: [0, h] },
  ];
  const segs = defs.map((_, i) => edgeOffsets(edges[i], t, tab));
  const pts = [];
  defs.forEach((e, i) => {
    const s = segs[i];
    const prev = segs[(i + 3) % 4];
    const next = segs[(i + 1) % 4];
    const prevD = prev[prev.length - 1].d;
    const nextD = next[0].d;
    const at = (along, d) => [
      e.o[0] + e.u[0] * along + e.n[0] * d,
      e.o[1] + e.u[1] * along + e.n[1] * d,
    ];
    s.forEach((seg, k) => {
      const a = k === 0 ? prevD : seg.a * e.L;
      const b = k === s.length - 1 ? e.L - nextD : seg.b * e.L;
      pts.push(at(a, seg.d), at(b, seg.d));
    });
  });
  return simplify(pts);
};

const simplify = (pts) => {
  const eq = (p, q) => Math.abs(p[0] - q[0]) < 1e-6 && Math.abs(p[1] - q[1]) < 1e-6;
  let out = pts.filter((p, i) => !eq(p, pts[(i + pts.length - 1) % pts.length]));
  let changed = true;
  while (changed) {
    changed = false;
    const next = [];
    for (let i = 0; i < out.length; i += 1) {
      const p0 = out[(i + out.length - 1) % out.length];
      const p1 = out[i];
      const p2 = out[(i + 1) % out.length];
      const cross = (p1[0] - p0[0]) * (p2[1] - p1[1]) - (p1[1] - p0[1]) * (p2[0] - p1[0]);
      if (Math.abs(cross) < 1e-9) changed = true;
      else next.push(p1);
    }
    out = next;
  }
  return out;
};

/**
 * @returns {{panels: Array, dims: object, withLid: boolean}}
 * Each panel: { id, name, w, h, outline, origin, u, v, nrm, explode }
 * 3D placement: world = origin + u*x + v*y, extruded along `nrm` by thickness.
 */
export const buildBox = (rawParams, withLid = false) => {
  const p = sanitizeBox(rawParams);
  const { width: W, height: H, depth: D, thickness: t, tab } = p;
  const panels = [];

  const add = (id, name, w, h, edges, placement, explode) =>
    panels.push({
      id, name, w, h,
      outline: buildOutline(w, h, edges, t, tab),
      ...placement,
      explode,
    });

  // 1. Bottom plate (W x D)
  // Edges: 0: bottom (faces Front), 1: right (faces Right), 2: top (faces Back), 3: left (faces Left)
  const plateEdges = () => [
    { length: W, mine: PRIORITY.plate, other: PRIORITY.fb },
    { length: D, mine: PRIORITY.plate, other: PRIORITY.side },
    { length: W, mine: PRIORITY.plate, other: PRIORITY.fb },
    { length: D, mine: PRIORITY.plate, other: PRIORITY.side },
  ];
  add('bottom', 'Bottom', W, D, plateEdges(), {
    origin: [0, t, 0], u: [1, 0, 0], v: [0, 0, 1], nrm: [0, -1, 0],
  }, [0, -1, 0]);

  // If withLid, add the 6th panel: Top / Lid plate (W x D) with matching finger joints
  if (withLid) {
    add('top', 'Top (Lid)', W, D, plateEdges(), {
      origin: [0, H, 0], u: [1, 0, 0], v: [0, 0, 1], nrm: [0, -1, 0],
    }, [0, 1, 0]);
  }

  // 2. Back wall (W x H)
  // Edges: 0: bottom (faces Bottom), 1: right (faces Right), 2: top (faces Top if withLid, else open flat rim), 3: left (faces Left)
  const backEdges = [
    { length: W, mine: PRIORITY.fb, other: PRIORITY.plate },
    { length: H, mine: PRIORITY.fb, other: PRIORITY.side },
    withLid ? { length: W, mine: PRIORITY.fb, other: PRIORITY.plate } : null,
    { length: H, mine: PRIORITY.fb, other: PRIORITY.side },
  ];
  add('back', 'Back', W, H, backEdges, {
    origin: [0, 0, D - t], u: [1, 0, 0], v: [0, 1, 0], nrm: [0, 0, 1],
  }, [0, 0, 1]);

  // 3. Front wall (W x H)
  // Edges: 0: bottom (faces Top if withLid, else open flat rim), 1: right (faces Right), 2: top (faces Bottom), 3: left (faces Left)
  const frontEdges = [
    withLid ? { length: W, mine: PRIORITY.fb, other: PRIORITY.plate } : null,
    { length: H, mine: PRIORITY.fb, other: PRIORITY.side },
    { length: W, mine: PRIORITY.fb, other: PRIORITY.plate },
    { length: H, mine: PRIORITY.fb, other: PRIORITY.side },
  ];
  add('front', 'Front', W, H, frontEdges, {
    origin: [0, H, t], u: [1, 0, 0], v: [0, -1, 0], nrm: [0, 0, -1],
  }, [0, 0, -1]);

  // 4. Left wall (H x D)
  // Edges: 0: bottom (faces Front), 1: right (faces Bottom), 2: top (faces Back), 3: left (faces Top if withLid, else open flat rim)
  const leftEdges = [
    { length: H, mine: PRIORITY.side, other: PRIORITY.fb },
    { length: D, mine: PRIORITY.side, other: PRIORITY.plate },
    { length: H, mine: PRIORITY.side, other: PRIORITY.fb },
    withLid ? { length: D, mine: PRIORITY.side, other: PRIORITY.plate } : null,
  ];
  add('left', 'Left', H, D, leftEdges, {
    origin: [t, H, 0], u: [0, -1, 0], v: [0, 0, 1], nrm: [-1, 0, 0],
  }, [-1, 0, 0]);

  // 5. Right wall (H x D)
  // Edges: 0: bottom (faces Front), 1: right (faces Top if withLid, else open flat rim), 2: top (faces Back), 3: left (faces Bottom)
  const rightEdges = [
    { length: H, mine: PRIORITY.side, other: PRIORITY.fb },
    withLid ? { length: D, mine: PRIORITY.side, other: PRIORITY.plate } : null,
    { length: H, mine: PRIORITY.side, other: PRIORITY.fb },
    { length: D, mine: PRIORITY.side, other: PRIORITY.plate },
  ];
  add('right', 'Right', H, D, rightEdges, {
    origin: [W - t, 0, 0], u: [0, 1, 0], v: [0, 0, 1], nrm: [1, 0, 0],
  }, [1, 0, 0]);

  return { panels, dims: p, withLid };
};

/**
 * Layout panels in 2D space.
 * Matches 3axis.co layout:
 * - 5 panels (open box):
 *     Row 1 (top): Back (W x H)
 *     Row 2 (middle): Left (H x D), Bottom (W x D), Right (H x D)
 *     Row 3 (bottom): Front (W x H)
 * - 6 panels (box with lid):
 *     Row 1 (top): Back (W x H)
 *     Row 2 (middle): Left (H x D), Bottom (W x D), Right (H x D), Top / Lid (W x D)
 *     Row 3 (bottom): Front (W x H)
 */
export const layoutPanels = (panels, spacing = 8) => {
  const find = (id) => panels.find((p) => p.id === id);
  const bottom = find('bottom');
  const back = find('back');
  const front = find('front');
  const left = find('left');
  const right = find('right');
  const top = find('top');

  if (bottom && back && front && left && right) {
    const W = bottom.w;
    const D = bottom.h;
    const H = back.h;
    const gap = spacing;

    // Positions
    const oxLeft = gap;
    const oxCenter = gap + H + gap;
    const oxRight = gap + H + gap + W + gap;
    const oxFarRight = gap + H + gap + W + gap + H + gap;

    const oyTop = gap;
    const oyMiddle = gap + H + gap;
    const oyBottom = gap + H + gap + D + gap;

    const placed = [];
    placed.push({ ...back, ox: oxCenter, oy: oyTop });
    placed.push({ ...left, ox: oxLeft, oy: oyMiddle });
    placed.push({ ...bottom, ox: oxCenter, oy: oyMiddle });
    placed.push({ ...right, ox: oxRight, oy: oyMiddle });
    placed.push({ ...front, ox: oxCenter, oy: oyBottom });

    let totalWidth = oxRight + H + gap;
    if (top) {
      placed.push({ ...top, ox: oxFarRight, oy: oyMiddle });
      totalWidth = oxFarRight + W + gap;
    }

    const totalHeight = oyBottom + H + gap;

    return { placed, width: totalWidth, height: totalHeight };
  }

  // Fallback to row pack
  const area = panels.reduce((a, q) => a + q.w * q.h, 0);
  const maxW = Math.max(...panels.map((q) => q.w));
  const limit = Math.max(maxW, Math.sqrt(area) * 1.5);
  const sorted = [...panels].sort((a, b) => b.h - a.h);
  let x = spacing;
  let y = spacing;
  let rowH = 0;
  let totalW = 0;
  const placed = [];
  sorted.forEach((q) => {
    if (x > spacing && x + q.w > limit + spacing) {
      x = spacing;
      y += rowH + spacing;
      rowH = 0;
    }
    placed.push({ ...q, ox: x, oy: y });
    x += q.w + spacing;
    rowH = Math.max(rowH, q.h);
    totalW = Math.max(totalW, x);
  });
  return { placed, width: totalW, height: y + rowH + spacing };
};

/** Convert placed panels into closed y-down polylines. */
export const layoutPolylines = (layout) =>
  layout.placed.map((q) => ({
    id: q.id,
    name: q.name,
    points: q.outline.map(([px, py]) => [q.ox + px, q.oy + (q.h - py)]),
  }));
