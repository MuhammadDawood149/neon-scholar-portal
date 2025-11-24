import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatsCard } from '@/components/ui/stats-card';
import { BookOpen, ClipboardCheck, BarChart3, TrendingUp, User as UserIcon } from 'lucide-react';
import { getCourses, getAttendanceRecords, getResultRecords, getUsers } from '@/lib/storage';
import { getAuthUser } from '@/lib/auth';
import { useEffect, useState } from 'react';
import { getValidStudentIds } from '@/lib/utils';

const TeacherDashboard = () => {
  const authUser = getAuthUser();
  const [user, setUser] = useState(authUser);
  const [stats, setStats] = useState({
    coursesAssigned: 0,
    attendanceMarked: 0,
    resultsUploaded: 0,
    totalStudents: 0,
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
    const courses = getCourses();
    const attendance = getAttendanceRecords();
    const results = getResultRecords();
    const allUsers = getUsers();

    const teacherCourses = courses.filter(c => c.teacherId === authUser?.id);
    const teacherCourseIds = teacherCourses.map(c => c.id);

    const today = new Date().toISOString().split('T')[0];
    const todayAttendance = attendance.filter(a => a.date === today && teacherCourseIds.includes(a.courseId));

    // Count only valid students across all courses
    const allValidStudents = new Set<string>();
    teacherCourses.forEach(course => {
      const validStudentIds = getValidStudentIds(course.studentsEnrolled, allUsers);
      validStudentIds.forEach(studentId => allValidStudents.add(studentId));
    });

    setStats({
      coursesAssigned: teacherCourses.length,
      attendanceMarked: todayAttendance.length,
      resultsUploaded: results.filter(r => teacherCourseIds.includes(r.courseId)).length,
      totalStudents: allValidStudents.size,
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
            <h1 className="text-3xl font-heading font-bold mb-2">Teacher Dashboard</h1>
            <p className="text-muted-foreground">Welcome back, {user?.name}</p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Courses Assigned"
            value={stats.coursesAssigned}
            icon={BookOpen}
            trend="Active"
          />
          <StatsCard
            title="Attendance Today"
            value={stats.attendanceMarked}
            icon={ClipboardCheck}
            trend="Marked today"
          />
          <StatsCard
            title="Results Uploaded"
            value={stats.resultsUploaded}
            icon={BarChart3}
            trend="Total records"
          />
          <StatsCard
            title="Total Students"
            value={stats.totalStudents}
            icon={TrendingUp}
            trend="Enrolled"
          />
        </div>

        <div className="grid gap-6 md:grid-cols-2 mt-8">
          <div className="p-6 rounded-xl bg-card border border-border card-hover">
            <h3 className="text-lg font-heading font-semibold mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <a
                href="/teacher/attendance"
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <ClipboardCheck className="h-5 w-5 text-primary" />
                <span>Mark Attendance</span>
              </a>
              <a
                href="/teacher/results"
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <BarChart3 className="h-5 w-5 text-secondary" />
                <span>Upload Results</span>
              </a>
            </div>
          </div>

          <div className="p-6 rounded-xl bg-card border border-border card-hover">
            <h3 className="text-lg font-heading font-semibold mb-4">Recent Activity</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Last Attendance</span>
                <span className="text-sm text-primary font-semibold">Today</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Last Result Upload</span>
                <span className="text-sm text-muted-foreground">Yesterday</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Courses Active</span>
                <span className="text-sm text-primary font-semibold">{stats.coursesAssigned}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default TeacherDashboard;
