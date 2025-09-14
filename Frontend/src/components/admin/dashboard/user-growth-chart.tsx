/**
 * @fileoverview Component for displaying the user growth chart on the admin dashboard.
 */
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

/**
 * Chart configuration for Recharts, mapping data keys to labels and CSS variables for colors.
 */
const chartConfig = {
  users: {
    label: "Users",
    color: "hsl(var(--primary))",
  },
};

/**
 * The shape of a single data point for the user growth chart.
 */
type UserGrowthData = {
  month: string;
  users: number;
};

/**
 * Props for the UserGrowthChart component.
 */
type UserGrowthChartProps = {
  data: UserGrowthData[];
};

/**
 * Renders a card containing a bar chart that visualizes user growth over time.
 * @param {UserGrowthChartProps} props - The props for the component.
 * @returns {JSX.Element} A card component with a Recharts bar chart.
 */
export function UserGrowthChart({ data }: UserGrowthChartProps) {
  return (
    <Card className="bg-background/60 backdrop-blur-lg border-white/10 h-full">
      <CardHeader>
        <CardTitle>User Growth</CardTitle>
        <CardDescription>New users in the last 6 months.</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <BarChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="hsl(var(--border) / 0.5)" />
            <XAxis
              dataKey="month"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              fontSize={12}
            />
            <YAxis tickLine={false} axisLine={false} fontSize={12} />
            <ChartTooltip cursor={{fill: 'hsl(var(--accent) / 0.1)'}} content={<ChartTooltipContent />} />
            <Bar dataKey="users" fill="var(--color-users)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
