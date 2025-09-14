/**
 * @fileoverview A skeleton loader for sections.
 * Provides a consistent loading placeholder for dynamically loaded sections.
 */
import { Skeleton } from '@/components/ui/skeleton';

export default function SectionLoader() {
  return (
    <section className="w-full py-12 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
                <Skeleton className="h-10 w-1/2" />
                <Skeleton className="h-6 w-3/4" />
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 pt-8">
                    <div className="flex flex-col gap-2">
                        <Skeleton className="h-48 w-full" />
                        <Skeleton className="h-6 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                    </div>
                    <div className="flex flex-col gap-2">
                        <Skeleton className="h-48 w-full" />
                        <Skeleton className="h-6 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                    </div>
                    <div className="flex flex-col gap-2">
                        <Skeleton className="h-48 w-full" />
                        <Skeleton className="h-6 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                    </div>
                </div>
            </div>
        </div>
    </section>
  );
}
