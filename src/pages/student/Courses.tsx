import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { BookOpen, User as UserIcon, Users, TrendingUp, Calendar } from 'lucide-react';
import { getAuthUser } from '@/lib/auth';
import { getCourses, getUsers, getAttendanceRecords, getResultRecords } from '@/lib/storage';
import { useState, useEffect } from 'react';
import { Course, User, AttendanceRecord, ResultRecord } from '@/lib/types';

const StudentCourses = () => {
  const user = getAuthUser();
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [courseDetails, setCourseDetails] = useState<{
    teacher: User | null;
    totalStudents: number;
    attendancePercentage: number;
    results: ResultRecord[];
  } | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const allCourses = getCourses();
    const studentCourses = allCourses.filter(course => 
      (course.studentsEnrolled || []).includes(user?.id || '')
    );
    setCourses(studentCourses);
  }, [user]);

  const handleViewDetails = (course: Course) => {
    setSelectedCourse(course);
    
    // Get teacher info
    const allUsers = getUsers();
    const teacher = allUsers.find(u => u.id === course.teacherId) || null;
    
    // Calculate attendance percentage
    const attendanceRecords = getAttendanceRecords();
    const studentAttendance = attendanceRecords.filter(
      record => record.studentId === user?.id && record.courseId === course.id
    );
    const presentCount = studentAttendance.filter(r => r.status === 'present').length;
    const attendancePercentage = studentAttendance.length > 0 
      ? Math.round((presentCount / studentAttendance.length) * 100)
      : 0;
    
    // Get results
    const resultRecords = getResultRecords();
    const studentResults = resultRecords.filter(
      record => record.studentId === user?.id && record.courseId === course.id
    );
    
    setCourseDetails({
      teacher,
      totalStudents: (course.studentsEnrolled || []).length,
      attendancePercentage,
      results: studentResults,
    });
    
    setIsModalOpen(true);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-heading font-bold mb-2">My Courses</h1>
          <p className="text-muted-foreground">View all courses you're enrolled in</p>
        </div>

        {courses.length === 0 ? (
          <Card className="p-12 text-center">
            <BookOpen className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-heading font-semibold mb-2">No Courses Enrolled</h3>
            <p className="text-muted-foreground">You are not enrolled in any courses yet.</p>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map(course => {
              const allUsers = getUsers();
              const teacher = allUsers.find(u => u.id === course.teacherId);
              
              return (
                <Card 
                  key={course.id}
                  className="p-6 hover:shadow-lg hover:scale-105 transition-all duration-300 cursor-pointer group border-border hover:border-primary/50"
                  onClick={() => handleViewDetails(course)}
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div className="p-3 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                      <BookOpen className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-heading font-semibold text-lg mb-1">{course.name}</h3>
                      <p className="text-sm text-muted-foreground">{course.code}</p>
                    </div>
                  </div>
                  
                  {teacher && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <UserIcon className="h-4 w-4" />
                      <span>{teacher.name}</span>
                    </div>
                  )}
                  
                  <Button 
                    className="w-full mt-4 neon-glow" 
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewDetails(course);
                    }}
                  >
                    View Details
                  </Button>
                </Card>
              );
            })}
          </div>
        )}

        {/* Course Details Modal */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="max-w-2xl bg-card border-border">
            <DialogHeader>
              <DialogTitle className="text-2xl font-heading flex items-center gap-3">
                <BookOpen className="h-6 w-6 text-primary" />
                {selectedCourse?.name}
              </DialogTitle>
            </DialogHeader>
            
            {courseDetails && (
              <div className="space-y-6 mt-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <Card className="p-4 bg-muted/30 border-border">
                    <div className="flex items-center gap-3 mb-2">
                      <UserIcon className="h-5 w-5 text-primary" />
                      <span className="text-sm font-medium text-muted-foreground">Instructor</span>
                    </div>
                    <p className="text-lg font-semibold">
                      {courseDetails.teacher?.name || 'Not Assigned'}
                    </p>
                  </Card>
                  
                  <Card className="p-4 bg-muted/30 border-border">
                    <div className="flex items-center gap-3 mb-2">
                      <Users className="h-5 w-5 text-primary" />
                      <span className="text-sm font-medium text-muted-foreground">Total Students</span>
                    </div>
                    <p className="text-lg font-semibold">{courseDetails.totalStudents}</p>
                  </Card>
                  
                  <Card className="p-4 bg-muted/30 border-border">
                    <div className="flex items-center gap-3 mb-2">
                      <Calendar className="h-5 w-5 text-primary" />
                      <span className="text-sm font-medium text-muted-foreground">Attendance</span>
                    </div>
                    <p className="text-lg font-semibold">{courseDetails.attendancePercentage}%</p>
                  </Card>
                  
                  <Card className="p-4 bg-muted/30 border-border">
                    <div className="flex items-center gap-3 mb-2">
                      <TrendingUp className="h-5 w-5 text-primary" />
                      <span className="text-sm font-medium text-muted-foreground">Assessments</span>
                    </div>
                    <p className="text-lg font-semibold">{courseDetails.results.length}</p>
                  </Card>
                </div>
                
                {courseDetails.results.length > 0 && (
                  <div>
                    <h4 className="font-heading font-semibold mb-3 flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-primary" />
                      My Results
                    </h4>
                    <div className="space-y-2">
                      {courseDetails.results.map(result => (
                        <div 
                          key={result.id}
                          className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border"
                        >
                          <div>
                            <p className="font-medium">{result.assessment}</p>
                            <p className="text-sm text-muted-foreground">{result.date}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">{result.marks}/{result.maxMarks}</p>
                            <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-semibold">
                              {result.grade}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {courseDetails.results.length === 0 && (
                  <Card className="p-6 text-center bg-muted/30 border-border">
                    <TrendingUp className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
                    <p className="text-muted-foreground">No results available yet</p>
                  </Card>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default StudentCourses;
