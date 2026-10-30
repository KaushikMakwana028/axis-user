const f = (n) => Number(n.toFixed(3));
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');

/** polylines: [{points:[[x,y]...]}] (y-down). */
export const polylinesToSvg = (polylines, width, height, extra = {}) => {
  const { lines = [], texts = [], rect = null } = extra;
  const body = [];
  if (rect) {
    body.push(`<rect x="0" y="0" width="${f(rect.w)}" height="${f(rect.h)}" fill="none" stroke="#ff0000" stroke-width="0.2"/>`);
  }
  polylines.forEach((pl) => {
    const d = pl.points.map(([x, y], i) => `${i ? 'L' : 'M'}${f(x)} ${f(y)}`).join(' ') + ' Z';
    body.push(`<path id="${pl.id}" d="${d}" fill="none" stroke="#ff0000" stroke-width="0.2"/>`);
  });
  lines.forEach((l) =>
    body.push(`<line x1="${f(l.x1)}" y1="${f(l.y1)}" x2="${f(l.x2)}" y2="${f(l.y2)}" stroke="#000000" stroke-width="0.2"/>`)
  );
  texts.forEach((t) =>
    body.push(
      `<text x="${f(t.x)}" y="${f(t.y)}" font-size="${f(t.size)}" font-family="Arial, Helvetica, sans-serif" font-weight="bold" text-anchor="${t.anchor}" fill="#000000">${esc(t.text)}</text>`
    )
  );
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${f(width)}mm" height="${f(height)}mm" viewBox="0 0 ${f(width)} ${f(height)}">
${body.join('\n')}
</svg>
`;
};

/** Minimal AutoCAD R12 ASCII DXF (units: mm). Input is y-down; output is y-up. */
export const polylinesToDxf = (polylines, height, extra = {}) => {
  const { lines = [], texts = [], rect = null } = extra;
  const out = [];
  const push = (code, val) => out.push(String(code), String(val));
  const Y = (y) => f(height - y);

  push(0, 'SECTION'); push(2, 'HEADER');
  push(9, '$ACADVER'); push(1, 'AC1009');
  push(9, '$INSUNITS'); push(70, 4);
  push(0, 'ENDSEC');
  push(0, 'SECTION'); push(2, 'TABLES');
  push(0, 'TABLE'); push(2, 'LAYER'); push(70, 2);
  push(0, 'LAYER'); push(2, 'CUT'); push(70, 0); push(62, 1); push(6, 'CONTINUOUS');
  push(0, 'LAYER'); push(2, 'MARK'); push(70, 0); push(62, 7); push(6, 'CONTINUOUS');
  push(0, 'ENDTAB');
  push(0, 'ENDSEC');
  push(0, 'SECTION'); push(2, 'ENTITIES');

  const poly = (pts, layer) => {
    push(0, 'POLYLINE'); push(8, layer); push(66, 1); push(70, 1);
    push(10, 0); push(20, 0); push(30, 0);
    pts.forEach(([x, y]) => {
      push(0, 'VERTEX'); push(8, layer); push(10, f(x)); push(20, Y(y)); push(30, 0);
    });
    push(0, 'SEQEND'); push(8, layer);
  };

  if (rect) poly([[0, 0], [rect.w, 0], [rect.w, rect.h], [0, rect.h]], 'CUT');
  polylines.forEach((pl) => poly(pl.points, 'CUT'));
  lines.forEach((l) => {
    push(0, 'LINE'); push(8, 'MARK');
    push(10, f(l.x1)); push(20, Y(l.y1)); push(30, 0);
    push(11, f(l.x2)); push(21, Y(l.y2)); push(31, 0);
  });
  texts.forEach((t) => {
    push(0, 'TEXT'); push(8, 'MARK');
    push(10, f(t.x)); push(20, Y(t.y)); push(30, 0);
    push(40, f(t.size)); push(1, t.text);
    if (t.anchor === 'middle') {
      push(72, 1); push(11, f(t.x)); push(21, Y(t.y)); push(31, 0);
    }
  });

  push(0, 'ENDSEC'); push(0, 'EOF');
  return out.join('\n') + '\n';
};

export const downloadText = (text, filename, mime) => {
  const blob = new Blob([text], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};
