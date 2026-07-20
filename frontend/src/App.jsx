import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/layout/ProtectedRoute';
import AdminLayout from './components/layout/AdminLayout';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ProfilPage from './pages/ProfilPage';
import CariMakananPage from './pages/CariMakananPage';
import RiwayatMakananPage from './pages/RiwayatMakananPage';
import MealPlannerPage from './pages/MealPlannerPage';
import DietBuddyPage from './pages/DietBuddyPage';
import ArtikelPage from './pages/ArtikelPage';
import ArtikelDetailPage from './pages/ArtikelDetailPage';
import KelolaArtikelPage from './pages/admin/KelolaArtikelPage';
import PanelAdminPage from './pages/admin/PanelAdminPage';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          

          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/profil" element={<ProfilPage />} />
            <Route path="/cari-makanan" element={<CariMakananPage />} />
            <Route path="/riwayat" element={<RiwayatMakananPage />} />
            <Route path="/meal-planner" element={<MealPlannerPage />} />
            <Route path="/diet-buddy" element={<DietBuddyPage />} />
            <Route path="/artikel" element={<ArtikelPage />} />
            <Route path="/artikel/:id" element={<ArtikelDetailPage />} />
          </Route>

          <Route element={<AdminLayout />}>
            <Route path="/admin/artikel" element={<KelolaArtikelPage />} />
            <Route path="/admin/panel" element={<PanelAdminPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
