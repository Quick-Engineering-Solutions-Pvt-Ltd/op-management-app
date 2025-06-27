
// import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
// import { seachOrderApi } from '../../utils/api.js'; // Adjust the import path to your API instance

// // Async thunk for searching orders
// export const searchOrders = createAsyncThunk<
//   { clientName: string; companyName: string; products: { name: string }[]; generatedBy: { name: string }; orderNumber: string }[],
//   string,
//   { rejectValue: string }
// >(
//   'orderSearch/searchOrders',
//   async (query, { rejectWithValue }) => {
//     try {
//       const response = await seachOrderApi(query);
//       console.log('Search response check on thunk com:', response.data);
//       return response.data; 
//     } catch (error: any) {
//       return rejectWithValue(error.response?.data?.message || 'An error occurred while fetching orders');
//     }
//   }
// );

// // Initial state
// const initialState = {
//   orders: [] as { clientName: string; companyName: string; products: { name: string }[]; generatedBy: { name: string }; orderNumber: string }[],
//   loading: false as boolean,
//   error: null as string | null,
//   query: '' as string,
// };

// // Create the slice
// const orderSearchSlice = createSlice({
//   name: 'orderSearch',
//   initialState,
//   reducers: {
//     setSearchQuery: (state, action: PayloadAction<string>) => {
//       state.query = action.payload;
//     },
//     clearSearchResults: (state) => {
//       state.orders = [];
//       state.query = '';
//       state.error = null;
//     },
//   },
//   extraReducers: (builder) => {
//     builder
//       .addCase(searchOrders.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(searchOrders.fulfilled, (state, action: PayloadAction<
//         { clientName: string; companyName: string; products: { name: string }[]; generatedBy: { name: string }; orderNumber: string }[]
//       >) => {
//         state.loading = false;
//         state.orders = action.payload;
//       })
//       .addCase(searchOrders.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload || 'An error occurred';
//       });
//   },
// });

// // Export actions
// export const { setSearchQuery, clearSearchResults } = orderSearchSlice.actions;
// export  default orderSearchSlice.reducer;