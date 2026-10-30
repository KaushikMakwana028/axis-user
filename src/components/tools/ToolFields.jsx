import React from 'react';

export const NumberField = ({ id, label, value, onChange, unit = 'mm', min, max, step = 1 }) => (
  <div className="tool-field">
    <label htmlFor={id}>{label}</label>
    <div className="tool-input-wrap">
      <input
        id={id}
        type="number"
        inputMode="decimal"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(e) => onChange(e.target.value)}
      />
      {unit && <span className="tool-input-unit">{unit}</span>}
    </div>
  </div>
);

export const CheckField = ({ id, label, checked, onChange }) => (
  <label className="tool-check" htmlFor={id}>
    <input id={id} type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
    <span className="tool-check-box" aria-hidden="true" />
    <span>{label}</span>
  </label>
);

export const DownloadButtons = ({ onSvg, onDxf }) => (
  <div className="tool-download-row">
    <button type="button" className="btn-gradient" onClick={onSvg}>
      Download SVG ⬇
    </button>
    <button type="button" className="btn-outline tool-dxf-btn" onClick={onDxf}>
      Download DXF ⬇
    </button>
  </div>
);
