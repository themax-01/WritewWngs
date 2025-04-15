import { useEffect } from 'react';
import Navbar from '@/components/layout/navbar';
import Footer from '@/components/layout/footer';
import MobileNav from '@/components/layout/mobile-nav';
import HeroSection from '@/components/home/hero-section';
import WeeklyChallenge from '@/components/home/weekly-challenge';
import FeaturedWritings from '@/components/home/featured-writings';
import PopularAuthors from '@/components/home/popular-authors';
import Categories from '@/components/home/categories';
import DownloadApp from '@/components/home/download-app';
import { useQuery } from '@tanstack/react-query';

export default function HomePage() {
  // Pre-fetch featured writings for better UX
  useQuery({
    queryKey: ['/api/writings', { featured: true }],
  });

  // Set page title
  useEffect(() => {
    document.title = 'Pencraft - Writing Platform';
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="container mx-auto px-4 py-8 flex-grow">
        <HeroSection />
        <WeeklyChallenge />
        <FeaturedWritings />
        <PopularAuthors />
        <Categories />
        <DownloadApp />
      </main>
      <Footer />
      <MobileNav />
    </div>
  );
}
