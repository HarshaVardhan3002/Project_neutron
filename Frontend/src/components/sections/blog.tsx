/**
 * @fileoverview The "From Our Blog" section for the homepage.
 * It displays a selection of the most recent blog posts.
 */
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { AnimatedDiv } from '../AnimatedDiv';
import { apiClient } from '@/lib/api.service';
import type { BlogPost } from '@/lib/types/blog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';

/**
 * Fetches the featured blog posts from the API.
 * @returns {Promise<BlogPost[]>} A promise that resolves to an array of blog posts.
 * @throws {Error} If the API call fails.
 */
async function getFeaturedBlogPosts(): Promise<BlogPost[]> {
    // Mock blog posts for demonstration
    // In a real application, this would fetch from a blog API endpoint
    return [
        {
            id: '1',
            title: 'Top 5 Tips for a Successful Study Abroad Application',
            excerpt: 'Navigating the study abroad application process can be daunting. Here are our top tips to help you succeed.',
            imageUrl: 'https://placehold.co/800x600',
            aiHint: 'student application',
            href: '/blog/1',
            date: 'October 26, 2023',
            readingTime: '5 min read',
        },
        {
            id: '2',
            title: 'How to Ace Your IELTS Exam: A Comprehensive Guide',
            excerpt: 'Our expert guide breaks down everything you need to know to get the best possible score on your IELTS exam.',
            imageUrl: 'https://placehold.co/800x600',
            aiHint: 'exam preparation',
            href: '/blog/2',
            date: 'October 22, 2023',
            readingTime: '7 min read',
        },
        {
            id: '3',
            title: 'Landing Your Dream Job Overseas: Resume and Interview Skills',
            excerpt: 'Learn how to tailor your resume and sharpen your interview skills for the international job market.',
            imageUrl: 'https://placehold.co/800x600',
            aiHint: 'job interview',
            href: '/blog/3',
            date: 'October 18, 2023',
            readingTime: '6 min read',
        },
    ];
}


/**
 * Renders the Blog section on the homepage, showcasing featured articles.
 * This is a server component that fetches its own data.
 * @returns {Promise<JSX.Element>} The Blog section component.
 */
export default async function BlogSection(): Promise<JSX.Element> {
    const blogPosts = await getFeaturedBlogPosts();

    return (
        <section id="blog" className="py-20 sm:py-32 bg-background/70 overflow-hidden">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <AnimatedDiv>
                        <h2 className="font-headline text-4xl md:text-5xl font-bold animated-gradient-text pb-4">
                            From Our Blog
                        </h2>
                    </AnimatedDiv>
                    <AnimatedDiv delay={200}>
                        <p className="mt-4 max-w-2xl mx-auto text-base sm:text-lg text-foreground/80">
                            Insights, tips, and stories to guide you on your journey.
                        </p>
                    </AnimatedDiv>
                </div>

                {!blogPosts || blogPosts.length === 0 ? (
                    <Alert>
                        <Terminal className="h-4 w-4" />
                        <AlertTitle>No Posts Yet!</AlertTitle>
                        <AlertDescription>
                            We&apos;re working on new content. Please check back soon!
                        </AlertDescription>
                    </Alert>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {blogPosts.map((post, index) => (
                            <AnimatedDiv key={post.id} delay={200 + index * 100}>
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
                )}
                <AnimatedDiv className="text-center mt-12" delay={500}>
                    <Button asChild size="lg">
                        <Link href="/blog">View All Posts</Link>
                    </Button>
                </AnimatedDiv>
            </div>
        </section>
    );
}
