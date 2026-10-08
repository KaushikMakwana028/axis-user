import React from 'react';

export const LoadingSpinner = ({ text = 'Loading designs...' }) => {
  return (
    <div className="loading-container">
      <div className="loading-spinner" />
      {text && <p className="loading-text">{text}</p>}
    </div>
  );
};

export const SkeletonCard = () => {
  return (
    <div className="product-card skeleton-card">
      <div className="skeleton-image" />
      <div className="product-info">
        <div className="skeleton-line skeleton-badge" />
        <div className="skeleton-line skeleton-title" />
        <div className="skeleton-line skeleton-formats" />
      </div>
    </div>
  );
};

export default LoadingSpinner;
