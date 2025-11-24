import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getAttendanceRecords, getCourses } from '@/lib/storage';
import { getAuthUser } from '@/lib/auth';
import { useEffect, useState } from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';

const StudentAttendance = () => {
  const user = getAuthUser();
  const [attendanceData, setAttendanceData] = useState<Array<{ date: string; course: string; status: string }>>([]);
  const [stats, setStats] = useState({ percentage: 0, present: 0, total: 0 });

  useEffect(() => {
    if (!user) return;

    const records = getAttendanceRecords().filter(r => r.studentId === user.id);
    const courses = getCourses();

    const flattenedData: Array<{ date: string; course: string; status: string }> = [];
    let totalPresent = 0;
    let totalClasses = 0;

    records.forEach(record => {
      const course = courses.find(c => c.id === record.courseId);
      record.records.forEach(rec => {
        flattenedData.push({
          date: rec.date,
          course: course ? `${course.name} (${course.code})` : 'Unknown Course',
          status: rec.status
        });
        totalClasses++;
        if (rec.status === 'present') totalPresent++;
      });
    });

    // Sort by date (newest first)
    flattenedData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const percentage = totalClasses > 0 ? Math.round((totalPresent / totalClasses) * 100) : 0;

    setAttendanceData(flattenedData);
    setStats({
      percentage,
      present: totalPresent,
      total: totalClasses
    });
  }, [user]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-heading font-bold mb-2">My Attendance</h1>
          <p className="text-muted-foreground">Track your attendance across all courses</p>
        </div>

        {/* Summary Card */}
        <Card className="p-6 neon-glow">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <p className="text-4xl font-heading font-bold text-primary">{stats.percentage}%</p>
              <p className="text-sm text-muted-foreground mt-2">Overall Attendance</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-heading font-bold">{stats.present}</p>
              <p className="text-sm text-muted-foreground mt-2">Classes Attended</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-heading font-bold">{stats.total}</p>
              <p className="text-sm text-muted-foreground mt-2">Total Classes</p>
            </div>
          </div>
        </Card>

        {/* Attendance History */}
        <Card className="p-6">
          <h2 className="text-xl font-heading font-semibold mb-4">Attendance History</h2>
          <div className="rounded-md border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>Date</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {attendanceData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground py-8">
                      No attendance records found
                    </TableCell>
                  </TableRow>
                ) : (
                  attendanceData.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">
                        {new Date(item.date).toLocaleDateString('en-US', {
                          weekday: 'short',
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </TableCell>
                      <TableCell>{item.course}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {item.status === 'present' ? (
                            <>
                              <CheckCircle2 className="h-4 w-4 text-primary" />
                              <span className="px-2 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
                                Present
                              </span>
                            </>
                          ) : (
                            <>
                              <XCircle className="h-4 w-4 text-destructive" />
                              <span className="px-2 py-1 rounded-full bg-destructive/10 text-destructive text-xs font-semibold">
                                Absent
                              </span>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default StudentAttendance;
