/**
 * @fileoverview Professional sidebar components for the LMS section.
 * Includes the main desktop sidebar and a reusable content component for mobile sheets.
 */
'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils.helper';
import { LayoutGrid, BookOpen, ShoppingCart, User, Settings, LogOut, FileText } from 'lucide-react';
import Logo from '@/components/Logo.component';

const navItems = [
  { label: 'Dashboard', href: '/lms/dashboard', icon: <LayoutGrid className="h-5 w-5" /> },
  { label: 'My Course', href: '/lms/module', icon: <BookOpen className="h-5 w-5" /> },
  { label: 'Mock Tests', href: '/lms/mock-tests', icon: <FileText className="h-5 w-5" /> },
  { label: 'Tutor Marketplace', href: '/lms/marketplace', icon: <ShoppingCart className="h-5 w-5" /> },
  { label: 'My Profile', href: '/lms/profile', icon: <User className="h-5 w-5" /> },
];

/**
 * Reusable navigation content for the LMS sidebar and mobile sheet.
 * @returns {JSX.Element} The navigation content.
 */
export const LmsNavContent = () => {
    const pathname = usePathname();
    return (
        <>
            <div className="mb-8 px-4">
                 <Logo />
            </div>
            <nav className="flex flex-col gap-2 flex-grow px-2">
                {navItems.map((item) => (
                    <Button
                        key={item.label}
                        variant={pathname.startsWith(item.href) && item.href !== '#' ? 'secondary' : 'ghost'}
                        className="justify-start gap-3 h-10"
                        asChild
                    >
                        <Link href={item.href}>
                           {item.icon}
                           <span className="text-sm font-semibold">{item.label}</span>
                        </Link>
                    </Button>
                ))}
            </nav>
            <div className="mt-auto p-2">
                <Button variant="ghost" className="justify-start gap-3 w-full" asChild>
                    <Link href="/lms/profile">
                        <Settings className="h-5 w-5" />
                         <span className="text-sm font-semibold">Settings</span>
                    </Link>
                </Button>
                 <Button variant="ghost" className="justify-start gap-3 w-full mt-1" asChild>
                    <Link href="/">
                        <LogOut className="h-5 w-5" />
                         <span className="text-sm font-semibold">Sign Out</span>
                    </Link>
                </Button>
            </div>
        </>
    );
};

/**
 * Renders the professional LMS sidebar for desktop views.
 * @returns {JSX.Element} The sidebar component.
 */
export default function LmsSidebar() {
    return (
        <aside className="hidden md:flex flex-col w-64 border-r bg-background/80 backdrop-blur-xl pt-4 fixed h-full">
            <LmsNavContent />
        </aside>
    );
}
