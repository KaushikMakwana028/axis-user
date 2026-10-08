import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import ProductCard from '../components/ProductCard';
import { products } from '../data/products';

const HomeScreen = () => {
    return (
        <div className="app-container">
            <Header />

            <section className="hero-section">
                <div className="hero-inner">
                    <span className="hero-badge">⚡ 56,000+ Free Design Files</span>
                    <h1>Free Vectors for <span>Laser Cutting</span> &amp; CNC</h1>
                    <p className="hero-subtitle">
                        Download free DXF files, CorelDRAW vectors (.cdr), SVG designs, and 3D puzzle
                        templates for CNC routers, laser cutters, and plasma cutters. Instant access,
                        no sign-up required.
                    </p>
                    <div className="hero-stats">
                        <div className="hero-stat"><strong>56,215</strong><span>Free Files</span></div>
                        <div className="hero-stat"><strong>120+</strong><span>Categories</span></div>
                        <div className="hero-stat"><strong>2.4M</strong><span>Downloads</span></div>
                    </div>
                </div>
            </section>

            <main className="main-content">
                <div className="section-heading">
                    <h2>Trending Designs</h2>
                    <Link to="/" className="view-all">View All →</Link>
                </div>

                <div className="product-grid">
                    {products.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            </main>
        </div>
    );
};

export default HomeScreen;