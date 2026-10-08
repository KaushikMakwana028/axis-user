import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ProductCard from '../components/ProductCard';
import Pagination from '../components/Pagination';
import LoadingSpinner, { SkeletonCard } from '../components/LoadingSpinner';
import { fetchCategoryDetail } from '../redux/categorySlice';
import { fetchProducts } from '../redux/productSlice';

const CategoryDetailsPage = () => {
  const { categorySlug, subcategorySlug, id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const slugOrId = categorySlug || id;

  const { currentCategory, detailLoading } = useSelector((state) => state.category);
  const { products, total, totalPages, page, loading: prodLoading } = useSelector(
    (state) => state.product
  );

  const [selectedSubId, setSelectedSubId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch category details by slug or id
  useEffect(() => {
    if (slugOrId) {
      const isNum = /^\d+$/.test(slugOrId);
      if (isNum) {
        dispatch(fetchCategoryDetail({ id: parseInt(slugOrId, 10) }));
      } else {
        dispatch(fetchCategoryDetail({ slug: slugOrId }));
      }
      setCurrentPage(1);
    }
  }, [dispatch, slugOrId]);

  // Sync subcategory selection from URL param if present
  useEffect(() => {
    if (currentCategory && currentCategory.subcategories) {
      if (subcategorySlug) {
        const found = currentCategory.subcategories.find(
          (s) => s.slug === subcategorySlug || String(s.id) === subcategorySlug
        );
        if (found) {
          setSelectedSubId(found.id);
        } else {
          setSelectedSubId(null);
        }
      } else {
        setSelectedSubId(null);
      }
    }
  }, [currentCategory, subcategorySlug]);

  // Fetch products for category and selected subcategory
  useEffect(() => {
    if (currentCategory && currentCategory.id) {
      dispatch(
        fetchProducts({
          category_id: currentCategory.id,
          subcategory_id: selectedSubId || 0,
          page: currentPage,
          per_page: 12,
        })
      );
    }
  }, [dispatch, currentCategory, selectedSubId, currentPage]);

  const catSlug = currentCategory?.slug || categorySlug || currentCategory?.id;

  const handleSubSelect = (sub) => {
    if (!sub) {
      navigate(`/category/${catSlug}`);
    } else {
      const sSlug = sub.slug || sub.id;
      navigate(`/category/${catSlug}/${sSlug}`);
    }
    setCurrentPage(1);
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 300, behavior: 'smooth' });
  };

  const subcategories = currentCategory?.subcategories || [];
  const activeSubcategory = subcategories.find((s) => s.id === selectedSubId);

  return (
    <div className="app-container">
      <Header />

      <main className="main-content">
        {/* Breadcrumbs */}
        <div className="breadcrumbs">
          <Link to="/">Home</Link>
          <span className="crumb-sep">›</span>
          <Link to="/categories">Categories</Link>
          <span className="crumb-sep">›</span>
          {activeSubcategory ? (
            <>
              <Link to={`/category/${catSlug}`}>{currentCategory?.name || 'Category'}</Link>
              <span className="crumb-sep">›</span>
              <span className="crumb-current">{activeSubcategory.name}</span>
            </>
          ) : (
            <span className="crumb-current">{currentCategory?.name || 'Category'}</span>
          )}
        </div>

        {detailLoading && !currentCategory ? (
          <LoadingSpinner text="Loading category details..." />
        ) : currentCategory ? (
          <>
            {/* Category Banner */}
            <div className="category-hero-card">
              <div className="cat-hero-left">
                <span className="cat-hero-badge">Category</span>
                <h1 className="cat-hero-title">{currentCategory.name}</h1>
                {currentCategory.description && (
                  <p className="cat-hero-desc">{currentCategory.description}</p>
                )}
                <div className="cat-hero-meta">
                  <span>
                    📂 {subcategories.length}{' '}
                    {subcategories.length === 1 ? 'Subcategory' : 'Subcategories'}
                  </span>
                  <span className="meta-sep">•</span>
                  <span>📐 {total} {total === 1 ? 'Design' : 'Designs'}</span>
                </div>
              </div>
            </div>

            {/* Subcategories Filter Chips */}
            {subcategories.length > 0 && (
              <div className="subcat-filter-section">
                <span className="subcat-filter-label">Subcategories:</span>
                <div className="subcat-chips-list">
                  <button
                    className={`subcat-chip-btn ${selectedSubId === null ? 'active' : ''}`}
                    onClick={() => handleSubSelect(null)}
                  >
                    All in {currentCategory.name}
                  </button>
                  {subcategories.map((sub) => (
                    <button
                      key={sub.id}
                      className={`subcat-chip-btn ${selectedSubId === sub.id ? 'active' : ''}`}
                      onClick={() => handleSubSelect(sub)}
                    >
                      {sub.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Product Grid */}
            <div className="category-products-section">
              <div className="section-heading">
                <h2>
                  {activeSubcategory
                    ? `${activeSubcategory.name} Designs`
                    : `Designs in ${currentCategory.name}`}
                </h2>
                <span className="results-count">
                  {total} {total === 1 ? 'design' : 'designs'}
                </span>
              </div>

              {prodLoading ? (
                <div className="product-grid">
                  {[...Array(6)].map((_, i) => (
                    <SkeletonCard key={i} />
                  ))}
                </div>
              ) : products.length > 0 ? (
                <>
                  <div className="product-grid">
                    {products.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>

                  <Pagination
                    currentPage={page}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                  />
                </>
              ) : (
                <div className="empty-state-box">
                  <span className="empty-icon">📂</span>
                  <h3>No designs found in this category</h3>
                  <p>Check back later or explore other categories.</p>
                  <Link to="/products" className="btn-gradient">
                    Browse All Designs
                  </Link>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="empty-state-box">
            <span className="empty-icon">❓</span>
            <h3>Category not found</h3>
            <p>The category you requested may have been removed or does not exist.</p>
            <Link to="/categories" className="btn-gradient">
              Back to Categories
            </Link>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default CategoryDetailsPage;
