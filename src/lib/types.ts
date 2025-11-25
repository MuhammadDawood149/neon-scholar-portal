export type UserRole = 'admin' | 'teacher' | 'student';

export interface User {
  id: string;
  username: string;
  password: string;
  role: UserRole;
  name: string;
  email?: string;
  profileImage?: string;
}

export interface Student extends User {
  role: 'student';
  studentId: string;
  courses: string[];
}

export interface Teacher extends User {
  role: 'teacher';
  teacherId: string;
  courses: string[];
}

export interface AttendanceRecord {
  courseId: string;
  studentId: string;
  records: Array<{
    date: string;
    status: 'present' | 'absent';
  }>;
}

export interface Assessment {
  type: string;
  weight: number;
  obtained: number;
}

export interface AssessmentItem {
  id: string;
  total: number;
  obtained: number;
  considered: boolean;
  name?: string; // optional name like "Quiz 1", "Assignment 2"
}

export interface CategoryData {
  max: number;
  items: AssessmentItem[];
}

export interface ResultRecord {
  courseId: string;
  studentId: string;
  assessments?: Assessment[]; // kept for backwards compatibility
  categories?: {
    quiz: CategoryData;
    assignment: CategoryData;
    midterm: CategoryData;
    final: CategoryData;
  };
  overallTotal: number;
  total: number; // kept for backwards compatibility
  grade: string;
}

export interface Course {
  id: string;
  name: string;
  code: string;
  teacherId?: string;
  studentsEnrolled: string[];
}
