/**
 * @fileoverview A client-side component that animates its children into view on scroll.
 * It uses a custom `useInView` hook to detect when it enters the viewport.
 */
'use client';

import { useRef, type ReactNode } from 'react';
import { useInView } from '@/hooks/useInView.hook';
import { cn } from '@/lib/utils.helper';

type AnimatedDivProps = {
  /** The content to be animated. */
  children: ReactNode;
  /** Optional additional class names for the wrapper div. */
  className?: string;
  /** Optional delay in milliseconds before the animation starts. */
  delay?: number;
  /** If true (default), the animation will only run once. If false, it will re-run every time it enters the viewport. */
  triggerOnce?: boolean;
};

/**
 * A wrapper `div` that fades and slides its children up when it becomes visible in the viewport.
 * @param {AnimatedDivProps} props - The props for the component.
 * @returns {JSX.Element} The animated div element.
 */
export function AnimatedDiv({ children, className, delay, triggerOnce = true }: AnimatedDivProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { triggerOnce });

  return (
    <div
      ref={ref}
      className={cn(
        'opacity-0 transition-all duration-700 ease-out',
        // Apply animation classes only when the element is in view
        isInView ? 'opacity-100 translate-y-0' : 'translate-y-4',
        className
      )}
      style={{
        // Apply optional delay via inline style
        transitionDelay: `${delay ?? 0}ms`,
      }}
    >
      {children}
    </div>
  );
}
