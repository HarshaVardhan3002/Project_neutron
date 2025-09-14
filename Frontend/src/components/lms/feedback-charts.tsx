/**
 * @fileoverview Client component for rendering animated feedback charts.
 * Uses Recharts for the donut chart visualization.
 */
'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Label } from 'recharts';

type FeedbackChartsProps = {
  scores: { name: string; score: number; color: string }[];
  overallBand: number;
};

/**
 * Renders the animated donut charts for the feedback page.
 * @param {FeedbackChartsProps} props The component props.
 * @returns {JSX.Element} The charts component.
 */
export default function FeedbackCharts({ scores, overallBand }: FeedbackChartsProps) {
    const maxScore = 9.0; // Max band score for IELTS

    return (
        <Card className="bg-background/50 backdrop-blur-lg border h-full">
            <CardHeader>
                <CardTitle>Your Performance Snapshot</CardTitle>
                <CardDescription>Predicted band scores based on your assessment.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="w-full h-[350px]">
                    <ResponsiveContainer width="100%" height="100%">
                         <PieChart>
                            <Pie
                                data={scores}
                                cx="50%"
                                cy="50%"
                                innerRadius="60%"
                                outerRadius="80%"
                                dataKey="score"
                                nameKey="name"
                                paddingAngle={5}
                                labelLine={false}
                                label={({ cx, cy, midAngle, innerRadius, outerRadius, value, index }) => {
                                    const RADIAN = Math.PI / 180;
                                    const radius = innerRadius + (outerRadius - innerRadius) * 1.2;
                                    const x = cx + radius * Math.cos(-midAngle * RADIAN);
                                    const y = cy + radius * Math.sin(-midAngle * RADIAN);
                                    
                                    return (
                                        <text x={x} y={y} fill={scores[index].color} textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" className="font-bold">
                                            {scores[index].name} ({value.toFixed(1)})
                                        </text>
                                    );
                                }}
                            >
                                {scores.map((entry) => <Cell key={`cell-${entry.name}`} fill={entry.color} stroke={entry.color} />)}
                            </Pie>
                             <Label 
                                value={`${overallBand.toFixed(1)}`}
                                position="center"
                                className="font-headline text-5xl font-bold fill-foreground"
                            />
                            <Label 
                                value="Overall Band"
                                position="center"
                                dy={30}
                                className="text-muted-foreground fill-muted-foreground"
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}
