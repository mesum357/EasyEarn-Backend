import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { CATEGORIES } from '@/lib/categories';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

const INITIAL_CATEGORIES_COUNT = 6;

export default function AllCategoriesPage() {
  // Show only the remaining categories (after the first 6)
  const remainingCategories = CATEGORIES.slice(INITIAL_CATEGORIES_COUNT);

  return (
    <div className="container py-12">
      <div className="mb-8">
        <Button variant="ghost" size="icon" asChild className="mb-4">
          <Link href="/">
            <ArrowLeft className="h-6 w-6" />
            <span className="sr-only">Back</span>
          </Link>
        </Button>
        <h1 className="text-4xl font-bold font-headline mb-2">More Categories</h1>
        <p className="text-muted-foreground">
          Browse through additional calculator categories
        </p>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {remainingCategories.map((category) => (
          <Link href={category.href} key={category.name} className="group">
            <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 h-full bg-white dark:bg-card">
              <CardContent className="p-6 flex flex-col items-start justify-center gap-3 text-left">
                <category.icon className="h-8 w-8 text-primary mb-2" />
                <span className="font-semibold font-headline text-lg text-foreground">
                  {category.name}
                </span>
                <p className="text-sm text-muted-foreground">{category.count} calculators</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}

