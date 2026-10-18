const rawBaseUrl =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.MODE === 'development'
    ? 'http://127.0.0.1:5000'
    : 'https://portfolio-backend-gxhv.onrender.com');

const API_BASE_URL = rawBaseUrl.trim().replace(/\/$/, '');

const api = {
  async post(endpoint, data) {
    const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || `Request failed with status ${res.status}`);
    }

    return res.json();
  },
};

export default api;

