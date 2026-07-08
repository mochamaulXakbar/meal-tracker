const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://meal-tracker-cp2l.onrender.com/api';

function ambilToken() {
  return localStorage.getItem('token');
}

async function permintaan(path, opsi = {}) {
  const token = ambilToken();
  const headers = { ...opsi.headers };

  if (!(opsi.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const respon = await fetch(`${BASE_URL}${path}`, { ...opsi, headers });
  const json = await respon.json().catch(() => ({}));

  if (!respon.ok || json.status === 'error') {
    throw new Error(json.pesan || 'Terjadi kesalahan, coba lagi.');
  }

  return json;
}

export const api = {
  get: (path) => permintaan(path, { method: 'GET' }),
  post: (path, body) =>
    permintaan(path, {
      method: 'POST',
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),
  put: (path, body) => permintaan(path, { method: 'PUT', body: JSON.stringify(body) }),
  delete: (path) => permintaan(path, { method: 'DELETE' }),
};
