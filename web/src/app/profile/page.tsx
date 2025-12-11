
import {
  Clock,
  Heart,
  User,
  ArrowRight,
  Percent,
  Landmark,
  Scale,
  Calculator,
  Home,
  HandCoins,
  Cake,
} from 'lucide-react';
import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const recentlyUsedCalculators: { name: string; icon: LucideIcon; description: string; href: string }[] = [
    { name: 'Average Percentage Calculator', icon: Percent, description: 'Used 5 minutes ago', href: '/calculators/math/average-percentage-calculator' },
    { name: 'Loan Calculator', icon: Landmark, description: 'Used 2 hours ago', href: '#' },
    { name: 'BMI Calculator', icon: Scale, description: 'Used 1 day ago', href: '#' },
    { name: 'Scientific Calculator', icon: Calculator, description: 'Used 3 days ago', href: '#' },
];

const favoriteCalculators: { name: string; icon: LucideIcon; description: string; href: string }[] = [
    { name: 'Mortgage Calculator', icon: Home, description: 'Estimate mortgage payments.', href: '#' },
    { name: 'Tip Calculator', icon: HandCoins, description: 'Calculate tips and split bills.', href: '#' },
    { name: 'Age Calculator', icon: Cake, description: 'Find out your exact age.', href: '#' },
];

export default function ProfilePage() {
    const hasFavorites = favoriteCalculators.length > 0;
    const hasHistory = recentlyUsedCalculators.length > 0;

  return (
    <div className="container mx-auto px-4 py-12">
        <Card className="w-full max-w-4xl mx-auto mb-8 bg-card/50">
            <CardContent className="p-6 flex items-center gap-6">
                 <Avatar className="h-24 w-24 border-4 border-background">
                    <AvatarImage src="https://picsum.photos/seed/user/200" alt="User Name" data-ai-hint="user avatar" />
                    <AvatarFallback>
                        <User className="h-10 w-10" />
                    </AvatarFallback>
                </Avatar>
                <div>
                    <h1 className="text-3xl font-bold font-headline">Welcome Back!</h1>
                    <p className="text-muted-foreground mt-1">Here&apos;s a summary of your recent activity.</p>
                </div>
            </CardContent>
        </Card>

      <section className="mb-12">
        <h2 className="text-3xl font-bold text-center font-headline mb-8">
          Recently Used
        </h2>
        {hasHistory ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {recentlyUsedCalculators.map((calc) => (
                <Card key={calc.name} className="flex flex-col">
                    <CardHeader>
                        <div className="flex items-center gap-4">
                             <calc.icon className="w-8 h-8 text-primary" />
                             <CardTitle className="font-headline text-lg">{calc.name}</CardTitle>
                        </div>
                        <CardDescription className="pt-2 flex items-center gap-2 text-sm"><Clock className="w-4 h-4"/>{calc.description}</CardDescription>
                    </CardHeader>
                    <CardFooter className="mt-auto">
                    <Button asChild variant="secondary" className="w-full">
                        <Link href={calc.href}>
                        Launch Again
                        <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                    </Button>
                    </CardFooter>
                </Card>
                ))}
            </div>
        ) : (
             <div className="text-center py-12 bg-card rounded-lg">
                <p className="text-muted-foreground">You haven&apos;t used any calculators yet.</p>
                <Button asChild className="mt-4">
                    <Link href="/">Explore Calculators</Link>
                </Button>
            </div>
        )}
      </section>

      <section>
        <h2 className="text-3xl font-bold text-center font-headline mb-8">
          My Favorites
        </h2>
        {hasFavorites ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {favoriteCalculators.map((calc) => (
              <Card key={calc.name} className="flex flex-col">
                <CardHeader>
                    <div className="flex items-center gap-4">
                        <calc.icon className="w-8 h-8 text-primary" />
                        <CardTitle className="font-headline text-lg">{calc.name}</CardTitle>
                    </div>
                     <CardDescription className="pt-2">{calc.description}</CardDescription>
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
        ) : (
            <div className="text-center py-12 bg-card rounded-lg">
                <Heart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">No Favorites Yet</h3>
                <p className="text-muted-foreground">Click the heart icon on any calculator to add it to your favorites.</p>
                 <Button asChild className="mt-4" variant="outline">
                    <Link href="/">Find Calculators to Love</Link>
                </Button>
            </div>
        )}
      </section>
    </div>
  );
}
