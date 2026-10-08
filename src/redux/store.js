import { configureStore } from '@reduxjs/toolkit';
import categoryReducer from './categorySlice';
import subcategoryReducer from './subcategorySlice';
import productReducer from './productSlice';
import fileTypeReducer from './fileTypeSlice';

export const store = configureStore({
  reducer: {
    category: categoryReducer,
    subcategory: subcategoryReducer,
    product: productReducer,
    fileType: fileTypeReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export default store;
