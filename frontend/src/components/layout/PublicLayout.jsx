import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import PageBackdrop from './PageBackdrop';

export default function PublicLayout() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <PageBackdrop>
        <Outlet />
      </PageBackdrop>
    </div>
  );
}
