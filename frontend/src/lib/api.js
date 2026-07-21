import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://meal-tracker-cp2l.onrender.com/api';

function ambilToken() {
  return localStorage.getItem('token');
}

const client = axios.create({
  baseURL: BASE_URL,
});

client.interceptors.request.use((config) => {
  const token = ambilToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

client.interceptors.response.use(
  (response) => {
    const data = response.data;

    if (data?.status === 'error') {
      throw new Error(data.pesan || 'Terjadi kesalahan, coba lagi.');
    }

    return data;
  },
  (error) => {
    const pesan =
      error.response?.data?.pesan ||
      error.response?.data?.message ||
      error.message ||
      'Terjadi kesalahan, coba lagi.';

    throw new Error(pesan);
  },
);

export const api = {
  get: (path) => client.get(path),
  post: (path, body) => client.post(path, body),
  put: (path, body) => client.put(path, body),
  delete: (path) => client.delete(path),
};
