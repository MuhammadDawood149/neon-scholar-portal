import { Button } from '@/components/ui/button';
import { GraduationCap, BookOpen, BarChart3, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useInitStorage } from '@/hooks/useInitStorage';

const Landing = () => {
  const navigate = useNavigate();
  useInitStorage();

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-6xl w-full">
        <div className="text-center space-y-8 animate-fade-in">
          {/* Logo */}
          <div className="flex justify-center">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center neon-glow animate-glow">
              <GraduationCap className="h-10 w-10 text-background" />
            </div>
          </div>

          {/* Hero Text */}
          <div className="space-y-4">
            <h1 className="text-5xl md:text-7xl font-heading font-bold bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent">
              Student Attendance & Result Portal
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              A comprehensive platform for managing student attendance, tracking academic performance, and streamlining educational administration.
            </p>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-6 mt-12">
            <div className="p-6 rounded-xl bg-card border border-border card-hover">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 neon-glow">
                <BookOpen className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-heading font-semibold mb-2">Attendance Tracking</h3>
              <p className="text-sm text-muted-foreground">
                Real-time attendance monitoring with detailed reports and analytics
              </p>
            </div>

            <div className="p-6 rounded-xl bg-card border border-border card-hover">
              <div className="w-12 h-12 rounded-lg bg-secondary/10 flex items-center justify-center mb-4 neon-glow-secondary">
                <BarChart3 className="h-6 w-6 text-secondary" />
              </div>
              <h3 className="text-lg font-heading font-semibold mb-2">Result Management</h3>
              <p className="text-sm text-muted-foreground">
                Efficient grade tracking and performance analysis for students
              </p>
            </div>

            <div className="p-6 rounded-xl bg-card border border-border card-hover">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 neon-glow">
                <GraduationCap className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-heading font-semibold mb-2">Multi-Role Access</h3>
              <p className="text-sm text-muted-foreground">
                Separate dashboards for admins, teachers, and students
              </p>
            </div>
          </div>

          {/* CTA */}
          <div className="pt-8">
            <Button
              onClick={() => navigate('/login')}
              size="lg"
              className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-background font-semibold neon-glow group"
            >
              Get Started
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>

          {/* Demo Credentials */}
          <div className="mt-12 p-6 rounded-xl bg-muted/30 border border-border max-w-2xl mx-auto">
            <p className="text-sm text-muted-foreground mb-3 font-semibold">Demo Credentials:</p>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="font-medium text-primary">Admin</p>
                <p className="text-muted-foreground">admin / admin123</p>
              </div>
              <div>
                <p className="font-medium text-secondary">Teacher</p>
                <p className="text-muted-foreground">teacher1 / teacher123</p>
              </div>
              <div>
                <p className="font-medium text-primary">Student</p>
                <p className="text-muted-foreground">student1 / student123</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing;
