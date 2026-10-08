import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ProductCard from '../components/ProductCard';
import { SkeletonCard } from '../components/LoadingSpinner';
import SearchAutocomplete from '../components/SearchAutocomplete';
import { fetchCategories } from '../redux/categorySlice';
import { fetchProducts } from '../redux/productSlice';
import { fetchFileTypes } from '../redux/fileTypeSlice';

const Home = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { categories } = useSelector((state) => state.category);
  const { products, total: totalProducts, loading: prodLoading } = useSelector((state) => state.product);
  const { fileTypes } = useSelector((state) => state.fileType);

  const [activeFormatId, setActiveFormatId] = useState(null);

  useEffect(() => {
    dispatch(fetchCategories({ limit: 12 }));
    dispatch(fetchFileTypes());
    dispatch(fetchProducts({ page: 1, per_page: 8 }));
  }, [dispatch]);

  const handleFormatClick = (fileTypeId) => {
    setActiveFormatId(fileTypeId);
    if (fileTypeId) {
      navigate(`/products?fileTypeId=${fileTypeId}`);
    } else {
      navigate('/products');
    }
  };

  return (
    <div className="app-container">
      <Header />

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-inner">
          <div className="hero-badge">
            <span className="badge-sparkle">⚡</span> High Quality Vectors for Laser Cutting &amp; CNC
          </div>
          <h1 className="hero-title">
            Free Vectors, DXF &amp; SVG for <span>Laser Cutting</span> &amp; CNC Routers
          </h1>
          <p className="hero-subtitle">
            Download free DXF files, CorelDRAW (.cdr), SVG cut files, Adobe Illustrator (.ai), and 3D puzzle templates for laser cutters, plasma torches, and CNC routers.
          </p>

          {/* Hero Search Box with Live Autocomplete Suggestions */}
          <SearchAutocomplete
            className="hero-search-box"
            inputClassName="hero-search-input"
            buttonClassName="hero-search-submit"
            iconClassName="hero-search-icon"
            placeholder="Search design files, e.g. wall decor, cartoon duck, 3D puzzle..."
            buttonText="Find Designs"
          />

          {/* File Format Quick Filter Pills */}
          <div className="hero-format-filters">
            <span className="format-filter-label">Popular Formats:</span>
            <button
              className={`format-pill-btn ${activeFormatId === null ? 'active' : ''}`}
              onClick={() => handleFormatClick(null)}
            >
              All Formats
            </button>
            {fileTypes.map((ft) => (
              <button
                key={ft.id}
                className={`format-pill-btn ${activeFormatId === ft.id ? 'active' : ''}`}
                onClick={() => handleFormatClick(ft.id)}
              >
                {ft.extension?.replace('.', '').toUpperCase()}
              </button>
            ))}
          </div>

          {/* Live Stats */}
          <div className="hero-stats">
            <div className="hero-stat">
              <strong>{totalProducts > 0 ? `${totalProducts}+` : 'Browse'}</strong>
              <span>Ready Designs</span>
            </div>
            <div className="hero-stat-sep" />
            <div className="hero-stat">
              <strong>{categories.length > 0 ? `${categories.length}+` : '0'}</strong>
              <span>Categories</span>
            </div>
            <div className="hero-stat-sep" />
            <div className="hero-stat">
              <strong>{fileTypes.length > 0 ? `${fileTypes.length}` : '6+'}</strong>
              <span>File Formats</span>
            </div>
            <div className="hero-stat-sep" />
            <div className="hero-stat">
              <strong>100%</strong>
              <span>Free Download</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="main-content">
        {/* Categories Spotlight */}
        {categories.length > 0 && (
          <section className="home-section">
            <div className="section-heading">
              <div>
                <h2>Popular Categories</h2>
                <p className="section-subtext">Browse vector templates grouped by industry and application</p>
              </div>
              <Link to="/categories" className="view-all-link">
                View All Categories →
              </Link>
            </div>

            <div className="category-grid">
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  to={`/category/${cat.slug || cat.id}`}
                  className="category-card"
                >
                  <div className="category-card-icon">📂</div>
                  <div className="category-card-content">
                    <h3 className="category-card-title">{cat.name}</h3>
                    <span className="category-card-meta">
                      {cat.subcategories_count || 0} {cat.subcategories_count === 1 ? 'Subcategory' : 'Subcategories'}
                    </span>
                  </div>
                  <span className="category-card-arrow">›</span>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Latest Designs */}
        <section className="home-section">
          <div className="section-heading">
            <div>
              <h2>Latest Vector &amp; CNC Designs</h2>
              <p className="section-subtext">Recently added design files ready for cutting and engraving</p>
            </div>
            <Link to="/products" className="view-all-link">
              Explore All Designs →
            </Link>
          </div>

          {prodLoading && products.length === 0 ? (
            <div className="product-grid">
              {[...Array(4)].map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : products.length > 0 ? (
            <div className="product-grid">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="empty-state-box">
              <span className="empty-icon">📁</span>
              <h3>No designs found</h3>
              <p>Check back soon or explore our category directory.</p>
              <Link to="/categories" className="btn-gradient">
                Browse Categories
              </Link>
            </div>
          )}
        </section>

        {/* Features / Why Axis Designs */}
        <section className="features-banner">
          <div className="feature-item">
            <div className="feature-icon">⚙️</div>
            <div className="feature-text">
              <h4>CNC &amp; Laser Ready</h4>
              <p>Clean node paths with no overlapping or intersecting lines, optimized for CNC machines.</p>
            </div>
          </div>
          <div className="feature-item">
            <div className="feature-icon">📦</div>
            <div className="feature-text">
              <h4>Multiple File Types</h4>
              <p>Each design comes with DXF, CDR, SVG, AI, EPS, and PDF files ready for instant download.</p>
            </div>
          </div>
          <div className="feature-item">
            <div className="feature-icon">🚀</div>
            <div className="feature-text">
              <h4>Instant Downloads</h4>
              <p>Direct download links with no registration or wait timers required.</p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Home;