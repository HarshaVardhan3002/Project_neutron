/**
 * @fileoverview A custom React hook that detects when an element is visible in the viewport.
 * It uses the Intersection Observer API for efficient observation.
 */
'use client';

import { useState, useEffect, type RefObject } from 'react';

/**
 * Options for the useInView hook, extending the standard IntersectionObserverInit.
 */
interface UseInViewOptions extends IntersectionObserverInit {
  /** If true, the observer will stop watching after the element becomes visible for the first time. */
  triggerOnce?: boolean;
}

/**
 * A custom hook to track whether a component is in the viewport.
 * @param {RefObject<Element>} ref - A React ref attached to the element to observe.
 * @param {UseInViewOptions} [options] - Configuration for the Intersection Observer.
 * @returns {boolean} `true` if the element is in the viewport, otherwise `false`.
 */
export function useInView(
  ref: RefObject<Element>,
  { threshold = 0.1, root = null, rootMargin = '0px', triggerOnce = true }: UseInViewOptions = {}
): boolean {
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    // Ensure this code runs only on the client-side where the Intersection Observer API is available.
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      return;
    }

    const element = ref.current;
    if (!element) return;

    // Create the observer with a callback that updates the state.
    const observer = new IntersectionObserver(
      ([entry]) => {
        // If the element is intersecting (visible)
        if (entry.isIntersecting) {
          setIsInView(true);
          // If we should only trigger once, disconnect the observer after the first intersection.
          if (triggerOnce) {
            observer.disconnect();
          }
        } else if (!triggerOnce) {
          // If we can trigger multiple times, set state to false when it goes out of view.
          setIsInView(false);
        }
      },
      { threshold, root, rootMargin }
    );

    // Start observing the element.
    observer.observe(element);

    // Cleanup function to disconnect the observer when the component unmounts or dependencies change.
    return () => observer.disconnect();
  }, [ref, threshold, root, rootMargin, triggerOnce]);

  return isInView;
}
