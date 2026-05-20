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

// ---- Hero CMS ----
export const adminListHero = async (token) => {
  const { data } = await api.get("/admin/hero", { headers: { "X-Admin-Token": token } });
  return data;
};
export const adminCreateHero = async (token, payload) => {
  const { data } = await api.post("/admin/hero", payload, { headers: { "X-Admin-Token": token } });
  return data;
};
export const adminUpdateHero = async (token, id, payload) => {
  const { data } = await api.put(`/admin/hero/${id}`, payload, { headers: { "X-Admin-Token": token } });
  return data;
};
export const adminDeleteHero = async (token, id) => {
  const { data } = await api.delete(`/admin/hero/${id}`, { headers: { "X-Admin-Token": token } });
  return data;
};
export const adminReorderHero = async (token, orderedIds) => {
  const { data } = await api.put("/admin/hero/reorder", { ordered_ids: orderedIds }, { headers: { "X-Admin-Token": token } });
  return data;
};

// ---- CMS Text ----
export const fetchCms = async () => {
  const { data } = await api.get("/cms");
  return data;
};
export const adminUpdateCms = async (token, items) => {
  const { data } = await api.put("/admin/cms", { items }, { headers: { "X-Admin-Token": token } });
  return data;
};

// ---- Admin Orders ----
export const adminListOrders = async (token) => {
  const { data } = await api.get("/admin/orders", { headers: { "X-Admin-Token": token } });
  return data;
};
export const adminMarkPaid = async (token, reference) => {
  const { data } = await api.post(`/admin/orders/${encodeURIComponent(reference)}/mark-paid`, {}, { headers: { "X-Admin-Token": token } });
  return data;
};
export const adminMarkUnpaid = async (token, reference) => {
  const { data } = await api.post(`/admin/orders/${encodeURIComponent(reference)}/mark-unpaid`, {}, { headers: { "X-Admin-Token": token } });
  return data;
};
export const lookupOrder = async (reference, email) => {
  const { data } = await api.post("/order-lookup", { reference, email });
  return data;
};
export const adminUpdateFulfillment = async (token, reference, payload) => {
  const { data } = await api.put(`/admin/orders/${encodeURIComponent(reference)}/fulfillment`, payload, { headers: { "X-Admin-Token": token } });
  return data;
};

// ---- FAQs ----
export const fetchFaqs = async () => {
  const { data } = await api.get("/faqs");
  return data;
};
export const adminListFaqs = async (token) => {
  const { data } = await api.get("/admin/faqs", { headers: { "X-Admin-Token": token } });
  return data;
};
export const adminCreateFaq = async (token, payload) => {
  const { data } = await api.post("/admin/faqs", payload, { headers: { "X-Admin-Token": token } });
  return data;
};
export const adminUpdateFaq = async (token, id, payload) => {
  const { data } = await api.put(`/admin/faqs/${id}`, payload, { headers: { "X-Admin-Token": token } });
  return data;
};
export const adminDeleteFaq = async (token, id) => {
  const { data } = await api.delete(`/admin/faqs/${id}`, { headers: { "X-Admin-Token": token } });
  return data;
};

// ---- Custom Requests ----
export const submitCustomRequest = async (payload) => {
  const { data } = await api.post("/custom-requests", payload);
  return data;
};
export const adminListCustomRequests = async (token) => {
  const { data } = await api.get("/admin/custom-requests", { headers: { "X-Admin-Token": token } });
  return data;
};
export const adminUpdateCustomRequest = async (token, id, payload) => {
  const { data } = await api.put(`/admin/custom-requests/${id}`, payload, { headers: { "X-Admin-Token": token } });
  return data;
};

// ---- Returns ----
export const submitReturn = async (payload) => {
  const { data } = await api.post("/returns", payload);
  return data;
};
export const adminListReturns = async (token) => {
  const { data } = await api.get("/admin/returns", { headers: { "X-Admin-Token": token } });
  return data;
};
export const adminUpdateReturn = async (token, id, payload) => {
  const { data } = await api.put(`/admin/returns/${id}`, payload, { headers: { "X-Admin-Token": token } });
  return data;
};

// ---- Live Chat ----
export const chatStart = async (payload) => {
  const { data } = await api.post("/chat/start", payload);
  return data;
};
export const chatSend = async (sessionId, body) => {
  const { data } = await api.post(`/chat/${sessionId}/message`, { body });
  return data;
};
export const chatFetch = async (sessionId, since = null) => {
  const params = since ? { since } : {};
  const { data } = await api.get(`/chat/${sessionId}/messages`, { params });
  return data;
};
export const adminChatSessions = async (token) => {
  const { data } = await api.get("/admin/chat/sessions", { headers: { "X-Admin-Token": token } });
  return data;
};
export const adminChatSession = async (token, sessionId) => {
  const { data } = await api.get(`/admin/chat/${sessionId}`, { headers: { "X-Admin-Token": token } });
  return data;
};
export const adminChatReply = async (token, sessionId, body, adminName) => {
  const { data } = await api.post(`/admin/chat/${sessionId}/reply`, { body, admin_name: adminName }, { headers: { "X-Admin-Token": token } });
  return data;
};
export const adminChatClose = async (token, sessionId, adminName) => {
  const params = adminName ? `?admin_name=${encodeURIComponent(adminName)}` : "";
  const { data } = await api.put(`/admin/chat/${sessionId}/close${params}`, {}, { headers: { "X-Admin-Token": token } });
  return data;
};

// ---- Gift Cards ----
export const purchaseGiftCard = async (payload) => {
  const { data } = await api.post("/gift-cards/checkout", payload);
  return data;
};
export const validateGiftCard = async (code) => {
  const { data } = await api.get(`/gift-cards/validate/${encodeURIComponent(code)}`);
  return data;
};
export const previewGiftCard = async (code, cartTotal) => {
  const { data } = await api.post("/gift-cards/preview", { code, cart_total: cartTotal });
  return data;
};
export const adminListGiftCards = async (token) => {
  const { data } = await api.get("/admin/gift-cards", { headers: { "X-Admin-Token": token } });
  return data;
};
export const adminUpdateGiftCard = async (token, id, payload) => {
  const { data } = await api.put(`/admin/gift-cards/${id}`, payload, { headers: { "X-Admin-Token": token } });
  return data;
};

// ---- Analytics ----
export const adminAnalytics = async (token, days = 30) => {
  const { data } = await api.get(`/admin/analytics?days=${days}`, { headers: { "X-Admin-Token": token } });
  return data;
};

// ---- Uploads (public for custom request images) ----
export const uploadPublicImage = async (token, file) => {
  // Reuses admin upload for now (token still required to keep it safe).
  // Public upload via the same endpoint with admin token = no.
  // We expose a custom-request specific public endpoint? — fallback: use base64 inline preview, never upload.
  return null;
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
