import axiosInstance from '../api/axiosInstance';

export const productService = {
  /**
   * Get paginated products list with filters
   * @param {Object} params - { page, per_page, category_id, subcategory_id, file_type_id, search }
   */
  getProductList: async (params = {}) => {
    return await axiosInstance.get('/get_product_list', { params });
  },

  /**
   * Get product detail by product_id or product_slug
   * @param {Object} params - { product_id, product_slug }
   */
  getProductDetail: async (params = {}) => {
    return await axiosInstance.get('/get_product_detail', { params });
  },
};

export default productService;
