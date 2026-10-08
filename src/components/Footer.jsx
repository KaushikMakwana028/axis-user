import React from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';

const Footer = () => {
  const { categories } = useSelector((state) => state.category);
  const { fileTypes } = useSelector((state) => state.fileType);

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-grid">
          {/* Col 1: Brand Info */}
          <div className="footer-col brand-col">
            <Link to="/" className="brand-logo footer-logo">
              <div className="logo-symbol">⚡</div>
              <div className="logo-text">
                <span className="logo-main">AXIS</span>
                <span className="logo-sub">DESIGNS</span>
              </div>
            </Link>
            <p className="footer-desc">
              Your premier repository of free vector cut files, DXF designs, and CNC router templates for laser cutting, plasma, and engraving.
            </p>
            <div className="footer-badges">
              <span className="footer-badge">✨ Free Downloads</span>
              <span className="footer-badge">⚡ Instant Access</span>
            </div>
          </div>

          {/* Col 2: Navigation */}
          <div className="footer-col">
            <h4 className="footer-heading">Navigation</h4>
            <ul className="footer-links">
              <li><Link to="/">Home</Link></li>
              <li><Link to="/products">All Designs</Link></li>
              <li><Link to="/categories">Categories</Link></li>
            </ul>
          </div>

          {/* Col 3: Categories */}
          <div className="footer-col">
            <h4 className="footer-heading">Top Categories</h4>
            <ul className="footer-links">
              {categories.slice(0, 6).map((cat) => (
                <li key={cat.id}>
                  <Link to={`/category/${cat.slug || cat.id}`}>{cat.name}</Link>
                </li>
              ))}
              {categories.length === 0 && (
                <li><Link to="/products">Explore Designs</Link></li>
              )}
            </ul>
          </div>

          {/* Col 4: Formats & Info */}
          <div className="footer-col">
            <h4 className="footer-heading">Supported Formats</h4>
            <div className="footer-format-pills">
              {fileTypes.length > 0 ? (
                fileTypes.map((ft) => (
                  <Link
                    key={ft.id}
                    to={`/products?fileTypeId=${ft.id}`}
                    className="footer-format-pill"
                  >
                    {ft.extension?.replace('.', '').toUpperCase()}
                  </Link>
                ))
              ) : (
                <>
                  <span className="footer-format-pill">DXF</span>
                  <span className="footer-format-pill">SVG</span>
                  <span className="footer-format-pill">CDR</span>
                  <span className="footer-format-pill">AI</span>
                  <span className="footer-format-pill">EPS</span>
                  <span className="footer-format-pill">PDF</span>
                </>
              )}
            </div>
            <p className="footer-compatibility-note">
              Compatible with LightBurn, LaserGRBL, CorelDRAW, Adobe Illustrator, AutoCAD, Fusion 360, and CNC routers.
            </p>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} Axis Designs. All vector templates and CNC cutting files.</p>
          <div className="footer-bottom-links">
            <span>Clean &amp; Optimized Vectors</span>
            <span className="dot-sep">•</span>
            <span>Laser &amp; CNC Ready</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
