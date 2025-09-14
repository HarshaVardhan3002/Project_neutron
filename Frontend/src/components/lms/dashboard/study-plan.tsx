/**
 * @fileoverview Accordion component to display the full study plan on the LMS dashboard.
 */
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { BookOpen, CheckCircle } from "lucide-react";
import type { LmsModule } from "@/lib/types";
import { cn } from "@/lib/utils.helper";

type StudyPlanProps = {
  modules: LmsModule[];
  currentModuleId?: string;
};

export function StudyPlan({ modules, currentModuleId }: StudyPlanProps) {
  return (
    <Card className="bg-card/50 backdrop-blur-lg animated-border-card">
      <CardHeader>
        <CardTitle>Your IELTS Study Plan</CardTitle>
        <CardDescription>All modules in your personalized course.</CardDescription>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full" defaultValue={currentModuleId}>
          {modules.map(module => (
            <AccordionItem value={module.id} key={module.id} className="border-b-0">
              <Card className={cn("mb-2", module.status === 'in-progress' && 'border-primary/50')}>
                <AccordionTrigger className="p-4 hover:no-underline">
                  <div className="flex items-center gap-4 text-left">
                    <div>
                      {module.status === 'completed' && <CheckCircle className="h-8 w-8 text-green-500" />}
                      {module.status === 'in-progress' && <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center"><BookOpen className="h-5 w-5 text-primary-foreground" /></div>}
                      {module.status === 'locked' && <div className="h-8 w-8 rounded-full bg-muted border" />}
                    </div>
                    <div>
                      <h4 className="font-semibold">{module.title}</h4>
                      <p className="text-sm text-muted-foreground">{module.description}</p>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="p-4 pt-0">
                  <ul className="space-y-2 pl-12">
                    {module.lessons.length > 0 ? module.lessons.map(lesson => (
                      <li key={lesson.id} className="flex items-center gap-3 text-muted-foreground">
                        {lesson.completed ? <CheckCircle className="h-4 w-4 text-green-500" /> : <div className="h-4 w-4 rounded-full border-2" />}
                        <span>{lesson.title}</span>
                        <Badge variant="outline" className="ml-auto">{lesson.type}</Badge>
                      </li>
                    )) : <p className="text-sm text-muted-foreground">Lessons for this module are locked.</p>}
                  </ul>
                </AccordionContent>
              </Card>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
}
