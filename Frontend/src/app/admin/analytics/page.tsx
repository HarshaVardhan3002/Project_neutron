/**
 * @fileoverview Analytics page for the admin dashboard.
 * Displays detailed charts and data visualizations for website metrics.
 */
'use client';

import { PageHeader } from '@/components/PageHeader.component';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BarChart, AreaChart, PieChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Bar, Area, Pie, Cell } from 'recharts';
import { AnimatedDiv } from '@/components/AnimatedDiv';

/**
 * Placeholder data for analytics. In a real app, this would be fetched from a data source.
 */
const analyticsData = {
  trafficOverTime: [
    { name: 'Jan', uv: 4000, pv: 2400 },
    { name: 'Feb', uv: 3000, pv: 1398 },
    { name: 'Mar', uv: 2000, pv: 9800 },
    { name: 'Apr', uv: 2780, pv: 3908 },
    { name: 'May', uv: 1890, pv: 4800 },
    { name: 'Jun', uv: 2390, pv: 3800 },
  ],
  trafficSources: [
    { name: 'Google', value: 400, color: 'hsl(var(--chart-1))' },
    { name: 'Facebook', value: 300, color: 'hsl(var(--chart-2))' },
    { name: 'Direct', value: 200, color: 'hsl(var(--chart-3))' },
    { name: 'Other', value: 100, color: 'hsl(var(--chart-4))' },
  ],
  userDemographics: [
    { name: 'USA', value: 250, fill: 'hsl(var(--chart-1))' },
    { name: 'India', value: 450, fill: 'hsl(var(--chart-2))' },
    { name: 'UK', value: 150, fill: 'hsl(var(--chart-3))' },
    { name: 'Canada', value: 100, fill: 'hsl(var(--chart-4))' },
    { name: 'Other', value: 50, fill: 'hsl(var(--chart-5))' },
  ],
  topPages: [
    { path: '/services/visa-processing', views: 12045 },
    { path: '/blog', views: 9876 },
    { path: '/services/test-preparation', views: 7654 },
    { path: '/', views: 5432 },
    { path: '/auth', views: 2345 },
  ],
};

/**
 * Chart configuration for Recharts, mapping data keys to labels and colors.
 */
const chartConfig = {
  views: { label: "Page Views", color: "hsl(var(--primary))" },
  users: { label: "Users", color: "hsl(var(--accent))" },
};

/**
 * Renders the Analytics page in the admin dashboard.
 * @returns {JSX.Element} The analytics page component.
 */
export default function AnalyticsPage() {
  return (
    <div className="space-y-8">
      <AnimatedDiv>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <PageHeader
            title="Analytics"
            description="Deep dive into your website's performance and user engagement."
          />
          <Select defaultValue="30">
            <SelectTrigger className="w-full sm:w-[180px] bg-background/60 backdrop-blur-lg border-white/10">
              <SelectValue placeholder="Date Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 Days</SelectItem>
              <SelectItem value="30">Last 30 Days</SelectItem>
              <SelectItem value="90">Last 90 Days</SelectItem>
              <SelectItem value="365">Last Year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </AnimatedDiv>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <AnimatedDiv delay={100}>
            <Card className="bg-background/60 backdrop-blur-lg border-white/10">
            <CardHeader>
              <CardTitle>Traffic Over Time</CardTitle>
              <CardDescription>Unique visitors (UV) vs. Page views (PV)</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[250px] w-full">
                <AreaChart data={analyticsData.trafficOverTime} margin={{ top: 5, right: 20, left: -10, bottom: 0 }}>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="hsl(var(--border) / 0.5)" />
                  <XAxis dataKey="name" tickLine={false} axisLine={false} fontSize={12} />
                  <YAxis tickLine={false} axisLine={false} fontSize={12} />
                  <Tooltip content={<ChartTooltipContent />} />
                  <Area type="monotone" dataKey="uv" stackId="1" stroke="hsl(var(--chart-2))" fill="hsl(var(--chart-2) / 0.3)" />
                  <Area type="monotone" dataKey="pv" stackId="1" stroke="hsl(var(--chart-1))" fill="hsl(var(--chart-1) / 0.3)" />
                </AreaChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </AnimatedDiv>

        <AnimatedDiv delay={200}>
            <Card className="bg-background/60 backdrop-blur-lg border-white/10">
            <CardHeader>
              <CardTitle>Traffic Sources</CardTitle>
              <CardDescription>How users are finding your website.</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={{}} className="h-[250px] w-full">
                <BarChart data={analyticsData.trafficSources} layout="vertical" margin={{ top: 0, right: 20, left: 20, bottom: 0 }}>
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" tickLine={false} axisLine={false} width={60} />
                    <Tooltip cursor={{fill: 'hsl(var(--accent) / 0.1)'}} content={<ChartTooltipContent />} />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                      {analyticsData.trafficSources.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </AnimatedDiv>

        <AnimatedDiv delay={300}>
            <Card className="bg-background/60 backdrop-blur-lg border-white/10">
            <CardHeader>
              <CardTitle>User Demographics</CardTitle>
              <CardDescription>Distribution of users by country.</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={{}} className="h-[250px] w-full">
                <PieChart>
                  <Tooltip content={<ChartTooltipContent />} />
                  <Pie data={analyticsData.userDemographics} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                     {analyticsData.userDemographics.map((entry) => (
                      <Cell key={entry.name} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Legend />
                </PieChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </AnimatedDiv>
      </div>

      <AnimatedDiv delay={400}>
        <Card className="bg-background/60 backdrop-blur-lg border-white/10">
          <CardHeader>
            <CardTitle>Top Pages</CardTitle>
            <CardDescription>Your most viewed pages in the selected period.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[70%]">Page Path</TableHead>
                    <TableHead className="text-right">Page Views</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {analyticsData.topPages.map((page) => (
                    <TableRow key={page.path}>
                      <TableCell className="font-medium">{page.path}</TableCell>
                      <TableCell className="text-right">{page.views.toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </AnimatedDiv>
    </div>
  );
}
