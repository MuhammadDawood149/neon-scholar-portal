import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getUsers, getCourses, saveResult, calculateGrade } from '@/lib/storage';
import { getAuthUser } from '@/lib/auth';
import { useState, useEffect } from 'react';
import { User, Course, ResultRecord } from '@/lib/types';
import { toast } from 'sonner';

const UploadResults = () => {
  const user = getAuthUser();
  const [courses, setCourses] = useState<Course[]>([]);
  const [students, setStudents] = useState<User[]>([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [assessment, setAssessment] = useState('');
  const [maxMarks, setMaxMarks] = useState('100');
  const [results, setResults] = useState<Record<string, string>>({});

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

  const handleSave = () => {
    if (!selectedCourse || !assessment || !maxMarks) {
      toast.error('Please fill all required fields');
      return;
    }

    const today = new Date().toISOString().split('T')[0];
    const maxMarksNum = parseInt(maxMarks);

    students.forEach(student => {
      const marks = parseInt(results[student.id] || '0');
      const grade = calculateGrade(marks, maxMarksNum);

      const record: ResultRecord = {
        id: `${student.id}-${selectedCourse}-${assessment}-${today}`,
        studentId: student.id,
        courseId: selectedCourse,
        assessment,
        marks,
        maxMarks: maxMarksNum,
        grade,
        date: today,
      };
      saveResult(record);
    });

    toast.success('Results saved successfully');
    setResults({});
    setAssessment('');
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-heading font-bold mb-2">Upload Results</h1>
          <p className="text-muted-foreground">Upload marks and grades for students</p>
        </div>

        <Card className="p-6">
          <div className="space-y-4 mb-6">
            <div className="grid md:grid-cols-3 gap-4">
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

              <div className="space-y-2">
                <Label htmlFor="assessment">Assessment Name</Label>
                <Input
                  id="assessment"
                  placeholder="e.g., Mid-term, Final"
                  value={assessment}
                  onChange={(e) => setAssessment(e.target.value)}
                  className="bg-muted border-border"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxMarks">Maximum Marks</Label>
                <Input
                  id="maxMarks"
                  type="number"
                  value={maxMarks}
                  onChange={(e) => setMaxMarks(e.target.value)}
                  className="bg-muted border-border"
                />
              </div>
            </div>
          </div>

          {selectedCourse && assessment && (
            <>
              <div className="space-y-3">
                <h3 className="text-lg font-heading font-semibold">Enter Marks for Students</h3>
                {students.map(student => (
                  <div
                    key={student.id}
                    className="flex items-center justify-between p-4 rounded-lg border border-border"
                  >
                    <div>
                      <p className="font-medium">{student.name}</p>
                      <p className="text-sm text-muted-foreground">{student.email}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Input
                        type="number"
                        placeholder="Marks"
                        value={results[student.id] || ''}
                        onChange={(e) => {
                          setResults(prev => ({ ...prev, [student.id]: e.target.value }));
                        }}
                        className="w-24 bg-muted border-border"
                        max={maxMarks}
                      />
                      <span className="text-muted-foreground">/ {maxMarks}</span>
                      {results[student.id] && (
                        <span className="px-3 py-1 rounded-full bg-primary/10 text-primary font-semibold">
                          {calculateGrade(parseInt(results[student.id]), parseInt(maxMarks))}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6">
                <Button onClick={handleSave} className="neon-glow">
                  Save Results
                </Button>
              </div>
            </>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default UploadResults;
