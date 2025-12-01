import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/card';
import { getUsers, getCourses, getAttendanceRecords, getResultRecords } from '@/lib/storage';
import { User, Course, AttendanceRecord, ResultRecord } from '@/lib/types';
import { CheckCircle2, XCircle } from 'lucide-react';

const ParentDashboard = () => {
  const [student, setStudent] = useState<User | null>(null);
  const [attendanceStats, setAttendanceStats] = useState({ present: 0, absent: 0, percentage: 0 });
  const [results, setResults] = useState<Array<ResultRecord & { courseName: string }>>([]);

  useEffect(() => {
    const parentData = localStorage.getItem('portal_current_parent');
    if (!parentData) return;

    const parent = JSON.parse(parentData);
    const users = getUsers();
    const studentData = users.find(u => u.id === parent.studentId);
    
    if (!studentData) return;
    setStudent(studentData);

    // Load attendance stats
    const attendanceRecords = getAttendanceRecords();
    const studentAttendance = attendanceRecords.filter(r => r.studentId === parent.studentId);
    
    let present = 0;
    let absent = 0;
    studentAttendance.forEach(record => {
      // Safety check: ensure records array exists
      if (record.records && Array.isArray(record.records)) {
        record.records.forEach(r => {
          if (r.status === 'present') present++;
          else absent++;
        });
      }
    });

    const total = present + absent;
    const percentage = total > 0 ? Math.round((present / total) * 100) : 0;
    setAttendanceStats({ present, absent, percentage });

    // Load results
    const resultRecords = getResultRecords();
    const courses = getCourses();
    const studentResults = resultRecords
      .filter(r => r.studentId === parent.studentId)
      .map(r => {
        const course = courses.find(c => c.id === r.courseId);
        return {
          ...r,
          courseName: course?.name || 'Unknown Course'
        };
      });
    setResults(studentResults);
  }, []);

  if (!student) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading student data...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-heading font-bold mb-2">Parent Dashboard</h1>
          <p className="text-muted-foreground">Child: {student.name}</p>
        </div>

        {/* Attendance Summary */}
        <Card className="p-6">
          <h2 className="text-xl font-heading font-semibold mb-4">Attendance Summary</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
              <p className="text-sm text-muted-foreground mb-1">Present Days</p>
              <p className="text-3xl font-bold text-green-500">{attendanceStats.present}</p>
            </div>
            <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
              <p className="text-sm text-muted-foreground mb-1">Absent Days</p>
              <p className="text-3xl font-bold text-red-500">{attendanceStats.absent}</p>
            </div>
            <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
              <p className="text-sm text-muted-foreground mb-1">Attendance Percentage</p>
              <p className="text-3xl font-bold text-primary">{attendanceStats.percentage}%</p>
            </div>
          </div>
        </Card>

        {/* Results Summary */}
        <Card className="p-6">
          <h2 className="text-xl font-heading font-semibold mb-4">Result Summary</h2>
          {results.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No results available yet.</p>
          ) : (
            <div className="space-y-6">
              {results.map((result) => (
                <div key={result.courseId} className="p-4 rounded-lg border border-border bg-muted/30">
                  <h3 className="text-lg font-semibold mb-3">{result.courseName}</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Quiz</p>
                      <p className="text-lg font-semibold">{result.quiz} / 10</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Assignment</p>
                      <p className="text-lg font-semibold">{result.assignment} / 10</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Midterm</p>
                      <p className="text-lg font-semibold">{result.mid} / 30</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Final</p>
                      <p className="text-lg font-semibold">{result.final} / 50</p>
                    </div>
                  </div>
                  <div className="pt-4 border-t border-border flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total</p>
                      <p className="text-xl font-bold">{result.total} / 100</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Percentage</p>
                      <p className="text-xl font-bold">{result.total}%</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Grade</p>
                      <p className="text-3xl font-bold text-primary">{result.grade}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default ParentDashboard;
