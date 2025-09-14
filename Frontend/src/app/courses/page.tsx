'use client';

/**
 * @fileoverview Main courses page - redirects to marketplace
 */
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function CoursesPage() {
    const router = useRouter();

    useEffect(() => {
        router.replace('/lms/marketplace');
    }, [router]);

    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <Loader2 className="h-8 w-8 animate-spin" />
                <p className="text-muted-foreground">Redirecting to courses...</p>
            </div>
        </div>
    );
}