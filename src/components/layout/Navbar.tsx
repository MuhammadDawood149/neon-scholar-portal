import { User, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getAuthUser, logout } from '@/lib/auth';
import { getUsers } from '@/lib/storage';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export const Navbar = () => {
  const navigate = useNavigate();
  const authUser = getAuthUser();
  const [user, setUser] = useState(authUser);

  useEffect(() => {
    if (authUser) {
      const users = getUsers();
      const fullUser = users.find(u => u.id === authUser.id);
      if (fullUser) setUser(fullUser);
    }
  }, [authUser]);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="flex h-16 items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center neon-glow">
            <span className="text-xl font-bold text-background">SP</span>
          </div>
          <div>
            <h1 className="text-lg font-heading font-semibold">Student Portal</h1>
            <p className="text-xs text-muted-foreground">Attendance & Results</p>
          </div>
        </div>

        {user && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full p-0 w-10 h-10 border-2 border-primary/30 overflow-hidden shadow-[0_0_6px_rgba(58,180,255,0.3)] hover:scale-105 transition-transform">
                {user.profileImage && user.profileImage !== 'default' ? (
                  <img src={user.profileImage} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-sm font-heading text-primary">
                    {getInitials(user.name)}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-card border-border">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">{user.name}</p>
                  <p className="text-xs text-muted-foreground capitalize">{user.role}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </nav>
  );
};
