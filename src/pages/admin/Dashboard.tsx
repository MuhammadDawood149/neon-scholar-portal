import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatsCard } from '@/components/ui/stats-card';
import { Users, GraduationCap, BookOpen, TrendingUp } from 'lucide-react';
import { getUsers, getCourses, getAttendanceRecords, getResultRecords } from '@/lib/storage';
import { useEffect, useState } from 'react';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalTeachers: 0,
    totalCourses: 0,
    totalRecords: 0,
  });

  useEffect(() => {
    const users = getUsers();
    const courses = getCourses();
    const attendance = getAttendanceRecords();
    const results = getResultRecords();

    setStats({
      totalStudents: users.filter(u => u.role === 'student').length,
      totalTeachers: users.filter(u => u.role === 'teacher').length,
      totalCourses: courses.length,
      totalRecords: attendance.length + results.length,
    });
  }, []);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-heading font-bold mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">Overview of system statistics and management</p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Total Students"
            value={stats.totalStudents}
            icon={GraduationCap}
            trend="+2 this week"
          />
          <StatsCard
            title="Total Teachers"
            value={stats.totalTeachers}
            icon={Users}
            trend="Active"
          />
          <StatsCard
            title="Total Courses"
            value={stats.totalCourses}
            icon={BookOpen}
            trend="All semesters"
          />
          <StatsCard
            title="System Records"
            value={stats.totalRecords}
            icon={TrendingUp}
            trend="Up to date"
          />
        </div>

        {/* Quick Actions */}
        <div className="grid gap-6 md:grid-cols-2 mt-8">
          <div className="p-6 rounded-xl bg-card border border-border card-hover">
            <h3 className="text-lg font-heading font-semibold mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <a
                href="/admin/users"
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <Users className="h-5 w-5 text-primary" />
                <span>Manage Users</span>
              </a>
              <a
                href="/admin/records"
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <BookOpen className="h-5 w-5 text-secondary" />
                <span>View All Records</span>
              </a>
            </div>
          </div>

          <div className="p-6 rounded-xl bg-card border border-border card-hover">
            <h3 className="text-lg font-heading font-semibold mb-4">System Health</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Database</span>
                <span className="text-sm text-primary font-semibold">Operational</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Storage</span>
                <span className="text-sm text-primary font-semibold">Available</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Last Backup</span>
                <span className="text-sm text-muted-foreground">Today</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
