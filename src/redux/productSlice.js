import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import productService from '../services/productService';

// Async thunk to fetch products with pagination, search, and filters
export const fetchProducts = createAsyncThunk(
  'product/fetchProducts',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await productService.getProductList(params);
      if (response && response.status) {
        return response.data;
      }
      return rejectWithValue(response?.message || 'Failed to fetch products');
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk to fetch single product detail
export const fetchProductDetail = createAsyncThunk(
  'product/fetchProductDetail',
  async (params, { rejectWithValue }) => {
    try {
      const response = await productService.getProductDetail(params);
      if (response && response.status) {
        return response.data;
      }
      return rejectWithValue(response?.message || 'Product not found');
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  products: [],
  currentProduct: null,
  total: 0,
  page: 1,
  perPage: 12,
  totalPages: 1,
  loading: false,
  detailLoading: false,
  error: null,
  filters: {
    categoryId: null,
    subcategoryId: null,
    fileTypeId: null,
    search: '',
  },
};

const productSlice = createSlice({
  name: 'product',
  initialState,
  reducers: {
    setFilter: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
      state.page = 1;
    },
    resetFilters: (state) => {
      state.filters = {
        categoryId: null,
        subcategoryId: null,
        fileTypeId: null,
        search: '',
      };
      state.page = 1;
    },
    setPage: (state, action) => {
      state.page = action.payload;
    },
    clearCurrentProduct: (state) => {
      state.currentProduct = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch products
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload?.products || [];
        state.total = action.payload?.total || 0;
        state.page = action.payload?.page || 1;
        state.perPage = action.payload?.per_page || 12;
        state.totalPages = action.payload?.total_pages || 1;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to load products';
      })
      // Fetch product detail
      .addCase(fetchProductDetail.pending, (state) => {
        state.detailLoading = true;
        state.error = null;
      })
      .addCase(fetchProductDetail.fulfilled, (state, action) => {
        state.detailLoading = false;
        state.currentProduct = action.payload;
      })
      .addCase(fetchProductDetail.rejected, (state, action) => {
        state.detailLoading = false;
        state.error = action.payload || 'Failed to load product details';
      });
  },
});

export const { setFilter, resetFilters, setPage, clearCurrentProduct } = productSlice.actions;
export default productSlice.reducer;
