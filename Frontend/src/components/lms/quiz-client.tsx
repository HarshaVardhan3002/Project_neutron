/**
 * @fileoverview The client-side component for the interactive quiz.
 * Manages quiz state, timer, and user interactions in a professional layout.
 */
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import type { Question } from '@/lib/types';
import { ScrollArea } from '../ui/scroll-area';
import { AnimatedDiv } from '../AnimatedDiv';
import { cn } from '@/lib/utils.helper';
import { toast } from 'sonner';

const mockQuestions: Question[] = [
    {
        id: 'r1',
        type: 'reading',
        section: 'Reading Section',
        passage: `The concept of 'flow', a term coined by psychologist Mihaly Csikszentmihalyi, refers to the mental state in which a person performing an activity is fully immersed in a feeling of energized focus, full involvement, and enjoyment in the process of the activity. It is a state of complete absorption, where one loses track of time and the outside world seems to fall away.\n\nThis optimal experience is not passive; it requires a high degree of concentration and the use of one's skills to meet a challenge. A key element of flow is that the challenge of the activity must be in balance with the individual's skill level. If the task is too easy, boredom sets in. If it's too difficult, it leads to anxiety. Therefore, achieving flow is like walking on a tightrope between boredom and anxiety, requiring a dynamic balance that pushes one to their limits while still being achievable. This state is often reported during activities such as sports, artistic creation, and even focused work.`,
        question: 'According to the passage, what is a crucial condition for achieving the state of "flow"?',
        options: [
            'The activity must be physically demanding.',
            'The challenge must be perfectly matched with one\'s skill level.',
            'The person must be in a quiet, isolated environment.',
            'The task must be simple and repetitive.',
        ],
        answer: 'The challenge must be perfectly matched with one\'s skill level.',
    },
    {
        id: 'l1',
        type: 'listening',
        section: 'Listening Section',
        passage: `(Simulated Audio Transcript)\n\nLibrarian: Good morning, how can I help you?\nStudent: Hi, I'd like to register for a library card. I'm a new student at the university.\nLibrarian: Of course. I'll just need to see your student ID and a proof of address. A utility bill or a bank statement will be fine for that.\nStudent: Okay, here's my student ID. For proof of address, I have a letter from the university accommodation office. Is that acceptable?\nLibrarian: Yes, that's perfect. Now, just fill out this form. The annual fee is £10, but it's waived for all full-time students. Your card will be ready in about five minutes.`,
        question: 'What is the annual fee for the library card for a full-time student?',
        options: [
            '£10',
            '£5',
            'It is free.',
            'The passage does not say.',
        ],
        answer: 'It is free.',
    },
    {
        id: 'w1',
        type: 'writing',
        section: 'Writing Section (Task 2)',
        question: 'Some people believe that unpaid community service should be a compulsory part of high school programmes. To what extent do you agree or disagree? Write at least 250 words.',
        options: [],
        answer: '',
    },
    {
        id: 'r2',
        type: 'reading',
        section: 'Reading Section',
        passage: `The concept of 'flow', a term coined by psychologist Mihaly Csikszentmihalyi, refers to the mental state in which a person performing an activity is fully immersed in a feeling of energized focus, full involvement, and enjoyment in the process of the activity. It is a state of complete absorption, where one loses track of time and the outside world seems to fall away.\n\nThis optimal experience is not passive; it requires a high degree of concentration and the use of one's skills to meet a challenge. A key element of flow is that the challenge of the activity must be in balance with the individual's skill level. If the task is too easy, boredom sets in. If it's too difficult, it leads to anxiety. Therefore, achieving flow is like walking on a tightrope between boredom and anxiety, requiring a dynamic balance that pushes one to their limits while still being achievable. This state is often reported during activities such as sports, artistic creation, and even focused work.`,
        question: 'What happens if a task is significantly more difficult than a person\'s skills?',
        options: ['Boredom', 'Flow', 'Anxiety', 'Enjoyment'],
        answer: 'Anxiety',
    },
];

type QuizClientProps = {
    onProgressUpdate: (progress: number) => void;
    onTimeUpdate: (time: number) => void;
    initialTime: number;
};

/**
 * Renders the interactive quiz interface with a professional two-column layout.
 * @returns {JSX.Element} The quiz component.
 */
export default function QuizClient({ onProgressUpdate, onTimeUpdate, initialTime }: QuizClientProps) {
    const router = useRouter();
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [timeLeft, setTimeLeft] = useState(initialTime);

    const currentQuestion = mockQuestions[currentQuestionIndex];

    useEffect(() => {
        const newProgress = ((currentQuestionIndex) / mockQuestions.length) * 100;
        onProgressUpdate(newProgress);
    }, [currentQuestionIndex, onProgressUpdate]);

    useEffect(() => {
        onTimeUpdate(timeLeft);
        if (timeLeft <= 0) {
            handleFinish();
        }
        const timer = setInterval(() => {
            setTimeLeft((prevTime) => prevTime > 0 ? prevTime - 1 : 0);
        }, 1000);
        return () => clearInterval(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [timeLeft, onTimeUpdate]);

    const handleAnswerSelect = (questionId: string, answer: string) => {
        setAnswers((prev) => ({ ...prev, [questionId]: answer }));
    };

    const handleNext = () => {
        const isAnswered = answers[currentQuestion.id] && answers[currentQuestion.id].trim() !== '';
        if (!isAnswered) {
            toast.warning("Please answer the current question before proceeding.");
            return;
        }

        if (currentQuestionIndex < mockQuestions.length - 1) {
            setCurrentQuestionIndex((prev) => prev + 1);
        } else {
            handleFinish();
        }
    };

    const handlePrevious = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex((prev) => prev - 1);
        }
    };

    const handleFinish = () => {
        onProgressUpdate(100);
        router.push('/lms/onboarding/feedback');
    };

    const renderQuestionContent = () => {
        switch (currentQuestion.type) {
            case 'writing':
                return (
                    <div className="flex flex-col h-full">
                        <p className="text-lg font-semibold mb-4">{currentQuestion.question}</p>
                        <Textarea
                            placeholder="Start writing your essay here..."
                            className="flex-grow min-h-[300px] text-base"
                            value={answers[currentQuestion.id] || ''}
                            onChange={(e) => handleAnswerSelect(currentQuestion.id, e.target.value)}
                        />
                    </div>
                );
            case 'reading':
            case 'listening':
            default:
                return (
                    <div className="flex flex-col h-full">
                        <p className="font-semibold mb-4 text-lg">{currentQuestion.question}</p>
                        <RadioGroup
                            value={answers[currentQuestion.id] || ''}
                            onValueChange={(value) => handleAnswerSelect(currentQuestion.id, value)}
                            className="space-y-4"
                        >
                            {currentQuestion.options.map((option) => (
                                <div key={option} className="flex items-center space-x-3 p-4 border rounded-lg transition-all has-[[data-state=checked]]:bg-primary/10 has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:shadow-inner">
                                    <RadioGroupItem value={option} id={option} className="h-5 w-5" />
                                    <Label htmlFor={option} className="text-base flex-1 cursor-pointer font-normal">{option}</Label>
                                </div>
                            ))}
                        </RadioGroup>
                    </div>
                );
        }
    }

    return (
        <AnimatedDiv key={currentQuestion.id} className="w-full">
            <Card className="w-full bg-card/50 backdrop-blur-lg shadow-2xl border animated-border-card">
                <CardHeader>
                    <CardTitle className="font-headline text-2xl">{currentQuestion.section}</CardTitle>
                    {currentQuestion.passage && (
                        <CardDescription>Read the passage and answer the question that follows.</CardDescription>
                    )}
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-8 min-h-[450px]">
                    {currentQuestion.passage && (
                        <ScrollArea className="h-full max-h-[450px] pr-6 border-r">
                            <div className="prose prose-base dark:prose-invert whitespace-pre-wrap leading-relaxed">
                                {currentQuestion.passage}
                            </div>
                        </ScrollArea>
                    )}
                    <div className={cn(!currentQuestion.passage && 'md:col-span-2')}>
                        {renderQuestionContent()}
                    </div>
                </CardContent>
                <CardFooter className="flex justify-between border-t pt-6">
                    <Button variant="outline" onClick={handlePrevious} disabled={currentQuestionIndex === 0}>
                        Previous
                    </Button>
                    <Button onClick={handleNext}>
                        {currentQuestionIndex === mockQuestions.length - 1 ? 'Finish Assessment' : 'Next'}
                    </Button>
                </CardFooter>
            </Card>
        </AnimatedDiv>
    );
}
