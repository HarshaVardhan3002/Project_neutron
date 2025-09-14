/**
 * @fileoverview A floating sidebar component with social media links and contact options.
 * It is expandable and collapsible for a clean user experience.
 */
'use client';

import type { SVGProps } from 'react';
import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { X, Twitter, Phone, Contact } from 'lucide-react';
import { cn } from '@/lib/utils.helper';

/**
 * SVG icon for Instagram.
 * @param {SVGProps<SVGSVGElement>} props - Standard SVG properties.
 * @returns {JSX.Element} The Instagram icon component.
 */
const InstagramIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"></line>
  </svg>
);

/**
 * SVG icon for Facebook.
 * @param {SVGProps<SVGSVGElement>} props - Standard SVG properties.
 * @returns {JSX.Element} The Facebook icon component.
 */
const FacebookIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
  </svg>
);

/**
 * SVG icon for WhatsApp.
 * @param {SVGProps<SVGSVGElement>} props - Standard SVG properties.
 * @returns {JSX.Element} The WhatsApp icon component.
 */
const WhatsAppIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
   <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
   <path d="M3 21l1.65 -3.8a9 9 0 1 1 3.4 2.9l-5.05 .9"></path>
   <path d="M9 10a.5 .5 0 0 0 1 0v-1a.5 .5 0 0 0 -1 0v1a5 5 0 0 0 5 5h1a.5 .5 0 0 0 0 -1h-1a4 4 0 0 1 -4 -4v-1a.5 .5 0 0 0 -1 0v1"></path>
  </svg>
);

/**
 * An array of social links with their respective icons, labels, and glow animation classes.
 */
const socialLinks = [
  { href: "https://wa.me/1234567890", icon: <WhatsAppIcon />, label: "WhatsApp", glowClass: 'animate-slow-green-blink' },
  { href: "https://instagram.com", icon: <InstagramIcon />, label: "Instagram", glowClass: 'animate-instagram-glow' },
  { href: "https://facebook.com", icon: <FacebookIcon />, label: "Facebook", glowClass: 'animate-facebook-glow' },
  { href: "https://x.com", icon: <Twitter />, label: "X / Twitter", glowClass: 'animate-twitter-glow' },
  { href: "tel:+1234567890", icon: <Phone />, label: "Call Us", glowClass: 'animate-call-glow' },
];

/**
 * Renders a floating sidebar with social media and contact links.
 * The sidebar can be expanded or collapsed by the user for a minimal footprint.
 * @returns {JSX.Element} The floating sidebar component.
 */
export default function FloatingSidebar() {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div
      className={cn(
        'fixed top-1/2 right-2 sm:right-4 -translate-y-1/2 z-50 p-2 flex items-center rounded-2xl bg-background/50 backdrop-blur-xl border border-border shadow-2xl transition-all duration-300 ease-in-out',
        // Conditionally apply classes based on the expanded state
        isExpanded ? 'flex-col h-auto gap-4' : 'flex-row w-auto'
      )}
    >
      <Button
        variant="ghost"
        size="icon"
        className="rounded-full h-10 w-10 hover:bg-primary/20 flex-shrink-0"
        onClick={() => setIsExpanded(!isExpanded)}
        aria-expanded={isExpanded}
      >
        {isExpanded ? <X className="h-5 w-5" /> : <Contact className="h-5 w-5" />}
        <span className="sr-only">{isExpanded ? 'Close' : 'Show'} social links</span>
      </Button>

      {/* Render social links only when the sidebar is expanded */}
      {isExpanded && (
        <div className="flex flex-col gap-4 items-center">
          {socialLinks.map((link, index) => (
            <Link
              key={index}
              href={link.href}
              aria-label={link.label}
              target={link.href.startsWith('http') || link.href.startsWith('tel') ? '_blank' : '_self'}
              rel="noopener noreferrer"
              className={cn(
                "transition-all duration-300 hover:scale-110 text-foreground",
                link.glowClass // Apply the specific glow animation class
              )}
            >
              {React.cloneElement(link.icon, { className: 'h-6 w-6' })}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
