/**
 * @fileoverview Layout for the admin section, providing a consistent sidebar and header.
 */
import Logo from '@/components/Logo.component';
import { ThemeToggle } from '@/components/ThemeToggle.component';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Bell, LayoutGrid, LogOut, Settings, Users, FileText, BarChart2, Menu, DollarSign } from 'lucide-react';
import Link from 'next/link';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

/**
 * Navigation items for the admin sidebar.
 */
const navItems = [
  { label: 'Dashboard', href: '/admin', icon: LayoutGrid },
  { label: 'Users', href: '/admin/users', icon: Users },
  { label: 'Blog Posts', href: '/admin/blog', icon: FileText },
  { label: 'Analytics', href: '/admin/analytics', icon: BarChart2 },
  { label: 'Payments', href: '/admin/payments', icon: DollarSign },
  { label: 'Settings', href: '/admin/settings', icon: Settings },
];

/**
 * Renders the content for the navigation sidebar, used for both desktop and mobile.
 * This component is self-contained to be reusable in the desktop sidebar and mobile sheet.
 * @returns {JSX.Element} The navigation content.
 */
const NavContent = () => (
  <>
    <div className="mb-8 flex justify-center">
        <Logo />
    </div>
    <nav className="flex flex-col gap-2">
      {navItems.map((item) => (
        <Button key={item.label} variant="ghost" className="justify-start gap-2" asChild>
          <Link href={item.href}>
            <item.icon className="h-4 w-4" />
            {item.label}
          </Link>
        </Button>
      ))}
    </nav>
    {/* Sign Out button is pushed to the bottom of the sidebar */}
    <div className="mt-auto">
        <Button variant="ghost" className="justify-start gap-2 w-full" asChild>
          <Link href="/">
            <LogOut className="h-4 w-4" />
            Sign Out
          </Link>
        </Button>
    </div>
  </>
);

/**
 * The main layout for the admin section of the application.
 * It includes a persistent sidebar for desktop and a sheet-based menu for mobile.
 * @param {object} props - The component props.
 * @param {React.ReactNode} props.children - The page content to be rendered within the layout.
 * @returns {JSX.Element} The admin layout component.
 */
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
      <div className="min-h-screen w-full flex bg-muted/20">
        {/* Desktop Sidebar */}
        <aside className="hidden w-64 flex-col border-r bg-background/80 p-4 backdrop-blur-xl sm:flex">
          <NavContent />
        </aside>

        <div className="flex flex-1 flex-col">
          {/* Header Bar */}
          <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background/80 px-4 backdrop-blur-xl sm:justify-end sm:px-6">
            {/* Mobile Navigation Trigger */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="sm:hidden">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Toggle navigation menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="flex flex-col p-4 bg-background/95 backdrop-blur-xl border-r">
                <NavContent />
              </SheetContent>
            </Sheet>
            
            {/* Header Action Icons */}
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" className="rounded-full">
                <Bell className="h-5 w-5" />
                <span className="sr-only">Toggle notifications</span>
              </Button>
              <ThemeToggle />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="https://placehold.co/100x100" alt="@admin" data-ai-hint="person portrait" />
                      <AvatarFallback>A</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Admin Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>Profile</DropdownMenuItem>
                  <DropdownMenuItem>Settings</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/">Sign Out</Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>

          {/* Main Content Area */}
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
            {children}
          </main>
        </div>
      </div>
  );
}
