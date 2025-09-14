/**
 * @fileoverview TypeScript types for the Blog feature.
 */

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  imageUrl: string;
  aiHint: string;
  href: string;
  date: string;
  readingTime: string;
}
