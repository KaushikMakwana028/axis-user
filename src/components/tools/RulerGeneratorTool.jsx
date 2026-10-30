import React, { useMemo, useState } from 'react';
import ToolShell from './ToolShell';
import { NumberField, CheckField, DownloadButtons } from './ToolFields';
import { buildRuler, DEFAULT_RULER } from '../../tools/rulerGeometry';
import { polylinesToSvg, polylinesToDxf, downloadText } from '../../tools/exporters';

const RulerGeneratorTool = () => {
  const [width, setWidth] = useState(String(DEFAULT_RULER.width));
  const [height, setHeight] = useState(String(DEFAULT_RULER.height));
  const [mm, setMm] = useState(DEFAULT_RULER.mm);
  const [inch, setInch] = useState(DEFAULT_RULER.inch);

  const ruler = useMemo(() => buildRuler({ width, height, mm, inch }), [width, height, mm, inch]);
  const extra = { lines: ruler.lines, texts: ruler.texts, rect: { w: ruler.width, h: ruler.height } };
  const name = `laser-cut-ruler-${ruler.width}x${ruler.height}`;

  const exportSvg = () =>
    downloadText(polylinesToSvg([], ruler.width, ruler.height, extra), `${name}.svg`, 'image/svg+xml');
  const exportDxf = () =>
    downloadText(polylinesToDxf([], ruler.height, extra), `${name}.dxf`, 'application/dxf');

  const pad = Math.max(ruler.width, ruler.height) * 0.02;

  return (
    <ToolShell
      title="Laser Cut Ruler Generator"
      subtitle="Generate a cm / inch ruler at any size and download it as SVG or DXF for engraving and cutting."
      crumb="Ruler Generator"
    >
      <div className="tool-layout">
        <aside className="tool-panel">
          <h2 className="tool-panel-title">Ruler Settings</h2>
          <NumberField id="rw" label="Width" value={width} onChange={setWidth} min={40} />
          <NumberField id="rh" label="Height" value={height} onChange={setHeight} min={15} />

          <div className="tool-checks">
            <CheckField id="rmm" label="Show mm lines" checked={mm} onChange={setMm} />
            <CheckField id="rin" label="Inch ruler" checked={inch} onChange={setInch} />
          </div>

          <div className="tool-meta">
            <div><span>Units</span><strong>mm</strong></div>
            <div><span>Length</span><strong>{Math.floor((ruler.width - 18) / 10)} cm</strong></div>
          </div>

          <DownloadButtons onSvg={exportSvg} onDxf={exportDxf} />
          <p className="tool-hint">Red outline is the cut path, black marks are for engraving.</p>
        </aside>

        <section className="tool-preview-card">
          <div className="tool-tabs">
            <span className="tool-tab active">Preview</span>
          </div>
          <div className="tool-stage tool-stage-light">
            <svg
              className="tool-2d-svg"
              viewBox={`${-pad} ${-pad} ${ruler.width + pad * 2} ${ruler.height + pad * 2}`}
              preserveAspectRatio="xMidYMid meet"
              role="img"
              aria-label="Ruler preview"
            >
              <rect
                x="0" y="0" width={ruler.width} height={ruler.height}
                fill="#ffffff" stroke="#ff0000" strokeWidth={ruler.width / 650}
              />
              {ruler.lines.map((l, i) => (
                <line key={i} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2} stroke="#000000" strokeWidth={ruler.width / 850} />
              ))}
              {ruler.texts.map((t, i) => (
                <text
                  key={i} x={t.x} y={t.y} fontSize={t.size} textAnchor={t.anchor}
                  fontWeight="bold" fontFamily="Arial, Helvetica, sans-serif" fill="#000000"
                >
                  {t.text}
                </text>
              ))}
            </svg>
          </div>
        </section>
      </div>
    </ToolShell>
  );
};

export default RulerGeneratorTool;
