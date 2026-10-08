import React, { useState, useEffect } from 'react';

const megaMenuData = {
    "3D Puzzle": [
        { title: "Animals", items: ["3D Puzzle", "3D Animal Puzzle", "Animal Trophy Heads", "Bee 3D Puzzle", "Dinosaur", "Deer", "Spider", "Horse", "Fish", "Elephant"] },
        { title: "Vehicles", items: ["Vehicles", "Car", "Jeep", "Train", "Trucks", "Bicycle", "Motorcycle"] },
        { title: "More", items: ["Airplane", "Helicopter", "Tank", "Ship", "Rocket"] }
    ],
    "Laser Cut": [
        { title: "Materials", items: ["Wood", "Acrylic", "MDF", "Plywood", "Leather"] },
        { title: "Decor", items: ["Wall Art", "Clocks", "Lamps", "Holders"] }
    ],
    "Boxes": [
        { title: "Types", items: ["Gift Boxes", "Jewelry Boxes", "Storage Boxes", "Puzzle Boxes"] },
        { title: "Shapes", items: ["Square", "Round", "Heart", "Hexagon"] }
    ]
};

const navItems = [
    "Laser Cut", "Tools", "File formats", "3D Puzzle", "Boxes",
    "Wood Cutouts", "Decor", "Events & Occasions", "Kids",
    "Office", "Jewelry", "Library", "Fonts"
];

const Header = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [hoveredCategory, setHoveredCategory] = useState(null);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [mobileExpanded, setMobileExpanded] = useState(null);

    useEffect(() => {
        document.body.style.overflow = mobileMenuOpen ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [mobileMenuOpen]);

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth > 768) {
                setMobileMenuOpen(false);
                setMobileExpanded(null);
            }
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const closeMobileMenu = () => {
        setMobileMenuOpen(false);
        setMobileExpanded(null);
    };

    return (
        <header className="header">
            <div className="header-top">
                <button
                    className="hamburger-btn"
                    onClick={() => setMobileMenuOpen(true)}
                    aria-label="Open menu"
                >
                    <span /><span /><span />
                </button>

                <div className="search-wrapper">
                    <span className="search-icon">🔍</span>
                    <input
                        type="text"
                        placeholder="Search for free vectors, DXF, SVG..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <button className="search-btn">Search</button>
                </div>

                <div className="header-actions">
                    <button className="btn-gradient">Sign In</button>
                </div>
            </div>

            {/* Desktop nav */}
            <nav className="main-nav desktop-only">
                {navItems.map((item) => {
                    const hasSubmenu = !!megaMenuData[item];
                    return (
                        <div
                            key={item}
                            className="nav-item-wrapper"
                            onMouseEnter={() => setHoveredCategory(item)}
                            onMouseLeave={() => setHoveredCategory(null)}
                        >
                            <a
                                href="#/"
                                className="nav-link"
                                onClick={(e) => e.preventDefault()}
                                aria-haspopup={hasSubmenu}
                                aria-expanded={hoveredCategory === item}
                            >
                                {item}
                            </a>

                            {hoveredCategory === item && hasSubmenu && (
                                <div className="mega-menu">
                                    {megaMenuData[item].map((column, idx) => (
                                        <div key={idx} className="mega-menu-column">
                                            <h4 className="mega-menu-title">{column.title}</h4>
                                            <ul className="mega-menu-list">
                                                {column.items.map((subItem, sIdx) => (
                                                    <li key={sIdx}>
                                                        <a
                                                            href="#/"
                                                            className="mega-menu-link"
                                                            onClick={(e) => e.preventDefault()}
                                                        >
                                                            {subItem}
                                                        </a>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    );
                })}
            </nav>

            {/* Mobile overlay */}
            <div
                className={`mobile-overlay ${mobileMenuOpen ? 'active' : ''}`}
                onClick={closeMobileMenu}
            />

            {/* Mobile drawer */}
            <aside className={`mobile-drawer ${mobileMenuOpen ? 'open' : ''}`}>
                <div className="drawer-header">
                    <span className="drawer-title">Menu</span>
                    <button className="drawer-close" onClick={closeMobileMenu} aria-label="Close menu">✕</button>
                </div>

                <nav className="drawer-nav">
                    {navItems.map((item) => {
                        const hasSubmenu = !!megaMenuData[item];
                        const isExpanded = mobileExpanded === item;
                        return (
                            <div className="drawer-nav-item" key={item}>
                                <div
                                    className="drawer-nav-link-row"
                                    onClick={() =>
                                        hasSubmenu
                                            ? setMobileExpanded(isExpanded ? null : item)
                                            : closeMobileMenu()
                                    }
                                >
                                    {hasSubmenu ? (
                                        <span className="drawer-nav-link">{item}</span>
                                    ) : (
                                        <a href="#/" className="drawer-nav-link" onClick={(e) => { e.preventDefault(); closeMobileMenu(); }}>{item}</a>
                                    )}
                                    {hasSubmenu && (
                                        <span className={`drawer-caret ${isExpanded ? 'rotated' : ''}`}>▾</span>
                                    )}
                                </div>

                                {hasSubmenu && isExpanded && (
                                    <div className="drawer-submenu">
                                        {megaMenuData[item].map((col, idx) => (
                                            <div key={idx} className="drawer-submenu-col">
                                                <h5>{col.title}</h5>
                                                <ul>
                                                    {col.items.map((sub, sIdx) => (
                                                        <li key={sIdx}>
                                                            <a href="#/" onClick={(e) => { e.preventDefault(); closeMobileMenu(); }}>{sub}</a>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })}

                    <div className="drawer-footer">
                        <button className="btn-gradient full">Sign In</button>
                    </div>
                </nav>
            </aside>

            <HeaderStyles />
        </header>
    );
};

const HeaderStyles = () => (
    <style>{`
        .header {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 16px 32px 0;
          background: rgba(255,255,255,0.92);
          backdrop-filter: blur(10px);
          position: sticky;
          top: 0;
          z-index: 200;
          border-bottom: 1px solid var(--border);
        }

        .header-top {
          display: flex;
          align-items: center;
          gap: 24px;
          width: 100%;
          max-width: 1320px;
          margin-bottom: 14px;
        }

        /* --- Hamburger --- */
        .hamburger-btn {
          display: none;
          flex-direction: column;
          justify-content: center;
          gap: 5px;
          width: 34px;
          height: 34px;
          padding: 0;
          flex-shrink: 0;
        }

        .hamburger-btn span {
          display: block;
          width: 100%;
          height: 2px;
          background: var(--text-dark);
          border-radius: 2px;
        }

        /* --- Search --- */
        .search-wrapper {
          position: relative;
          flex: 1;
          max-width: 760px;
        }

        .search-wrapper input {
          width: 100%;
          padding: 12px 108px 12px 44px;
          border-radius: 50px;
          border: 1.5px solid var(--border);
          background-color: var(--bg-soft);
          font-family: 'Poppins', sans-serif;
          font-size: 13.5px;
          outline: none;
          transition: var(--transition);
        }

        .search-wrapper input:focus {
          background-color: #fff;
          border-color: var(--primary);
          box-shadow: 0 0 0 4px var(--primary-light);
        }

        .search-icon {
          position: absolute;
          left: 17px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-muted);
          font-size: 14px;
          pointer-events: none;
        }

        .search-btn {
          position: absolute;
          right: 5px;
          top: 50%;
          transform: translateY(-50%);
          background: var(--primary-gradient);
          color: #fff;
          font-size: 12px;
          font-weight: 600;
          padding: 9px 18px;
          border-radius: 50px;
          transition: var(--transition);
        }

        .search-btn:hover {
          box-shadow: 0 6px 16px rgba(255, 107, 53, 0.35);
        }

        /* --- Header actions --- */
        .header-actions {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-shrink: 0;
        }

        .btn-gradient {
          font-size: 13px;
          font-weight: 600;
          color: #fff;
          padding: 10px 22px;
          border-radius: 50px;
          background: var(--primary-gradient);
          box-shadow: 0 6px 16px rgba(255, 107, 53, 0.3);
          white-space: nowrap;
          transition: var(--transition);
        }

        .btn-gradient:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 22px rgba(255, 107, 53, 0.4);
        }

        /* --- Desktop nav --- */
        .main-nav {
          display: flex;
          gap: 4px;
          font-size: 13px;
          flex-wrap: wrap;
          justify-content: center;
          padding-bottom: 10px;
        }

        .nav-item-wrapper {
          position: relative;
          padding: 4px 0;
        }

        .nav-link {
          color: var(--text-body);
          cursor: pointer;
          font-weight: 500;
          padding: 9px 16px;
          border-radius: 50px;
          display: inline-block;
          transition: var(--transition);
        }

        .nav-link:hover {
          background: var(--primary-light);
          color: var(--primary-dark);
        }

        /* --- Mega menu (no dividers) --- */
        .mega-menu {
          position: absolute;
          top: calc(100% + 12px);
          left: 50%;
          transform: translateX(-50%);
          background: #fff;
          border: 1px solid var(--border);
          border-radius: 14px;
          box-shadow: var(--shadow-lg);
          padding: 30px 36px;
          display: flex;
          gap: 48px;
          min-width: 620px;
          z-index: 1000;
          animation: menuFadeIn 0.2s ease forwards;
        }

        .mega-menu::before {
          content: '';
          position: absolute;
          top: -6px;
          left: 50%;
          transform: translateX(-50%) rotate(45deg);
          width: 12px;
          height: 12px;
          background: #fff;
          border-left: 1px solid var(--border);
          border-top: 1px solid var(--border);
        }

        @keyframes menuFadeIn {
          from { opacity: 0; transform: translateX(-50%) translateY(6px); }
          to { opacity: 1; transform: translateX(-50%) translateY(0); }
        }

        .mega-menu-column {
          display: flex;
          flex-direction: column;
          min-width: 150px;
        }

        .mega-menu-title {
          font-size: 11.5px;
          font-weight: 700;
          color: var(--primary);
          text-transform: uppercase;
          letter-spacing: 0.6px;
          margin-bottom: 16px;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .mega-menu-title::before {
          content: '';
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--primary);
          flex-shrink: 0;
        }

        .mega-menu-list {
          display: flex;
          flex-direction: column;
          gap: 11px;
        }

        .mega-menu-link {
          color: #5c6170;
          font-size: 13px;
          transition: var(--transition);
          display: inline-block;
        }

        .mega-menu-link:hover {
          color: var(--primary);
          transform: translateX(4px);
        }

        /* --- Mobile overlay & drawer --- */
        .mobile-overlay { display: none; }

        .mobile-drawer {
          position: fixed;
          top: 0;
          left: -100%;
          width: 82%;
          max-width: 340px;
          height: 100vh;
          background: #fff;
          z-index: 999;
          transition: left 0.3s ease;
          overflow-y: auto;
          box-shadow: var(--shadow-lg);
          display: flex;
          flex-direction: column;
        }

        .mobile-drawer.open { left: 0; }

        .drawer-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 18px 20px;
          border-bottom: 1px solid var(--border);
        }

        .drawer-title {
          font-size: 16px;
          font-weight: 700;
          color: var(--text-dark);
        }

        .drawer-close {
          font-size: 18px;
          color: var(--text-muted);
        }

        .drawer-nav {
          padding: 8px 0 24px;
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .drawer-nav-item { border-bottom: 1px solid var(--border); }

        .drawer-nav-link-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 15px 20px;
          cursor: pointer;
        }

        .drawer-nav-link {
          font-size: 14px;
          font-weight: 500;
          color: var(--text-dark);
        }

        .drawer-caret {
          font-size: 12px;
          color: var(--text-muted);
          transition: transform 0.2s ease;
        }

        .drawer-caret.rotated {
          transform: rotate(180deg);
          color: var(--primary);
        }

        .drawer-submenu {
          background: var(--bg-soft);
          padding: 10px 20px 16px 28px;
          display: flex;
          flex-direction: column;
          gap: 16px;
          animation: dropDown 0.2s ease;
        }

        @keyframes dropDown {
          from { opacity: 0; transform: translateY(-6px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .drawer-submenu-col h5 {
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.4px;
          color: var(--primary);
          margin-bottom: 8px;
        }

        .drawer-submenu-col ul {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .drawer-submenu-col a {
          font-size: 13px;
          color: var(--text-body);
        }

        .drawer-submenu-col a:hover { color: var(--primary); }

        .drawer-footer {
          margin-top: auto;
          padding: 18px 20px 24px;
          border-top: 1px solid var(--border);
        }

        .btn-gradient.full {
          text-align: center;
          width: 100%;
        }

        /* --- Responsive --- */
        @media (max-width: 992px) {
          .header-actions { display: none; }

          .main-nav {
            flex-wrap: nowrap;
            overflow-x: auto;
            justify-content: flex-start;
            -ms-overflow-style: none;
            scrollbar-width: none;
            padding: 0 4px 10px;
          }
          .main-nav::-webkit-scrollbar { display: none; }
          .nav-link { white-space: nowrap; }
        }

        @media (max-width: 768px) {
          .header { padding: 14px 16px 0; }

          .header-top {
            flex-wrap: wrap;
            justify-content: space-between;
            gap: 14px;
          }

          .hamburger-btn { display: flex; }

          .search-wrapper {
            flex-basis: 100%;
            width: 100%;
            max-width: none;
          }

          .search-wrapper input { padding-right: 90px; }

          .desktop-only { display: none; }

          .mobile-overlay {
            display: block;
            position: fixed;
            inset: 0;
            background: rgba(10, 10, 15, 0.5);
            z-index: 998;
            opacity: 0;
            pointer-events: none;
            transition: opacity 0.25s ease;
          }

          .mobile-overlay.active {
            opacity: 1;
            pointer-events: auto;
          }
        }
    `}</style>
);

export default Header;