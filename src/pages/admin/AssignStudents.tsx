import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { getCourses, saveCourse, getUsers } from '@/lib/storage';
import { Course } from '@/lib/types';
import { UsersRound } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from '@/hooks/use-toast';

const AssignStudents = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);

  useEffect(() => {
    setCourses(getCourses());
    setStudents(getUsers().filter(u => u.role === 'student'));
  }, []);

  useEffect(() => {
    if (selectedCourseId) {
      const course = courses.find(c => c.id === selectedCourseId);
      setSelectedStudentIds(course?.studentsEnrolled || []);
    }
  }, [selectedCourseId, courses]);

  const handleToggleStudent = (studentId: string) => {
    setSelectedStudentIds(prev =>
      prev.includes(studentId)
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  const handleSave = () => {
    if (!selectedCourseId) {
      toast({ title: 'Error', description: 'Please select a course', variant: 'destructive' });
      return;
    }

    const course = courses.find(c => c.id === selectedCourseId);
    if (!course) return;

    const updatedCourse: Course = {
      ...course,
      studentsEnrolled: selectedStudentIds,
    };

    saveCourse(updatedCourse);
    setCourses(getCourses());
    toast({ title: 'Success', description: 'Students assigned successfully' });
  };

  const selectedCourse = courses.find(c => c.id === selectedCourseId);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-heading font-bold">Assign Students to Course</h1>
          <p className="text-muted-foreground">Select students who should be enrolled in a course</p>
        </div>

        <div className="max-w-2xl space-y-6">
          <div className="p-6 rounded-xl bg-card border border-border card-hover">
            <div className="space-y-4">
              <div>
                <Label htmlFor="course">Select Course</Label>
                <Select value={selectedCourseId} onValueChange={setSelectedCourseId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a course" />
                  </SelectTrigger>
                  <SelectContent>
                    {courses.map(course => (
                      <SelectItem key={course.id} value={course.id}>
                        {course.code} - {course.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedCourseId && (
                <>
                  <div>
                    <Label className="mb-3 block">Enrolled Students</Label>
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {students.map(student => (
                        <div
                          key={student.id}
                          className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                        >
                          <Checkbox
                            id={student.id}
                            checked={selectedStudentIds.includes(student.id)}
                            onCheckedChange={() => handleToggleStudent(student.id)}
                          />
                          <label
                            htmlFor={student.id}
                            className="flex-1 cursor-pointer"
                          >
                            <p className="font-medium">{student.name}</p>
                            <p className="text-sm text-muted-foreground">{student.email}</p>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Button onClick={handleSave} className="w-full gap-2">
                    <UsersRound className="h-4 w-4" />
                    Save Mapping
                  </Button>
                </>
              )}
            </div>
          </div>

          {selectedCourse && (
            <div className="p-6 rounded-xl bg-card border border-border">
              <h3 className="text-lg font-heading font-semibold mb-4">Course Summary</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Course Name:</span>
                  <span className="font-medium">{selectedCourse.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Course Code:</span>
                  <span className="font-medium">{selectedCourse.code}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Students Enrolled:</span>
                  <span className="font-medium text-primary">{selectedStudentIds.length}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AssignStudents;
