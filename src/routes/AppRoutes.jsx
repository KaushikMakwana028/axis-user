import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from '../pages/Home';
import ProductsPage from '../pages/ProductsPage';
import CategoriesPage from '../pages/CategoriesPage';
import CategoryDetailsPage from '../pages/CategoryDetailsPage';
import ProductDetails from '../pages/ProductDetails';
import NotFound from '../pages/NotFound';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/products" element={<ProductsPage />} />
      <Route path="/categories" element={<CategoriesPage />} />

      {/* Category and Subcategory clean Slug Routes */}
      <Route path="/category/:categorySlug" element={<CategoryDetailsPage />} />
      <Route path="/category/:categorySlug/:subcategorySlug" element={<CategoryDetailsPage />} />

      {/* Product Detail Clean Slug Routes */}
      <Route path="/product/:productSlug" element={<ProductDetails />} />
      <Route path="/:categorySlug/:subcategorySlug/:productSlug" element={<ProductDetails />} />

      {/* 404 Route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
