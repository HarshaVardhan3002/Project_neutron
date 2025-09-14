/**
 * @fileoverview A client-side component that creates a background wave effect
 * which animates based on the user's scroll progress through the page.
 */
'use client';

import { useEffect } from 'react';

/**
 * Renders a decorative background with a wave effect that reacts to scroll progress.
 * It uses a CSS variable `--scroll-progress` which is updated via a scroll event listener.
 * This is a purely aesthetic component to enhance the visual experience.
 * @returns {JSX.Element} The background component.
 */
export default function ScrollProgressBackground() {
  useEffect(() => {
    /**
     * Handles the scroll event to calculate and update the scroll progress CSS variable.
     */
    const handleScroll = () => {
      // Calculate the total scrollable height of the page.
      const totalHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      
      // Avoid division by zero if the content is not scrollable.
      if (totalHeight <= 0) {
        document.body.style.setProperty('--scroll-progress', '100%');
        return;
      }
      
      // Calculate the scroll percentage.
      const scrollPercentage = (window.scrollY / totalHeight) * 100;
      
      // Set the CSS custom property on the body element. This is then used in globals.css.
      document.body.style.setProperty('--scroll-progress', `${scrollPercentage}%`);
    };

    // Add the event listener and call it once to set the initial value.
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    // Cleanup function to remove the event listener and the CSS property on component unmount.
    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.body.style.removeProperty('--scroll-progress');
    };
  }, []);

  return null; // This component does not render any visible elements itself.
}
