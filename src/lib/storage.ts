import { User, AttendanceRecord, ResultRecord, Course } from './types';

const STORAGE_KEYS = {
  USERS: 'portal_users',
  ATTENDANCE: 'portal_attendance',
  RESULTS: 'portal_results',
  COURSES: 'portal_courses',
  CURRENT_USER: 'portal_current_user',
};

// Initialize default data
export const initializeStorage = () => {
  if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
    const defaultUsers: User[] = [
      {
        id: '1',
        username: 'admin',
        password: 'admin123',
        role: 'admin',
        name: 'Admin User',
        email: 'admin@portal.com',
      },
      {
        id: '2',
        username: 'teacher1',
        password: 'teacher123',
        role: 'teacher',
        name: 'John Smith',
        email: 'john@portal.com',
      },
      {
        id: '3',
        username: 'student1',
        password: 'student123',
        role: 'student',
        name: 'Alice Johnson',
        email: 'alice@portal.com',
      },
    ];
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(defaultUsers));
  }

  if (!localStorage.getItem(STORAGE_KEYS.COURSES)) {
    const defaultCourses: Course[] = [
      { id: '1', name: 'Mathematics', code: 'MATH101', teacherId: '2', studentsEnrolled: ['3'] },
      { id: '2', name: 'Physics', code: 'PHY101', teacherId: '2', studentsEnrolled: ['3'] },
      { id: '3', name: 'Chemistry', code: 'CHEM101', teacherId: '2', studentsEnrolled: ['3'] },
    ];
    localStorage.setItem(STORAGE_KEYS.COURSES, JSON.stringify(defaultCourses));
  }

  if (!localStorage.getItem(STORAGE_KEYS.ATTENDANCE)) {
    localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify([]));
  }

  if (!localStorage.getItem(STORAGE_KEYS.RESULTS)) {
    localStorage.setItem(STORAGE_KEYS.RESULTS, JSON.stringify([]));
  }
};

// Users
export const getUsers = (): User[] => {
  const data = localStorage.getItem(STORAGE_KEYS.USERS);
  return data ? JSON.parse(data) : [];
};

export const saveUser = (user: User) => {
  const users = getUsers();
  const index = users.findIndex(u => u.id === user.id);
  if (index >= 0) {
    users[index] = user;
  } else {
    users.push(user);
  }
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
};

export const deleteUser = (userId: string) => {
  const users = getUsers().filter(u => u.id !== userId);
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
};

// Attendance
export const getAttendanceRecords = (): AttendanceRecord[] => {
  const data = localStorage.getItem(STORAGE_KEYS.ATTENDANCE);
  return data ? JSON.parse(data) : [];
};

export const saveAttendance = (record: AttendanceRecord) => {
  const records = getAttendanceRecords();
  const index = records.findIndex(
    r => r.studentId === record.studentId && r.courseId === record.courseId && r.date === record.date
  );
  if (index >= 0) {
    records[index] = record;
  } else {
    records.push(record);
  }
  localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(records));
};

// Results
export const getResultRecords = (): ResultRecord[] => {
  const data = localStorage.getItem(STORAGE_KEYS.RESULTS);
  return data ? JSON.parse(data) : [];
};

export const saveResult = (record: ResultRecord) => {
  const records = getResultRecords();
  const index = records.findIndex(r => r.id === record.id);
  if (index >= 0) {
    records[index] = record;
  } else {
    records.push(record);
  }
  localStorage.setItem(STORAGE_KEYS.RESULTS, JSON.stringify(records));
};

// Courses
export const getCourses = (): Course[] => {
  const data = localStorage.getItem(STORAGE_KEYS.COURSES);
  return data ? JSON.parse(data) : [];
};

export const saveCourse = (course: Course) => {
  const courses = getCourses();
  const index = courses.findIndex(c => c.id === course.id);
  if (index >= 0) {
    courses[index] = course;
  } else {
    courses.push(course);
  }
  localStorage.setItem(STORAGE_KEYS.COURSES, JSON.stringify(courses));
};

export const deleteCourse = (courseId: string) => {
  const courses = getCourses().filter(c => c.id !== courseId);
  localStorage.setItem(STORAGE_KEYS.COURSES, JSON.stringify(courses));
};

// Current User
export const getCurrentUser = (): User | null => {
  const data = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
  return data ? JSON.parse(data) : null;
};

export const setCurrentUser = (user: User | null) => {
  if (user) {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
  } else {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  }
};

// Calculate grade
export const calculateGrade = (marks: number, maxMarks: number): string => {
  const percentage = (marks / maxMarks) * 100;
  if (percentage >= 90) return 'A+';
  if (percentage >= 80) return 'A';
  if (percentage >= 70) return 'B+';
  if (percentage >= 60) return 'B';
  if (percentage >= 50) return 'C';
  if (percentage >= 40) return 'D';
  return 'F';
};
