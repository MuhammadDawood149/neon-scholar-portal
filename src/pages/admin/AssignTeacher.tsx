import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { getCourses, saveCourse, getUsers } from '@/lib/storage';
import { Course } from '@/lib/types';
import { UserPlus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from '@/hooks/use-toast';

const AssignTeacher = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [selectedTeacherId, setSelectedTeacherId] = useState('');

  useEffect(() => {
    setCourses(getCourses());
    setTeachers(getUsers().filter(u => u.role === 'teacher'));
  }, []);

  const handleAssign = () => {
    if (!selectedCourseId || !selectedTeacherId) {
      toast({ title: 'Error', description: 'Please select both course and teacher', variant: 'destructive' });
      return;
    }

    const course = courses.find(c => c.id === selectedCourseId);
    if (!course) return;

    const updatedCourse: Course = {
      ...course,
      teacherId: selectedTeacherId,
    };

    saveCourse(updatedCourse);
    setSelectedCourseId('');
    setSelectedTeacherId('');
    setCourses(getCourses());
    toast({ title: 'Success', description: 'Teacher assigned successfully' });
  };

  const getTeacherName = (teacherId?: string) => {
    if (!teacherId) return 'Not Assigned';
    return teachers.find(t => t.id === teacherId)?.name || 'Unknown';
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-heading font-bold">Assign Teacher to Course</h1>
          <p className="text-muted-foreground">Select a course and assign a teacher</p>
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

              <div>
                <Label htmlFor="teacher">Select Teacher</Label>
                <Select value={selectedTeacherId} onValueChange={setSelectedTeacherId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a teacher" />
                  </SelectTrigger>
                  <SelectContent>
                    {teachers.map(teacher => (
                      <SelectItem key={teacher.id} value={teacher.id}>
                        {teacher.name} ({teacher.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button onClick={handleAssign} className="w-full gap-2">
                <UserPlus className="h-4 w-4" />
                Assign Teacher
              </Button>
            </div>
          </div>

          <div className="p-6 rounded-xl bg-card border border-border">
            <h3 className="text-lg font-heading font-semibold mb-4">Current Assignments</h3>
            <div className="space-y-3">
              {courses.map(course => (
                <div
                  key={course.id}
                  className="flex justify-between items-center p-3 rounded-lg bg-muted/30"
                >
                  <div>
                    <p className="font-medium">{course.name}</p>
                    <p className="text-sm text-muted-foreground">{course.code}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-primary">
                      {getTeacherName(course.teacherId)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AssignTeacher;
