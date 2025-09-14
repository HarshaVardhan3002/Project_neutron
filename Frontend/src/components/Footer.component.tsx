/**
 * @fileoverview The global footer component for the application.
 * Displays the logo, copyright information, and social media links.
 */
'use client';

import { useState, useEffect } from 'react';
import Logo from '@/components/Logo.component';
import Link from 'next/link';
import { Github, Twitter, Linkedin } from 'lucide-react';

/**
 * Renders the global footer for the website.
 * @returns {JSX.Element} The footer component.
 */
export default function Footer() {
  // State to hold the current year. `null` initially to prevent hydration mismatch.
  const [year, setYear] = useState<number | null>(null);

  /**
   * `useEffect` hook to set the current year only on the client-side.
   * This is a crucial step to avoid hydration errors that can occur if the server-rendered year
   * (at build time) differs from the client-rendered year (at run time), for example,
   * if a user visits the site on New Year's Eve.
   */
  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);

  return (
    <footer className="bg-secondary border-t">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Instructor CTA Section */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl p-6 mb-8">
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-2">Join Us as a Tutor</h3>
            <p className="text-blue-100 mb-4">
              Share your expertise, inspire students, and earn competitive income teaching what you love.
            </p>
            <Link
              href="/auth/instructor-signup"
              className="inline-flex items-center px-6 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-colors"
            >
              Become an Instructor
            </Link>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <Logo />
          </div>
          <div className="text-sm text-muted-foreground mb-4 md:mb-0">
            {/* Display the year only after it has been set on the client */}
            &copy; {year} Project_Neutron. All rights reserved.
          </div>
          <div className="flex space-x-4">
            <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
              <Twitter className="h-5 w-5" />
            </Link>
            <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
              <Github className="h-5 w-5" />
            </Link>
            <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
              <Linkedin className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
