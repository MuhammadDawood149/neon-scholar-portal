import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getResultRecords, getCourses, getUsers } from '@/lib/storage';
import { getAuthUser } from '@/lib/auth';
import { useEffect, useState } from 'react';
import { TrendingUp, Award } from 'lucide-react';
import { CategoryData } from '@/lib/types';

type CategoryType = 'quiz' | 'assignment' | 'midterm' | 'final';

const CATEGORY_NAMES: Record<CategoryType, string> = {
  quiz: 'Quizzes',
  assignment: 'Assignments',
  midterm: 'Midterm',
  final: 'Final',
};

const StudentResults = () => {
  const authUser = getAuthUser();
  const [courses, setCourses] = useState<any[]>([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [courseResult, setCourseResult] = useState<any>(null);
  const [classAverages, setClassAverages] = useState<{
    overall: number;
    categories: Record<CategoryType, number>;
  }>({ overall: 0, categories: { quiz: 0, assignment: 0, midterm: 0, final: 0 } });

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

    // Calculate class averages
    const courseResults = results.filter(r => r.courseId === selectedCourse);
    if (courseResults.length > 0) {
      // Overall average
      const overallAvg = courseResults.reduce((sum, r) => sum + (r.overallTotal || r.total || 0), 0) / courseResults.length;
      
      // Category averages
      const categoryAverages: Record<CategoryType, number> = {
        quiz: 0,
        assignment: 0,
        midterm: 0,
        final: 0,
      };

      (['quiz', 'assignment', 'midterm', 'final'] as CategoryType[]).forEach(category => {
        const validResults = courseResults.filter(r => r.categories?.[category]);
        if (validResults.length > 0) {
          const categorySum = validResults.reduce((sum, r) => {
            const items = r.categories[category].items || [];
            const consideredItems = items.filter((item: any) => item.considered);
            const obtained = consideredItems.reduce((s: number, item: any) => {
              const studentScore = item.scores?.[r.studentId] ?? 0;
              return s + studentScore;
            }, 0);
            return sum + obtained;
          }, 0);
          categoryAverages[category] = Math.round(categorySum / validResults.length * 100) / 100;
        }
      });

      setClassAverages({
        overall: Math.round(overallAvg * 100) / 100,
        categories: categoryAverages,
      });
    } else {
      setClassAverages({ overall: 0, categories: { quiz: 0, assignment: 0, midterm: 0, final: 0 } });
    }
  }, [authUser, selectedCourse]);

  const getCategoryTotal = (category: CategoryData, studentId: string): { obtained: number; total: number } => {
    const items = category?.items || [];
    const consideredItems = items.filter(item => item.considered);
    return {
      obtained: consideredItems.reduce((sum, item) => {
        const score = item.scores?.[studentId] ?? 0;
        return sum + score;
      }, 0),
      total: consideredItems.reduce((sum, item) => sum + item.total, 0),
    };
  };

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
            {courseResult && courseResult.categories && (
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
                        <p className="text-3xl font-heading font-bold">{courseResult.overallTotal || courseResult.total}/100</p>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-6">
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Class Average</p>
                      <p className="text-3xl font-heading font-bold">{classAverages.overall}%</p>
                      <p className="text-sm mt-1">
                        <span className={(courseResult.overallTotal || courseResult.total) >= classAverages.overall ? 'text-primary' : 'text-destructive'}>
                          {(courseResult.overallTotal || courseResult.total) >= classAverages.overall ? '↑' : '↓'} 
                          {' '}{Math.abs(Math.round(((courseResult.overallTotal || courseResult.total) - classAverages.overall) * 100) / 100)} points
                        </span>
                      </p>
                    </div>
                  </Card>
                </div>

                {/* Category Breakdown */}
                <Card className="p-6">
                  <h2 className="text-xl font-heading font-semibold mb-6">
                    {selectedCourseData?.name} - Assessment Breakdown
                  </h2>
                  
                  <div className="space-y-6">
                    {(['quiz', 'assignment', 'midterm', 'final'] as CategoryType[]).map(category => {
                      const categoryData = courseResult.categories[category];
                      if (!categoryData || categoryData.items.length === 0) return null;

                      const categoryTotals = getCategoryTotal(categoryData, authUser?.id || '');
                      const consideredItems = categoryData.items.filter((item: any) => item.considered);
                      const categoryMax = categoryData.max || 0;
                      const remainingMarks = categoryMax - categoryTotals.total;

                      return (
                        <div key={category} className="space-y-3">
                          {/* Category Header */}
                          <div className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20">
                            <div>
                              <h3 className="font-semibold text-lg">{CATEGORY_NAMES[category]}</h3>
                              <p className="text-sm text-muted-foreground mt-1">
                                Class Average: {classAverages.categories[category]} marks
                              </p>
                              {remainingMarks > 0 && (
                                <p className="text-sm text-muted-foreground italic mt-1">
                                  Remaining: {remainingMarks} marks (max: {categoryMax})
                                </p>
                              )}
                            </div>
                            <div className="text-right">
                              <p className="text-3xl font-bold text-primary">{categoryTotals.obtained}</p>
                              <p className="text-sm text-muted-foreground">out of {categoryTotals.total}</p>
                            </div>
                          </div>

                          {/* Individual Items */}
                          <div className="grid gap-3 md:grid-cols-2">
                            {consideredItems.map((item: any, index: number) => {
                              const obtained = item.scores?.[authUser?.id || ''] ?? 0;
                              return (
                                <div key={item.id || index} className="p-3 rounded-lg border border-border hover:border-primary/50 transition-colors">
                                  <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-medium">{item.name || `Item ${index + 1}`}</span>
                                    <span className="text-lg font-bold">{obtained}/{item.total}</span>
                                  </div>
                                  
                                  {/* Progress Bar */}
                                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                                    <div
                                      className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-500"
                                      style={{ width: `${(obtained / item.total) * 100}%` }}
                                    />
                                  </div>
                                  <p className="text-xs text-muted-foreground mt-1 text-right">
                                    {Math.round((obtained / item.total) * 100)}%
                                  </p>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Overall Total Section */}
                  <div className="mt-8 p-6 rounded-lg bg-gradient-to-r from-primary/10 to-secondary/10 border-2 border-primary/20">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-xl font-heading font-bold">Overall Total</h3>
                        <p className="text-sm text-muted-foreground mt-1">Combined score across all categories</p>
                      </div>
                      <div className="text-right">
                        <p className="text-4xl font-heading font-bold text-primary">{courseResult.overallTotal || courseResult.total}/100</p>
                        <p className="text-xl font-semibold mt-1">Grade: {courseResult.grade}</p>
                      </div>
                    </div>
                  </div>
                </Card>
              </>
            )}

            {/* Fallback for old format */}
            {courseResult && !courseResult.categories && courseResult.assessments && (
              <Card className="p-6">
                <p className="text-center text-muted-foreground py-4">
                  Results are in old format. Teacher needs to re-upload using new system.
                </p>
              </Card>
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
