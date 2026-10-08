import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import productService from '../services/productService';
import { formatExtension } from '../utils/formatters';

const SearchAutocomplete = ({
  placeholder = 'Search DXF, SVG, CDR, AI laser cut files...',
  buttonText = 'Search',
  className = 'search-wrapper',
  inputClassName = '',
  buttonClassName = 'search-btn',
  iconClassName = 'search-icon',
  initialValue = '',
  onSelectResult,
}) => {
  const navigate = useNavigate();
  const wrapperRef = useRef(null);

  const { categories } = useSelector((state) => state.category);

  const [query, setQuery] = useState(initialValue || '');
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [productResults, setProductResults] = useState([]);
  const [totalFound, setTotalFound] = useState(0);

  // Sync initialValue changes (e.g. from URL search param)
  useEffect(() => {
    if (initialValue !== undefined) {
      setQuery(initialValue);
    }
  }, [initialValue]);

  // Debounce API calls for suggestions
  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setProductResults([]);
      setTotalFound(0);
      setLoading(false);
      return;
    }

    setLoading(true);
    const timer = setTimeout(() => {
      productService
        .getProductList({ search: trimmed, per_page: 5 })
        .then((res) => {
          if (res?.status && res?.data) {
            setProductResults(res.data.products || []);
            setTotalFound(res.data.total || 0);
          } else {
            setProductResults([]);
            setTotalFound(0);
          }
        })
        .catch(() => {
          setProductResults([]);
          setTotalFound(0);
        })
        .finally(() => {
          setLoading(false);
        });
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  // Close suggestions on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter matching categories from Redux
  const trimmed = query.trim().toLowerCase();
  const matchedCategories = trimmed.length >= 2
    ? categories.filter((c) => c.name.toLowerCase().includes(trimmed)).slice(0, 3)
    : [];

  const showSuggestions = isOpen && trimmed.length >= 2;

  const handleSubmit = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (trimmed) {
      setIsOpen(false);
      if (onSelectResult) onSelectResult();
      navigate(`/products?search=${encodeURIComponent(trimmed)}`);
    }
  };

  const handleSelectProduct = (product) => {
    setIsOpen(false);
    if (onSelectResult) onSelectResult();
    const url =
      product.category_slug && product.subcategory_slug && product.slug
        ? `/${product.category_slug}/${product.subcategory_slug}/${product.slug}`
        : product.slug
        ? `/product/${product.slug}`
        : `/product/${product.id}`;
    navigate(url);
  };

  const handleSelectCategory = (cat) => {
    setIsOpen(false);
    if (onSelectResult) onSelectResult();
    navigate(`/category/${cat.slug || cat.id}`);
  };

  return (
    <div className={`search-autocomplete-container ${className}`} ref={wrapperRef}>
      <form onSubmit={handleSubmit} className="search-form-inner">
        <span className={iconClassName}>🔍</span>
        <input
          type="text"
          className={inputClassName}
          placeholder={placeholder}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => {
            if (trimmed.length >= 2) setIsOpen(true);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Escape') setIsOpen(false);
          }}
          autoComplete="off"
        />

        {query && (
          <button
            type="button"
            className="search-clear-btn"
            onClick={() => {
              setQuery('');
              setProductResults([]);
              setIsOpen(false);
            }}
            aria-label="Clear query"
          >
            ✕
          </button>
        )}

        <button type="submit" className={buttonClassName}>
          {buttonText}
        </button>
      </form>

      {/* Autocomplete Dropdown Popup */}
      {showSuggestions && (
        <div className="autocomplete-dropdown">
          {loading && (
            <div className="autocomplete-loading">
              <span className="mini-spinner" />
              <span>Searching designs...</span>
            </div>
          )}

          {/* Matched Categories */}
          {matchedCategories.length > 0 && (
            <div className="autocomplete-section">
              <div className="autocomplete-section-title">Categories</div>
              <div className="autocomplete-categories-row">
                {matchedCategories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    className="autocomplete-cat-pill"
                    onClick={() => handleSelectCategory(cat)}
                  >
                    📂 {cat.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Matched Products */}
          {productResults.length > 0 ? (
            <div className="autocomplete-section">
              <div className="autocomplete-section-title">Design Files</div>
              <div className="autocomplete-results-list">
                {productResults.map((product) => {
                  const fileTypes = product.available_file_types || product.files || [];
                  return (
                    <div
                      key={product.id}
                      className="autocomplete-item"
                      onClick={() => handleSelectProduct(product)}
                      role="button"
                      tabIndex={0}
                    >
                      <div className="autocomplete-item-thumb">
                        {product.image_url ? (
                          <img
                            src={product.image_url}
                            alt={product.name}
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src =
                                'https://placehold.co/100x100/f5f5f7/8a8f9a?text=Vector';
                            }}
                          />
                        ) : (
                          <span className="autocomplete-thumb-icon">📐</span>
                        )}
                      </div>

                      <div className="autocomplete-item-info">
                        <span className="autocomplete-item-title">
                          {product.name}
                        </span>
                        <div className="autocomplete-item-meta">
                          {product.category_name && (
                            <span className="autocomplete-meta-badge">
                              {product.category_name}
                            </span>
                          )}
                          {fileTypes.slice(0, 4).map((ft, idx) => (
                            <span key={ft.id || idx} className="autocomplete-format-pill">
                              {formatExtension(ft.extension)}
                            </span>
                          ))}
                        </div>
                      </div>
                      <span className="autocomplete-arrow">›</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            !loading && matchedCategories.length === 0 && (
              <div className="autocomplete-empty">
                <span className="autocomplete-empty-icon">🔍</span>
                <p>No designs matching "{query}"</p>
                <span className="autocomplete-empty-tip">
                  Try searching for keywords like "wood", "duck", "decor", or "3d"
                </span>
              </div>
            )
          )}

          {/* Dropdown Footer: View All Results */}
          <div className="autocomplete-footer">
            <button
              type="button"
              className="autocomplete-view-all-btn"
              onClick={handleSubmit}
            >
              <span>View all results for <strong>"{query}"</strong></span>
              {totalFound > 0 && (
                <span className="autocomplete-total-badge">
                  {totalFound} {totalFound === 1 ? 'result' : 'results'}
                </span>
              )}
              <span className="autocomplete-view-arrow">→</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchAutocomplete;
