
// import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
// // import { fetchOrders } from '../../utils/api';

// export const fetchOrdersAsync = createAsyncThunk(
//   'orders/fetchOrders',
//   async (_, { rejectWithValue }) => {
//     try {
//       return await fetchOrders();
//     } catch (error) {
//       return rejectWithValue(error.message);
//     }
//   }
// );

// const orderSlice = createSlice({
//   name: 'orders',
//   initialState: {
//     orders: [],
//     status: 'idle',
//     error: null,
//   },
//   reducers: {
//     resetOrders: (state) => {
//       state.orders = [];
//       state.status = 'idle';
//       state.error = null;
//     },
//   },
//   extraReducers: (builder) => {
//     builder
//       .addCase(fetchOrdersAsync.pending, (state) => {
//         state.status = 'loading';
//         state.error = null;
//       })
//       .addCase(fetchOrdersAsync.fulfilled, (state, action) => {
//         state.status = 'succeeded';
//         state.orders = action.payload.data || [];
//       })
//       .addCase(fetchOrdersAsync.rejected, (state, action) => {
//         state.status = 'failed';
//         state.error = action.payload;
//       });
//   },
// });

// export const { resetOrders } = orderSlice.actions;
// export default orderSlice.reducer;
