/**
 * @fileoverview Error boundary for the admin section.
 * Catches errors within the admin layout and provides a recovery option.
 */
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TriangleAlert } from 'lucide-react';
import { useEffect } from 'react';

/**
 * A Next.js Error component that acts as a catch-all for errors within its boundary.
 * @param {object} props - The component props.
 * @param {Error & { digest?: string }} props.error - The error that was thrown.
 * @param {() => void} props.reset - A function to attempt to re-render the segment.
 * @returns {JSX.Element} An error message component with a recovery button.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // In a real application, you would log the error to a reporting service like Sentry or LogRocket.
    console.error(error);
  }, [error]);

  return (
    <div className="flex items-center justify-center h-full">
        <Card className="max-w-md w-full text-center bg-background/60 backdrop-blur-lg border-destructive/50">
            <CardHeader>
                <div className="mx-auto bg-destructive/10 p-3 rounded-full w-fit">
                    <TriangleAlert className="h-8 w-8 text-destructive" />
                </div>
                <CardTitle className="mt-4">Something went wrong!</CardTitle>
                <CardDescription>
                    An unexpected error occurred in the admin panel. You can try to recover by clicking the button below.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="bg-destructive/10 text-destructive text-xs font-mono p-4 rounded-md overflow-x-auto">
                    <p>Error: {error.message}</p>
                </div>
                <Button onClick={() => reset()}>
                    Try again
                </Button>
            </CardContent>
        </Card>
    </div>
  );
}
