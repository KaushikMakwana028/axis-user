import axiosInstance from '../api/axiosInstance';

export const categoryService = {
  /**
   * Get paginated category list
   * @param {Object} params - { page, limit, search, status }
   */
  getCategoryList: async (params = {}) => {
    return await axiosInstance.get('/get_category_list', { params });
  },

  /**
   * Get category detail with subcategories
   * @param {Object} params - { id, slug }
   */
  getCategoryDetail: async (params = {}) => {
    return await axiosInstance.get('/get_category_detail', { params });
  },
};

export default categoryService;
