import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Link, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCategories } from '../redux/categorySlice';
import { fetchSubcategories } from '../redux/subcategorySlice';
import SearchAutocomplete from './SearchAutocomplete';

const Header = () => {
  const location = useLocation();
  const dispatch = useDispatch();

  const { categories } = useSelector((state) => state.category);
  const { subcategories } = useSelector((state) => state.subcategory);

  const [searchTerm, setSearchTerm] = useState('');
  const [activeDropdownId, setActiveDropdownId] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileExpandedCatId, setMobileExpandedCatId] = useState(null);

  // Load categories and subcategories if not loaded
  useEffect(() => {
    if (categories.length === 0) {
      dispatch(fetchCategories({ limit: 50 }));
    }
    if (subcategories.length === 0) {
      dispatch(fetchSubcategories({ limit: 100 }));
    }
  }, [dispatch, categories.length, subcategories.length]);

  // Keep search input synced with URL query if on /products
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const q = params.get('search');
    if (q) {
      setSearchTerm(q);
    }
  }, [location.search]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (!e.target.closest('.nav-item-wrapper')) {
        setActiveDropdownId(null);
      }
    };
    document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
  }, []);

  // Close dropdown and drawer on route change
  useEffect(() => {
    setActiveDropdownId(null);
    setMobileMenuOpen(false);
  }, [location.pathname, location.search]);

  // Lock body scroll on mobile menu open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
    setMobileExpandedCatId(null);
  };

  // Group subcategories by category_id (safely comparing numbers)
  const getSubcategoriesForCategory = (categoryId) => {
    return subcategories.filter(
      (sub) => Number(sub.category_id) === Number(categoryId)
    );
  };

  // Mobile Drawer rendered via Portal to avoid any clipping/backdrop-filter issues
  const mobileDrawerElement = typeof document !== 'undefined' ? (
    <>
      <div
        className={`mobile-overlay ${mobileMenuOpen ? 'active' : ''}`}
        onClick={closeMobileMenu}
        aria-hidden="true"
      />

      <aside
        className={`mobile-drawer ${mobileMenuOpen ? 'open' : ''}`}
        aria-label="Mobile Navigation"
      >
        <div className="drawer-header">
          <Link to="/" className="brand-logo" onClick={closeMobileMenu}>
            <div className="logo-symbol">⚡</div>
            <div className="logo-text">
              <span className="logo-main">AXIS</span>
              <span className="logo-sub">DESIGNS</span>
            </div>
          </Link>
          <button
            className="drawer-close"
            onClick={closeMobileMenu}
            aria-label="Close menu"
          >
            ✕
          </button>
        </div>

        {/* Search inside mobile drawer with live suggestions */}
        <div className="drawer-search-container">
          <SearchAutocomplete
            className="drawer-search-wrapper"
            inputClassName="drawer-search-input"
            buttonClassName="drawer-search-btn"
            iconClassName="drawer-search-icon"
            placeholder="Search designs, DXF, SVG..."
            buttonText="Go"
            initialValue={searchTerm}
            onSelectResult={closeMobileMenu}
          />
        </div>

        <nav className="drawer-nav">
          <div className="drawer-nav-item">
            <Link to="/" className="drawer-nav-link" onClick={closeMobileMenu}>
              Home
            </Link>
          </div>
          <div className="drawer-nav-item">
            <Link
              to="/products"
              className="drawer-nav-link"
              onClick={closeMobileMenu}
            >
              All Designs
            </Link>
          </div>
          <div className="drawer-nav-item">
            <Link
              to="/categories"
              className="drawer-nav-link"
              onClick={closeMobileMenu}
            >
              Categories Directory
            </Link>
          </div>

          <div className="drawer-section-title">Categories</div>

          {categories.map((cat) => {
            const subs = getSubcategoriesForCategory(cat.id);
            const hasSubmenu = subs.length > 0;
            const isExpanded = mobileExpandedCatId === cat.id;
            const categorySlugOrId = cat.slug || cat.id;

            return (
              <div className="drawer-nav-item" key={cat.id}>
                <div className="drawer-nav-link-row">
                  <Link
                    to={`/category/${categorySlugOrId}`}
                    className="drawer-nav-link"
                    onClick={closeMobileMenu}
                  >
                    {cat.name}
                  </Link>
                  {hasSubmenu && (
                    <button
                      className="drawer-expand-btn"
                      onClick={() =>
                        setMobileExpandedCatId(isExpanded ? null : cat.id)
                      }
                      aria-label="Toggle subcategories"
                    >
                      <span className={`drawer-caret ${isExpanded ? 'rotated' : ''}`}>
                        ▾
                      </span>
                    </button>
                  )}
                </div>

                {hasSubmenu && isExpanded && (
                  <div className="drawer-submenu">
                    <Link
                      to={`/category/${categorySlugOrId}`}
                      className="drawer-sublink view-all-sublink"
                      onClick={closeMobileMenu}
                    >
                      All in {cat.name} →
                    </Link>
                    {subs.map((sub) => {
                      const subSlugOrId = sub.slug || sub.id;
                      return (
                        <Link
                          key={sub.id}
                          to={`/category/${categorySlugOrId}/${subSlugOrId}`}
                          className="drawer-sublink"
                          onClick={closeMobileMenu}
                        >
                          {sub.name}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </aside>
    </>
  ) : null;

  return (
    <>
      <header className="header">
        <div className="header-top">
          <button
            className="hamburger-btn"
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Open menu"
          >
            <span />
            <span />
            <span />
          </button>

          <Link to="/" className="brand-logo" onClick={closeMobileMenu}>
            <div className="logo-symbol">⚡</div>
            <div className="logo-text">
              <span className="logo-main">AXIS</span>
              <span className="logo-sub">DESIGNS</span>
            </div>
          </Link>

          <SearchAutocomplete
            className="search-wrapper"
            placeholder="Search DXF, SVG, CDR, AI laser cut files..."
            buttonText="Search"
            initialValue={searchTerm}
          />

          <div className="header-actions">
            <Link to="/products" className="header-cta-btn">
              Explore All
            </Link>
          </div>
        </div>

        {/* Mobile Search Bar Row (Under Header on Small Screens) */}
        <div className="mobile-search-row">
          <SearchAutocomplete
            className="mobile-search-form"
            inputClassName="mobile-search-input"
            buttonClassName="mobile-search-submit"
            iconClassName="search-icon"
            placeholder="Search laser designs..."
            buttonText="Search"
            initialValue={searchTerm}
          />
        </div>

        {/* Desktop Navigation */}
        <nav className="main-nav desktop-only">
          <div className="nav-item-wrapper">
            <Link
              to="/"
              className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
            >
              Home
            </Link>
          </div>

          <div className="nav-item-wrapper">
            <Link
              to="/products"
              className={`nav-link ${
                location.pathname === '/products' && !location.search ? 'active' : ''
              }`}
            >
              All Designs
            </Link>
          </div>

          <div className="nav-item-wrapper">
            <Link
              to="/categories"
              className={`nav-link ${
                location.pathname === '/categories' ? 'active' : ''
              }`}
            >
              Categories
            </Link>
          </div>

          {/* Dynamic Categories from API with Dropdown using Slug URLs */}
          {categories.map((cat) => {
            const subs = getSubcategoriesForCategory(cat.id);
            const hasSubmenu = subs.length > 0;
            const isDropdownOpen = activeDropdownId === cat.id;
            const categorySlugOrId = cat.slug || cat.id;

            return (
              <div
                key={cat.id}
                className={`nav-item-wrapper ${isDropdownOpen ? 'dropdown-active' : ''}`}
                onMouseEnter={() => {
                  if (hasSubmenu) setActiveDropdownId(cat.id);
                }}
                onMouseLeave={() => {
                  setActiveDropdownId(null);
                }}
              >
                <div className="nav-link-composite">
                  <Link
                    to={`/category/${categorySlugOrId}`}
                    className={`nav-link ${
                      location.pathname.startsWith(`/category/${categorySlugOrId}`)
                        ? 'active'
                        : ''
                    }`}
                    onClick={() => setActiveDropdownId(null)}
                  >
                    {cat.name}
                  </Link>

                  {hasSubmenu && (
                    <button
                      type="button"
                      className={`dropdown-caret-btn ${isDropdownOpen ? 'open' : ''}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveDropdownId((prev) => (prev === cat.id ? null : cat.id));
                      }}
                      aria-label={`Toggle ${cat.name} dropdown`}
                      aria-expanded={isDropdownOpen}
                    >
                      ▾
                    </button>
                  )}
                </div>

                {hasSubmenu && isDropdownOpen && (
                  <div
                    className="mega-menu"
                    onMouseEnter={() => setActiveDropdownId(cat.id)}
                    onMouseLeave={() => setActiveDropdownId(null)}
                  >
                    <div className="mega-menu-header">
                      <h4>{cat.name}</h4>
                      <Link
                        to={`/category/${categorySlugOrId}`}
                        className="mega-menu-view-all"
                        onClick={() => setActiveDropdownId(null)}
                      >
                        All in {cat.name} →
                      </Link>
                    </div>
                    <div className="mega-menu-grid">
                      {subs.map((sub) => {
                        const subSlugOrId = sub.slug || sub.id;
                        return (
                          <Link
                            key={sub.id}
                            to={`/category/${categorySlugOrId}/${subSlugOrId}`}
                            className="mega-menu-item"
                            onClick={() => setActiveDropdownId(null)}
                          >
                            <span className="mega-menu-item-bullet">•</span>
                            <span className="mega-menu-item-name">{sub.name}</span>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </header>

      {/* Portal Drawer to Body */}
      {mobileDrawerElement && createPortal(mobileDrawerElement, document.body)}
    </>
  );
};

export default Header;