/**
 * @fileoverview Shared TypeScript types for the Learning Management System (LMS).
 * These types define the data structures for courses, lessons, tests, and users in the LMS.
 */

/**
 * Represents a single question in a quiz or assessment.
 */
export type Question = {
  id: string;
  section: string;
  type: 'reading' | 'writing' | 'listening';
  passage?: string; // Optional for questions that don't need a reading passage
  question: string;
  options: string[];
  answer: string;
};

/**
 * Represents a test available for the user to select (e.g., IELTS, GRE).
 */
export type Test = {
  id: string;
  name: string;
  description: string;
  icon: JSX.Element;
  color: string;
  href: string;
};

/**
 * Represents a single lesson within a module.
 */
export type LmsLesson = {
  id: string;
  title: string;
  type: 'video' | 'reading' | 'quiz';
  completed: boolean;
};

/**
 * Represents a single module in a learning path or course.
 */
export type LmsModule = {
  id: string;
  title: string;
  description: string;
  status: 'completed' | 'in-progress' | 'locked';
  lessons: LmsLesson[];
};

/**
 * Represents a tutor available on the marketplace.
 */
export type Tutor = {
  id: string;
  name: string;
  avatarUrl: string;
  skills: string[];
  rating: number; // e.g., 4.9
  reviews: number;
  pricePerHour: number;
  description: string;
};

/**
 * Represents a mock test available to the user.
 */
export type MockTest = {
  id: string;
  title: string;
  type: 'Full Test' | 'Sectional';
  section?: string;
  duration: number; // in minutes
  status: 'Not Started' | 'In Progress' | 'Completed' | 'Locked';
  score?: number; // Optional band score for completed tests
};
