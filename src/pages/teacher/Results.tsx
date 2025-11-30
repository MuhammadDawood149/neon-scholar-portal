import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getCourses, getUsers, saveResult, calculateGrade, getResultRecords } from '@/lib/storage';
import { getAuthUser } from '@/lib/auth';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { getValidStudentIds } from '@/lib/utils';

const UploadResults = () => {
  const authUser = getAuthUser();
  const [courses, setCourses] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedStudent, setSelectedStudent] = useState('');
  const [marks, setMarks] = useState({
    quiz: '',
    assignment: '',
    mid: '',
    final: '',
  });

  useEffect(() => {
    const allCourses = getCourses();
    const teacherCourses = allCourses.filter(c => c.teacherId === authUser?.id);
    setCourses(teacherCourses);
  }, [authUser]);

  useEffect(() => {
    if (selectedCourse) {
      const course = courses.find(c => c.id === selectedCourse);
      if (course) {
        const allUsers = getUsers();
        const validStudentIds = getValidStudentIds(course.studentsEnrolled, allUsers);
        const enrolledStudents = allUsers.filter(u => validStudentIds.includes(u.id));
        setStudents(enrolledStudents);
        setSelectedStudent('');
        setMarks({ quiz: '', assignment: '', mid: '', final: '' });
      }
    }
  }, [selectedCourse, courses]);

  useEffect(() => {
    if (selectedCourse && selectedStudent) {
      // Load existing marks for this student+course
      const existingResults = getResultRecords();
      const existingResult = existingResults.find(
        r => r.courseId === selectedCourse && r.studentId === selectedStudent
      );
      
      if (existingResult) {
        setMarks({
          quiz: existingResult.quiz?.toString() || '',
          assignment: existingResult.assignment?.toString() || '',
          mid: existingResult.mid?.toString() || '',
          final: existingResult.final?.toString() || '',
        });
      } else {
        setMarks({ quiz: '', assignment: '', mid: '', final: '' });
      }
    }
  }, [selectedCourse, selectedStudent]);

  const handleSave = () => {
    if (!selectedCourse || !selectedStudent) {
      toast.error('Please select both course and student');
      return;
    }

    const quiz = parseFloat(marks.quiz) || 0;
    const assignment = parseFloat(marks.assignment) || 0;
    const mid = parseFloat(marks.mid) || 0;
    const final = parseFloat(marks.final) || 0;

    // Validation
    if (quiz < 0 || quiz > 10) {
      toast.error('Quiz marks must be between 0 and 10');
      return;
    }
    if (assignment < 0 || assignment > 10) {
      toast.error('Assignment marks must be between 0 and 10');
      return;
    }
    if (mid < 0 || mid > 30) {
      toast.error('Midterm marks must be between 0 and 30');
      return;
    }
    if (final < 0 || final > 50) {
      toast.error('Final marks must be between 0 and 50');
      return;
    }

    const total = quiz + assignment + mid + final;
    const grade = calculateGrade(total);

    try {
      saveResult({
        courseId: selectedCourse,
        studentId: selectedStudent,
        quiz,
        assignment,
        mid,
        final,
        total,
        grade,
      });

      toast.success('Result saved successfully!');
    } catch (error) {
      toast.error('Failed to save result');
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-heading font-bold mb-2">Upload Results</h1>
          <p className="text-muted-foreground">Enter marks for students in your courses</p>
        </div>

        <Card className="p-6">
          <div className="space-y-6">
            {/* Course Selection */}
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

            {/* Student Selection */}
            {selectedCourse && students.length > 0 && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Select Student</label>
                <Select value={selectedStudent} onValueChange={setSelectedStudent}>
                  <SelectTrigger className="bg-muted border-border">
                    <SelectValue placeholder="Choose a student" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    {students.map(student => (
                      <SelectItem key={student.id} value={student.id}>
                        {student.name} ({student.username})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Marks Entry Form */}
            {selectedStudent && (
              <>
                <div className="border-t border-border pt-6 space-y-4">
                  <h3 className="font-semibold text-lg">Enter Marks</h3>
                  
                  {/* Quiz */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Quiz (out of 10)</label>
                    <Input
                      type="number"
                      step="0.1"
                      min="0"
                      max="10"
                      value={marks.quiz}
                      onChange={(e) => setMarks({ ...marks, quiz: e.target.value })}
                      placeholder="Enter quiz marks"
                      className="bg-muted border-border"
                    />
                  </div>

                  {/* Assignment */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Assignment (out of 10)</label>
                    <Input
                      type="number"
                      step="0.1"
                      min="0"
                      max="10"
                      value={marks.assignment}
                      onChange={(e) => setMarks({ ...marks, assignment: e.target.value })}
                      placeholder="Enter assignment marks"
                      className="bg-muted border-border"
                    />
                  </div>

                  {/* Midterm */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Midterm (out of 30)</label>
                    <Input
                      type="number"
                      step="0.1"
                      min="0"
                      max="30"
                      value={marks.mid}
                      onChange={(e) => setMarks({ ...marks, mid: e.target.value })}
                      placeholder="Enter midterm marks"
                      className="bg-muted border-border"
                    />
                  </div>

                  {/* Final */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Final (out of 50)</label>
                    <Input
                      type="number"
                      step="0.1"
                      min="0"
                      max="50"
                      value={marks.final}
                      onChange={(e) => setMarks({ ...marks, final: e.target.value })}
                      placeholder="Enter final marks"
                      className="bg-muted border-border"
                    />
                  </div>
                </div>

                {/* Save Button */}
                <Button onClick={handleSave} className="w-full" size="lg">
                  Save Result
                </Button>
              </>
            )}

            {selectedCourse && students.length === 0 && (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No students enrolled in this course</p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default UploadResults;
