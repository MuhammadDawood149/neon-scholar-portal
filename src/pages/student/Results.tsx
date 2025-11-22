import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getResultRecords, getCourses } from '@/lib/storage';
import { getAuthUser } from '@/lib/auth';
import { useEffect, useState } from 'react';
import { ResultRecord, Course } from '@/lib/types';
import { Trophy, TrendingUp } from 'lucide-react';

const StudentResults = () => {
  const user = getAuthUser();
  const [results, setResults] = useState<ResultRecord[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [totals, setTotals] = useState({ marks: 0, maxMarks: 0 });

  useEffect(() => {
    if (!user) return;

    const records = getResultRecords().filter(r => r.studentId === user.id);
    setResults(records.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    setCourses(getCourses());

    const totalMarks = records.reduce((sum, r) => sum + r.marks, 0);
    const totalMax = records.reduce((sum, r) => sum + r.maxMarks, 0);
    setTotals({ marks: totalMarks, maxMarks: totalMax });
  }, [user]);

  const getCourseName = (courseId: string) => {
    const course = courses.find(c => c.id === courseId);
    return course ? `${course.name} (${course.code})` : courseId;
  };

  const overallPercentage = totals.maxMarks > 0 
    ? Math.round((totals.marks / totals.maxMarks) * 100) 
    : 0;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-heading font-bold mb-2">My Results</h1>
          <p className="text-muted-foreground">View your academic performance and grades</p>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="p-6 neon-glow">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Trophy className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Overall Score</p>
                <p className="text-2xl font-heading font-bold">
                  {totals.marks}/{totals.maxMarks}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6 neon-glow-secondary">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-secondary/10 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-secondary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Percentage</p>
                <p className="text-2xl font-heading font-bold">{overallPercentage}%</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <span className="text-2xl font-heading font-bold text-primary">
                  {results.length > 0 ? results[0].grade : '-'}
                </span>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Latest Grade</p>
                <p className="text-xl font-heading font-bold">
                  {results.length > 0 ? results[0].assessment : '-'}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Results Table */}
        <Card className="p-6">
          <h2 className="text-xl font-heading font-semibold mb-4">Assessment Results</h2>
          <div className="rounded-md border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>Date</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead>Assessment</TableHead>
                  <TableHead>Marks</TableHead>
                  <TableHead>Percentage</TableHead>
                  <TableHead>Grade</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {results.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                      No results found
                    </TableCell>
                  </TableRow>
                ) : (
                  results.map((record) => {
                    const percentage = Math.round((record.marks / record.maxMarks) * 100);
                    return (
                      <TableRow key={record.id}>
                        <TableCell className="font-medium">
                          {new Date(record.date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </TableCell>
                        <TableCell>{getCourseName(record.courseId)}</TableCell>
                        <TableCell>{record.assessment}</TableCell>
                        <TableCell>
                          {record.marks}/{record.maxMarks}
                        </TableCell>
                        <TableCell>
                          <span className={`font-semibold ${
                            percentage >= 75 ? 'text-primary' : 
                            percentage >= 50 ? 'text-secondary' : 
                            'text-destructive'
                          }`}>
                            {percentage}%
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="px-3 py-1 rounded-full bg-primary/10 text-primary font-semibold">
                            {record.grade}
                          </span>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default StudentResults;
