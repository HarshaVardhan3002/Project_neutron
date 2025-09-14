/**
 * @fileoverview A reusable header component for pages within the admin and user dashboards.
 * It provides a consistent title and description format for all sub-pages.
 */
import { cn } from '@/lib/utils.helper';

/**
 * Props for the PageHeader component.
 */
type PageHeaderProps = {
  /** The main title of the page. */
  title: string;
  /** A short description or subtitle for the page. */
  description: string;
  /** Optional additional class names to apply to the header element. */
  className?: string;
};

/**
 * Renders a consistent page header with a title and description.
 * @param {PageHeaderProps} props - The component props.
 * @returns {JSX.Element} The page header component.
 */
export function PageHeader({ title, description, className }: PageHeaderProps) {
  return (
    <header className={cn('mb-8', className)}>
      <h1 className="text-3xl md:text-4xl font-bold font-headline text-foreground">{title}</h1>
      <p className="mt-2 text-muted-foreground">{description}</p>
    </header>
  );
}
