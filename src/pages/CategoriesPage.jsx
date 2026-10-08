import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import Header from '../components/Header';
import Footer from '../components/Footer';
import LoadingSpinner from '../components/LoadingSpinner';
import { fetchCategories } from '../redux/categorySlice';
import { fetchSubcategories } from '../redux/subcategorySlice';

const CategoriesPage = () => {
  const dispatch = useDispatch();
  const { categories, loading: catLoading } = useSelector((state) => state.category);
  const { subcategories } = useSelector((state) => state.subcategory);

  useEffect(() => {
    dispatch(fetchCategories({ limit: 100 }));
    dispatch(fetchSubcategories({ limit: 100 }));
  }, [dispatch]);

  const getSubcategoriesForCategory = (catId) => {
    return subcategories.filter((s) => s.category_id === catId);
  };

  return (
    <div className="app-container">
      <Header />

      <main className="main-content">
        <div className="catalog-header">
          <div>
            <h1 className="catalog-title">Design Categories</h1>
            <p className="catalog-subtitle">
              Explore laser cut vectors and CNC designs organized by category and theme.
            </p>
          </div>
        </div>

        {catLoading && categories.length === 0 ? (
          <LoadingSpinner text="Loading categories..." />
        ) : categories.length > 0 ? (
          <div className="categories-full-grid">
            {categories.map((cat) => {
              const subs = getSubcategoriesForCategory(cat.id);
              return (
                <div key={cat.id} className="category-overview-card">
                  <div className="cat-card-header">
                    <div className="cat-card-icon">📁</div>
                    <div>
                      <h2 className="cat-card-title">
                        <Link to={`/category/${cat.slug || cat.id}`}>{cat.name}</Link>
                      </h2>
                      <span className="cat-card-count">
                        {subs.length} {subs.length === 1 ? 'Subcategory' : 'Subcategories'}
                      </span>
                    </div>
                  </div>

                  {cat.description && (
                    <p className="cat-card-desc">{cat.description}</p>
                  )}

                  {subs.length > 0 && (
                    <div className="cat-subs-list">
                      {subs.map((sub) => (
                        <Link
                          key={sub.id}
                          to={`/category/${cat.slug || cat.id}/${sub.slug || sub.id}`}
                          className="cat-sub-chip"
                        >
                          {sub.name}
                        </Link>
                      ))}
                    </div>
                  )}

                  <div className="cat-card-footer">
                    <Link
                      to={`/category/${cat.slug || cat.id}`}
                      className="cat-view-btn"
                    >
                      Browse {cat.name} →
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="empty-state-box">
            <span className="empty-icon">📂</span>
            <h3>No categories found</h3>
            <p>Categories will appear here once added from the dashboard.</p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default CategoriesPage;
