import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getAttendanceRecords, getResultRecords, getUsers } from '@/lib/storage';
import { useState, useEffect } from 'react';
import { AttendanceRecord, ResultRecord, User } from '@/lib/types';

const ViewRecords = () => {
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [results, setResults] = useState<ResultRecord[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    setAttendance(getAttendanceRecords());
    setResults(getResultRecords());
    setUsers(getUsers());
  }, []);

  const getStudentName = (studentId: string) => {
    const student = users.find(u => u.id === studentId);
    return student?.name || 'Unknown';
  };

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
                      <TableHead>Course ID</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {attendance.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-muted-foreground">
                          No attendance records found
                        </TableCell>
                      </TableRow>
                    ) : (
                      attendance.map((record) => (
                        <TableRow key={record.id}>
                          <TableCell className="font-medium">{getStudentName(record.studentId)}</TableCell>
                          <TableCell>{record.courseId}</TableCell>
                          <TableCell>{new Date(record.date).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <span
                              className={`px-2 py-1 rounded-full text-xs ${
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
                      <TableHead>Course ID</TableHead>
                      <TableHead>Assessment</TableHead>
                      <TableHead>Marks</TableHead>
                      <TableHead>Grade</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {results.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground">
                          No result records found
                        </TableCell>
                      </TableRow>
                    ) : (
                      results.map((record) => (
                        <TableRow key={record.id}>
                          <TableCell className="font-medium">{getStudentName(record.studentId)}</TableCell>
                          <TableCell>{record.courseId}</TableCell>
                          <TableCell>{record.assessment}</TableCell>
                          <TableCell>
                            {record.marks}/{record.maxMarks}
                          </TableCell>
                          <TableCell>
                            <span className="px-2 py-1 rounded-full bg-primary/10 text-primary text-xs">
                              {record.grade}
                            </span>
                          </TableCell>
                          <TableCell>{new Date(record.date).toLocaleDateString()}</TableCell>
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
