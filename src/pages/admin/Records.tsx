import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getAttendanceRecords, getResultRecords, getUsers, getCourses } from '@/lib/storage';
import { useState, useEffect } from 'react';

const ViewRecords = () => {
  const [attendanceData, setAttendanceData] = useState<Array<{ studentName: string; course: string; date: string; status: string }>>([]);
  const [resultsData, setResultsData] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    const allUsers = getUsers();
    const courses = getCourses();
    const attendance = getAttendanceRecords();
    const results = getResultRecords();

    setUsers(allUsers);

    // Flatten attendance data
    const flattenedAttendance: Array<{ studentName: string; course: string; date: string; status: string }> = [];
    attendance.forEach(record => {
      const student = allUsers.find(u => u.id === record.studentId);
      const course = courses.find(c => c.id === record.courseId);
      record.records.forEach(rec => {
        flattenedAttendance.push({
          studentName: student?.name || 'Unknown',
          course: course ? `${course.name} (${course.code})` : 'Unknown',
          date: rec.date,
          status: rec.status
        });
      });
    });
    setAttendanceData(flattenedAttendance);

    // Process results data
    const processedResults = results.map(result => {
      const student = allUsers.find(u => u.id === result.studentId);
      const course = courses.find(c => c.id === result.courseId);
      return {
        studentName: student?.name || 'Unknown',
        course: course ? `${course.name} (${course.code})` : 'Unknown',
        total: result.total,
        grade: result.grade,
        assessments: result.assessments
      };
    });
    setResultsData(processedResults);
  }, []);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-heading font-bold mb-2">View Records</h1>
          <p className="text-muted-foreground">View all attendance and result records</p>
        </div>

        <Tabs defaultValue="attendance" className="space-y-4">
          <TabsList className="bg-muted">
            <TabsTrigger value="attendance">Attendance Records</TabsTrigger>
            <TabsTrigger value="results">Result Records</TabsTrigger>
          </TabsList>

          <TabsContent value="attendance">
            <Card className="p-6">
              <h2 className="text-xl font-heading font-semibold mb-4">Attendance Records</h2>
              <div className="rounded-md border border-border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead>Student Name</TableHead>
                      <TableHead>Course</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {attendanceData.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                          No attendance records found
                        </TableCell>
                      </TableRow>
                    ) : (
                      attendanceData.map((record, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{record.studentName}</TableCell>
                          <TableCell>{record.course}</TableCell>
                          <TableCell>{new Date(record.date).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                record.status === 'present'
                                  ? 'bg-primary/10 text-primary'
                                  : 'bg-destructive/10 text-destructive'
                              }`}
                            >
                              {record.status}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="results">
            <Card className="p-6">
              <h2 className="text-xl font-heading font-semibold mb-4">Result Records</h2>
              <div className="rounded-md border border-border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead>Student Name</TableHead>
                      <TableHead>Course</TableHead>
                      <TableHead>Assessments</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Grade</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {resultsData.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                          No result records found
                        </TableCell>
                      </TableRow>
                    ) : (
                      resultsData.map((record, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{record.studentName}</TableCell>
                          <TableCell>{record.course}</TableCell>
                          <TableCell>
                            <div className="text-xs space-y-1">
                              {record.assessments.map((a: any, i: number) => (
                                <div key={i}>
                                  {a.type}: {a.obtained}/{a.weight}
                                </div>
                              ))}
                            </div>
                          </TableCell>
                          <TableCell className="font-semibold">{record.total}/100</TableCell>
                          <TableCell>
                            <span className="px-2 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
                              {record.grade}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default ViewRecords;
