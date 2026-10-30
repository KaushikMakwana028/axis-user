import React, { useMemo, useState } from 'react';
import ToolShell from './ToolShell';
import Box3DViewer from './Box3DViewer';
import { NumberField, DownloadButtons } from './ToolFields';
import { buildBox, layoutPanels, layoutPolylines, DEFAULT_BOX } from '../../tools/boxGeometry';
import { polylinesToSvg, polylinesToDxf, downloadText } from '../../tools/exporters';

const SWATCHES = [
  '#131417', '#374047', '#5f6e78', '#7f8a93', '#97a1a7', '#acb4b9', '#df9998', '#7c6862',
  '#a3ab84', '#d6ccb1', '#f8d5c4', '#a3ae99', '#eff2f2', '#b0c5c1', '#8b8c8c', '#565f59',
  '#cb304a', '#fed7c8', '#c7bdbd', '#3dcbbe', '#264b4f', '#389389', '#85beae', '#f2daba',
  '#f2a97f', '#d85f52', '#d92e37', '#fc9736', '#f7bd69', '#a4d09c', '#4c8a67', '#25608a',
  '#75c8c6', '#f5e4b7',
];

const BoxGeneratorTool = ({ withLid = false }) => {
  const [form, setForm] = useState({
    width: String(DEFAULT_BOX.width),
    height: String(DEFAULT_BOX.height),
    depth: String(DEFAULT_BOX.depth),
    thickness: String(DEFAULT_BOX.thickness),
    tab: String(DEFAULT_BOX.tab),
  });
  const [view, setView] = useState('3d');
  const [color, setColor] = useState(SWATCHES[9]); // #d6ccb1 (warm pale wood matching 3axis.co default)
  const [explode, setExplode] = useState(0);
  const [resetKey, setResetKey] = useState(0);

  const set = (key) => (val) => setForm((f) => ({ ...f, [key]: val }));

  const box = useMemo(() => buildBox(form, withLid), [form, withLid]);
  const layout = useMemo(() => layoutPanels(box.panels), [box]);
  const polylines = useMemo(() => layoutPolylines(layout), [layout]);
  const { dims } = box;

  const baseName = withLid ? 'laser-cut-box-with-lid' : 'laser-cut-box';
  const stamp = `${dims.width}x${dims.height}x${dims.depth}-t${dims.thickness}`;

  const exportSvg = () =>
    downloadText(
      polylinesToSvg(polylines, layout.width, layout.height),
      `${baseName}-${stamp}.svg`,
      'image/svg+xml'
    );
  const exportDxf = () =>
    downloadText(polylinesToDxf(polylines, layout.height), `${baseName}-${stamp}.dxf`, 'application/dxf');

  const title = withLid ? 'Laser Cut Box Generator With Lid' : 'Laser Cut Box Generator';
  const subtitle = withLid
    ? 'Finger-jointed box with lid. Tweak the size, preview it in 3D and download cut-ready SVG or DXF.'
    : 'Finger-jointed open box. Tweak the size, preview it in 3D and download cut-ready SVG or DXF.';

  return (
    <ToolShell title={title} subtitle={subtitle} crumb={withLid ? 'Box Generator With Lid' : 'Box Generator'}>
      <div className="tool-layout">
        <aside className="tool-panel">
          <h2 className="tool-panel-title">Box Settings</h2>
          <NumberField id="bw" label="Width" value={form.width} onChange={set('width')} min={20} />
          <NumberField id="bh" label="Height" value={form.height} onChange={set('height')} min={20} />
          <NumberField id="bd" label="Depth" value={form.depth} onChange={set('depth')} min={20} />
          <NumberField
            id="bt"
            label="Material Thickness"
            value={form.thickness}
            onChange={set('thickness')}
            min={0.5}
            max={20}
            step={0.1}
          />
          <NumberField id="btab" label="Tab Size" value={form.tab} onChange={set('tab')} min={5} />
          <input
            className="tool-range"
            type="range"
            min={5}
            max={60}
            value={Math.min(60, Math.max(5, parseFloat(form.tab) || 5))}
            onChange={(e) => set('tab')(e.target.value)}
            aria-label="Tab size slider"
          />

          <div className="tool-meta">
            <div><span>Units</span><strong>mm</strong></div>
            <div><span>Parts</span><strong>{box.panels.length}</strong></div>
            <div><span>Sheet</span><strong>{Math.ceil(layout.width)} × {Math.ceil(layout.height)}</strong></div>
          </div>

          <DownloadButtons onSvg={exportSvg} onDxf={exportDxf} />
          <p className="tool-hint">Red lines are cut paths. Units are millimetres.</p>
        </aside>

        <section className="tool-preview-card">
          <div className="tool-tabs">
            <button type="button" className={`tool-tab ${view === '3d' ? 'active' : ''}`} onClick={() => setView('3d')}>
              3D View
            </button>
            <button type="button" className={`tool-tab ${view === '2d' ? 'active' : ''}`} onClick={() => setView('2d')}>
              2D View
            </button>

            {view === '3d' && (
              <div className="tool-tab-extras">
                <label className="tool-explode">
                  <span>Explode</span>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.01}
                    value={explode}
                    onChange={(e) => setExplode(parseFloat(e.target.value))}
                  />
                </label>
                <button type="button" className="tool-mini-btn" onClick={() => setResetKey((k) => k + 1)}>
                  ⟲ Reset view
                </button>
              </div>
            )}
          </div>

          <div className={`tool-stage ${view === '2d' ? 'tool-stage-2d' : ''}`}>
            {view === '3d' ? (
              <>
                <Box3DViewer box={box} color={color} explode={explode} resetKey={resetKey} />
                <span className="tool-stage-hint">Drag to rotate 360° · Scroll to zoom · Right-drag to pan</span>
              </>
            ) : (
              <svg
                className="tool-2d-svg"
                viewBox={`0 0 ${layout.width} ${layout.height}`}
                preserveAspectRatio="xMidYMid meet"
                role="img"
                aria-label="Flat cutting layout"
              >
                {polylines.map((pl) => {
                  const panel = layout.placed.find((q) => q.id === pl.id);
                  if (!panel) return null;
                  return (
                    <g key={pl.id}>
                      <path
                        d={pl.points.map(([x, y], i) => `${i ? 'L' : 'M'}${x} ${y}`).join(' ') + ' Z'}
                        fill="#ffffff"
                        stroke="#111111"
                        strokeWidth={Math.max(layout.width, layout.height) / 550}
                        strokeLinejoin="round"
                      />
                      <text
                        x={panel.ox + panel.w / 2}
                        y={panel.oy + panel.h / 2}
                        fontSize={Math.max(12, Math.min(panel.w, panel.h) / 8)}
                        textAnchor="middle"
                        dominantBaseline="central"
                        fill="#555555"
                        fontFamily="Poppins, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
                        fontWeight="600"
                        letterSpacing="0.3px"
                      >
                        {pl.name}
                      </text>
                    </g>
                  );
                })}
              </svg>
            )}
          </div>

          <div className="tool-swatches" role="radiogroup" aria-label="Material colour (3D preview only)">
            {SWATCHES.map((c) => (
              <button
                key={c}
                type="button"
                role="radio"
                aria-checked={color === c}
                aria-label={`Colour ${c}`}
                className={`tool-swatch ${color === c ? 'active' : ''}`}
                style={{ background: c }}
                onClick={() => setColor(c)}
              />
            ))}
          </div>
        </section>
      </div>
    </ToolShell>
  );
};

export default BoxGeneratorTool;
