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

// Check if current route is for parent role
const isParentRoute = (pathname: string): boolean => {
  return pathname.startsWith('/parent');
};

export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isParent = isParentRoute(location.pathname);

  useEffect(() => {
    if (isParent) {
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
  }, [navigate, location.pathname, isParent]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex flex-1">
        {/* Hide sidebar for parent role */}
        {!isParent && <Sidebar />}
        <main className={`flex-1 p-6 overflow-auto ${isParent ? 'w-full' : ''}`}>
          <div className="max-w-7xl mx-auto animate-fade-in">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
