// src/utils/api.ts
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:4000/', // Fixed typo: baseUrl -> baseURL
  headers: {
    'Content-Type': 'application/json',
  },
});


// export const createOrder = async (orderData) => {
//   const response = await api.post('order/api/order-create-api', orderData);
//   return response.data; 
// };


// export const fetchOrderById = async (orderId) => {
//   const response = await api.get(`/order/api/get-order/${orderId}`);
//   return response.data; 
// };


// export const fetchAllOrders = async () => {
//   const response = await api.get('/order/api/get-all-orders');
//   const orders = response?.data?.data?.orders || [];
//   return orders;
// };

// export const updateOrder = async (orderId, orderData) => {
//     const response = await api.put(`/order/api/update-order/${orderId}`, orderData);
//     return response.data;
// }

/// search orders by query parameter
// export const seachOrderApi = async (query) => {
//   const response = await api.get(`/order/api/search-order`, { params: { query } });
//   console.log("search response:", response.data);
//   return response.data; 
// };




///// for the auth apis end point
/**
 * @typedef {Object} UserData
 * @property {string} username
 * @property {string} emimport { createOrder, fetchOrderById, fetchAllOrders, updateOrder, seachOrderApi, adminSignup, adminSigIn } from '../utils/api';ail
 * @property {string} password
 * @property {string} role
 */

export const adminSignup = async (UserData: { username: string; email: string; password: string; userType: string }) => {
  const response = await api.post('/user/api/admin-signup', UserData);
  return response.data;
}


export const adminSigIn=async(UserData: { email: string; password: string})=>{
  const response = await api.post('/user/api/admin-sigin',UserData,{
    withCredentials:true
  });
  return response.data; 
}

