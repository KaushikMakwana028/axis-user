import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';

const NotFound = () => {
  return (
    <div className="app-container">
      <Header />
      <main className="main-content">
        <div className="empty-state-box not-found-box">
          <span className="empty-icon">404</span>
          <h2>Page Not Found</h2>
          <p>
            The page or design file you are looking for does not exist or may have been moved.
          </p>
          <div className="not-found-actions">
            <Link to="/" className="btn-gradient">
              Return Home
            </Link>
            <Link to="/products" className="btn-outline">
              Browse Designs
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default NotFound;
