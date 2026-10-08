import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ProductCard from '../components/ProductCard';
import Pagination from '../components/Pagination';
import { SkeletonCard } from '../components/LoadingSpinner';
import { fetchProducts } from '../redux/productSlice';
import { fetchCategories } from '../redux/categorySlice';
import { fetchSubcategories } from '../redux/subcategorySlice';
import { fetchFileTypes } from '../redux/fileTypeSlice';

const ProductsPage = () => {
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();

  // Read URL query parameters (supporting both slug and id parameters)
  const querySearch = searchParams.get('search') || '';
  const queryCategoryParam = searchParams.get('category') || searchParams.get('categoryId') || '';
  const querySubcategoryParam = searchParams.get('subcategory') || searchParams.get('subcategoryId') || '';
  const queryFileTypeId = searchParams.get('fileTypeId') || '';
  const queryPage = parseInt(searchParams.get('page') || '1', 10);

  // Redux state
  const { products, total, totalPages, page, loading } = useSelector(
    (state) => state.product
  );
  const { categories } = useSelector((state) => state.category);
  const { subcategories } = useSelector((state) => state.subcategory);
  const { fileTypes } = useSelector((state) => state.fileType);

  // Local search input state
  const [searchInput, setSearchInput] = useState(querySearch);

  // Load taxonomy data if not yet loaded
  useEffect(() => {
    if (categories.length === 0) dispatch(fetchCategories({ limit: 100 }));
    if (subcategories.length === 0) dispatch(fetchSubcategories({ limit: 100 }));
    if (fileTypes.length === 0) dispatch(fetchFileTypes());
  }, [dispatch, categories.length, subcategories.length, fileTypes.length]);

  // Keep searchInput synced when URL search parameter changes
  useEffect(() => {
    setSearchInput(querySearch);
  }, [querySearch]);

  // Resolve matching category & subcategory objects
  const activeCategory = categories.find(
    (c) => String(c.id) === queryCategoryParam || c.slug === queryCategoryParam
  );
  const activeSubcategory = subcategories.find(
    (s) => String(s.id) === querySubcategoryParam || s.slug === querySubcategoryParam
  );
  const activeFileType = fileTypes.find((f) => String(f.id) === queryFileTypeId);

  // Fetch products whenever search params change
  const loadProducts = useCallback(() => {
    const params = {
      page: queryPage,
      per_page: 12,
      search: querySearch,
      category_id: activeCategory ? activeCategory.id : (parseInt(queryCategoryParam, 10) || 0),
      category_slug: activeCategory ? activeCategory.slug : (!parseInt(queryCategoryParam, 10) ? queryCategoryParam : ''),
      subcategory_id: activeSubcategory ? activeSubcategory.id : (parseInt(querySubcategoryParam, 10) || 0),
      subcategory_slug: activeSubcategory ? activeSubcategory.slug : (!parseInt(querySubcategoryParam, 10) ? querySubcategoryParam : ''),
      file_type_id: queryFileTypeId ? parseInt(queryFileTypeId, 10) : 0,
    };
    dispatch(fetchProducts(params));
  }, [dispatch, queryPage, querySearch, activeCategory, activeSubcategory, queryCategoryParam, querySubcategoryParam, queryFileTypeId]);

  useEffect(() => {
    loadProducts();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [loadProducts]);

  // Update query params helper
  const updateParam = (key, value) => {
    const nextParams = new URLSearchParams(searchParams);
    if (value) {
      nextParams.set(key, value);
    } else {
      nextParams.delete(key);
    }
    // Clean legacy id params if using slug params
    if (key === 'category') nextParams.delete('categoryId');
    if (key === 'subcategory') nextParams.delete('subcategoryId');

    if (key !== 'page') {
      nextParams.set('page', '1');
    }
    if (key === 'category') {
      nextParams.delete('subcategory');
      nextParams.delete('subcategoryId');
    }
    setSearchParams(nextParams);
  };

  // Filter subcategories for the selected category dropdown
  const filteredSubcategories = activeCategory
    ? subcategories.filter((s) => s.category_id === activeCategory.id)
    : subcategories;

  // Clear all filters
  const handleClearFilters = () => {
    setSearchInput('');
    setSearchParams({});
  };

  const handleSearchSubmit = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    updateParam('search', searchInput.trim());
  };

  const handlePageChange = (newPage) => {
    updateParam('page', newPage.toString());
  };

  const hasActiveFilters = Boolean(
    querySearch || queryCategoryParam || querySubcategoryParam || queryFileTypeId
  );

  return (
    <div className="app-container">
      <Header />

      <main className="main-content">
        <div className="catalog-header">
          <div>
            <h1 className="catalog-title">Vector &amp; CNC Design Catalog</h1>
            <p className="catalog-subtitle">
              Browse through our collection of free cutting templates, vectors, and CNC plans.
            </p>
          </div>
        </div>

        {/* Filters Bar */}
        <div className="filters-bar">
          <form className="filter-search-box" onSubmit={handleSearchSubmit}>
            <span className="filter-search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search by name or keyword..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
            {searchInput && (
              <button
                type="button"
                className="filter-search-clear"
                onClick={() => {
                  setSearchInput('');
                  updateParam('search', '');
                }}
              >
                ✕
              </button>
            )}
            <button
              type="submit"
              className="filter-search-submit"
              onClick={handleSearchSubmit}
            >
              Filter
            </button>
          </form>

          <div className="filter-selects-row">
            {/* Category Select using slug */}
            <div className="select-wrapper">
              <label htmlFor="category-select" className="sr-only">Category</label>
              <select
                id="category-select"
                value={activeCategory ? (activeCategory.slug || activeCategory.id) : ''}
                onChange={(e) => updateParam('category', e.target.value)}
                className="filter-select"
              >
                <option value="">All Categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.slug || c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Subcategory Select using slug */}
            <div className="select-wrapper">
              <label htmlFor="subcategory-select" className="sr-only">Subcategory</label>
              <select
                id="subcategory-select"
                value={activeSubcategory ? (activeSubcategory.slug || activeSubcategory.id) : ''}
                onChange={(e) => updateParam('subcategory', e.target.value)}
                className="filter-select"
                disabled={filteredSubcategories.length === 0}
              >
                <option value="">
                  {activeCategory ? 'All Subcategories' : 'Select Subcategory'}
                </option>
                {filteredSubcategories.map((s) => (
                  <option key={s.id} value={s.slug || s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            {/* File Type Select */}
            <div className="select-wrapper">
              <label htmlFor="file-type-select" className="sr-only">File Format</label>
              <select
                id="file-type-select"
                value={queryFileTypeId}
                onChange={(e) => updateParam('fileTypeId', e.target.value)}
                className="filter-select"
              >
                <option value="">All Formats (DXF, SVG...)</option>
                {fileTypes.map((ft) => (
                  <option key={ft.id} value={ft.id}>
                    {ft.extension?.replace('.', '').toUpperCase()} — {ft.name}
                  </option>
                ))}
              </select>
            </div>

            {hasActiveFilters && (
              <button
                className="reset-filters-btn"
                onClick={handleClearFilters}
                title="Reset all filters"
              >
                Reset All ✕
              </button>
            )}
          </div>
        </div>

        {/* Active Filter Tags */}
        {hasActiveFilters && (
          <div className="active-filters-row">
            <span className="active-filters-label">Active Filters:</span>
            {querySearch && (
              <span className="active-filter-tag">
                Query: "{querySearch}"
                <button onClick={() => updateParam('search', '')}>✕</button>
              </span>
            )}
            {activeCategory && (
              <span className="active-filter-tag">
                Category: {activeCategory.name}
                <button onClick={() => updateParam('category', '')}>✕</button>
              </span>
            )}
            {activeSubcategory && (
              <span className="active-filter-tag">
                Subcategory: {activeSubcategory.name}
                <button onClick={() => updateParam('subcategory', '')}>✕</button>
              </span>
            )}
            {activeFileType && (
              <span className="active-filter-tag">
                Format: {activeFileType.extension?.replace('.', '').toUpperCase()}
                <button onClick={() => updateParam('fileTypeId', '')}>✕</button>
              </span>
            )}
            <button className="clear-all-text-btn" onClick={handleClearFilters}>
              Clear all
            </button>
          </div>
        )}

        {/* Results Bar */}
        <div className="results-status-bar">
          <span className="results-count">
            Found <strong>{total}</strong> {total === 1 ? 'design' : 'designs'}
          </span>
          {totalPages > 1 && (
            <span className="results-page-indicator">
              Page {page} of {totalPages}
            </span>
          )}
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="product-grid">
            {[...Array(8)].map((_, i) => (
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
            <span className="empty-icon">🔍</span>
            <h3>No designs matched your criteria</h3>
            <p>
              Try adjusting your search query, selecting a different category, or resetting all filters.
            </p>
            <button className="btn-gradient" onClick={handleClearFilters}>
              Reset Filters
            </button>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default ProductsPage;
