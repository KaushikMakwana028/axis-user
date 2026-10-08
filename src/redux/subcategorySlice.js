import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import subcategoryService from '../services/subcategoryService';

// Async thunk to fetch all subcategories
export const fetchSubcategories = createAsyncThunk(
  'subcategory/fetchSubcategories',
  async (params, { rejectWithValue }) => {
    try {
      const response = await subcategoryService.getSubcategoryList(params);
      if (response && response.status) {
        return response.data;
      }
      return rejectWithValue(response?.message || 'Failed to fetch subcategories');
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk to fetch subcategories by category ID or slug
export const fetchSubcategoriesByCategory = createAsyncThunk(
  'subcategory/fetchSubcategoriesByCategory',
  async (params, { rejectWithValue }) => {
    try {
      const response = await subcategoryService.getSubcategoriesByCategory(params);
      if (response && response.status) {
        return response.data;
      }
      return rejectWithValue(response?.message || 'Failed to fetch subcategories');
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk to fetch single subcategory detail
export const fetchSubcategoryDetail = createAsyncThunk(
  'subcategory/fetchSubcategoryDetail',
  async (params, { rejectWithValue }) => {
    try {
      const response = await subcategoryService.getSubcategoryDetail(params);
      if (response && response.status) {
        return response.data;
      }
      return rejectWithValue(response?.message || 'Subcategory not found');
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  subcategories: [],
  subcategoriesByCategory: [],
  currentSubcategory: null,
  total: 0,
  page: 1,
  limit: 20,
  totalPages: 1,
  loading: false,
  error: null,
};

const subcategorySlice = createSlice({
  name: 'subcategory',
  initialState,
  reducers: {
    clearCurrentSubcategory: (state) => {
      state.currentSubcategory = null;
    },
    clearSubcategoriesByCategory: (state) => {
      state.subcategoriesByCategory = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch subcategories
      .addCase(fetchSubcategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSubcategories.fulfilled, (state, action) => {
        state.loading = false;
        state.subcategories = action.payload?.subcategories || [];
        state.total = action.payload?.total || 0;
        state.page = action.payload?.page || 1;
        state.limit = action.payload?.limit || 20;
        state.totalPages = action.payload?.total_pages || 1;
      })
      .addCase(fetchSubcategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to load subcategories';
      })
      // Fetch subcategories by category
      .addCase(fetchSubcategoriesByCategory.fulfilled, (state, action) => {
        state.subcategoriesByCategory = action.payload?.subcategories || [];
      })
      // Fetch subcategory detail
      .addCase(fetchSubcategoryDetail.fulfilled, (state, action) => {
        state.currentSubcategory = action.payload;
      });
  },
});

export const { clearCurrentSubcategory, clearSubcategoriesByCategory } = subcategorySlice.actions;
export default subcategorySlice.reducer;
