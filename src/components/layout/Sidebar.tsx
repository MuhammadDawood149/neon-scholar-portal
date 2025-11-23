import { LayoutDashboard, Users, FileText, ClipboardList, BarChart3, LogOut, BookOpen, UserPlus, UsersRound } from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import { getAuthUser, logout } from '@/lib/auth';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

export const Sidebar = () => {
  const navigate = useNavigate();
  const user = getAuthUser();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const adminLinks = [
    { to: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/admin/users', icon: Users, label: 'Manage Users' },
    { to: '/admin/courses', icon: BookOpen, label: 'Manage Courses' },
    { to: '/admin/assign-teacher', icon: UserPlus, label: 'Assign Teacher' },
    { to: '/admin/assign-students', icon: UsersRound, label: 'Assign Students' },
    { to: '/admin/records', icon: FileText, label: 'View Records' },
  ];

  const teacherLinks = [
    { to: '/teacher', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/teacher/courses', icon: BookOpen, label: 'My Courses' },
    { to: '/teacher/attendance', icon: ClipboardList, label: 'Mark Attendance' },
    { to: '/teacher/results', icon: BarChart3, label: 'Upload Results' },
  ];

  const studentLinks = [
    { to: '/student', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/student/courses', icon: BookOpen, label: 'My Courses' },
    { to: '/student/attendance', icon: ClipboardList, label: 'My Attendance' },
    { to: '/student/results', icon: BarChart3, label: 'My Results' },
  ];

  let links = studentLinks;
  if (user?.role === 'admin') links = adminLinks;
  if (user?.role === 'teacher') links = teacherLinks;

  return (
    <aside className="w-64 border-r border-border bg-card/30 backdrop-blur-sm flex flex-col animate-slide-in">
      <nav className="flex-1 p-4 space-y-2">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"
            activeClassName="bg-primary/10 text-primary font-medium neon-glow"
          >
            <link.icon className="h-5 w-5" />
            <span>{link.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-border">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-destructive hover:bg-destructive/10 transition-all w-full"
        >
          <LogOut className="h-5 w-5" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};
