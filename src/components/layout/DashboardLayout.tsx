import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { isAuthenticated } from '@/lib/auth';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

// Check if parent is authenticated
const isParentAuthenticated = (): boolean => {
  const parentData = localStorage.getItem('portal_current_parent');
  return parentData !== null;
};

export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const isParentRoute = location.pathname.startsWith('/parent');
    
    if (isParentRoute) {
      // Parent routes only check parent authentication
      if (!isParentAuthenticated()) {
        navigate('/login');
      }
    } else {
      // All other routes check regular user authentication
      if (!isAuthenticated()) {
        navigate('/login');
      }
    }
  }, [navigate, location.pathname]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-6 overflow-auto">
          <div className="max-w-7xl mx-auto animate-fade-in">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
