/**
 * @fileoverview The global header component for the application.
 * This is now a client component that uses authentication context.
 */
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import Logo from '@/components/Logo.component';
import { ThemeToggle } from './ThemeToggle.component';
import HeaderClientWrapper from './HeaderClientWrapper.component';
import MobileNav from './MobileNav.component';
import { useAuth } from '@/contexts/AuthContext.context';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { User, Settings, LogOut } from 'lucide-react';

/**
 * An array of navigation links to be displayed in the header.
 */
const navLinks = [
  { href: '/#about', label: 'About' },
  { href: '/#features', label: 'Features' },
  { href: '/lms/onboarding', label: 'Get Started' },
  { href: '/#testimonials', label: 'Testimonials' },
  { href: '/blog', label: 'Blog' },
  { href: '/lms/marketplace', label: 'Courses' },
];

/**
 * Renders the global header for the website.
 * @returns {JSX.Element} The header component.
 */
export default function Header() {
  const { user, profile, signOut, loading } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  return (
    <HeaderClientWrapper>
      {/* Fading frosted gradient overlay to ensure logo visibility against any background. */}
      <div className="absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-white/20 to-transparent pointer-events-none dark:from-black/20" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="flex h-20 items-center justify-between">
          <Logo />
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-foreground/80 transition-colors hover:animated-gradient-text"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          {/* Desktop Action Buttons */}
          <div className="hidden md:flex items-center space-x-2">
            {!loading && (
              <>
                {user && profile ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={profile.avatar_s3_key || ''} alt={profile.display_name || user?.email || ''} />
                          <AvatarFallback>
                            {profile.display_name ? profile.display_name.charAt(0).toUpperCase() : (user?.email?.charAt(0).toUpperCase() || 'U')}
                          </AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end" forceMount>
                      <DropdownMenuLabel className="font-normal">
                        <div className="flex flex-col space-y-1">
                          <p className="text-sm font-medium leading-none">
                            {profile.display_name || 'User'}
                          </p>
                          <p className="text-xs leading-none text-muted-foreground">
                            {user?.email}
                          </p>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href="/lms/profile" className="flex items-center">
                          <User className="mr-2 h-4 w-4" />
                          <span>Profile</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/lms/dashboard" className="flex items-center">
                          <Settings className="mr-2 h-4 w-4" />
                          <span>Dashboard</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/lms/schedule" className="flex items-center">
                          <Settings className="mr-2 h-4 w-4" />
                          <span>My Schedule</span>
                        </Link>
                      </DropdownMenuItem>
                      {profile.role === 'admin' && (
                        <DropdownMenuItem asChild>
                          <Link href="/admin" className="flex items-center">
                            <Settings className="mr-2 h-4 w-4" />
                            <span>Admin Panel</span>
                          </Link>
                        </DropdownMenuItem>
                      )}
                      {profile.role === 'instructor' && (
                        <DropdownMenuItem asChild>
                          <Link href="/instructor/dashboard" className="flex items-center">
                            <Settings className="mr-2 h-4 w-4" />
                            <span>Instructor Dashboard</span>
                          </Link>
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleSignOut} className="flex items-center">
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Sign Out</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <>
                    <Button variant="outline" asChild>
                      <Link href="/auth/signin">Sign In</Link>
                    </Button>
                    <Button asChild>
                      <Link href="/auth/signup">Sign Up</Link>
                    </Button>
                  </>
                )}
              </>
            )}
            <ThemeToggle />
          </div>
          {/* Mobile Navigation */}
          <MobileNav />
        </div>
      </div>
    </HeaderClientWrapper>
  );
}
