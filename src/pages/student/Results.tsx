import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getResultRecords, getCourses } from '@/lib/storage';
import { getAuthUser } from '@/lib/auth';
import { useEffect, useState } from 'react';
import { TrendingUp, Award } from 'lucide-react';

const StudentResults = () => {
  const authUser = getAuthUser();
  const [courses, setCourses] = useState<any[]>([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [courseResult, setCourseResult] = useState<any>(null);
  const [classAverage, setClassAverage] = useState(0);

  useEffect(() => {
    if (!authUser) return;

    const allCourses = getCourses();
    const results = getResultRecords();
    
    // Get courses where student has results
    const studentResults = results.filter(r => r.studentId === authUser.id);
    const coursesWithResults = allCourses.filter(c => 
      studentResults.some(r => r.courseId === c.id)
    );
    
    setCourses(coursesWithResults);
    
    // Auto-select first course if available
    if (coursesWithResults.length > 0 && !selectedCourse) {
      setSelectedCourse(coursesWithResults[0].id);
    }
  }, [authUser]);

  useEffect(() => {
    if (!authUser || !selectedCourse) return;

    const results = getResultRecords();
    const studentResult = results.find(
      r => r.studentId === authUser.id && r.courseId === selectedCourse
    );

    setCourseResult(studentResult || null);

    // Calculate class average
    const courseResults = results.filter(r => r.courseId === selectedCourse);
    if (courseResults.length > 0) {
      const totalSum = courseResults.reduce((sum, r) => sum + (r.total || 0), 0);
      const avg = totalSum / courseResults.length;
      setClassAverage(Math.round(avg * 100) / 100);
    } else {
      setClassAverage(0);
    }
  }, [authUser, selectedCourse]);

  const selectedCourseData = courses.find(c => c.id === selectedCourse);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-heading font-bold mb-2">My Results</h1>
          <p className="text-muted-foreground">View your academic performance and grades</p>
        </div>

        {courses.length > 0 ? (
          <>
            {/* Course Selection */}
            <Card className="p-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Select Course</label>
                <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                  <SelectTrigger className="bg-muted border-border">
                    <SelectValue placeholder="Choose a course" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    {courses.map(course => (
                      <SelectItem key={course.id} value={course.id}>
                        {course.name} ({course.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </Card>

            {/* Results Display */}
            {courseResult && (
              <>
                {/* Summary Cards */}
                <div className="grid gap-6 md:grid-cols-3">
                  <Card className="p-6 neon-glow">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Award className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Final Grade</p>
                        <p className="text-3xl font-heading font-bold text-primary">{courseResult.grade}</p>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-6 neon-glow-secondary">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-secondary/10 flex items-center justify-center">
                        <TrendingUp className="h-6 w-6 text-secondary" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Total Score</p>
                        <p className="text-3xl font-heading font-bold">{courseResult.total}%</p>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-6">
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Class Average</p>
                      <p className="text-3xl font-heading font-bold">{classAverage}%</p>
                      <p className="text-sm mt-1">
                        <span className={courseResult.total >= classAverage ? 'text-primary' : 'text-destructive'}>
                          {courseResult.total >= classAverage ? '↑' : '↓'} 
                          {' '}{Math.abs(Math.round((courseResult.total - classAverage) * 100) / 100)} points
                        </span>
                      </p>
                    </div>
                  </Card>
                </div>

                {/* Detailed Breakdown */}
                <Card className="p-6">
                  <h2 className="text-xl font-heading font-semibold mb-6">
                    {selectedCourseData?.name} - Assessment Breakdown
                  </h2>
                  
                  <div className="space-y-4">
                    {/* Quiz */}
                    <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50 border border-border">
                      <span className="font-medium">Quiz</span>
                      <span className="text-lg font-bold text-primary">{courseResult.quiz} / 10</span>
                    </div>

                    {/* Assignment */}
                    <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50 border border-border">
                      <span className="font-medium">Assignment</span>
                      <span className="text-lg font-bold text-primary">{courseResult.assignment} / 10</span>
                    </div>

                    {/* Midterm */}
                    <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50 border border-border">
                      <span className="font-medium">Midterm</span>
                      <span className="text-lg font-bold text-primary">{courseResult.mid} / 30</span>
                    </div>

                    {/* Final */}
                    <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50 border border-border">
                      <span className="font-medium">Final</span>
                      <span className="text-lg font-bold text-primary">{courseResult.final} / 50</span>
                    </div>

                    {/* Total */}
                    <div className="mt-6 p-6 rounded-lg bg-gradient-to-r from-primary/10 to-secondary/10 border-2 border-primary/20">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between pb-3 border-b border-border">
                          <span className="text-sm text-muted-foreground">Total</span>
                          <span className="text-lg font-semibold">{courseResult.total} / 100</span>
                        </div>
                        <div className="flex items-center justify-between pb-3 border-b border-border">
                          <span className="text-sm text-muted-foreground">Percentage</span>
                          <span className="text-lg font-semibold">{courseResult.total}%</span>
                        </div>
                        <div className="flex items-center justify-between pt-2">
                          <span className="text-sm text-muted-foreground">Grade</span>
                          <span className="text-3xl font-heading font-bold text-primary">{courseResult.grade}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </>
            )}
          </>
        ) : (
          <Card className="p-12">
            <div className="text-center">
              <TrendingUp className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-xl text-muted-foreground">No results available yet</p>
              <p className="text-sm text-muted-foreground mt-2">
                Results will appear here once your teacher uploads them
              </p>
            </div>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default StudentResults;
