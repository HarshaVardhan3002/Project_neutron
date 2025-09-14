/**
 * @fileoverview Card component to display the user's weekly goals.
 */
'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Target } from "lucide-react";

export function WeeklyGoalsCard() {
  return (
    <Card className="bg-card/50 backdrop-blur-lg transform transition-all hover:-translate-y-1 hover:shadow-xl animated-border-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-6 w-6 text-destructive" />
          <span>Weekly Goals</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-3">
          <CheckCircle className="h-5 w-5 text-green-500" />
          <span>Complete 2 modules</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="h-5 w-5 rounded-full border-2 border-muted-foreground" />
          <span>Take 1 full mock test</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="h-5 w-5 rounded-full border-2 border-muted-foreground" />
          <span>Book a session with a tutor</span>
        </div>
      </CardContent>
    </Card>
  );
}
