import axiosInstance from '../api/axiosInstance';

export const fileTypeService = {
  /**
   * Get active file types list
   */
  getFileTypeList: async () => {
    return await axiosInstance.get('/get_file_type_list');
  },
};

export default fileTypeService;
