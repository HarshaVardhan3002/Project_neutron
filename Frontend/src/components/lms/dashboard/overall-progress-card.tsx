/**
 * @fileoverview Card component to display the user's overall course progress.
 */
'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

type OverallProgressCardProps = {
  progress: number;
};

export function OverallProgressCard({ progress }: OverallProgressCardProps) {
  return (
    <Card className="bg-card/50 backdrop-blur-lg transform transition-all hover:-translate-y-1 hover:shadow-xl animated-border-card">
      <CardHeader>
        <CardTitle>Overall Progress</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Progress value={progress} />
        <p className="text-center text-muted-foreground font-medium">{Math.round(progress)}% Complete</p>
      </CardContent>
    </Card>
  );
}
