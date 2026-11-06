import axios from "axios";

import { getApiURL } from "@/util/constants";

export type SessionUser = { userId: string; username: string; imageUrl?: string; role: string; csrfToken: string };

axios.defaults.withCredentials = true;
axios.interceptors.request.use((config) => {
  const csrfToken = sessionStorage.getItem("typink_web_csrf");
  if (csrfToken && !["get", "head", "options"].includes(String(config.method || "get").toLowerCase())) {
    config.headers.set("X-CSRF-Token", csrfToken);
  }
  return config;
});

export function storeSession(user: SessionUser) {
  sessionStorage.setItem("typink_web_session", JSON.stringify(user));
  sessionStorage.setItem("typink_web_csrf", user.csrfToken);
  sessionStorage.setItem("typink_user_id", user.userId);
  sessionStorage.setItem("typink_username", user.username);
  if (user.imageUrl) sessionStorage.setItem("typink_user_image", user.imageUrl);
}

export function getStoredSession(): SessionUser | null {
  try {
    return JSON.parse(sessionStorage.getItem("typink_web_session") || "null");
  } catch {
    return null;
  }
}

export async function loadSession() {
  const response = await axios.get<SessionUser>(`${getApiURL()}/auth/session`);
  storeSession(response.data);
  return response.data;
}

export async function logout() {
  await axios.post(`${getApiURL()}/auth/logout`);
  sessionStorage.removeItem("typink_web_session");
  sessionStorage.removeItem("typink_web_csrf");
  sessionStorage.removeItem("typink_user_id");
  sessionStorage.removeItem("typink_username");
  sessionStorage.removeItem("typink_user_image");
}

export default axios;
