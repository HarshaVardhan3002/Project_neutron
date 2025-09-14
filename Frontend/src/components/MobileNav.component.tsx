/**
 * @fileoverview The mobile navigation component, containing the hamburger menu and drawer (Sheet).
 * This is a client component because it manages the open/closed state of the mobile menu.
 */
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import Logo from '@/components/Logo.component';
import { Menu, X } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import { ThemeToggle } from './ThemeToggle.component';

/**
 * An array of navigation links to be displayed in the header.
 */
const navLinks = [
  { href: '/#about', label: 'About Us' },
  { href: '/#services', label: 'Our Services' },
  { href: '/lms/onboarding', label: 'AI Prep' },
  { href: '/#testimonials', label: 'Testimonials' },
  { href: '/blog', label: 'Blog' },
  { href: '/#carriers', label: 'Carriers' },
];

/**
 * Renders the mobile navigation menu.
 * @returns {JSX.Element} The mobile navigation component.
 */
export default function MobileNav() {
    const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <div className="md:hidden">
            <Sheet open={isMobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px] bg-background">
                <SheetTitle className="sr-only">Mobile Menu</SheetTitle>
                <div className="p-4 h-full flex flex-col">
                  <div className="flex justify-between items-center mb-8">
                    <Logo />
                    <div className="flex items-center">
                      <ThemeToggle />
                      <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(false)}>
                        <X className="h-6 w-6" />
                        <span className="sr-only">Close menu</span>
                      </Button>
                    </div>
                  </div>
                  <nav className="flex flex-col space-y-4">
                    {navLinks.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        className="text-lg font-medium text-foreground/80 transition-colors hover:animated-gradient-text"
                        onClick={() => setMobileMenuOpen(false)} // Close menu on link click
                      >
                        {link.label}
                      </Link>
                    ))}
                  </nav>
                   <Button asChild className="mt-auto">
                      <Link href="/auth" onClick={() => setMobileMenuOpen(false)}>Login / Sign Up</Link>
                   </Button>
                </div>
              </SheetContent>
            </Sheet>
        </div>
    );
}
