/**
 * @fileoverview Payments and revenue page for the admin dashboard.
 * Provides a visual overview of financial metrics and a list of recent transactions.
 */
'use client';

import { PageHeader } from '@/components/PageHeader.component';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { AreaChart, CartesianGrid, XAxis, YAxis, Tooltip, Area } from 'recharts';
import { AnimatedDiv } from '@/components/AnimatedDiv';
import { DollarSign, ShoppingCart, Users, CreditCard } from 'lucide-react';
import type { Payment } from '@/lib/types';
import { cn } from '@/lib/utils.helper';

/**
 * Mock data for payments. In a real application, this would be fetched from a payment gateway API.
 */
const paymentsData: Payment[] = [
  { id: 'txn_1', user: { name: 'Arjun Verma', email: 'arjun@example.com' }, amount: 299, date: '2023-11-28', status: 'Completed', product: 'Human Tutoring (IELTS)' },
  { id: 'txn_2', user: { name: 'Priya Sharma', email: 'priya@example.com' }, amount: 149, date: '2023-11-27', status: 'Completed', product: 'Hybrid Tutoring (GRE)' },
  { id: 'txn_3', user: { name: 'Aditya Rao', email: 'aditya@example.com' }, amount: 49, date: '2023-11-26', status: 'Failed', product: 'AI Tutoring (TOEFL)' },
  { id: 'txn_4', user: { name: 'Sneha Gupta', email: 'sneha@example.com' }, amount: 399, date: '2023-11-25', status: 'Completed', product: 'Human Tutoring (GRE)' },
  { id: 'txn_5', user: { name: 'Rahul Nair', email: 'rahul@example.com' }, amount: 129, date: '2023-11-24', status: 'Pending', product: 'Hybrid Tutoring (PTE)' },
];

/**
 * Mock data for the revenue trend chart.
 */
const revenueChartData = [
  { date: '2023-11-01', revenue: 2340 },
  { date: '2023-11-05', revenue: 3120 },
  { date: '2023-11-10', revenue: 4530 },
  { date: '2023-11-15', revenue: 5100 },
  { date: '2023-11-20', revenue: 6890 },
  { date: '2023-11-25', revenue: 8210 },
  { date: '2023-11-30', revenue: 9500 },
];

/**
 * Chart configuration for the revenue chart.
 */
const chartConfig = {
  revenue: { label: 'Revenue', color: 'hsl(var(--chart-2))' },
};

/**
 * Renders the Payments page in the admin dashboard.
 * @returns {JSX.Element} The payments page component.
 */
export default function PaymentsPage() {
  return (
    <div className="space-y-8">
      <AnimatedDiv>
         <PageHeader
            title="Payments & Revenue"
            description="Monitor all transactions and track your financial performance."
          />
      </AnimatedDiv>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <AnimatedDiv delay={100}>
            <Card className="bg-background/60 backdrop-blur-lg border-white/10">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">$45,231.89</div>
                    <p className="text-xs text-muted-foreground">+20.1% from last month</p>
                </CardContent>
            </Card>
        </AnimatedDiv>
        <AnimatedDiv delay={200}>
            <Card className="bg-background/60 backdrop-blur-lg border-white/10">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Subscriptions</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">+2350</div>
                    <p className="text-xs text-muted-foreground">+180.1% from last month</p>
                </CardContent>
            </Card>
        </AnimatedDiv>
        <AnimatedDiv delay={300}>
            <Card className="bg-background/60 backdrop-blur-lg border-white/10">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Sales</CardTitle>
                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">+12,234</div>
                    <p className="text-xs text-muted-foreground">+19% from last month</p>
                </CardContent>
            </Card>
        </AnimatedDiv>
        <AnimatedDiv delay={400}>
            <Card className="bg-background/60 backdrop-blur-lg border-white/10">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Active Now</CardTitle>
                    <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">+573</div>
                    <p className="text-xs text-muted-foreground">+201 since last hour</p>
                </CardContent>
            </Card>
        </AnimatedDiv>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <AnimatedDiv className="lg:col-span-2" delay={300}>
            <Card className="bg-background/60 backdrop-blur-lg border-white/10 h-full">
                <CardHeader>
                    <CardTitle>Revenue Trend</CardTitle>
                    <CardDescription>Revenue overview for the last 30 days.</CardDescription>
                </CardHeader>
                <CardContent>
                     <ChartContainer config={chartConfig} className="h-[300px] w-full">
                        <AreaChart data={revenueChartData} margin={{ top: 5, right: 20, left: -10, bottom: 0 }}>
                            <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="hsl(var(--border) / 0.5)" />
                            <XAxis dataKey="date" tickLine={false} axisLine={false} fontSize={12} tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { day: 'numeric', month: 'short'})} />
                            <YAxis tickLine={false} axisLine={false} fontSize={12} tickFormatter={(value) => `$${value/1000}k`} />
                            <Tooltip content={<ChartTooltipContent />} />
                            <Area type="monotone" dataKey="revenue" stroke="hsl(var(--chart-2))" fill="hsl(var(--chart-2) / 0.3)" />
                        </AreaChart>
                    </ChartContainer>
                </CardContent>
            </Card>
        </AnimatedDiv>
        <AnimatedDiv className="lg:col-span-1" delay={400}>
             {/* This could be a list of top selling products or plans */}
            <Card className="bg-background/60 backdrop-blur-lg border-white/10 h-full">
                 <CardHeader>
                    <CardTitle>Top Products</CardTitle>
                    <CardDescription>Your best-selling services and plans.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                        <p className="font-medium">Human Tutoring (GRE)</p>
                        <p className="text-muted-foreground font-bold">$399</p>
                    </div>
                    <div className="flex justify-between items-center">
                        <p className="font-medium">Hybrid Tutoring (IELTS)</p>
                        <p className="text-muted-foreground font-bold">$149</p>
                    </div>
                     <div className="flex justify-between items-center">
                        <p className="font-medium">Human Tutoring (IELTS)</p>
                        <p className="text-muted-foreground font-bold">$299</p>
                    </div>
                </CardContent>
            </Card>
        </AnimatedDiv>
      </div>

       <AnimatedDiv delay={500}>
        <Card className="bg-background/60 backdrop-blur-lg border-white/10">
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>A list of the most recent payments.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paymentsData.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell>
                        <div className="font-medium">{payment.user.name}</div>
                        <div className="text-sm text-muted-foreground">{payment.user.email}</div>
                      </TableCell>
                      <TableCell>{payment.product}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={cn(
                            payment.status === 'Completed' && 'bg-green-500/10 text-green-700 border-green-500/20',
                            payment.status === 'Pending' && 'bg-yellow-500/10 text-yellow-700 border-yellow-500/20',
                            payment.status === 'Failed' && 'bg-red-500/10 text-red-700 border-red-500/20',
                        )}>
                          {payment.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{payment.date}</TableCell>
                      <TableCell className="text-right font-medium">${payment.amount.toFixed(2)}</TableCell>
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
