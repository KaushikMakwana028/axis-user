import React from 'react';
import { Link } from 'react-router-dom';
import { formatExtension } from '../utils/formatters';

const ProductCard = ({ product }) => {
  if (!product) return null;

  // Extract formats from available_file_types or files
  const fileTypes = product.available_file_types || product.files || [];

  // Generate clean slug URL: /:categorySlug/:subcategorySlug/:productSlug
  const productUrl =
    product.category_slug && product.subcategory_slug && product.slug
      ? `/${product.category_slug}/${product.subcategory_slug}/${product.slug}`
      : product.slug
      ? `/product/${product.slug}`
      : `/product/${product.id}`;

  const categoryUrl = product.category_slug
    ? `/category/${product.category_slug}`
    : `/category/${product.category_id}`;

  const subcategoryUrl =
    product.category_slug && product.subcategory_slug
      ? `/category/${product.category_slug}/${product.subcategory_slug}`
      : `/products?categoryId=${product.category_id}&subcategoryId=${product.subcategory_id}`;

  return (
    <div className="product-card">
      <Link to={productUrl} className="image-container-link">
        <div className="image-container">
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.name}
              loading="lazy"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://placehold.co/600x400/f5f5f7/8a8f9a?text=Vector+Design';
              }}
            />
          ) : (
            <div className="placeholder-image">
              <span className="placeholder-icon">📐</span>
              <span className="placeholder-text">Vector Design</span>
            </div>
          )}

          {fileTypes.length > 0 && (
            <span className="files-count-badge">
              {fileTypes.length} {fileTypes.length === 1 ? 'Format' : 'Formats'}
            </span>
          )}
        </div>
      </Link>

      <div className="product-info">
        <div className="product-category-row">
          {product.category_name && (
            <Link to={categoryUrl} className="product-category">
              {product.category_name}
            </Link>
          )}
          {product.subcategory_name && (
            <Link to={subcategoryUrl} className="product-subcategory">
              {product.subcategory_name}
            </Link>
          )}
        </div>

        <h3 className="product-title" title={product.name}>
          <Link to={productUrl}>{product.name}</Link>
        </h3>

        <div className="format-tag-row">
          {fileTypes.length > 0 ? (
            fileTypes.slice(0, 5).map((ft, idx) => (
              <span
                key={ft.id || idx}
                className={`format-pill format-pill-${(ft.extension || '').replace('.', '').toLowerCase()}`}
              >
                {formatExtension(ft.extension)}
              </span>
            ))
          ) : (
            <span className="format-pill format-pill-generic">VECTOR</span>
          )}
          {fileTypes.length > 5 && (
            <span className="format-pill format-pill-more">
              +{fileTypes.length - 5}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
