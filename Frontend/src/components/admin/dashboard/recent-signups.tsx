/**
 * @fileoverview Component for displaying the recent signups table on the admin dashboard.
 */
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import Link from 'next/link';
import { ArrowRight } from "lucide-react";

/**
 * The shape of a single signup object.
 */
type Signup = {
  name: string;
  email: string;
  date: string;
};

/**
 * Props for the RecentSignups component.
 */
type RecentSignupsProps = {
  signups: Signup[];
};

/**
 * Renders a card with a table of recent user signups.
 * @param {RecentSignupsProps} props - The props for the component.
 * @returns {JSX.Element} A card component displaying recent signups.
 */
export function RecentSignups({ signups }: RecentSignupsProps) {
  return (
    <Card className="bg-background/60 backdrop-blur-lg border-white/10 h-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Recent Sign-ups</CardTitle>
          <CardDescription>The latest users to join.</CardDescription>
        </div>
        <Button asChild variant="ghost" size="sm">
          <Link href="/admin/users">
            View all <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead className="text-right">Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {signups.map((user) => (
                <TableRow key={user.email}>
                  <TableCell>
                    <div className="font-medium">{user.name}</div>
                    <div className="text-sm text-muted-foreground hidden sm:block">{user.email}</div>
                  </TableCell>
                  <TableCell className="text-right">{user.date}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
