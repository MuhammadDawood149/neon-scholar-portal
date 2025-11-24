import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { User } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Get valid student IDs from a course's studentsEnrolled array
 * Filters out empty strings, null values, and non-student users
 */
export function getValidStudentIds(studentsEnrolled: string[] | undefined, allUsers: User[]): string[] {
  if (!studentsEnrolled || studentsEnrolled.length === 0) return [];
  
  return studentsEnrolled.filter(id => {
    // Remove empty strings and null values
    if (!id || id.trim() === '') return false;
    
    // Check if the user exists and has role === 'student'
    const user = allUsers.find(u => u.id === id);
    return user && user.role === 'student';
  });
}

/**
 * Count valid students enrolled in a course
 */
export function countValidStudents(studentsEnrolled: string[] | undefined, allUsers: User[]): number {
  return getValidStudentIds(studentsEnrolled, allUsers).length;
}
