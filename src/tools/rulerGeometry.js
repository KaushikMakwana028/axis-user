export const DEFAULT_RULER = { width: 170, height: 30, mm: true, inch: true };
const MARGIN = 10;

export const sanitizeRuler = (raw) => {
  const num = (v, d) => (Number.isFinite(parseFloat(v)) ? parseFloat(v) : d);
  return {
    width: Math.min(1000, Math.max(40, num(raw.width, DEFAULT_RULER.width))),
    height: Math.min(200, Math.max(15, num(raw.height, DEFAULT_RULER.height))),
    mm: !!raw.mm,
    inch: !!raw.inch,
  };
};

/** y-down coordinates in mm. Returns lines + texts + outline rect. */
export const buildRuler = (raw) => {
  const p = sanitizeRuler(raw);
  const { width: W, height: H } = p;
  const lines = [];
  const texts = [];

  // Font size scaled with ruler height
  const size = Math.max(2.6, Math.min(4.5, H * 0.115));

  // ---- centimetre ruler along the bottom edge (ticks grow upward)
  const cmMax = Math.floor((W - MARGIN - 8) / 10);
  const cmTall = H * 0.27;
  const cmMid = H * 0.18;
  const cmMini = H * 0.085;
  const cmTextY = H - cmTall - H * 0.06;

  texts.push({ x: MARGIN, y: cmTextY, size, text: 'cm', anchor: 'middle' });
  for (let mm = 0; mm <= cmMax * 10; mm += 1) {
    const x = MARGIN + mm;
    if (mm % 10 === 0) {
      lines.push({ x1: x, y1: H, x2: x, y2: H - cmTall });
      if (mm > 0) {
        texts.push({ x, y: cmTextY, size, text: String(mm / 10), anchor: 'middle' });
      }
    } else if (mm % 5 === 0) {
      lines.push({ x1: x, y1: H, x2: x, y2: H - cmMid });
    } else if (p.mm) {
      lines.push({ x1: x, y1: H, x2: x, y2: H - cmMini });
    }
  }

  // ---- inch ruler along the top edge (ticks hang downward)
  // Matching 3axis.co: quarters (1/4, 1/2, 3/4, 1) and whole numbers, clean and uncluttered
  if (p.inch) {
    const inMax = Math.floor((W - MARGIN - 5) / 25.4);
    const inchTall = H * 0.28;
    const inchMid = H * 0.21;
    const inchQuarter = H * 0.15;
    const inchTextY = H * 0.42;

    texts.push({ x: MARGIN, y: inchTextY, size, text: 'Inch', anchor: 'middle' });
    for (let i = 0; i <= inMax; i += 1) {
      const x = MARGIN + i * 25.4;
      lines.push({ x1: x, y1: 0, x2: x, y2: inchTall });
      if (i > 0) {
        texts.push({ x, y: inchTextY, size, text: String(i), anchor: 'middle' });
      }
      if (i < inMax) {
        // Quarter inch subdivisions: 1/4, 1/2, 3/4
        const quarters = [
          { frac: 0.25, len: inchQuarter },
          { frac: 0.5, len: inchMid },
          { frac: 0.75, len: inchQuarter },
        ];
        quarters.forEach((q) => {
          const qx = MARGIN + (i + q.frac) * 25.4;
          if (qx <= W - 4) {
            lines.push({ x1: qx, y1: 0, x2: qx, y2: q.len });
          }
        });
      }
    }
  }

  return { params: p, width: W, height: H, lines, texts };
};
