import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getAttendanceRecords, getCourses } from '@/lib/storage';
import { getAuthUser } from '@/lib/auth';
import { useEffect, useState } from 'react';
import { AttendanceRecord, Course } from '@/lib/types';
import { CheckCircle2, XCircle } from 'lucide-react';

const StudentAttendance = () => {
  const user = getAuthUser();
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [percentage, setPercentage] = useState(0);

  useEffect(() => {
    if (!user) return;

    const records = getAttendanceRecords().filter(a => a.studentId === user.id);
    setAttendance(records.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    setCourses(getCourses());

    const present = records.filter(a => a.status === 'present').length;
    const total = records.length;
    setPercentage(total > 0 ? Math.round((present / total) * 100) : 0);
  }, [user]);

  const getCourseName = (courseId: string) => {
    const course = courses.find(c => c.id === courseId);
    return course ? `${course.name} (${course.code})` : courseId;
  };

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
              <p className="text-4xl font-heading font-bold text-primary">{percentage}%</p>
              <p className="text-sm text-muted-foreground mt-2">Overall Attendance</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-heading font-bold">
                {attendance.filter(a => a.status === 'present').length}
              </p>
              <p className="text-sm text-muted-foreground mt-2">Classes Attended</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-heading font-bold">{attendance.length}</p>
              <p className="text-sm text-muted-foreground mt-2">Total Classes</p>
            </div>
          </div>
        </Card>

        {/* Attendance Table */}
        <Card className="p-6">
          <h2 className="text-xl font-heading font-semibold mb-4">Attendance Records</h2>
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
                {attendance.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground py-8">
                      No attendance records found
                    </TableCell>
                  </TableRow>
                ) : (
                  attendance.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell className="font-medium">
                        {new Date(record.date).toLocaleDateString('en-US', {
                          weekday: 'short',
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </TableCell>
                      <TableCell>{getCourseName(record.courseId)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {record.status === 'present' ? (
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
