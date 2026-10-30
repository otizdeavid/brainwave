
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const POSTS_API_BASE_URL =
  "https://jsonplaceholder.typicode.com";

export async function apiRequest(endpoint, options = {}) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (response.status === 204) {
    return null;
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      data?.message || `Request failed: ${response.status}`
    );
  }

  return data;
}

export async function apiGetPosts() {
  const response = await fetch(`${POSTS_API_BASE_URL}/posts`);

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  return response.json();
}

export async function sendChatMessage(message, messages = []) {
  return apiRequest("/api/chat", {
    method: "POST",
    body: JSON.stringify({
      message,
      messages,
    }),
  });
}