/**
 * @fileoverview A sample lesson page for a module within the LMS.
 */
'use client';

import React, { useState } from 'react';
import { PageHeader } from '@/components/PageHeader.component';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageSquare, ArrowLeft, ArrowRight } from 'lucide-react';
import AiChatDialog from '@/components/lms/ai-chat-dialog';
import { AnimatedDiv } from '@/components/AnimatedDiv';

// Mock data for a single lesson
const lessonData = {
    title: 'Skimming and Scanning Techniques',
    module: 'IELTS Reading: Advanced Strategies',
    videoUrl: 'https://www.youtube.com/embed/unAGSy41_54', // Professional placeholder video
    content: `<p>Skimming and scanning are two essential speed-reading techniques that are crucial for success in the IELTS Reading test. They allow you to quickly get a general overview of a passage and locate specific information without reading every word.</p><h3 class="text-lg font-semibold mt-4 mb-2">Skimming</h3><p>Skimming is reading quickly to get the main idea of a text. You don't read every word, but rather let your eyes 'skim' over the surface of the text. Focus on titles, headings, subheadings, and the first and last sentences of paragraphs.</p><h3 class="text-lg font-semibold mt-4 mb-2">Scanning</h3><p>Scanning is used when you are looking for a specific piece of information, such as a name, date, number, or a particular keyword. You move your eyes quickly down the page in a pattern, looking for that specific word or phrase.</p>`,
    quiz: [
        {
            id: 'q1',
            question: 'Which technique is best for finding a specific date in a text?',
            options: ['Skimming', 'Scanning', 'Intensive Reading'],
            answer: 'Scanning',
        }
    ]
};

/**
 * Renders a sample lesson page.
 * @returns {JSX.Element} The lesson page component.
 */
export default function QuizPage() {
    const [isChatOpen, setChatOpen] = useState(false);

    return (
        <div className="space-y-8">
            <AnimatedDiv>
                <PageHeader
                    title={lessonData.title}
                    description={`Part of the "${lessonData.module}" module.`}
                />
            </AnimatedDiv>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                {/* Main content: Video and Text */}
                <div className="lg:col-span-2 space-y-6">
                    <AnimatedDiv delay={100}>
                        <Card className="overflow-hidden bg-card/50 backdrop-blur-lg animated-border-card">
                            <div className="aspect-video bg-muted">
                            {/* In a real app, use a proper video player */}
                            <iframe
                                    width="100%"
                                    height="100%"
                                    src={lessonData.videoUrl}
                                    title="YouTube video player"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                ></iframe>
                            </div>
                        </Card>
                    </AnimatedDiv>
                    <AnimatedDiv delay={200}>
                        <Card className="bg-card/50 backdrop-blur-lg animated-border-card">
                            <CardHeader>
                                <CardTitle>Lesson Content</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="prose dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: lessonData.content }} />
                            </CardContent>
                        </Card>
                    </AnimatedDiv>
                </div>
                {/* Sidebar: Quiz */}
                <div className="lg:col-span-1">
                    <AnimatedDiv delay={300}>
                        <Card className="sticky top-24 bg-card/50 backdrop-blur-lg animated-border-card">
                            <CardHeader>
                                <CardTitle>Knowledge Check</CardTitle>
                                <CardDescription>Answer the question below to mark this lesson as complete.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                            <div>
                                    <p className="font-semibold mb-2">{lessonData.quiz[0].question}</p>
                                    <div className="space-y-2">
                                        {lessonData.quiz[0].options.map(opt => (
                                            <Button key={opt} variant="outline" className="w-full justify-start">{opt}</Button>
                                        ))}
                                    </div>
                            </div>
                            </CardContent>
                            <CardFooter className="flex justify-between">
                                <Button variant="secondary">
                                    <ArrowLeft className="mr-2 h-4 w-4" /> Previous
                                </Button>
                                <Button>
                                    Next <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            </CardFooter>
                        </Card>
                    </AnimatedDiv>
                </div>
            </div>

            {/* Floating "Ask Doubt" button */}
            <Button 
                className="fixed bottom-8 right-8 rounded-full h-16 w-16 shadow-lg z-40 transform transition-all hover:scale-110"
                onClick={() => setChatOpen(true)}
            >
                <MessageSquare className="h-8 w-8" />
                <span className="sr-only">Ask a doubt</span>
            </Button>
            
            <AiChatDialog isOpen={isChatOpen} onOpenChange={setChatOpen} />
        </div>
    );
}
