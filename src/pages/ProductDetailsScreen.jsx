import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import ProductCard from '../components/ProductCard';
import { products } from '../data/products';

// Generates dummy per-format file sizes derived from the product's base size
const buildFormatDetails = (formats, fileSize) => {
    const match = fileSize.match(/([\d.]+)\s*([A-Za-z]+)/);
    const base = match ? parseFloat(match[1]) : 1;
    const unit = match ? match[2] : 'MB';

    return formats.split(',').map((f, idx) => {
        const size = (base * (0.55 + idx * 0.13)).toFixed(1);
        return { ext: f.trim(), size: `${size} ${unit}` };
    });
};

const ProductDetailsScreen = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const product = products.find((p) => p.id === Number(id));

    const [activeImage, setActiveImage] = useState(0);
    const [downloadedFormat, setDownloadedFormat] = useState(null);

    useEffect(() => {
        window.scrollTo(0, 0);
        setActiveImage(0);
        setDownloadedFormat(null);
    }, [id]);

    if (!product) {
        return (
            <div className="app-container">
                <Header />
                <main className="main-content">
                    <div className="not-found">
                        <span className="not-found-icon">🔍</span>
                        <h2>Product not found</h2>
                        <p>The item you're looking for doesn't exist or has been removed.</p>
                        <button className="btn-gradient" onClick={() => navigate('/')}>
                            Back to Home
                        </button>
                    </div>
                </main>
                <ProductDetailsStyles />
            </div>
        );
    }

    const relatedProducts = products
        .filter((p) => p.category === product.category && p.id !== product.id)
        .slice(0, 4);

    const formatDetails = buildFormatDetails(product.formats, product.fileSize);

    const handleDownload = (ext) => {
        // Dummy download handler — wire up to a real file endpoint later
        setDownloadedFormat(ext);
        setTimeout(() => setDownloadedFormat(null), 2000);
    };

    return (
        <div className="app-container">
            <Header />

            <main className="main-content">
                <div className="breadcrumbs">
                    <Link to="/">Home</Link>
                    <span className="crumb-sep">›</span>
                    <span>{product.category}</span>
                    {product.subcategory && (
                        <>
                            <span className="crumb-sep">›</span>
                            <span>{product.subcategory}</span>
                        </>
                    )}
                    <span className="crumb-sep">›</span>
                    <span className="crumb-current">{product.title}</span>
                </div>

                <div className="details-layout">
                    {/* LEFT: Gallery */}
                    <div className="gallery-section">
                        <div className="gallery-main">
                            <span className="gallery-counter">{activeImage + 1} / {product.images.length}</span>
                            <img src={product.images[activeImage]} alt={product.title} />
                        </div>
                        <div className="gallery-thumbs">
                            {product.images.map((img, idx) => (
                                <button
                                    key={idx}
                                    className={`thumb-btn ${activeImage === idx ? 'active' : ''}`}
                                    onClick={() => setActiveImage(idx)}
                                    aria-label={`View image ${idx + 1}`}
                                >
                                    <img src={img} alt={`${product.title} ${idx + 1}`} />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* RIGHT: Info */}
                    <div className="info-section">
                        <div className="pill-row">
                            <span className="category-pill">{product.category}</span>
                            {product.subcategory && (
                                <span className="category-pill subtle">{product.subcategory}</span>
                            )}
                        </div>

                        <h1 className="product-title">{product.title}</h1>

                        <p className="product-description">{product.description}</p>

                        <div className="specs-grid">
                            <div className="spec-card">
                                <span className="spec-icon">📦</span>
                                <div>
                                    <span className="spec-label">Total Size</span>
                                    <span className="spec-value">{product.fileSize}</span>
                                </div>
                            </div>
                            <div className="spec-card">
                                <span className="spec-icon">📅</span>
                                <div>
                                    <span className="spec-label">Published</span>
                                    <span className="spec-value">{product.dateAdded}</span>
                                </div>
                            </div>
                            <div className="spec-card">
                                <span className="spec-icon">🏷️</span>
                                <div>
                                    <span className="spec-label">Category</span>
                                    <span className="spec-value">{product.category}</span>
                                </div>
                            </div>
                            <div className="spec-card">
                                <span className="spec-icon">⚖️</span>
                                <div>
                                    <span className="spec-label">License</span>
                                    <span className="spec-value">Free Commercial Use</span>
                                </div>
                            </div>
                        </div>

                        {/* Per-format downloads */}
                        <div className="download-block">
                            <h4>Download Files</h4>
                            <div className="download-list">
                                {formatDetails.map(({ ext, size }) => (
                                    <div className="download-row" key={ext}>
                                        <div className="download-row-left">
                                            <span className="file-ext-icon">{ext}</span>
                                            <div>
                                                <span className="download-ext-name">.{ext.toLowerCase()} file</span>
                                                <span className="download-ext-size">{size}</span>
                                            </div>
                                        </div>
                                        <button
                                            className={`btn-download-sm ${downloadedFormat === ext ? 'done' : ''}`}
                                            onClick={() => handleDownload(ext)}
                                        >
                                            {downloadedFormat === ext ? '✓ Downloaded' : '⬇ Download'}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="trust-strip">
                            <span>✅ Commercial License</span>
                            <span>⚡ Instant Download</span>
                            <span>🎯 High Quality Vector</span>
                        </div>

                        <div className="tags-block">
                            {product.tags.map((tag) => (
                                <span key={tag} className="tag-chip">#{tag}</span>
                            ))}
                        </div>
                    </div>
                </div>

                {relatedProducts.length > 0 && (
                    <section className="related-section">
                        <div className="section-heading">
                            <h2>You may also like</h2>
                            <Link to="/" className="view-all">Browse All →</Link>
                        </div>
                        <div className="product-grid">
                            {relatedProducts.map((p) => (
                                <ProductCard key={p.id} product={p} />
                            ))}
                        </div>
                    </section>
                )}
            </main>

            <ProductDetailsStyles />
        </div>
    );
};

const ProductDetailsStyles = () => (
    <style>{`
        .breadcrumbs {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12.5px;
          color: var(--text-muted);
          margin-bottom: 28px;
          flex-wrap: wrap;
        }

        .breadcrumbs a { color: var(--text-muted); transition: var(--transition); }
        .breadcrumbs a:hover { color: var(--primary); }
        .crumb-sep { color: #ccc; }
        .crumb-current { color: var(--text-dark); font-weight: 500; }

        .details-layout {
          display: grid;
          grid-template-columns: 1.15fr 1fr;
          gap: 56px;
          margin-bottom: 72px;
          align-items: start;
        }

        /* --- Gallery --- */
        .gallery-section { display: flex; flex-direction: column; gap: 16px; }

        .gallery-main {
          position: relative;
          width: 100%;
          aspect-ratio: 1 / 1;
          background: var(--bg-soft);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .gallery-main img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          padding: 30px;
          transition: transform 0.3s ease;
        }

        .gallery-main:hover img { transform: scale(1.05); }

        .gallery-counter {
          position: absolute;
          top: 14px;
          right: 14px;
          background: rgba(26, 26, 26, 0.75);
          color: #fff;
          font-size: 11px;
          font-weight: 600;
          padding: 4px 10px;
          border-radius: 20px;
          backdrop-filter: blur(4px);
        }

        .gallery-thumbs { display: flex; gap: 12px; flex-wrap: wrap; }

        .thumb-btn {
          width: 76px;
          height: 76px;
          border-radius: var(--radius-sm);
          border: 2px solid var(--border);
          background: var(--bg-soft);
          padding: 6px;
          overflow: hidden;
          transition: var(--transition);
        }

        .thumb-btn img { width: 100%; height: 100%; object-fit: contain; }
        .thumb-btn:hover { border-color: var(--primary); }
        .thumb-btn.active { border-color: var(--primary); box-shadow: 0 0 0 4px var(--primary-light); }

        /* --- Info section (sticky) --- */
        .info-section {
          display: flex;
          flex-direction: column;
          gap: 18px;
          position: sticky;
          top: 104px;
          align-self: start;
        }

        .pill-row { display: flex; gap: 8px; flex-wrap: wrap; }

        .category-pill {
          align-self: flex-start;
          background: var(--primary-light);
          color: var(--primary-dark);
          font-size: 11.5px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          padding: 6px 16px;
          border-radius: 20px;
        }

        .category-pill.subtle {
          background: var(--bg-soft);
          color: var(--text-muted);
        }

        .product-title {
          font-size: 28px;
          font-weight: 700;
          color: var(--text-dark);
          line-height: 1.3;
          letter-spacing: -0.4px;
        }

        .product-description {
          font-size: 13.5px;
          line-height: 1.85;
          color: var(--text-body);
          padding-bottom: 4px;
          border-bottom: 1px solid var(--border);
        }

        .specs-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px;
          padding: 18px 0;
          border-bottom: 1px solid var(--border);
        }

        .spec-card { display: flex; align-items: center; gap: 12px; }

        .spec-icon {
          width: 38px;
          height: 38px;
          border-radius: 10px;
          background: var(--bg-soft);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          flex-shrink: 0;
        }

        .spec-label {
          display: block;
          font-size: 10.5px;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.3px;
        }

        .spec-value {
          display: block;
          font-size: 13px;
          font-weight: 600;
          color: var(--text-dark);
          margin-top: 2px;
        }

        /* --- Per-format download list --- */
        .download-block h4 {
          font-size: 13px;
          font-weight: 700;
          color: var(--text-dark);
          margin-bottom: 12px;
        }

        .download-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .download-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          border: 1px solid var(--border);
          border-radius: var(--radius);
          padding: 12px 14px;
          transition: var(--transition);
        }

        .download-row:hover {
          border-color: var(--primary);
          background: var(--primary-light);
        }

        .download-row-left {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .file-ext-icon {
          width: 42px;
          height: 42px;
          border-radius: 10px;
          background: var(--primary-gradient);
          color: #fff;
          font-size: 10px;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          letter-spacing: 0.3px;
          flex-shrink: 0;
        }

        .download-ext-name {
          display: block;
          font-size: 13px;
          font-weight: 600;
          color: var(--text-dark);
        }

        .download-ext-size {
          display: block;
          font-size: 11px;
          color: var(--text-muted);
          margin-top: 2px;
        }

        .btn-download-sm {
          font-size: 12px;
          font-weight: 600;
          color: #fff;
          background: var(--primary-gradient);
          padding: 9px 16px;
          border-radius: 50px;
          white-space: nowrap;
          transition: var(--transition);
          flex-shrink: 0;
        }

        .btn-download-sm:hover {
          box-shadow: 0 6px 16px rgba(255, 107, 53, 0.35);
          transform: translateY(-1px);
        }

        .btn-download-sm.done {
          background: #2fb866;
        }

        .trust-strip {
          display: flex;
          flex-wrap: wrap;
          gap: 16px;
          font-size: 11.5px;
          color: var(--text-muted);
          background: var(--bg-soft);
          padding: 14px 16px;
          border-radius: var(--radius);
        }

        .tags-block { display: flex; flex-wrap: wrap; gap: 8px; }

        .tag-chip {
          font-size: 11.5px;
          color: var(--text-muted);
          background: var(--bg-soft);
          padding: 6px 14px;
          border-radius: 20px;
          transition: var(--transition);
          cursor: pointer;
        }

        .tag-chip:hover { background: var(--primary-light); color: var(--primary); }

        .related-section { padding-top: 36px; border-top: 1px solid var(--border); }

        /* --- Not found --- */
        .not-found { text-align: center; padding: 100px 20px; }
        .not-found-icon { font-size: 40px; display: block; margin-bottom: 16px; }
        .not-found h2 { font-size: 22px; margin-bottom: 10px; color: var(--text-dark); }
        .not-found p { color: var(--text-muted); margin-bottom: 24px; }
        .not-found .btn-gradient { display: inline-block; }

        /* --- Responsive --- */
        @media (max-width: 900px) {
          .details-layout { grid-template-columns: 1fr; gap: 32px; }
          .info-section { position: static; }
          .product-title { font-size: 21px; }
        }

        @media (max-width: 480px) {
          .download-row { flex-direction: column; align-items: flex-start; gap: 10px; }
          .btn-download-sm { width: 100%; text-align: center; }
        }
    `}</style>
);

export default ProductDetailsScreen;