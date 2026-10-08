import axiosInstance from '../api/axiosInstance';

export const subcategoryService = {
  /**
   * Get paginated subcategory list
   * @param {Object} params - { page, limit, category_id, search, status }
   */
  getSubcategoryList: async (params = {}) => {
    return await axiosInstance.get('/get_subcategory_list', { params });
  },

  /**
   * Get subcategory detail
   * @param {Object} params - { id, slug }
   */
  getSubcategoryDetail: async (params = {}) => {
    return await axiosInstance.get('/get_subcategory_detail', { params });
  },

  /**
   * Get subcategories for a specific category
   * @param {Object} params - { category_id, category_slug }
   */
  getSubcategoriesByCategory: async (params = {}) => {
    return await axiosInstance.get('/get_subcategory_by_category', { params });
  },
};

export default subcategoryService;
