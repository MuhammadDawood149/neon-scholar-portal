import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { GraduationCap, LogIn } from 'lucide-react';
import { login, loginParent } from '@/lib/auth';
import { UserRole } from '@/lib/types';
import { toast } from 'sonner';

const Login = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState<UserRole>('student');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      if (role === 'parent') {
        // Parent login uses email instead of username
        const parent = loginParent(username, password);
        if (parent) {
          localStorage.setItem('portal_current_parent', JSON.stringify(parent));
          toast.success(`Welcome back, ${parent.name}!`);
          navigate('/parent');
        } else {
          toast.error('Invalid credentials. Please try again.');
        }
      } else {
        const user = login(username, password);
        
        if (user && user.role === role) {
          toast.success(`Welcome back, ${user.name}!`);
          navigate(`/${role}`);
        } else if (user && user.role !== role) {
          toast.error(`Invalid role selected. This account is a ${user.role}.`);
        } else {
          toast.error('Invalid credentials. Please try again.');
        }
      }
      
      setLoading(false);
    }, 500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 animate-fade-in neon-glow">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center neon-glow">
            <GraduationCap className="h-8 w-8 text-background" />
          </div>
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-heading font-bold mb-2">Welcome Back</h1>
          <p className="text-sm text-muted-foreground">Sign in to access your portal</p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-6">
          {/* Role Selection */}
          <div className="space-y-2">
            <Label htmlFor="role">Select Role</Label>
            <Select value={role} onValueChange={(value) => setRole(value as UserRole)}>
              <SelectTrigger id="role" className="bg-muted border-border">
                <SelectValue placeholder="Choose your role" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="teacher">Teacher</SelectItem>
                <SelectItem value="student">Student</SelectItem>
                <SelectItem value="parent">Parent</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Username/Email */}
          <div className="space-y-2">
            <Label htmlFor="username">{role === 'parent' ? 'Email' : 'Username'}</Label>
            <Input
              id="username"
              type={role === 'parent' ? 'email' : 'text'}
              placeholder={role === 'parent' ? 'Enter your email' : 'Enter your username'}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="bg-muted border-border"
            />
          </div>

          {/* Password */}
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="bg-muted border-border"
            />
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-background font-semibold neon-glow"
            disabled={loading}
          >
            {loading ? (
              'Signing In...'
            ) : (
              <>
                <LogIn className="mr-2 h-4 w-4" />
                Sign In
              </>
            )}
          </Button>
        </form>

        {/* Back Link */}
        <div className="mt-6 text-center">
          <button
            onClick={() => navigate('/')}
            className="text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            ← Back to Home
          </button>
        </div>
      </Card>
    </div>
  );
};

export default Login;
