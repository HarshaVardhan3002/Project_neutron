/**
 * @fileoverview A component that displays the company logo and links to the homepage.
 */
import Link from 'next/link';
import { cn } from '@/lib/utils.helper';

/**
 * Props for the Logo component.
 */
type LogoProps = {
  /** Optional additional class names for the link wrapper. */
  className?: string;
};

/**
 * Renders the Project_Neutron logo as a link to the homepage.
 * Includes a throbbing animation on hover for a nice interactive touch.
 * @param {LogoProps} props - The component props.
 * @returns {JSX.Element} The logo component.
 */
export default function Logo({ className }: LogoProps) {
  return (
    <Link href="/#home" className={cn("relative flex items-center justify-center -ml-4 sm:-ml-8 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-lg transition-all hover:animate-throb", className)}>
      <div className="flex items-center space-x-2">
        <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/60 rounded-lg flex items-center justify-center">
          <span className="text-primary-foreground font-bold text-lg">N</span>
        </div>
        <span className="font-headline text-2xl font-bold animated-gradient-text">
          Project_Neutron
        </span>
      </div>
    </Link>
  );
}
