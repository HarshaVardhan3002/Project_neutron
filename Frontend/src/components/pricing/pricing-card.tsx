/**
 * @fileoverview A reusable card component for displaying pricing tiers.
 * It supports different styles for regular and "popular" tiers.
 */
'use client';

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils.helper";
import Link from 'next/link';

/**
 * Props for the PricingCard component.
 */
export type PricingCardProps = {
  /** The title of the pricing tier (e.g., "AI Tutoring"). */
  title: string;
  /** The monthly price of the tier. */
  price: number;
  /** The suffix for the price (e.g., "/month" or "/one-time"). */
  priceSuffix?: string;
  /** The icon to display at the top of the card. */
  icon: React.ReactNode;
  /** An array of feature strings to list. */
  features: string[];
  /** If true, the card will be highlighted as the "most popular" option. */
  popular?: boolean;
  /** The URL the action button should link to. If provided, the button becomes a link. */
  href?: string;
  /** A callback function to execute when the action button is clicked. */
  onActionClick?: () => void;
  /** The text to display on the action button. */
  actionText?: string;
};

/**
 * Renders a single pricing card with features and a call-to-action button.
 * @param {PricingCardProps} props - The component props.
 * @returns {JSX.Element} The pricing card component.
 */
export function PricingCard({
  title,
  price,
  priceSuffix = "/month",
  icon,
  features,
  popular = false,
  href,
  onActionClick,
  actionText = "Get Started",
}: PricingCardProps) {
  const CardAction = href ? Link : 'div';

  return (
    <Card className={cn(
      "flex flex-col h-full transition-all duration-300 bg-background/50 backdrop-blur-xl border transform hover:-translate-y-2",
      popular
        ? 'border-primary shadow-2xl shadow-primary/20'
        : 'hover:shadow-2xl hover:shadow-primary/10'
    )}>
      {popular && (
        <div className="text-sm font-bold text-center py-2 rounded-t-lg text-primary-foreground animated-gradient-text bg-clip-border [background-image:none] bg-primary">
          MOST POPULAR
        </div>
      )}
      <CardHeader className="items-center text-center">
        {icon}
        <CardTitle className="font-headline text-2xl">{title}</CardTitle>
        <div className="flex items-baseline gap-1">
          <span className="text-4xl font-bold">${price}</span>
          <span className="text-muted-foreground">{priceSuffix}</span>
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <ul className="space-y-4 text-sm">
          {features.map(feature => (
            <li key={feature} className="flex items-center gap-3">
              <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
              <span className="text-muted-foreground">{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter>
        <Button asChild={!!href} className="w-full" size="lg" variant={popular ? 'default' : 'outline'} onClick={onActionClick}>
          <CardAction href={href || '#'}>
            {actionText} {href && <ArrowRight className="ml-2 h-4 w-4" />}
          </CardAction>
        </Button>
      </CardFooter>
    </Card>
  );
}
