/**
 * @fileoverview A client-side wrapper for the header.
 * It handles the scroll detection to apply styles to the header when the user scrolls.
 * This isolates client-side logic from the main header component.
 */
'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils.helper';

/**
 * Props for the HeaderClientWrapper component.
 */
type HeaderClientWrapperProps = {
  /** The content to be rendered inside the wrapper. */
  children: React.ReactNode;
};

/**
 * A wrapper that applies a shadow to the header on scroll.
 * @param {HeaderClientWrapperProps} props - The component props.
 * @returns {JSX.Element} The wrapper component.
 */
export default function HeaderClientWrapper({ children }: HeaderClientWrapperProps) {
  const [scrolled, setScrolled] = useState(false);

  /**
   * Effect to detect if the user has scrolled down the page.
   */
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    // Cleanup the event listener on component unmount
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={cn(
        'sticky top-0 z-50 transition-shadow duration-300 ease-in-out',
        'backdrop-blur-lg', // Always apply frosted glass effect
        scrolled ? 'shadow-md' : 'shadow-none' // Add shadow only when scrolled
      )}
    >
      {children}
    </header>
  );
}
