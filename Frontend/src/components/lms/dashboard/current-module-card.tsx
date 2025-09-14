/**
 * @fileoverview Card component to display the user's current or next module in the LMS.
 */
'use client';

import Link from "next/link";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, CheckCircle, Video, FileText, ArrowRight } from "lucide-react";
import type { LmsModule } from "@/lib/types";

type CurrentModuleCardProps = {
  module: LmsModule;
};

export function CurrentModuleCard({ module }: CurrentModuleCardProps) {
  return (
    <Card className="bg-card/50 backdrop-blur-lg animated-border-card transform transition-all hover:-translate-y-1 hover:shadow-2xl hover:shadow-primary/10">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-6 w-6 text-primary" />
          <span>Next Up: {module.title}</span>
        </CardTitle>
        <CardDescription>{module.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          {module.lessons.map(lesson => (
            <li key={lesson.id} className="flex items-center justify-between p-3 rounded-md bg-muted/50">
              <div className="flex items-center gap-3">
                {lesson.type === 'video' ? <Video className="h-5 w-5 text-muted-foreground" /> : <FileText className="h-5 w-5 text-muted-foreground" />}
                <span className="font-medium">{lesson.title}</span>
              </div>
              {lesson.completed ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <div className="h-5 w-5 rounded-full border-2 border-muted-foreground" />
              )}
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter>
        <Button asChild>
          <Link href="/lms/module">
            Continue Learning <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
