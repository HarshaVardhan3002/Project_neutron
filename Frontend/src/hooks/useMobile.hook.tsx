/**
 * @fileoverview A custom React hook to detect if the user is on a mobile-sized screen.
 * It provides a simple boolean flag that updates automatically on viewport resize.
 */
import * as React from "react";

// The breakpoint (in pixels) for what is considered "mobile".
const MOBILE_BREAKPOINT = 768; // Corresponds to Tailwind's `md` breakpoint.

/**
 * A custom hook that returns true if the current screen width is less than the mobile breakpoint.
 * It uses `window.matchMedia` for efficient, event-based detection of viewport changes.
 * @returns {boolean} `true` if the viewport is mobile-sized, otherwise `false`. Returns `undefined` during server-side rendering.
 */
export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined);

  React.useEffect(() => {
    // Create a media query list object that targets screen widths below the breakpoint.
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    
    /**
     * Callback function to update the state when the media query match changes.
     */
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };

    // Add the event listener to respond to changes in viewport size.
    mql.addEventListener("change", onChange);
    
    // Set the initial state when the component mounts.
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    
    // Cleanup function to remove the event listener on component unmount.
    return () => mql.removeEventListener("change", onChange);
  }, []);

  return !!isMobile;
}
