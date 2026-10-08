import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ProductCard from '../components/ProductCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { fetchProductDetail } from '../redux/productSlice';
import productService from '../services/productService';
import { formatFileSize, formatDate, formatExtension } from '../utils/formatters';

const ProductDetails = () => {
  const { categorySlug, subcategorySlug, productSlug, id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const slugOrId = productSlug || id;

  const { currentProduct, detailLoading } = useSelector((state) => state.product);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [downloadSuccessMessage, setDownloadSuccessMessage] = useState('');

  // Fetch product detail on slug or id change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (slugOrId) {
      const isNum = /^\d+$/.test(slugOrId);
      if (isNum) {
        dispatch(fetchProductDetail({ product_id: parseInt(slugOrId, 10) }));
      } else {
        dispatch(fetchProductDetail({ product_slug: slugOrId }));
      }
    }
  }, [dispatch, slugOrId]);

  // Fetch related products once currentProduct is loaded
  useEffect(() => {
    if (currentProduct && (currentProduct.category_id || currentProduct.category_slug)) {
      productService
        .getProductList({
          category_id: currentProduct.category_id || 0,
          category_slug: currentProduct.category_slug || '',
          per_page: 5,
        })
        .then((res) => {
          if (res?.status && res?.data?.products) {
            // Filter out current product
            const filtered = res.data.products.filter(
              (p) => p.id !== currentProduct.id && p.slug !== currentProduct.slug
            );
            setRelatedProducts(filtered.slice(0, 4));
          }
        })
        .catch(() => {
          setRelatedProducts([]);
        });
    }
  }, [currentProduct]);

  const handleDownloadFeedback = (fileName) => {
    setDownloadSuccessMessage(`Starting download for: ${fileName}`);
    setTimeout(() => {
      setDownloadSuccessMessage('');
    }, 4000);
  };

  const files = currentProduct?.files || [];
  const catSlug = currentProduct?.category_slug || categorySlug || currentProduct?.category_id;
  const subSlug = currentProduct?.subcategory_slug || subcategorySlug || currentProduct?.subcategory_id;

  return (
    <div className="app-container">
      <Header />

      <main className="main-content product-page-main">
        {detailLoading && !currentProduct ? (
          <LoadingSpinner text="Loading design details..." />
        ) : currentProduct ? (
          <>
            {/* Breadcrumbs with clean slugs */}
            <div className="breadcrumbs">
              <Link to="/">Home</Link>
              <span className="crumb-sep">›</span>
              <Link to="/products">Designs</Link>
              {currentProduct.category_name && (
                <>
                  <span className="crumb-sep">›</span>
                  <Link to={`/category/${catSlug}`}>
                    {currentProduct.category_name}
                  </Link>
                </>
              )}
              {currentProduct.subcategory_name && (
                <>
                  <span className="crumb-sep">›</span>
                  <Link to={`/category/${catSlug}/${subSlug}`}>
                    {currentProduct.subcategory_name}
                  </Link>
                </>
              )}
              <span className="crumb-sep">›</span>
              <span className="crumb-current">{currentProduct.name}</span>
            </div>

            {/* Main Product Layout */}
            <div className="product-details-container">
              {/* Left Column: Image Preview */}
              <div className="product-preview-col">
                <div className="product-main-image-card">
                  {currentProduct.image_url ? (
                    <img
                      src={currentProduct.image_url}
                      alt={currentProduct.name}
                      className="product-main-image"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src =
                          'https://placehold.co/800x600/f5f5f7/8a8f9a?text=Vector+Design';
                      }}
                    />
                  ) : (
                    <div className="placeholder-image large-placeholder">
                      <span className="placeholder-icon">📐</span>
                      <span className="placeholder-text">Vector Design Preview</span>
                    </div>
                  )}
                  <span className="preview-watermark">Ready for Laser &amp; CNC</span>
                </div>

                {/* Compatibility Badges */}
                <div className="compatibility-card">
                  <h4>Software &amp; Machine Compatibility</h4>
                  <div className="software-badge-list">
                    <span className="software-badge">LightBurn</span>
                    <span className="software-badge">LaserGRBL</span>
                    <span className="software-badge">AutoCAD</span>
                    <span className="software-badge">CorelDRAW</span>
                    <span className="software-badge">Illustrator</span>
                    <span className="software-badge">Fusion 360</span>
                    <span className="software-badge">CNC Routers</span>
                    <span className="software-badge">Plasma Cutters</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Info & Downloads */}
              <div className="product-details-info-col">
                <div className="product-category-badges">
                  {currentProduct.category_name && (
                    <Link
                      to={`/category/${catSlug}`}
                      className="badge-pill-cat"
                    >
                      {currentProduct.category_name}
                    </Link>
                  )}
                  {currentProduct.subcategory_name && (
                    <Link
                      to={`/category/${catSlug}/${subSlug}`}
                      className="badge-pill-sub"
                    >
                      {currentProduct.subcategory_name}
                    </Link>
                  )}
                  <span className="badge-pill-free">100% Free</span>
                </div>

                <h1 className="product-page-title">{currentProduct.name}</h1>

                <div className="product-meta-row">
                  {currentProduct.created_at && (
                    <span className="meta-item">
                      📅 Added: {formatDate(currentProduct.created_at)}
                    </span>
                  )}
                  <span className="meta-item">
                    📦 {files.length} {files.length === 1 ? 'File Format' : 'File Formats'}
                  </span>
                  <span className="meta-item">
                    ⚡ Instant Download
                  </span>
                </div>

                {/* Product Description */}
                <div className="product-description-card">
                  <h3>Description &amp; Specifications</h3>
                  {currentProduct.description ? (
                    <p className="product-desc-text">{currentProduct.description}</p>
                  ) : (
                    <p className="product-desc-text">
                      High precision vector artwork file suitable for laser cutting, CNC engraving, and plasma cutting machines. Clean vector lines with no unjoined nodes.
                    </p>
                  )}
                </div>

                {/* Download Files List */}
                <div className="downloads-section">
                  <div className="downloads-header">
                    <h3>Available Download Files</h3>
                    <span className="downloads-count">{files.length} Available</span>
                  </div>

                  {downloadSuccessMessage && (
                    <div className="download-alert-success">
                      ✓ {downloadSuccessMessage}
                    </div>
                  )}

                  {files.length > 0 ? (
                    <div className="files-list">
                      {files.map((file) => {
                        const extClass = (file.extension || '')
                          .replace('.', '')
                          .toLowerCase();

                        return (
                          <div key={file.id} className="file-row">
                            <div className="file-info-group">
                              <span className={`file-badge file-badge-${extClass}`}>
                                {formatExtension(file.extension)}
                              </span>
                              <div className="file-text-details">
                                <span className="file-name-title" title={file.file_name}>
                                  {file.file_name}
                                </span>
                                <span className="file-type-meta">
                                  {file.file_type_name} • {formatFileSize(file.file_size)}
                                </span>
                              </div>
                            </div>

                            <a
                              href={file.download_url}
                              download={file.file_name}
                              className="file-download-btn"
                              onClick={() => handleDownloadFeedback(file.file_name)}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              Download ⬇
                            </a>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="no-files-notice">
                      <p>No downloadable files are currently attached to this design.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Related Designs */}
            {relatedProducts.length > 0 && (
              <section className="related-products-section">
                <div className="section-heading">
                  <h2>Related Designs</h2>
                  <Link
                    to={`/category/${catSlug}`}
                    className="view-all-link"
                  >
                    More in {currentProduct.category_name} →
                  </Link>
                </div>

                <div className="product-grid">
                  {relatedProducts.map((p) => (
                    <ProductCard key={p.id} product={p} />
                  ))}
                </div>
              </section>
            )}
          </>
        ) : (
          <div className="empty-state-box">
            <span className="empty-icon">🔍</span>
            <h2>Product Not Found</h2>
            <p>The design you're looking for does not exist or has been removed.</p>
            <button className="btn-gradient" onClick={() => navigate('/products')}>
              Back to Catalog
            </button>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default ProductDetails;