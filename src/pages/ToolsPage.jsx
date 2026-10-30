import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import '../tools.css';
import { TOOLS } from '../tools/toolsList';

const ToolsPage = () => (
  <div className="app-container">
    <Header />
    <main className="main-content tool-main">
      <div className="breadcrumbs">
        <Link to="/">Home</Link>
        <span className="crumb-sep">›</span>
        <span className="crumb-current">Tools</span>
      </div>
      <div className="catalog-header">
        <div>
          <h1 className="catalog-title">Free Laser Cut Tools</h1>
          <p className="catalog-subtitle">
            Parametric generators with live 3D preview. Set your size, then download SVG or DXF.
          </p>
        </div>
      </div>

      <div className="tools-grid">
        {TOOLS.map((t) => (
          <Link key={t.path} to={t.path} className="tool-card">
            <span className="tool-card-icon">{t.icon}</span>
            <span className="tool-card-group">{t.group}</span>
            <h2>{t.name}</h2>
            <p>{t.desc}</p>
            <span className="tool-card-cta">Open tool →</span>
          </Link>
        ))}
      </div>
    </main>
    <Footer />
  </div>
);

export default ToolsPage;
