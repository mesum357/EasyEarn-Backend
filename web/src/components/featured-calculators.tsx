import {
  Sigma,
  LineChart,
  Landmark,
  BarChart3,
  FunctionSquare,
  Triangle,
  ArrowRightLeft,
  DollarSign,
  Binary,
  ArrowRight,
} from 'lucide-react';
import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const popularCalculators: { name: string; icon: LucideIcon; description: string; href: string; slug: string }[] = [
  { name: 'Scientific Calculator', icon: Sigma, description: 'Advanced scientific calculations with functions.', href: '/calculators/scientific', slug: 'scientific' },
  { name: 'Graphing Calculator', icon: LineChart, description: 'Graph functions and visualize data.', href: '/calculators/graphing', slug: 'graphing' },
  { name: 'Financial Calculator', icon: Landmark, description: 'Calculate loans, investments, and more.', href: '/calculators/financial', slug: 'financial' },
  { name: 'Statistics Calculator', icon: BarChart3, description: 'Statistical analysis and probability.', href: '/calculators/statistics-calc', slug: 'statistics-calc' },
  { name: 'Algebra Calculator', icon: FunctionSquare, description: 'Solve algebraic equations and expressions.', href: '/calculators/algebra', slug: 'algebra' },
  { name: 'Geometry Calculator', icon: Triangle, description: 'Calculate areas, volumes, and shapes.', href: '/calculators/geometry', slug: 'geometry' },
  { name: 'Unit Converter', icon: ArrowRightLeft, description: 'Convert between different units.', href: '/calculators/unit-converter', slug: 'unit-converter' },
  { name: 'Currency Converter', icon: DollarSign, description: 'Convert between world currencies.', href: '/calculators/currency', slug: 'currency' },
  { name: 'Programming Calculator', icon: Binary, description: 'Binary, hex, and programming conversions.', href: '/calculators/programming', slug: 'programming' },
];

export function FeaturedCalculators() {
  return (
    <>
      <h2 className="text-3xl font-bold text-center font-headline mb-8">
        Most Used Calculators
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {popularCalculators.map((calc) => (
          <Card key={calc.name} className="flex flex-col">
            <CardHeader className="flex-row items-center gap-4">
              <calc.icon className="w-8 h-8 text-primary" />
              <div>
                <CardTitle className="font-headline text-lg">{calc.name}</CardTitle>
                <CardDescription>{calc.description}</CardDescription>
              </div>
            </CardHeader>
            <CardFooter className="mt-auto">
              <Button asChild variant="secondary" className="w-full">
                <Link href={calc.href}>
                  Launch
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
      <div className="text-center mt-12">
        <Button variant="outline" asChild size="lg">
          <Link href="#categories">
            See More Calculators
          </Link>
        </Button>
      </div>
    </>
  );
}
