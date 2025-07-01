// src/utils/api.ts
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:4000/", // Fixed typo: baseUrl -> baseURL
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("jwtToken");
  if (token && !config.url?.includes("/api/auth/validate")) {
    config.headers.Authorization = `Bearer ${token}`; // Use header for non-validate endpoints
  }
  return config;
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

export const adminSignup = async (UserData: {
  username: string;
  email: string;
  password: string;
  userType: string;
}) => {
  const response = await api.post("/user/api/admin-signup", UserData);
  return response.data;
};

export const adminSigIn = async (UserData: {
  email: string;
  password: string;
}) => {
  const response = await api.post("/user/api/admin-sigin", UserData, {
    withCredentials: true,
  });
  return response.data;
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const getUserWithWithOp = async (p0: {
  page: number;
  limit: number;
}) => {
  const response = await api.get(`/user/api/admin-get-all-user`, {
    withCredentials: true,
  });
  console.log(
    "getUserWithWithOp response shariq khan fetch user details:",
    response.data
  );
  return response.data;
};

export const apiDeleteUser = async (userId: string) => {
  const response = await api.delete(`/user/api/admin-delete/${userId}`, {
    withCredentials: true,
  });
  return response.data;
};

export const apiSearchUser = async (query: string) => {
  const response = await api.get(`/user/api/admin-user-profie`, {
    params: { query },
    withCredentials: true,
  });
  return response.data;
};
