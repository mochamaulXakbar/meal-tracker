import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Navbar from './Navbar';
import PageBackdrop from './PageBackdrop';
import Spinner from '../ui/Spinner';

export default function ProtectedRoute() {
  const { user, memuat } = useAuth();

  if (memuat) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <PageBackdrop>
        <Outlet />
      </PageBackdrop>
    </div>
  );
}
