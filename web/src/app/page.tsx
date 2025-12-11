
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Search, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CategoryNavigation } from '@/components/category-navigation';
import { FeaturedCalculators } from '@/components/featured-calculators';
import { AdvancedCalculator } from '@/components/advanced-calculator';
import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';

const AppleIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 384 512"
    fill="currentColor"
    height="1em"
    width="1em"
    {...props}
  >
    <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C39.2 141.1 0 183.2 0 241.2c0 70.7 59.4 124.3 123.7 124.3 25.2 0 49-17.5 64.9-17.5 16.5 0 40.7 17.5 68.1 17.5 24.3 0 57.6-10.9 78.4-31.5-22.1-17.5-40.7-49-40.7-82.3zM250.2 92.5C275.9 67.8 293.5 39.2 293.5 0 231.8 1.1 176.2 32.7 150.8 58.3c-27.1 27.1-51.4 69.4-51.4 117.3 64.9-1.1 112.5-49.4 112.5-83.1z" />
  </svg>
);

const AndroidIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    height="1em"
    width="1em"
    {...props}
  >
    <path d="M17.32 5H6.68a.33.33 0 00-.32.32.33.33 0 00.32.32h10.64a.33.33 0 00.32-.32.33.33 0 00-.32-.32zm-2.45-1.92L14.12 2a.32.32 0 00-.45 0l-.75 1.08a9.46 9.46 0 00-4.14 0L7.02 2a.32.32 0 00-.45 0l-.75 1.08A7.77 7.77 0 003 8.76v8.48a3.36 3.36 0 003.34 3.34h11.32A3.36 3.36 0 0021 17.24V8.76a7.77 7.77 0 00-2.87-5.68zM7.85 17.3a.85.85 0 11.85-.85.85.85 0 01-.85.85zm8.3 0a.85.85 0 11.85-.85.85.85 0 01-.85.85zM18 13H6a.32.32 0 01-.32-.32c0-.18.14-.32.32-.32h12a.32.32 0 01.32.32c0 .18-.14.32-.32.32z" />
  </svg>
);

export default function Home() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <div className="flex flex-col items-center">
      {/* Hero Section */}
      <section className="w-full py-16 md:py-24 lg:py-32 bg-gradient-to-b from-white to-background dark:from-card dark:to-background">
        <div className="container grid grid-cols-1 lg:grid-cols-2 gap-12 items-center px-4 md:px-6">
          <div className="text-center lg:text-left">
            <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl/none font-headline">
              Every Calculation
              <br />
              <span className="text-primary">You Need</span>—One Click Away
            </h1>
            <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl mt-6">
              Over 3,700 free calculators. From algebra to finance, we've got
              you covered.
            </p>
            <div className="mt-8 max-w-lg mx-auto lg:mx-0">
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Button
                  size="lg"
                  className="h-14 text-lg font-headline w-full"
                  asChild
                >
                  <Link href="/get-app">
                    <AppleIcon className="w-6 h-6 mr-2" />
                    App Store
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="h-14 text-lg font-headline w-full"
                  asChild
                >
                  <Link href="/get-app">
                    <AndroidIcon className="w-6 h-6 mr-2" />
                    Google Play
                  </Link>
                </Button>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-center">
            <AdvancedCalculator />
          </div>
        </div>
      </section>

      {/* Navigation + Search Section */}
      <section id="categories" className="w-full py-16 md:py-24 bg-background">
        <div className="container px-4 md:px-6">
          <CategoryNavigation />
        </div>
      </section>

      {/* Featured & Popular Calculators Section */}
      <section className="w-full py-16 md:py-24 bg-white dark:bg-card">
        <div className="container px-4 md:px-6">
          <FeaturedCalculators />
        </div>
      </section>
    </div>
  );
}
