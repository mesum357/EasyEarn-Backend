
"use client";

import Link from "next/link";
import { Search } from "lucide-react";
import { ThemeToggle } from "./theme-toggle";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { useState, useEffect } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { CATEGORIES } from "@/lib/categories";
import { cn } from "@/lib/utils";
import { usePathname } from 'next/navigation';
import { Logo } from "./logo";


export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const currentCategory = CATEGORIES.find(c => pathname?.includes(c.href));

  useEffect(() => {
    if (currentCategory) {
      setActiveCategory(currentCategory.id);
    } else {
      setActiveCategory(null);
    }
  }, [currentCategory]);


  return (
    <header
      className={cn("sticky top-0 z-50 w-full border-b",
        isScrolled ? "bg-background/95 backdrop-blur-sm" : "bg-background"
      )}
    >
      <div className="container flex h-16 items-center justify-between px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2">
          <Logo />
          <span className="text-xl font-bold font-headline text-foreground">
            Calculator1.org
          </span>
        </Link>

        <div className="flex-1 flex justify-center px-4 lg:px-16">
          <div className="relative w-full max-w-md hidden md:block">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
             <Input
                type="search"
                placeholder="Search calculators..."
                className="w-full rounded-full pl-10"
              />
          </div>
        </div>
        
        <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="md:hidden">
                <Search className="h-5 w-5" />
                <span className="sr-only">Search</span>
            </Button>
          <ThemeToggle />
            <div className="hidden md:flex items-center gap-2">
                <Button variant="ghost" asChild>
                    <Link href="/auth">Login</Link>
                </Button>
                <Button asChild>
                    <Link href="/auth">Sign Up</Link>
                </Button>
            </div>
        </div>
      </div>
      <nav className="border-t">
        <div className="container px-4 md:px-6">
            <Carousel
              opts={{
                align: "start",
                dragFree: true,
              }}
              className="w-full"
            >
              <CarouselContent>
                {CATEGORIES.map((category) => (
                  <CarouselItem key={category.id} className="basis-auto">
                    <Link href={category.href}>
                      <div className={cn(
                          "py-3 px-4 text-sm font-medium transition-colors relative border-b-2", 
                          activeCategory === category.id 
                            ? "text-primary border-primary" 
                            : "text-muted-foreground hover:text-foreground border-transparent"
                        )}>
                        {category.name}
                      </div>
                    </Link>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <div className="hidden md:block">
                  <CarouselPrevious className="absolute -left-4 top-1/2 -translate-y-1/2" />
                  <CarouselNext className="absolute -right-4 top-1/2 -translate-y-1/2" />
              </div>
            </Carousel>
        </div>
      </nav>
    </header>
  );
}
