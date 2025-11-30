import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { getCourses, getUsers, saveResult, calculateGrade, getResultRecords } from '@/lib/storage';
import { getAuthUser } from '@/lib/auth';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Plus, Trash2, Eye, EyeOff, Edit2, Save } from 'lucide-react';
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
  const [isEditItemDialogOpen, setIsEditItemDialogOpen] = useState(false);
  const [isMarksDialogOpen, setIsMarksDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryType>('quiz');
  const [editingMaxValue, setEditingMaxValue] = useState<number>(0);
  const [editingItem, setEditingItem] = useState<{ category: CategoryType; itemId: string; currentTotal: number } | null>(null);
  const [editingItemTotal, setEditingItemTotal] = useState<number>(0);
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>('quiz');
  const [newItemTotal, setNewItemTotal] = useState<number>(0);
  const [newItemName, setNewItemName] = useState('');
  const [marksDialogData, setMarksDialogData] = useState<{ category: CategoryType; item: AssessmentItem } | null>(null);
  const [tempMarks, setTempMarks] = useState<{ [studentId: string]: number }>({});
  
  // Shared category structure (same for all students)
  const [categoryStructure, setCategoryStructure] = useState<{
    quiz: CategoryData;
    assignment: CategoryData;
    midterm: CategoryData;
    final: CategoryData;
  }>({
    quiz: { max: DEFAULT_CATEGORY_CONFIG.quiz.max, items: [] },
    assignment: { max: DEFAULT_CATEGORY_CONFIG.assignment.max, items: [] },
    midterm: { max: DEFAULT_CATEGORY_CONFIG.midterm.max, items: [] },
    final: { max: DEFAULT_CATEGORY_CONFIG.final.max, items: [] },
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

        // Load existing structure from first student's result
        const existingResults = getResultRecords();
        const firstStudentResult = existingResults.find(
          r => r.courseId === selectedCourse && validStudentIds.includes(r.studentId)
        );
        
        if (firstStudentResult?.categories) {
          setCategoryStructure(firstStudentResult.categories);
        } else {
          // Initialize with defaults
          setCategoryStructure({
            quiz: { max: DEFAULT_CATEGORY_CONFIG.quiz.max, items: [] },
            assignment: { max: DEFAULT_CATEGORY_CONFIG.assignment.max, items: [] },
            midterm: { max: DEFAULT_CATEGORY_CONFIG.midterm.max, items: [] },
            final: { max: DEFAULT_CATEGORY_CONFIG.final.max, items: [] },
          });
        }
      }
    }
  }, [selectedCourse, courses]);

  const getCategoryUsedTotal = (category: CategoryType): number => {
    const items = categoryStructure[category]?.items || [];
    return items
      .filter(item => item.considered)
      .reduce((sum, item) => sum + item.total, 0);
  };

  const getCategoryAvailableSpace = (category: CategoryType): number => {
    const max = categoryStructure[category]?.max || DEFAULT_CATEGORY_CONFIG[category].max;
    const used = getCategoryUsedTotal(category);
    return max - used;
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

    const available = getCategoryAvailableSpace(selectedCategory);
    if (newItemTotal > available) {
      toast.error(`Not enough space. Maximum available: ${available} marks`);
      return;
    }

    // Generate assessment name
    const categoryItems = categoryStructure[selectedCategory]?.items || [];
    const itemNumber = categoryItems.length + 1;
    const itemName = newItemName.trim() || `${DEFAULT_CATEGORY_CONFIG[selectedCategory].name} ${itemNumber}`;
    const itemId = `${selectedCategory}_${Date.now()}`;

    // Initialize scores for all students (default 0)
    const initialScores: { [studentId: string]: number } = {};
    students.forEach(student => {
      initialScores[student.id] = 0;
    });

    // Add new item to structure
    const updatedStructure = { ...categoryStructure };
    updatedStructure[selectedCategory].items.push({
      id: itemId,
      name: itemName,
      total: newItemTotal,
      scores: initialScores,
      considered: true,
    });

    setCategoryStructure(updatedStructure);
    setIsAddDialogOpen(false);
    setNewItemTotal(0);
    setNewItemName('');
    toast.success(`${itemName} added successfully!`);
  };

  const handleRemoveAssessment = (category: CategoryType, itemId: string) => {
    const updatedStructure = { ...categoryStructure };
    updatedStructure[category].items = updatedStructure[category].items.filter(item => item.id !== itemId);
    setCategoryStructure(updatedStructure);
    toast.success('Assessment removed');
  };

  const handleEditCategoryMax = (category: CategoryType) => {
    const currentMax = categoryStructure[category]?.max || DEFAULT_CATEGORY_CONFIG[category].max;
    setEditingCategory(category);
    setEditingMaxValue(currentMax);
    setIsEditMaxDialogOpen(true);
  };

  const handleSaveCategoryMax = () => {
    // Validate: new max must be >= total of existing assessments
    const items = categoryStructure[editingCategory]?.items || [];
    const totalUsed = items.reduce((sum, item) => sum + item.total, 0);

    if (editingMaxValue < totalUsed) {
      toast.error(`New limit cannot be less than total marks of existing assessments (${totalUsed})`);
      return;
    }

    const updatedStructure = { ...categoryStructure };
    updatedStructure[editingCategory].max = editingMaxValue;
    setCategoryStructure(updatedStructure);
    setIsEditMaxDialogOpen(false);
    toast.success(`${DEFAULT_CATEGORY_CONFIG[editingCategory].name} max updated to ${editingMaxValue}`);
  };

  const handleEditItemTotal = (category: CategoryType, itemId: string, currentTotal: number) => {
    setEditingItem({ category, itemId, currentTotal });
    setEditingItemTotal(currentTotal);
    setIsEditItemDialogOpen(true);
  };

  const handleSaveItemTotal = () => {
    if (!editingItem) return;

    const { category, itemId, currentTotal } = editingItem;

    if (editingItemTotal <= 0) {
      toast.error('Total marks must be greater than 0');
      return;
    }

    // Check if increase is within available space
    const increase = editingItemTotal - currentTotal;
    if (increase > 0) {
      const available = getCategoryAvailableSpace(category);
      if (increase > available) {
        toast.error(`Cannot increase by ${increase}. Only ${available} marks available.`);
        return;
      }
    }

    // Update item total
    const updatedStructure = { ...categoryStructure };
    const item = updatedStructure[category].items.find(i => i.id === itemId);
    if (item) {
      item.total = editingItemTotal;
      // Cap existing scores at new total
      Object.keys(item.scores).forEach(studentId => {
        if (item.scores[studentId] > editingItemTotal) {
          item.scores[studentId] = editingItemTotal;
        }
      });
      setCategoryStructure(updatedStructure);
      toast.success('Assessment total updated');
    }

    setIsEditItemDialogOpen(false);
    setEditingItem(null);
  };

  const handleToggleConsidered = (category: CategoryType, itemId: string) => {
    const updatedStructure = { ...categoryStructure };
    const item = updatedStructure[category].items.find(i => i.id === itemId);
    if (item) {
      item.considered = !item.considered;
      setCategoryStructure(updatedStructure);
    }
  };

  const handleOpenMarksDialog = (category: CategoryType, item: AssessmentItem) => {
    setMarksDialogData({ category, item });
    setTempMarks({ ...item.scores });
    setIsMarksDialogOpen(true);
  };

  const handleSaveMarks = () => {
    if (!marksDialogData) return;

    const { category, item } = marksDialogData;
    const updatedStructure = { ...categoryStructure };
    const targetItem = updatedStructure[category].items.find(i => i.id === item.id);
    
    if (targetItem) {
      targetItem.scores = { ...tempMarks };
      setCategoryStructure(updatedStructure);
      toast.success('Marks saved successfully');
    }

    setIsMarksDialogOpen(false);
    setMarksDialogData(null);
  };

  const getStudentOverallTotal = (studentId: string): number => {
    let total = 0;
    (['quiz', 'assignment', 'midterm', 'final'] as CategoryType[]).forEach(category => {
      const items = categoryStructure[category]?.items || [];
      const consideredItems = items.filter(item => item.considered);
      consideredItems.forEach(item => {
        total += item.scores[studentId] || 0;
      });
    });
    return Math.round(total * 100) / 100;
  };

  const handleSave = () => {
    if (!selectedCourse) {
      toast.error('Please select a course');
      return;
    }

    try {
      students.forEach(student => {
        const overallTotal = getStudentOverallTotal(student.id);
        const grade = calculateGrade(overallTotal);

        saveResult({
          courseId: selectedCourse,
          studentId: student.id,
          categories: categoryStructure,
          overallTotal,
          total: overallTotal,
          grade,
          assessments: [],
        });
      });

      toast.success('Results saved successfully!');
    } catch (error) {
      toast.error('Failed to save results');
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-heading font-bold mb-2">Upload Results</h1>
          <p className="text-muted-foreground">Manage assessments and upload marks for students</p>
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
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-lg">Assessment Structure</h3>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="gap-2"
                    onClick={() => setIsAddDialogOpen(true)}
                  >
                    <Plus className="h-4 w-4" />
                    Add Assessment
                  </Button>
                </div>

                {/* Categories Display */}
                {(['quiz', 'assignment', 'midterm', 'final'] as CategoryType[]).map(category => {
                  const items = categoryStructure[category]?.items || [];
                  const currentMax = categoryStructure[category]?.max || DEFAULT_CATEGORY_CONFIG[category].max;
                  const used = getCategoryUsedTotal(category);
                  const available = getCategoryAvailableSpace(category);

                  return (
                    <div key={category} className="p-4 rounded-lg border border-border space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-primary">{DEFAULT_CATEGORY_CONFIG[category].name}</h4>
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-muted-foreground">
                            {used} / {currentMax} | Remaining: {available}
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

                      {items.length > 0 ? (
                        <div className="space-y-2">
                          {items.map(item => (
                            <div 
                              key={item.id} 
                              className={`flex items-center justify-between p-3 rounded border ${
                                item.considered ? 'border-primary/30 bg-primary/5' : 'border-border/50 opacity-60'
                              }`}
                            >
                              <div className="flex items-center gap-3 flex-1">
                                <button
                                  onClick={() => handleToggleConsidered(category, item.id)}
                                  className="flex items-center gap-2"
                                  title={item.considered ? 'Click to ignore' : 'Click to consider'}
                                >
                                  {item.considered ? (
                                    <Eye className="h-4 w-4 text-primary" />
                                  ) : (
                                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                                  )}
                                </button>
                                <span className="font-medium">{item.name}</span>
                                <span className="text-sm text-muted-foreground">Total: {item.total}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEditItemTotal(category, item.id, item.total)}
                                  className="h-8 px-2"
                                >
                                  <Edit2 className="h-3 w-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleOpenMarksDialog(category, item)}
                                  className="h-8 px-3 text-primary"
                                >
                                  Enter Marks
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleRemoveAssessment(category, item.id)}
                                  className="h-8 px-2 text-destructive hover:text-destructive"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground text-center py-2">
                          No assessments added yet
                        </p>
                      )}
                    </div>
                  );
                })}

                {/* Save Button */}
                <Button onClick={handleSave} className="w-full" size="lg">
                  <Save className="h-4 w-4 mr-2" />
                  Save All Results
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

        {/* Add Assessment Dialog */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent className="bg-card border-border">
            <DialogHeader>
              <DialogTitle>Add New Assessment</DialogTitle>
              <DialogDescription>Create a new assessment item for a category</DialogDescription>
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
                      const available = getCategoryAvailableSpace(cat);
                      const max = categoryStructure[cat]?.max || DEFAULT_CATEGORY_CONFIG[cat].max;
                      return (
                        <SelectItem 
                          key={cat} 
                          value={cat}
                          disabled={available <= 0}
                        >
                          {DEFAULT_CATEGORY_CONFIG[cat].name} {available <= 0 ? '(Full)' : `(${available}/${max} available)`}
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
                  max={getCategoryAvailableSpace(selectedCategory)}
                  className="bg-muted border-border"
                />
                <p className="text-xs text-muted-foreground">
                  Available space: {getCategoryAvailableSpace(selectedCategory)} marks
                </p>
              </div>
              <Button 
                onClick={handleAddAssessment} 
                className="w-full"
                disabled={getCategoryAvailableSpace(selectedCategory) <= 0}
              >
                Add Assessment
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Category Max Dialog */}
        <Dialog open={isEditMaxDialogOpen} onOpenChange={setIsEditMaxDialogOpen}>
          <DialogContent className="bg-card border-border">
            <DialogHeader>
              <DialogTitle>Edit {DEFAULT_CATEGORY_CONFIG[editingCategory]?.name} Maximum</DialogTitle>
              <DialogDescription>Set the total absolute marks for this category</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Maximum Marks</label>
                <Input
                  type="number"
                  value={editingMaxValue || ''}
                  onChange={(e) => setEditingMaxValue(Number(e.target.value))}
                  min="0"
                  className="bg-muted border-border"
                />
                <p className="text-xs text-muted-foreground">
                  Current total used: {getCategoryUsedTotal(editingCategory)} marks
                </p>
              </div>
              <Button onClick={handleSaveCategoryMax} className="w-full">
                Save Maximum
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Item Total Dialog */}
        <Dialog open={isEditItemDialogOpen} onOpenChange={setIsEditItemDialogOpen}>
          <DialogContent className="bg-card border-border">
            <DialogHeader>
              <DialogTitle>Edit Assessment Total</DialogTitle>
              <DialogDescription>Change the total marks for this assessment</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Total Marks</label>
                <Input
                  type="number"
                  value={editingItemTotal || ''}
                  onChange={(e) => setEditingItemTotal(Number(e.target.value))}
                  min="0"
                  className="bg-muted border-border"
                />
                {editingItem && (
                  <p className="text-xs text-muted-foreground">
                    Current: {editingItem.currentTotal} | Available for increase: {getCategoryAvailableSpace(editingItem.category)}
                  </p>
                )}
              </div>
              <Button onClick={handleSaveItemTotal} className="w-full">
                Save Total
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Marks Entry Dialog */}
        <Dialog open={isMarksDialogOpen} onOpenChange={setIsMarksDialogOpen}>
          <DialogContent className="bg-card border-border max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                Enter Marks: {marksDialogData?.item.name}
              </DialogTitle>
              <DialogDescription>
                Total marks: {marksDialogData?.item.total}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3">
              {students.map(student => (
                <div key={student.id} className="flex items-center justify-between p-3 rounded-lg border border-border">
                  <span className="font-medium">{student.name}</span>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      value={tempMarks[student.id] ?? 0}
                      onChange={(e) => {
                        const value = Number(e.target.value);
                        const capped = Math.min(value, marksDialogData?.item.total || 0);
                        setTempMarks(prev => ({ ...prev, [student.id]: capped }));
                      }}
                      min="0"
                      max={marksDialogData?.item.total || 0}
                      className="w-20 bg-muted border-border"
                    />
                    <span className="text-sm text-muted-foreground">/ {marksDialogData?.item.total}</span>
                  </div>
                </div>
              ))}
            </div>
            <Button onClick={handleSaveMarks} className="w-full">
              Save Marks
            </Button>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default UploadResults;
