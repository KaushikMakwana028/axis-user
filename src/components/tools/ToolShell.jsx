import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../Header';
import Footer from '../Footer';
import '../../tools.css';

const ToolShell = ({ title, subtitle, crumb, children }) => (
  <div className="app-container">
    <Header />
    <main className="main-content tool-main">
      <div className="breadcrumbs">
        <Link to="/">Home</Link>
        <span className="crumb-sep">›</span>
        <Link to="/tools">Tools</Link>
        {crumb && (
          <>
            <span className="crumb-sep">›</span>
            <span className="crumb-current">{crumb}</span>
          </>
        )}
      </div>
      <div className="catalog-header">
        <div>
          <h1 className="catalog-title">{title}</h1>
          {subtitle && <p className="catalog-subtitle">{subtitle}</p>}
        </div>
      </div>
      {children}
    </main>
    <Footer />
  </div>
);

export default ToolShell;
