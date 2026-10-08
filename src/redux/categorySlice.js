import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import categoryService from '../services/categoryService';

// Async thunk to fetch categories list
export const fetchCategories = createAsyncThunk(
  'category/fetchCategories',
  async (params, { rejectWithValue }) => {
    try {
      const response = await categoryService.getCategoryList(params);
      if (response && response.status) {
        return response.data;
      }
      return rejectWithValue(response?.message || 'Failed to fetch categories');
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk to fetch single category detail with its subcategories
export const fetchCategoryDetail = createAsyncThunk(
  'category/fetchCategoryDetail',
  async (params, { rejectWithValue }) => {
    try {
      const response = await categoryService.getCategoryDetail(params);
      if (response && response.status) {
        return response.data;
      }
      return rejectWithValue(response?.message || 'Category not found');
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  categories: [],
  currentCategory: null,
  total: 0,
  page: 1,
  limit: 20,
  totalPages: 1,
  loading: false,
  detailLoading: false,
  error: null,
};

const categorySlice = createSlice({
  name: 'category',
  initialState,
  reducers: {
    clearCurrentCategory: (state) => {
      state.currentCategory = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch categories
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = action.payload?.categories || [];
        state.total = action.payload?.total || 0;
        state.page = action.payload?.page || 1;
        state.limit = action.payload?.limit || 20;
        state.totalPages = action.payload?.total_pages || 1;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to load categories';
      })
      // Fetch category detail
      .addCase(fetchCategoryDetail.pending, (state) => {
        state.detailLoading = true;
        state.error = null;
      })
      .addCase(fetchCategoryDetail.fulfilled, (state, action) => {
        state.detailLoading = false;
        state.currentCategory = action.payload;
      })
      .addCase(fetchCategoryDetail.rejected, (state, action) => {
        state.detailLoading = false;
        state.error = action.payload || 'Failed to load category detail';
      });
  },
});

export const { clearCurrentCategory } = categorySlice.actions;
export default categorySlice.reducer;
