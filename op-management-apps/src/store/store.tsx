import { configureStore } from '@reduxjs/toolkit';
import authReducer from './Slice/authSlice';
// import orderReducer from './Slice/orderSlice'; // For general order management
// import orderCreateReducer from './Slice/orderCreateSlice'; // For creating orders
// import orderSearchReducer from './Slice/orderSearchSlice'; // For searching orders

const store = configureStore({
  reducer: {
    auth: authReducer,
    // orders: orderReducer,
    // orderCreate: orderCreateReducer,
    // orderSearch: orderSearchReducer,
  },
});

export default store;

// Export RootState and AppDispatch types for TypeScript
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;