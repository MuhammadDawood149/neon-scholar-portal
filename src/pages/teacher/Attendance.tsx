import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Check, X } from 'lucide-react';
import { getUsers, getCourses, saveAttendance } from '@/lib/storage';
import { getAuthUser } from '@/lib/auth';
import { useState, useEffect } from 'react';
import { User, Course, AttendanceRecord } from '@/lib/types';
import { toast } from 'sonner';

const MarkAttendance = () => {
  const user = getAuthUser();
  const [courses, setCourses] = useState<Course[]>([]);
  const [students, setStudents] = useState<User[]>([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [attendance, setAttendance] = useState<Record<string, 'present' | 'absent'>>({});

  useEffect(() => {
    const allCourses = getCourses();
    const teacherCourses = allCourses.filter(c => c.teacherId === user?.id);
    setCourses(teacherCourses);
  }, [user]);

  useEffect(() => {
    if (selectedCourse) {
      const course = courses.find(c => c.id === selectedCourse);
      if (course) {
      const allUsers = getUsers();
      const enrolledStudents = allUsers.filter(
        u => u.role === 'student' && (course.studentsEnrolled || []).includes(u.id)
      );
        setStudents(enrolledStudents);
      }
    } else {
      setStudents([]);
    }
  }, [selectedCourse, courses]);

  const handleToggleAttendance = (studentId: string) => {
    setAttendance(prev => ({
      ...prev,
      [studentId]: prev[studentId] === 'present' ? 'absent' : 'present',
    }));
  };

  const handleSave = () => {
    if (!selectedCourse) {
      toast.error('Please select a course');
      return;
    }

    const today = new Date().toISOString().split('T')[0];
    
    students.forEach(student => {
      saveAttendance(selectedCourse, student.id, today, attendance[student.id] || 'absent');
    });

    toast.success('Attendance saved successfully');
    setAttendance({});
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-heading font-bold mb-2">Mark Attendance</h1>
          <p className="text-muted-foreground">Mark attendance for students in your courses</p>
        </div>

        <Card className="p-6">
          <div className="space-y-4 mb-6">
            <div className="space-y-2">
              <Label htmlFor="course">Select Course</Label>
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
          </div>

          {selectedCourse && (
            <>
              <div className="space-y-3">
                <h3 className="text-lg font-heading font-semibold">Students</h3>
                {students.map(student => (
                  <div
                    key={student.id}
                    className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/30 transition-colors"
                  >
                    <div>
                      <p className="font-medium">{student.name}</p>
                      <p className="text-sm text-muted-foreground">{student.email}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant={attendance[student.id] === 'present' ? 'default' : 'outline'}
                        onClick={() => {
                          setAttendance(prev => ({ ...prev, [student.id]: 'present' }));
                        }}
                        className={attendance[student.id] === 'present' ? 'neon-glow' : ''}
                      >
                        <Check className="mr-2 h-4 w-4" />
                        Present
                      </Button>
                      <Button
                        size="sm"
                        variant={attendance[student.id] === 'absent' ? 'default' : 'outline'}
                        onClick={() => {
                          setAttendance(prev => ({ ...prev, [student.id]: 'absent' }));
                        }}
                        className={
                          attendance[student.id] === 'absent'
                            ? 'bg-destructive hover:bg-destructive/90'
                            : ''
                        }
                      >
                        <X className="mr-2 h-4 w-4" />
                        Absent
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6">
                <Button onClick={handleSave} className="neon-glow">
                  Save Attendance
                </Button>
              </div>
            </>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default MarkAttendance;
