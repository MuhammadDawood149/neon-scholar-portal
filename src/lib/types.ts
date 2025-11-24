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

export interface ResultRecord {
  courseId: string;
  studentId: string;
  assessments: Assessment[];
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
