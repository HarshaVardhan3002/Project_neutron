/**
 * @fileoverview Main blog page displaying a grid of all available blog posts.
 */
'use client';

import Header from '@/components/Header.component';
import Footer from '@/components/Footer.component';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { AnimatedDiv } from '@/components/AnimatedDiv';

/**
 * An array of blog post data.
 * In a real application, this would be fetched from a CMS or database.
 */
const blogPosts = [
  {
    title: 'Top 5 Tips for a Successful Study Abroad Application',
    excerpt: 'Navigating the study abroad application process can be daunting. Here are our top tips to help you succeed.',
    imageUrl: 'https://placehold.co/800x600',
    aiHint: 'student application',
    href: '/blog', // Note: In a real app, this would be a dynamic link like `/blog/slug-for-this-post`
    date: 'October 26, 2023',
    readingTime: '5 min read',
  },
  {
    title: 'How to Ace Your IELTS Exam: A Comprehensive Guide',
    excerpt: 'Our expert guide breaks down everything you need to know to get the best possible score on your IELTS exam.',
    imageUrl: 'https://placehold.co/800x600',
    aiHint: 'exam preparation',
    href: '/blog',
    date: 'October 22, 2023',
    readingTime: '7 min read',
  },
  {
    title: 'Landing Your Dream Job Overseas: Resume and Interview Skills',
    excerpt: 'Learn how to tailor your resume and sharpen your interview skills for the international job market.',
    imageUrl: 'https://placehold.co/800x600',
    aiHint: 'job interview',
    href: '/blog',
    date: 'October 18, 2023',
    readingTime: '6 min read',
  },
  {
    title: 'The Ultimate Checklist for Your Visa Application',
    excerpt: 'A step-by-step checklist to ensure your visa application process is smooth and successful.',
    imageUrl: 'https://placehold.co/800x600',
    aiHint: 'visa documents',
    href: '/blog',
    date: 'October 15, 2023',
    readingTime: '4 min read',
  },
  {
    title: 'Career Upskilling: Which Courses Are in Demand?',
    excerpt: 'Explore the top courses and skills that are currently in high demand in the global job market.',
    imageUrl: 'https://placehold.co/800x600',
    aiHint: 'online course',
    href: '/blog',
    date: 'October 11, 2023',
    readingTime: '8 min read',
  },
  {
    title: 'A Student\'s Guide to Living in the UK',
    excerpt: 'From accommodation to culture, here\'s what you need to know about student life in the United Kingdom.',
    imageUrl: 'https://placehold.co/800x600',
    aiHint: 'london city',
    href: '/blog',
    date: 'October 07, 2023',
    readingTime: '6 min read',
  },
];

/**
 * Renders the main blog page, displaying all posts in a responsive grid layout.
 * @returns {JSX.Element} The blog page component.
 */
export default function BlogPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1">
        <section className="pt-28 pb-20 sm:pt-36 sm:pb-32 overflow-hidden">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <AnimatedDiv>
                <h1 className="font-headline text-5xl md:text-6xl font-bold animated-gradient-text pb-4">
                  The Project_Neutron Blog
                </h1>
              </AnimatedDiv>
              <AnimatedDiv delay={200}>
                <p className="mt-4 max-w-2xl mx-auto text-base sm:text-lg text-foreground/80">
                  Your source for learning tips, educational insights, and platform updates.
                </p>
              </AnimatedDiv>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {blogPosts.map((post, index) => (
                <AnimatedDiv key={index} delay={200 + index * 100}>
                  <Card
                    className="group flex flex-col overflow-hidden bg-card border transition-all duration-300 transform hover:-translate-y-2 hover:shadow-2xl h-full"
                  >
                    <CardHeader className="p-0">
                      <Link href={post.href} className="block relative aspect-[16/9] overflow-hidden">
                        <Image
                          src={post.imageUrl}
                          alt={post.title}
                          fill
                          sizes="(max-width: 767px) 100vw, (max-width: 1023px) 50vw, 33vw"
                          data-ai-hint={post.aiHint}
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      </Link>
                    </CardHeader>
                    <CardContent className="flex flex-col flex-grow p-6">
                      <div className="text-sm text-muted-foreground mb-2">
                        <span>{post.date}</span> &middot; <span>{post.readingTime}</span>
                      </div>
                      <CardTitle className="font-headline text-xl mb-3 flex-grow">
                        <Link href={post.href} className="hover:text-primary transition-colors">
                          {post.title}
                        </Link>
                      </CardTitle>
                      <p className="text-foreground/70 text-sm">{post.excerpt}</p>
                    </CardContent>
                    <CardFooter className="p-6 pt-0">
                      <Button asChild variant="link" className="p-0 h-auto text-primary">
                        <Link href={post.href}>
                          Read More <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    </CardFooter>
                  </Card>
                </AnimatedDiv>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
