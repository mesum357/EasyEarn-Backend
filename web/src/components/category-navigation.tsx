import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { CATEGORIES } from '@/lib/categories';
import { MoreHorizontal } from 'lucide-react';

const INITIAL_CATEGORIES_COUNT = 6;

export function CategoryNavigation() {
  const initialCategories = CATEGORIES.slice(0, INITIAL_CATEGORIES_COUNT);
  const remainingCategories = CATEGORIES.slice(INITIAL_CATEGORIES_COUNT);

  return (
    <div className="mt-16">
      <h2 className="text-3xl font-bold text-center font-headline mb-8">
        Browse by Category
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {initialCategories.map((category) => (
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
        
        {remainingCategories.length > 0 && (
          <Link href="/categories" className="group">
            <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 h-full bg-white dark:bg-card">
              <CardContent className="p-6 flex flex-col items-center justify-center gap-3 text-center h-full">
                <MoreHorizontal className="h-8 w-8 text-primary mb-2" />
                <span className="font-semibold font-headline text-lg text-foreground">
                  More
                </span>
                <p className="text-sm text-muted-foreground">
                  {remainingCategories.length} more categories
                </p>
              </CardContent>
            </Card>
          </Link>
        )}
      </div>
    </div>
  );
}
