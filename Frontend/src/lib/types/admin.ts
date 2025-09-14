/**
 * @fileoverview Shared TypeScript types for the Admin dashboard section.
 * These types define the shape of data used across the admin pages.
 */

/**
 * Represents a user account in the system.
 */
export type User = {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  createdAt: string; // ISO date string
};

/**
 * Represents a blog post entity.
 */
export type Post = {
  id: string;
  title: string;
  slug: string;
  content: string;
  tags: string[];
  published: boolean;
  publishedAt: string | null; // ISO date string or null
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
};

/**
 * Represents a financial transaction for the payments page.
 * Note: This is used for frontend mock data.
 */
export type Payment = {
  id: string;
  user: {
    name: string;
    email: string;
  };
  amount: number;
  date: string;
  status: 'Completed' | 'Pending' | 'Failed';
  product: string;
};
