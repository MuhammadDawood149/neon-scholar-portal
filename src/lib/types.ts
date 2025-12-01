export type UserRole = 'admin' | 'teacher' | 'student' | 'parent';

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

export interface ResultRecord {
  courseId: string;
  studentId: string;
  quiz: number;
  assignment: number;
  mid: number;
  final: number;
  total: number;
  grade: string;
}

export interface Course {
  id: string;
  name: string;
  code: string;
  teacherId?: string;
  studentsEnrolled: string[];
}

export interface Parent {
  id: string;
  name: string;
  email: string;
  password: string;
  studentId: string;
}
