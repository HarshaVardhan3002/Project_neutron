/**
 * @fileoverview The main landing page of the application.
 * It composes various sections to create the homepage, using dynamic imports for performance.
 */
import dynamic from 'next/dynamic';
import Header from '@/components/Header.component';
import Footer from '@/components/Footer.component';
import HeroSection from '@/components/sections/hero';
import FloatingSidebar from '@/components/FloatingSidebar.component';
import ScrollProgressBackground from '@/components/ScrollProgressBackground.component';

import SectionLoader from '@/components/SectionLoader.component';

// Dynamically import sections that are below the fold to improve initial page load time.
// These components will only be loaded when they are about to be scrolled into view.
const AboutUsSection = dynamic(() => import('@/components/sections/about'), { loading: () => <SectionLoader /> });
const FeaturesSection = dynamic(() => import('@/components/sections/services'), { loading: () => <SectionLoader /> });
const TestimonialsSection = dynamic(() => import('@/components/sections/testimonials'), { loading: () => <SectionLoader /> });
const BlogSection = dynamic(() => import('@/components/sections/blog'), { loading: () => <SectionLoader /> });
const CarriersSection = dynamic(() => import('@/components/sections/carriers'), { loading: () => <SectionLoader /> });


/**
 * Renders the Home page by assembling all the main sections.
 * @returns {JSX.Element} The Home page component.
 */
export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <ScrollProgressBackground />
      <Header />
      <FloatingSidebar />
      <main className="flex-1">
        <HeroSection />
        <AboutUsSection />
        <FeaturesSection />
        <TestimonialsSection />
        <BlogSection />
        <CarriersSection />
      </main>
      <Footer />
    </div>
  );
}
