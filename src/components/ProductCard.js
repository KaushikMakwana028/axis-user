import React from 'react';
import { Link } from 'react-router-dom';

const ProductCard = ({ product }) => {
    const formatList = product.formats.split(',').map((f) => f.trim());

    return (
        <Link to={`/product/${product.id}`} className="product-card-link">
            <div className="product-card">
                <div className="image-container">
                    <img src={product.img} alt={product.title} loading="lazy" />
                </div>

                <div className="product-info">
                    <span className="product-category">{product.category}</span>
                    <h3>{product.title}</h3>

                    <div className="format-tag-row">
                        {formatList.map((f) => (
                            <span key={f} className="format-pill">{f}</span>
                        ))}
                    </div>
                </div>
            </div>
        </Link>
    );
};

export default ProductCard;