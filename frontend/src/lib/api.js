import axios from "axios";

export const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const API = `${BACKEND_URL}/api`;

export const api = axios.create({
  baseURL: API,
  withCredentials: true,
});

export const fetchProducts = async (params = {}) => {
  const { data } = await api.get("/products", { params });
  return data;
};
export const fetchProduct = async (id) => {
  const { data } = await api.get(`/products/${id}`);
  return data;
};
export const createCheckout = async (payload) => {
  const { data } = await api.post("/checkout/session", payload);
  return data;
};
export const getCheckoutStatus = async (sessionId) => {
  const { data } = await api.get(`/checkout/status/${sessionId}`);
  return data;
};
export const createIbanOrder = async (payload) => {
  const { data } = await api.post("/checkout/iban", payload);
  return data;
};
export const getIbanOrder = async (reference) => {
  const { data } = await api.get(`/checkout/iban/${reference}`);
  return data;
};

// ---- Settings ----
export const fetchSettings = async () => {
  const { data } = await api.get("/settings");
  return data;
};
export const adminUpdateSettings = async (token, payload) => {
  const { data } = await api.put("/admin/settings", payload, { headers: { "X-Admin-Token": token } });
  return data;
};

// ---- Auth ----
export const exchangeSession = async (sessionId) => {
  const { data } = await api.post("/auth/session", { session_id: sessionId });
  return data;
};
export const fetchMe = async () => {
  const { data } = await api.get("/auth/me");
  return data;
};
export const logout = async () => {
  const { data } = await api.post("/auth/logout");
  return data;
};
export const fetchOrders = async () => {
  const { data } = await api.get("/orders");
  return data;
};

// ---- Admin ----
export const adminLogin = async (password) => {
  const { data } = await api.post("/admin/login", { password });
  return data;
};
const adminHeaders = (token) => ({ headers: { "X-Admin-Token": token } });
export const adminCreateProduct = async (token, product) => {
  const { data } = await api.post("/admin/products", product, adminHeaders(token));
  return data;
};
export const adminUpdateProduct = async (token, id, product) => {
  const { data } = await api.put(`/admin/products/${id}`, product, adminHeaders(token));
  return data;
};
export const adminDeleteProduct = async (token, id) => {
  const { data } = await api.delete(`/admin/products/${id}`, adminHeaders(token));
  return data;
};
export const adminUploadImage = async (token, file) => {
  const fd = new FormData();
  fd.append("file", file);
  const { data } = await api.post("/admin/upload", fd, {
    headers: { "X-Admin-Token": token, "Content-Type": "multipart/form-data" },
  });
  const url = data?.url?.startsWith("http") ? data.url : `${BACKEND_URL}${data.url}`;
  return { ...data, url };
};
