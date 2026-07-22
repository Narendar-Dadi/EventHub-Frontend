// const API_BASE = process.env.REACT_APP_API_URL || "/api";
const API_BASE =
  process.env.REACT_APP_API_URL ||
  "https://smart-event-backend-4ik2.onrender.com/api";
const TOKEN_KEY = "eventhub_token";
const USER_KEY = "eventhub_user";

console.log("API_BASE =", API_BASE);

// ─── Token helpers ──────────────────────────────────────
export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}
export function setToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

// ─── User helpers (persist role across refreshes) ───────
export function getStoredUser() {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}
export function storeUser(user) {
  if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
  else localStorage.removeItem(USER_KEY);
}

// ─── HTTP helper ────────────────────────────────────────
async function request(path, options = {}) {
  const token = getToken();
  const headers = { "Content-Type": "application/json", ...(options.headers || {}) };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.message || "Request failed");
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

// ─── API methods ────────────────────────────────────────
export const api = {
  health: () => request("/health"),

  // Auth
  login: (body) => request("/auth/login", { method: "POST", body: JSON.stringify(body) }),
  register: (body) => request("/auth/register", { method: "POST", body: JSON.stringify(body) }),
  registerOrganizer: (body) => request("/auth/register-organizer", { method: "POST", body: JSON.stringify(body) }),
  getMe: () => request("/auth/me"),

  // Admin: user management
  createUser: (body) => request("/auth/create-user", { method: "POST", body: JSON.stringify(body) }),
  getUsers: () => request("/auth/users"),
  deleteUser: (id) => request(`/auth/users/${id}`, { method: "DELETE" }),

  // Admin: organizer approval
  getOrganizerRequests: () => request("/auth/organizer-requests"),
  approveOrganizer: (id) => request(`/auth/organizer-requests/${id}/approve`, { method: "PATCH" }),
  rejectOrganizer: (id) => request(`/auth/organizer-requests/${id}/reject`, { method: "PATCH" }),

  // Events
  getEvents: () => request("/events"),
  getEvent: (id) => request(`/events/${id}`),
  createEvent: (body) => request("/events", { method: "POST", body: JSON.stringify(body) }),
  deleteEvent: (id) => request(`/events/${id}`, { method: "DELETE" }),
  registerFree: (eventId) => request(`/events/${eventId}/register-free`, { method: "POST", body: "{}" }),
  getTransactions: () => request("/events/transactions/list"),

  // Tickets
  getMyTickets: () => request("/tickets/my-tickets"),
  getTicket: (ticketId) => request(`/tickets/${ticketId}`),
  checkInTicket: (body) => request("/tickets/check-in", { method: "POST", body: JSON.stringify(body) }),
  getAttendance: (eventId) => request(`/tickets/attendance/${eventId}`),

  // Payments
  getPaymentConfig: () => request("/payments/config"),
  getPaymentSettings: () => request("/payments/settings"),
  savePaymentSettings: (body) => request("/payments/settings", { method: "PUT", body: JSON.stringify(body) }),
  createPaymentOrder: (body) => request("/payments/create-order", { method: "POST", body: JSON.stringify(body) }),
  verifyPayment: (body) => request("/payments/verify", { method: "POST", body: JSON.stringify(body) })
};

// ─── Razorpay loader ────────────────────────────────────
export function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) { resolve(true); return; }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}
