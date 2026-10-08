import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import fileTypeService from '../services/fileTypeService';

// Async thunk to fetch file types
export const fetchFileTypes = createAsyncThunk(
  'fileType/fetchFileTypes',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fileTypeService.getFileTypeList();
      if (response && response.status) {
        return response.data?.file_types || [];
      }
      return rejectWithValue(response?.message || 'Failed to fetch file types');
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  fileTypes: [],
  loading: false,
  error: null,
};

const fileTypeSlice = createSlice({
  name: 'fileType',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchFileTypes.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFileTypes.fulfilled, (state, action) => {
        state.loading = false;
        state.fileTypes = action.payload;
      })
      .addCase(fetchFileTypes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to load file types';
      });
  },
});

export default fileTypeSlice.reducer;
