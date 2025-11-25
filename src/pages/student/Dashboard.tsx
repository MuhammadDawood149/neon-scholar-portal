import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/card';
import { getAttendanceRecords, getResultRecords, getUsers } from '@/lib/storage';
import { getAuthUser } from '@/lib/auth';
import { useEffect, useState } from 'react';
import { CheckCircle2, XCircle, TrendingUp, User as UserIcon } from 'lucide-react';

const StudentDashboard = () => {
  const authUser = getAuthUser();
  const [user, setUser] = useState(authUser);
  const [stats, setStats] = useState({
    attendancePercentage: 0,
    totalClasses: 0,
    present: 0,
    latestGrade: '-',
  });

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

  useEffect(() => {
    if (!authUser) return;

    const attendance = getAttendanceRecords().filter(a => a.studentId === authUser.id);
    const results = getResultRecords().filter(r => r.studentId === authUser.id);

    // Count total attendance records
    let totalClasses = 0;
    let presentCount = 0;
    attendance.forEach(record => {
      // Safety check: ensure records array exists
      if (record.records && Array.isArray(record.records)) {
        record.records.forEach(rec => {
          totalClasses++;
          if (rec.status === 'present') presentCount++;
        });
      }
    });

    const percentage = totalClasses > 0 ? Math.round((presentCount / totalClasses) * 100) : 0;

    // Get latest grade from results
    const latestResult = results.length > 0 ? results[results.length - 1] : null;

    setStats({
      attendancePercentage: percentage,
      totalClasses,
      present: presentCount,
      latestGrade: latestResult?.grade || '-',
    });
  }, [authUser]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-6">
          <div className="relative w-24 h-24 rounded-full border-2 border-primary/30 overflow-hidden bg-card flex items-center justify-center shadow-[0_0_8px_rgba(58,180,255,0.4)] hover:scale-105 transition-transform">
            {user?.profileImage && user.profileImage !== 'default' ? (
              <img src={user.profileImage} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-3xl font-heading text-primary">
                {user?.name ? getInitials(user.name) : <UserIcon className="h-12 w-12" />}
              </span>
            )}
          </div>
          <div>
            <h1 className="text-3xl font-heading font-bold mb-2">Welcome, {user?.name}</h1>
            <p className="text-muted-foreground">Here's your academic overview</p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Attendance Card */}
          <Card className="p-6 card-hover">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="relative w-32 h-32">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    className="text-muted"
                  />
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 56}`}
                    strokeDashoffset={`${2 * Math.PI * 56 * (1 - stats.attendancePercentage / 100)}`}
                    className="text-primary transition-all duration-1000 neon-glow"
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div>
                    <p className="text-3xl font-heading font-bold">{stats.attendancePercentage}%</p>
                    <p className="text-xs text-muted-foreground">Attendance</p>
                  </div>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">
                  {stats.present} present out of {stats.totalClasses} classes
                </p>
              </div>
            </div>
          </Card>

          {/* Latest Grade */}
          <Card className="p-6 card-hover">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-secondary/10 flex items-center justify-center neon-glow-secondary">
                  <TrendingUp className="h-6 w-6 text-secondary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Latest Grade</p>
                  <p className="text-3xl font-heading font-bold">{stats.latestGrade}</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Check your results page for detailed performance
              </p>
            </div>
          </Card>

          {/* Quick Stats */}
          <Card className="p-6 card-hover">
            <h3 className="text-lg font-heading font-semibold mb-4">Quick Stats</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  <span className="text-sm">Classes Attended</span>
                </div>
                <span className="font-semibold">{stats.present}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <XCircle className="h-4 w-4 text-destructive" />
                  <span className="text-sm">Classes Missed</span>
                </div>
                <span className="font-semibold">{stats.totalClasses - stats.present}</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Quick Links */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="p-6 card-hover">
            <h3 className="text-lg font-heading font-semibold mb-4">Quick Links</h3>
            <div className="space-y-3">
              <a
                href="/student/attendance"
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <CheckCircle2 className="h-5 w-5 text-primary" />
                <span>View My Attendance</span>
              </a>
              <a
                href="/student/results"
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <TrendingUp className="h-5 w-5 text-secondary" />
                <span>View My Results</span>
              </a>
            </div>
          </Card>

          <Card className="p-6 card-hover">
            <h3 className="text-lg font-heading font-semibold mb-4">Academic Status</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Attendance Status</span>
                <span className={`text-sm font-semibold ${
                  stats.attendancePercentage >= 75 ? 'text-primary' : 'text-destructive'
                }`}>
                  {stats.attendancePercentage >= 75 ? 'Good Standing' : 'Need Improvement'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Overall Performance</span>
                <span className="text-sm text-primary font-semibold">Active</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StudentDashboard;
