import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/card';
import { getAttendanceRecords, getResultRecords } from '@/lib/storage';
import { getAuthUser } from '@/lib/auth';
import { useEffect, useState } from 'react';
import { CheckCircle2, XCircle, TrendingUp } from 'lucide-react';

const StudentDashboard = () => {
  const user = getAuthUser();
  const [stats, setStats] = useState({
    attendancePercentage: 0,
    totalClasses: 0,
    present: 0,
    latestGrade: '-',
  });

  useEffect(() => {
    if (!user) return;

    const attendance = getAttendanceRecords().filter(a => a.studentId === user.id);
    const results = getResultRecords().filter(r => r.studentId === user.id);

    const present = attendance.filter(a => a.status === 'present').length;
    const total = attendance.length;
    const percentage = total > 0 ? Math.round((present / total) * 100) : 0;

    const latestResult = results.sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    )[0];

    setStats({
      attendancePercentage: percentage,
      totalClasses: total,
      present,
      latestGrade: latestResult?.grade || '-',
    });
  }, [user]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-heading font-bold mb-2">Welcome, {user?.name}</h1>
          <p className="text-muted-foreground">Here's your academic overview</p>
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
