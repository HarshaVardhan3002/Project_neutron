/**
 * @fileoverview The baseline assessment quiz page for the LMS onboarding flow.
 * Provides a professional, full-screen, distraction-free layout for the test.
 */
'use client';

import QuizClient from '@/components/lms/quiz-client';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { X, Clock } from 'lucide-react';
import { useState } from 'react';
import Logo from '@/components/Logo.component';

/**
 * Renders the quiz page with a professional, full-screen layout.
 * This component acts as a wrapper for the main QuizClient, providing the persistent header.
 * @returns {JSX.Element} The quiz page component.
 */
export default function AssessmentPage() {
  const [progress, setProgress] = useState(0);
  const [timeLeft, setTimeLeft] = useState(1200); // 20 minutes in seconds

  /**
   * Callback function passed to QuizClient to update the progress bar.
   * @param {number} newProgress - The new progress percentage (0-100).
   */
  const handleProgressUpdate = (newProgress: number) => {
    setProgress(newProgress);
  };
  
  /**
   * Callback function passed to QuizClient to update the timer display.
   * @param {number} newTime - The new time left in seconds.
   */
  const handleTimeUpdate = (newTime: number) => {
    setTimeLeft(newTime);
  };

  /**
   * Formats the remaining time from seconds into a MM:SS string.
   * @param {number} seconds - The time in seconds.
   * @returns {string} The formatted time string.
   */
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="fixed inset-0 bg-muted/30 z-50 flex flex-col">
      {/* Test Header */}
      <header className="p-4 flex flex-wrap sm:flex-nowrap justify-between items-center gap-4 border-b shrink-0 bg-background/80 backdrop-blur-xl">
        <div className="flex-shrink-0 w-full sm:w-auto text-center sm:text-left">
           <Logo className="-ml-0 sm:-ml-0" />
        </div>
        <div className="w-full sm:flex-1 order-last sm:order-none px-4 sm:px-0">
            <Progress value={progress} className="w-full h-2" />
            <p className="text-xs text-muted-foreground text-center mt-1.5">Question {Math.round(progress/25)} of 4</p>
        </div>
        <div className="flex-shrink-0 flex items-center justify-end gap-4 w-full sm:w-auto">
            <div className="flex items-center gap-2 font-semibold text-destructive">
                <Clock className="h-5 w-5" />
                <span>{formatTime(timeLeft)}</span>
            </div>
            <Button variant="ghost" size="icon" asChild>
                <Link href="/lms/onboarding">
                    <X className="h-5 w-5" />
                    <span className="sr-only">Exit Assessment</span>
                </Link>
            </Button>
        </div>
      </header>
      
      {/* Main Quiz Content */}
      <main className="flex-1 flex items-center justify-center p-4 overflow-y-auto">
        <div className="w-full max-w-5xl">
          <QuizClient onProgressUpdate={handleProgressUpdate} onTimeUpdate={handleTimeUpdate} initialTime={timeLeft} />
        </div>
      </main>
    </div>
  );
}
