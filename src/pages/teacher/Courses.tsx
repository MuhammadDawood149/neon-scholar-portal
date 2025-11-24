import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { BookOpen, Users, User as UserIcon, TrendingUp, Calendar, Eye } from 'lucide-react';
import { getAuthUser } from '@/lib/auth';
import { getCourses, getUsers, getAttendanceRecords, getResultRecords } from '@/lib/storage';
import { useState, useEffect } from 'react';
import { Course, User, AttendanceRecord, ResultRecord } from '@/lib/types';
import { getValidStudentIds, countValidStudents } from '@/lib/utils';

const TeacherCourses = () => {
  const user = getAuthUser();
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [students, setStudents] = useState<User[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<User | null>(null);
  const [studentInfo, setStudentInfo] = useState<{
    courses: Course[];
    attendance: AttendanceRecord[];
    results: ResultRecord[];
    attendancePercentage: number;
  } | null>(null);
  const [isStudentsModalOpen, setIsStudentsModalOpen] = useState(false);
  const [isStudentInfoModalOpen, setIsStudentInfoModalOpen] = useState(false);

  useEffect(() => {
    const allCourses = getCourses();
    const teacherCourses = allCourses.filter(c => c.teacherId === user?.id);
    setCourses(teacherCourses);
  }, [user]);

  const handleViewStudents = (course: Course) => {
    setSelectedCourse(course);
    
    const allUsers = getUsers();
    // Get only valid student IDs
    const validStudentIds = getValidStudentIds(course.studentsEnrolled, allUsers);
    const enrolledStudents = allUsers.filter(
      u => u.role === 'student' && validStudentIds.includes(u.id)
    );
    setStudents(enrolledStudents);
    setIsStudentsModalOpen(true);
  };

  const handleViewStudentInfo = (student: User) => {
    setSelectedStudent(student);
    
    // Get all courses the student is enrolled in
    const allCourses = getCourses();
    const studentCourses = allCourses.filter(course =>
      (course.studentsEnrolled || []).includes(student.id)
    );
    
    // Get attendance for the selected course
    const attendanceRecords = getAttendanceRecords();
    const studentRecord = attendanceRecords.find(
      record => record.studentId === student.id && record.courseId === selectedCourse?.id
    );
    const attendanceArray = studentRecord?.records || [];
    const presentCount = attendanceArray.filter(r => r.status === 'present').length;
    const attendancePercentage = attendanceArray.length > 0
      ? Math.round((presentCount / attendanceArray.length) * 100)
      : 0;
    
    // Get results for the selected course
    const resultRecords = getResultRecords();
    const courseResults = resultRecords.filter(
      record => record.studentId === student.id && record.courseId === selectedCourse?.id
    );
    
    setStudentInfo({
      courses: studentCourses,
      attendance: courseAttendance,
      results: courseResults,
      attendancePercentage,
    });
    
    setIsStudentInfoModalOpen(true);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-heading font-bold mb-2">My Courses & Students</h1>
          <p className="text-muted-foreground">Manage your assigned courses and view enrolled students</p>
        </div>

        {courses.length === 0 ? (
          <Card className="p-12 text-center">
            <BookOpen className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-heading font-semibold mb-2">No Courses Assigned</h3>
            <p className="text-muted-foreground">You don't have any courses assigned yet.</p>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map(course => (
              <Card 
                key={course.id}
                className="p-6 hover:shadow-lg hover:scale-105 transition-all duration-300 border-border hover:border-primary/50"
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="p-3 rounded-lg bg-primary/10">
                    <BookOpen className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-heading font-semibold text-lg mb-1">{course.name}</h3>
                    <p className="text-sm text-muted-foreground">{course.code}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                  <Users className="h-4 w-4" />
                  <span>{countValidStudents(course.studentsEnrolled, getUsers())} Students Enrolled</span>
                </div>
                
                <Button 
                  className="w-full neon-glow" 
                  size="sm"
                  onClick={() => handleViewStudents(course)}
                >
                  <Eye className="mr-2 h-4 w-4" />
                  View Students
                </Button>
              </Card>
            ))}
          </div>
        )}

        {/* Students List Modal */}
        <Dialog open={isStudentsModalOpen} onOpenChange={setIsStudentsModalOpen}>
          <DialogContent className="max-w-3xl bg-card border-border max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl font-heading flex items-center gap-3">
                <Users className="h-6 w-6 text-primary" />
                Students in {selectedCourse?.name}
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-3 mt-4">
              {students.length === 0 ? (
                <Card className="p-8 text-center bg-muted/30 border-border">
                  <Users className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
                  <p className="text-muted-foreground">No students enrolled in this course</p>
                </Card>
              ) : (
                students.map(student => (
                  <Card 
                    key={student.id}
                    className="p-4 border-border hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          {student.profileImage && student.profileImage !== 'default' ? (
                            <img
                              src={student.profileImage}
                              alt={student.name}
                              className="w-12 h-12 rounded-full object-cover border-2 border-primary/20"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center">
                              <span className="text-primary font-semibold">
                                {getInitials(student.name)}
                              </span>
                            </div>
                          )}
                        </div>
                        
                        <div>
                          <p className="font-semibold">{student.name}</p>
                          <p className="text-sm text-muted-foreground">{student.id}</p>
                          <p className="text-xs text-muted-foreground">{student.email}</p>
                        </div>
                      </div>
                      
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleViewStudentInfo(student)}
                        className="neon-glow"
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        View Info
                      </Button>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </DialogContent>
        </Dialog>

        {/* Student Info Modal */}
        <Dialog open={isStudentInfoModalOpen} onOpenChange={setIsStudentInfoModalOpen}>
          <DialogContent className="max-w-2xl bg-card border-border max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl font-heading flex items-center gap-3">
                <UserIcon className="h-6 w-6 text-primary" />
                Student Information
              </DialogTitle>
            </DialogHeader>
            
            {selectedStudent && studentInfo && (
              <div className="space-y-6 mt-4">
                {/* Student Profile */}
                <Card className="p-6 bg-muted/30 border-border">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      {selectedStudent.profileImage && selectedStudent.profileImage !== 'default' ? (
                        <img
                          src={selectedStudent.profileImage}
                          alt={selectedStudent.name}
                          className="w-20 h-20 rounded-full object-cover border-4 border-primary/20"
                        />
                      ) : (
                        <div className="w-20 h-20 rounded-full bg-primary/10 border-4 border-primary/20 flex items-center justify-center">
                          <span className="text-primary font-semibold text-xl">
                            {getInitials(selectedStudent.name)}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <div>
                      <h3 className="text-xl font-heading font-semibold">{selectedStudent.name}</h3>
                      <p className="text-muted-foreground">{selectedStudent.id}</p>
                      <p className="text-sm text-muted-foreground">{selectedStudent.email}</p>
                    </div>
                  </div>
                </Card>
                
                {/* Stats Grid */}
                <div className="grid md:grid-cols-2 gap-4">
                  <Card className="p-4 bg-muted/30 border-border">
                    <div className="flex items-center gap-3 mb-2">
                      <BookOpen className="h-5 w-5 text-primary" />
                      <span className="text-sm font-medium text-muted-foreground">Total Courses</span>
                    </div>
                    <p className="text-lg font-semibold">{studentInfo.courses.length}</p>
                  </Card>
                  
                  <Card className="p-4 bg-muted/30 border-border">
                    <div className="flex items-center gap-3 mb-2">
                      <Calendar className="h-5 w-5 text-primary" />
                      <span className="text-sm font-medium text-muted-foreground">Attendance ({selectedCourse?.code})</span>
                    </div>
                    <p className="text-lg font-semibold">{studentInfo.attendancePercentage}%</p>
                  </Card>
                </div>
                
                {/* Course Results */}
                <div>
                  <h4 className="font-heading font-semibold mb-3 flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    Results for {selectedCourse?.name}
                  </h4>
                  
                  {studentInfo.results.length > 0 ? (
                    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border">
                      <div>
                        <p className="font-medium">Total Score</p>
                        <p className="text-sm text-muted-foreground">All assessments</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{studentInfo.results[0].total}/100</p>
                        <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-semibold">
                          {studentInfo.results[0].grade}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <Card className="p-6 text-center bg-muted/30 border-border">
                      <TrendingUp className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
                      <p className="text-muted-foreground">No results available</p>
                    </Card>
                  )}
                </div>
                
                {/* All Enrolled Courses */}
                <div>
                  <h4 className="font-heading font-semibold mb-3 flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-primary" />
                    All Enrolled Courses
                  </h4>
                  <div className="space-y-2">
                    {studentInfo.courses.map(course => (
                      <div 
                        key={course.id}
                        className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border"
                      >
                        <div>
                          <p className="font-medium">{course.name}</p>
                          <p className="text-sm text-muted-foreground">{course.code}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default TeacherCourses;
