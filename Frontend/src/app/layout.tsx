/**
 * @fileoverview The root layout for the entire application.
 * It sets up the HTML structure, global fonts, theme provider, and toast notifications.
 */
import type { Metadata } from 'next';
import './globals.css';
import { Toaster as OldToaster } from "@/components/ui/toaster";
import { ThemeProvider } from '@/components/ThemeProvider.component';
import { AuthProvider } from '@/contexts/AuthContext.context';
import { Roboto, Montserrat } from 'next/font/google';
import { Toaster } from '@/components/ui/sonner';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';

/**
 * Configure the Roboto font for body text.
 * Using CSS variables for fonts allows for easy customization and switching.
 */
const roboto = Roboto({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-body',
  weight: ['400', '500', '700'],
});

/**
 * Configure the Montserrat font for headlines.
 */
const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['600', '700'],
  variable: '--font-headline',
});

/**
 * Global metadata for the application, used for SEO and browser tab information.
 */
export const metadata: Metadata = {
  title: 'Project_Neutron - Advanced Learning Management System',
  description: 'Empowering education through intelligent learning management.',
};

/**
 * The root layout component that wraps all pages.
 * @param {object} props - The component props.
 * @param {React.ReactNode} props.children - The content of the pages to be rendered.
 * @returns {JSX.Element} The root layout element.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${roboto.variable} ${montserrat.variable} scroll-smooth`} suppressHydrationWarning>
      <body className="font-body antialiased">
        <ErrorBoundary level="global">
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <AuthProvider>
              {children}
              {/* Toaster components for displaying notifications. Sonner is used for rich toasts. */}
              <OldToaster />
              <Toaster richColors />
            </AuthProvider>
          </ThemeProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
