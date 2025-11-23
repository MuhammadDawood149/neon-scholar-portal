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
  id: string;
  studentId: string;
  courseId: string;
  date: string;
  status: 'present' | 'absent';
}

export interface ResultRecord {
  id: string;
  studentId: string;
  courseId: string;
  assessment: string;
  marks: number;
  maxMarks: number;
  grade: string;
  date: string;
}

export interface Course {
  id: string;
  name: string;
  code: string;
  teacherId?: string;
  studentsEnrolled: string[];
}
