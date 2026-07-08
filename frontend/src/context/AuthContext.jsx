import { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../lib/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [memuat, setMemuat] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setMemuat(false);
      return;
    }
    api
      .get('/pengguna/profil')
      .then((res) => setUser(res.data))
      .catch(() => {
        localStorage.removeItem('token');
        setUser(null);
      })
      .finally(() => setMemuat(false));
  }, []);

  async function login(email, password) {
    const res = await api.post('/auth/login', { email, password });
    localStorage.setItem('token', res.token);
    setUser(res.data);
    return res.data;
  }

  async function register(email, password, nama_pengguna) {
    await api.post('/auth/register', { email, password, nama_pengguna });
    return login(email, password);
  }

  function logout() {
    localStorage.removeItem('token');
    setUser(null);
  }

  async function refreshProfil() {
    const res = await api.get('/pengguna/profil');
    setUser(res.data);
    return res.data;
  }

  const value = {
    user,
    memuat,
    isAdmin: user?.peran === 'admin',
    login,
    register,
    logout,
    refreshProfil,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth harus dipakai di dalam AuthProvider');
  return ctx;
}
