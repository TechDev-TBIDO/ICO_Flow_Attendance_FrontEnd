// Admin session helpers: token storage + authenticated fetch.

const TOKEN_KEY = "admin_token";
export const API_BASE = import.meta.env.VITE_API_BASE_URL;

export function getAdminToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setAdminToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearAdminToken() {
  localStorage.removeItem(TOKEN_KEY);
}

function decodePayload(token) {
  try {
    const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(base64));
  } catch {
    return null;
  }
}

// Client-side check only (for redirects); the server verifies the signature.
export function isAdminLoggedIn() {
  const token = getAdminToken();
  if (!token) return false;
  const payload = decodePayload(token);
  return !!payload?.exp && payload.exp * 1000 > Date.now();
}

export function getAdminUsername() {
  const token = getAdminToken();
  return (token && decodePayload(token)?.username) || "Admin";
}

export function logoutAdmin(reason) {
  clearAdminToken();
  window.location.href = reason ? `/admin?reason=${reason}` : "/admin";
}

// fetch() wrapper for admin endpoints. Sends the bearer token, parses JSON,
// and bounces back to the login page when the session is no longer valid.
export async function adminFetch(path, { method = "GET", body } = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getAdminToken()}`,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (res.status === 401) {
    logoutAdmin("expired");
    throw new Error("Session expired");
  }

  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, data };
}
