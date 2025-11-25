import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getCourses, getUsers, saveResult, calculateGrade } from '@/lib/storage';
import { getAuthUser } from '@/lib/auth';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Plus, Trash2 } from 'lucide-react';
import { getValidStudentIds } from '@/lib/utils';
import { Assessment } from '@/lib/types';

interface AssessmentTemplate {
  type: string;
  weight: number;
}

const UploadResults = () => {
  const authUser = getAuthUser();
  const [courses, setCourses] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [assessmentTemplates, setAssessmentTemplates] = useState<AssessmentTemplate[]>([
    { type: 'Quiz', weight: 10 },
    { type: 'Assignment', weight: 10 },
    { type: 'Midterm', weight: 30 },
    { type: 'Final', weight: 50 }
  ]);
  const [studentMarks, setStudentMarks] = useState<Record<string, Record<string, number>>>({});

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

        // Initialize student marks
        const initialMarks: Record<string, Record<string, number>> = {};
        enrolledStudents.forEach(student => {
          initialMarks[student.id] = {};
          assessmentTemplates.forEach(template => {
            initialMarks[student.id][template.type] = 0;
          });
        });
        setStudentMarks(initialMarks);
      }
    }
  }, [selectedCourse, courses, assessmentTemplates]);

  const addAssessment = () => {
    const newTemplate = { type: '', weight: 0 };
    setAssessmentTemplates([...assessmentTemplates, newTemplate]);
    
    // Initialize marks for this new assessment for all students
    const updatedMarks = { ...studentMarks };
    Object.keys(updatedMarks).forEach(studentId => {
      updatedMarks[studentId][newTemplate.type] = 0;
    });
    setStudentMarks(updatedMarks);
  };

  const removeAssessment = (index: number) => {
    const removedType = assessmentTemplates[index].type;
    const newTemplates = assessmentTemplates.filter((_, i) => i !== index);
    setAssessmentTemplates(newTemplates);
    
    // Remove marks for this assessment from all students
    const updatedMarks = { ...studentMarks };
    Object.keys(updatedMarks).forEach(studentId => {
      delete updatedMarks[studentId][removedType];
    });
    setStudentMarks(updatedMarks);
  };

  const updateAssessmentTemplate = (index: number, field: 'type' | 'weight', value: string | number) => {
    const oldType = assessmentTemplates[index].type;
    const newTemplates = [...assessmentTemplates];
    newTemplates[index] = { ...newTemplates[index], [field]: value };
    setAssessmentTemplates(newTemplates);
    
    // If type changed, update all student marks to use new type key
    if (field === 'type' && oldType !== value) {
      const updatedMarks = { ...studentMarks };
      Object.keys(updatedMarks).forEach(studentId => {
        if (oldType && updatedMarks[studentId][oldType] !== undefined) {
          updatedMarks[studentId][value as string] = updatedMarks[studentId][oldType];
          delete updatedMarks[studentId][oldType];
        } else {
          updatedMarks[studentId][value as string] = 0;
        }
      });
      setStudentMarks(updatedMarks);
    }
  };

  const updateStudentMark = (studentId: string, assessmentType: string, marks: number) => {
    setStudentMarks(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [assessmentType]: marks
      }
    }));
  };

  const getTotalWeight = () => {
    return assessmentTemplates.reduce((sum, template) => sum + Number(template.weight), 0);
  };

  const getStudentTotal = (studentId: string) => {
    return Object.values(studentMarks[studentId] || {}).reduce((sum, mark) => sum + Number(mark), 0);
  };

  const handleSave = () => {
    if (!selectedCourse) {
      toast.error('Please select a course');
      return;
    }

    const totalWeight = getTotalWeight();
    if (totalWeight !== 100) {
      toast.error(`Total weight must be 100. Current total: ${totalWeight}`);
      return;
    }

    // Check if any assessment type is empty
    const hasEmptyType = assessmentTemplates.some(t => !t.type.trim());
    if (hasEmptyType) {
      toast.error('All assessment types must have a name');
      return;
    }

    try {
      students.forEach(student => {
        const assessments: Assessment[] = assessmentTemplates.map(template => ({
          type: template.type,
          weight: template.weight,
          obtained: studentMarks[student.id][template.type] || 0
        }));

        const total = getStudentTotal(student.id);
        const grade = calculateGrade(total);

        saveResult({
          courseId: selectedCourse,
          studentId: student.id,
          assessments,
          total,
          grade
        });
      });

      toast.success('Results saved successfully!');
      setSelectedCourse('');
      setAssessmentTemplates([
        { type: 'Quiz', weight: 10 },
        { type: 'Assignment', weight: 10 },
        { type: 'Midterm', weight: 30 },
        { type: 'Final', weight: 50 }
      ]);
    } catch (error) {
      toast.error('Failed to save results');
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-heading font-bold mb-2">Upload Results</h1>
          <p className="text-muted-foreground">Upload marks and grades for students</p>
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

            {/* Assessment Structure */}
            {selectedCourse && (
              <>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-lg">Assessment Structure</h3>
                    <Button onClick={addAssessment} size="sm" variant="outline" className="gap-2">
                      <Plus className="h-4 w-4" />
                      Add Assessment
                    </Button>
                  </div>

                  {assessmentTemplates.map((template, index) => (
                    <div key={index} className="flex gap-4 items-end">
                      <div className="flex-1 space-y-2">
                        <label className="text-sm font-medium">Assessment Type</label>
                        <Input
                          value={template.type}
                          onChange={(e) => updateAssessmentTemplate(index, 'type', e.target.value)}
                          placeholder="e.g., Quiz, Assignment"
                          className="bg-muted border-border"
                        />
                      </div>
                      <div className="w-32 space-y-2">
                        <label className="text-sm font-medium">Weight (%)</label>
                        <Input
                          type="number"
                          value={template.weight}
                          onChange={(e) => updateAssessmentTemplate(index, 'weight', Number(e.target.value))}
                          min="0"
                          max="100"
                          className="bg-muted border-border"
                        />
                      </div>
                      <Button
                        onClick={() => removeAssessment(index)}
                        variant="destructive"
                        size="icon"
                        disabled={assessmentTemplates.length === 1}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}

                  <div className="flex justify-between items-center p-4 rounded-lg bg-muted">
                    <span className="font-semibold">Total Weight:</span>
                    <span className={`text-lg font-bold ${getTotalWeight() === 100 ? 'text-primary' : 'text-destructive'}`}>
                      {getTotalWeight()}%
                    </span>
                  </div>
                </div>

                {/* Student Marks */}
                {students.length > 0 && getTotalWeight() === 100 && (
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Enter Student Marks</h3>
                    {students.map(student => (
                      <div key={student.id} className="p-4 rounded-lg border border-border space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                              <span className="text-sm font-semibold text-primary">
                                {student.name.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                              </span>
                            </div>
                            <span className="font-medium">{student.name}</span>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-muted-foreground">Total</p>
                            <p className="text-2xl font-bold">{getStudentTotal(student.id)}/100</p>
                            <p className="text-sm font-semibold text-primary">
                              Grade: {calculateGrade(getStudentTotal(student.id))}
                            </p>
                          </div>
                        </div>

                        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
                          {assessmentTemplates.map(template => (
                            <div key={template.type} className="space-y-1">
                              <label className="text-xs font-medium text-muted-foreground">
                                {template.type} ({template.weight}%)
                              </label>
                              <Input
                                type="number"
                                value={studentMarks[student.id]?.[template.type] || 0}
                                onChange={(e) => updateStudentMark(student.id, template.type, Number(e.target.value))}
                                min="0"
                                max={template.weight}
                                className="bg-muted border-border"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {students.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    No students enrolled in this course
                  </p>
                )}

                {students.length > 0 && getTotalWeight() === 100 && (
                  <Button onClick={handleSave} className="w-full neon-glow">
                    Save Results
                  </Button>
                )}
              </>
            )}
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default UploadResults;
