import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { getCourses, getUsers, saveResult, calculateGrade, getResultRecords } from '@/lib/storage';
import { getAuthUser } from '@/lib/auth';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Plus, Trash2, Eye, EyeOff } from 'lucide-react';
import { getValidStudentIds } from '@/lib/utils';
import { AssessmentItem, CategoryData } from '@/lib/types';

type CategoryType = 'quiz' | 'assignment' | 'midterm' | 'final';

interface CategoryConfig {
  name: string;
  max: number;
}

const DEFAULT_CATEGORY_CONFIG: Record<CategoryType, CategoryConfig> = {
  quiz: { name: 'Quiz', max: 10 },
  assignment: { name: 'Assignment', max: 10 },
  midterm: { name: 'Midterm', max: 30 },
  final: { name: 'Final', max: 50 },
};

const UploadResults = () => {
  const authUser = getAuthUser();
  const [courses, setCourses] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditMaxDialogOpen, setIsEditMaxDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryType>('quiz');
  const [editingMaxValue, setEditingMaxValue] = useState<number>(0);
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>('quiz');
  const [newItemTotal, setNewItemTotal] = useState<number>(0);
  const [newItemName, setNewItemName] = useState('');
  
  // Store category data per student
  const [studentCategories, setStudentCategories] = useState<Record<string, {
    quiz: CategoryData;
    assignment: CategoryData;
    midterm: CategoryData;
    final: CategoryData;
  }>>({});

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

        // Load existing results
        const existingResults = getResultRecords();
        
        // Initialize student categories with saved values or defaults
        const initialCategories: Record<string, any> = {};
        enrolledStudents.forEach(student => {
          const existingResult = existingResults.find(
            r => r.studentId === student.id && r.courseId === selectedCourse
          );
          
          if (existingResult?.categories) {
            // Load saved categories
            initialCategories[student.id] = existingResult.categories;
          } else {
            // Initialize empty categories with default max values
            initialCategories[student.id] = {
              quiz: { max: DEFAULT_CATEGORY_CONFIG.quiz.max, items: [] },
              assignment: { max: DEFAULT_CATEGORY_CONFIG.assignment.max, items: [] },
              midterm: { max: DEFAULT_CATEGORY_CONFIG.midterm.max, items: [] },
              final: { max: DEFAULT_CATEGORY_CONFIG.final.max, items: [] },
            };
          }
        });
        setStudentCategories(initialCategories);
      }
    }
  }, [selectedCourse, courses]);

  const getCategoryUsedTotal = (category: CategoryType, studentId: string): number => {
    const items = studentCategories[studentId]?.[category]?.items || [];
    return items
      .filter(item => item.considered)
      .reduce((sum, item) => sum + item.total, 0);
  };

  const getCategoryAvailableSpace = (category: CategoryType, studentId: string): number => {
    const max = studentCategories[studentId]?.[category]?.max || DEFAULT_CATEGORY_CONFIG[category].max;
    const used = getCategoryUsedTotal(category, studentId);
    return max - used;
  };

  const canAddAssessment = (category: CategoryType): boolean => {
    // Check if all students have space in this category
    return students.every(student => {
      const available = getCategoryAvailableSpace(category, student.id);
      return available > 0;
    });
  };

  const handleAddAssessment = () => {
    if (!selectedCourse || students.length === 0) {
      toast.error('Please select a course with enrolled students');
      return;
    }

    if (newItemTotal <= 0) {
      toast.error('Assessment total marks must be greater than 0');
      return;
    }

    // Check if all students have enough space
    const minAvailable = Math.min(
      ...students.map(s => getCategoryAvailableSpace(selectedCategory, s.id))
    );

    if (newItemTotal > minAvailable) {
      toast.error(`Not enough space in ${DEFAULT_CATEGORY_CONFIG[selectedCategory].name} category. Maximum available: ${minAvailable}`);
      return;
    }

    // Generate assessment name
    const categoryItems = studentCategories[students[0].id]?.[selectedCategory]?.items || [];
    const itemNumber = categoryItems.length + 1;
    const itemName = newItemName.trim() || `${DEFAULT_CATEGORY_CONFIG[selectedCategory].name} ${itemNumber}`;
    const itemId = `${selectedCategory}_${Date.now()}`;

    // Add new item to all students
    const updatedCategories = { ...studentCategories };
    students.forEach(student => {
      if (!updatedCategories[student.id]) {
        updatedCategories[student.id] = {
          quiz: { max: DEFAULT_CATEGORY_CONFIG.quiz.max, items: [] },
          assignment: { max: DEFAULT_CATEGORY_CONFIG.assignment.max, items: [] },
          midterm: { max: DEFAULT_CATEGORY_CONFIG.midterm.max, items: [] },
          final: { max: DEFAULT_CATEGORY_CONFIG.final.max, items: [] },
        };
      }
      
      updatedCategories[student.id][selectedCategory].items.push({
        id: itemId,
        name: itemName,
        total: newItemTotal,
        obtained: 0,
        considered: true,
      });
    });

    setStudentCategories(updatedCategories);
    setIsAddDialogOpen(false);
    setNewItemTotal(0);
    setNewItemName('');
    toast.success(`${itemName} added successfully!`);
  };

  const handleRemoveAssessment = (category: CategoryType, itemId: string) => {
    const updatedCategories = { ...studentCategories };
    students.forEach(student => {
      if (updatedCategories[student.id]) {
        updatedCategories[student.id][category].items = 
          updatedCategories[student.id][category].items.filter(item => item.id !== itemId);
      }
    });
    setStudentCategories(updatedCategories);
    toast.success('Assessment removed');
  };

  const handleEditCategoryMax = (category: CategoryType) => {
    if (students.length === 0) return;
    const currentMax = studentCategories[students[0].id]?.[category]?.max || DEFAULT_CATEGORY_CONFIG[category].max;
    setEditingCategory(category);
    setEditingMaxValue(currentMax);
    setIsEditMaxDialogOpen(true);
  };

  const handleSaveCategoryMax = () => {
    if (students.length === 0) return;

    // Validate: new max must be >= total of existing assessments
    const minRequired = students.map(student => {
      const items = studentCategories[student.id]?.[editingCategory]?.items || [];
      return items.reduce((sum, item) => sum + item.total, 0);
    });
    const maxRequired = Math.max(...minRequired);

    if (editingMaxValue < maxRequired) {
      toast.error(`New limit cannot be less than total marks of existing assessments (${maxRequired})`);
      return;
    }

    // Update max for all students
    const updatedCategories = { ...studentCategories };
    students.forEach(student => {
      if (updatedCategories[student.id]) {
        updatedCategories[student.id][editingCategory].max = editingMaxValue;
      }
    });

    setStudentCategories(updatedCategories);
    setIsEditMaxDialogOpen(false);
    toast.success(`${DEFAULT_CATEGORY_CONFIG[editingCategory].name} max updated to ${editingMaxValue}`);
  };

  const handleToggleConsidered = (studentId: string, category: CategoryType, itemId: string) => {
    const updatedCategories = { ...studentCategories };
    const item = updatedCategories[studentId][category].items.find(i => i.id === itemId);
    if (item) {
      item.considered = !item.considered;
      setStudentCategories(updatedCategories);
    }
  };

  const handleUpdateMark = (studentId: string, category: CategoryType, itemId: string, obtained: number) => {
    const updatedCategories = { ...studentCategories };
    const item = updatedCategories[studentId][category].items.find(i => i.id === itemId);
    if (item) {
      item.obtained = Math.min(obtained, item.total); // Cap at total
      setStudentCategories(updatedCategories);
    }
  };

  const getStudentCategoryTotal = (studentId: string, category: CategoryType): { obtained: number; total: number } => {
    const items = studentCategories[studentId]?.[category]?.items || [];
    const consideredItems = items.filter(item => item.considered);
    return {
      obtained: consideredItems.reduce((sum, item) => sum + item.obtained, 0),
      total: consideredItems.reduce((sum, item) => sum + item.total, 0),
    };
  };

  const getStudentOverallTotal = (studentId: string): number => {
    let total = 0;
    (['quiz', 'assignment', 'midterm', 'final'] as CategoryType[]).forEach(category => {
      const categoryTotal = getStudentCategoryTotal(studentId, category);
      total += categoryTotal.obtained;
    });
    return Math.round(total * 100) / 100; // Round to 2 decimals
  };

  const handleSave = () => {
    if (!selectedCourse) {
      toast.error('Please select a course');
      return;
    }

    try {
      students.forEach(student => {
        const categories = studentCategories[student.id];
        const overallTotal = getStudentOverallTotal(student.id);
        const grade = calculateGrade(overallTotal);

        saveResult({
          courseId: selectedCourse,
          studentId: student.id,
          categories,
          overallTotal,
          total: overallTotal, // for backwards compatibility
          grade,
          assessments: [], // for backwards compatibility
        });
      });

      toast.success('Results saved successfully!');
    } catch (error) {
      toast.error('Failed to save results');
    }
  };

  // Get first student's items for display (all students have same assessment structure)
  const getAssessmentItems = (category: CategoryType): AssessmentItem[] => {
    if (students.length === 0) return [];
    return studentCategories[students[0].id]?.[category]?.items || [];
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

            {/* Assessment Management */}
            {selectedCourse && students.length > 0 && (
              <>
                {/* Category-based Assessment Structure */}
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-lg">Assessment Structure</h3>
                    <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                      <DialogTrigger asChild>
                        <Button size="sm" variant="outline" className="gap-2">
                          <Plus className="h-4 w-4" />
                          Add Assessment
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="bg-card border-border">
                        <DialogHeader>
                          <DialogTitle>Add New Assessment</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Category</label>
                            <Select value={selectedCategory} onValueChange={(v) => setSelectedCategory(v as CategoryType)}>
                              <SelectTrigger className="bg-muted border-border">
                                <SelectValue />
                              </SelectTrigger>
                               <SelectContent className="bg-card border-border">
                                {(Object.keys(DEFAULT_CATEGORY_CONFIG) as CategoryType[]).map(cat => {
                                  const available = students.length > 0 ? getCategoryAvailableSpace(cat, students[0].id) : 0;
                                  const max = students.length > 0 ? (studentCategories[students[0].id]?.[cat]?.max || DEFAULT_CATEGORY_CONFIG[cat].max) : DEFAULT_CATEGORY_CONFIG[cat].max;
                                  return (
                                    <SelectItem 
                                      key={cat} 
                                      value={cat}
                                      disabled={available <= 0}
                                    >
                                      {DEFAULT_CATEGORY_CONFIG[cat].name} (Available: {available}/{max})
                                    </SelectItem>
                                  );
                                })}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Assessment Name (Optional)</label>
                            <Input
                              value={newItemName}
                              onChange={(e) => setNewItemName(e.target.value)}
                              placeholder="e.g., Quiz 1, Assignment 2"
                              className="bg-muted border-border"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Total Marks</label>
                            <Input
                              type="number"
                              value={newItemTotal || ''}
                              onChange={(e) => setNewItemTotal(Number(e.target.value))}
                              min="0"
                              max={students.length > 0 ? getCategoryAvailableSpace(selectedCategory, students[0].id) : 0}
                              className="bg-muted border-border"
                            />
                            <p className="text-xs text-muted-foreground">
                              Available space: {students.length > 0 ? getCategoryAvailableSpace(selectedCategory, students[0].id) : 0} marks
                            </p>
                          </div>
                          <Button onClick={handleAddAssessment} className="w-full">
                            Add Assessment
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>

                  {/* Display Categories */}
                  {(['quiz', 'assignment', 'midterm', 'final'] as CategoryType[]).map(category => {
                    const items = getAssessmentItems(category);
                    const currentMax = students.length > 0 ? (studentCategories[students[0].id]?.[category]?.max || DEFAULT_CATEGORY_CONFIG[category].max) : DEFAULT_CATEGORY_CONFIG[category].max;
                    const available = students.length > 0 ? getCategoryAvailableSpace(category, students[0].id) : currentMax;

                    return (
                      <div key={category} className="p-4 rounded-lg border border-border space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold text-primary">{DEFAULT_CATEGORY_CONFIG[category].name}</h4>
                          <div className="flex items-center gap-3">
                            <span className="text-sm text-muted-foreground">
                              Max: {currentMax} marks | Remaining: {available}
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditCategoryMax(category)}
                              className="h-7 text-xs"
                            >
                              Edit Max
                            </Button>
                          </div>
                        </div>
                        <div className="space-y-2">
                          {items.map(item => (
                            <div key={item.id} className="flex items-center gap-2 p-2 rounded bg-muted/50">
                              <span className="flex-1 text-sm">{item.name || 'Unnamed'}</span>
                              <span className="text-sm text-muted-foreground">({item.total} marks)</span>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => handleRemoveAssessment(category, item.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                        );
                      })}
                    </div>

                {/* Edit Category Max Dialog */}
                <Dialog open={isEditMaxDialogOpen} onOpenChange={setIsEditMaxDialogOpen}>
                  <DialogContent className="bg-card border-border">
                    <DialogHeader>
                      <DialogTitle>Edit {DEFAULT_CATEGORY_CONFIG[editingCategory].name} Maximum Marks</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Maximum Absolute Marks</label>
                        <Input
                          type="number"
                          value={editingMaxValue || ''}
                          onChange={(e) => setEditingMaxValue(Number(e.target.value))}
                          min="0"
                          className="bg-muted border-border"
                        />
                        <p className="text-xs text-muted-foreground">
                          Current assessments total: {students.length > 0 ? 
                            (studentCategories[students[0].id]?.[editingCategory]?.items || [])
                              .reduce((sum, item) => sum + item.total, 0) : 0} marks
                        </p>
                      </div>
                      <Button onClick={handleSaveCategoryMax} className="w-full">
                        Save Maximum
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>

                {/* Student Marks Entry */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Enter Student Marks</h3>
                  {students.map(student => (
                    <div key={student.id} className="p-4 rounded-lg border border-border space-y-4">
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
                          <p className="text-2xl font-bold">{getStudentOverallTotal(student.id)}/100</p>
                          <p className="text-sm font-semibold text-primary">
                            Grade: {calculateGrade(getStudentOverallTotal(student.id))}
                          </p>
                        </div>
                      </div>

                      {/* Categories */}
                      {(['quiz', 'assignment', 'midterm', 'final'] as CategoryType[]).map(category => {
                        const items = studentCategories[student.id]?.[category]?.items || [];
                        if (items.length === 0) return null;

                        const categoryTotals = getStudentCategoryTotal(student.id, category);

                        return (
                          <div key={category} className="space-y-2">
                            <div className="flex items-center justify-between px-2">
                              <h5 className="text-sm font-semibold text-primary">{DEFAULT_CATEGORY_CONFIG[category].name}</h5>
                              <span className="text-sm font-medium">
                                {categoryTotals.obtained}/{categoryTotals.total}
                              </span>
                            </div>
                            <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
                              {items.map(item => (
                                <div key={item.id} className="relative">
                                  <div className={`space-y-1 p-2 rounded border ${item.considered ? 'border-border' : 'border-muted opacity-50'}`}>
                                    <div className="flex items-center justify-between">
                                      <label className="text-xs font-medium">
                                        {item.name} ({item.total}m)
                                      </label>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-6 w-6"
                                        onClick={() => handleToggleConsidered(student.id, category, item.id)}
                                      >
                                        {item.considered ? (
                                          <Eye className="h-3 w-3" />
                                        ) : (
                                          <EyeOff className="h-3 w-3" />
                                        )}
                                      </Button>
                                    </div>
                                    <Input
                                      type="number"
                                      value={item.obtained || 0}
                                      onChange={(e) => handleUpdateMark(student.id, category, item.id, Number(e.target.value))}
                                      min="0"
                                      max={item.total}
                                      step="0.5"
                                      disabled={!item.considered}
                                      className="h-8 bg-muted border-border text-sm"
                                    />
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>

                <Button onClick={handleSave} className="w-full neon-glow">
                  Save Results
                </Button>
              </>
            )}

            {selectedCourse && students.length === 0 && (
              <p className="text-center text-muted-foreground py-8">
                No students enrolled in this course
              </p>
            )}
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default UploadResults;
