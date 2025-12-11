import Link from 'next/link';
import { CATEGORIES } from '@/lib/categories';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function CategoryList({ currentCategory }: { currentCategory?: string }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>All Categories</CardTitle>
            </CardHeader>
            <CardContent>
                <nav className="flex flex-col gap-2">
                    {CATEGORIES.map(category => (
                        <Link
                            key={category.id}
                            href={category.href}
                            className={cn(
                                'flex justify-between items-center px-3 py-2 text-sm rounded-md transition-colors',
                                currentCategory === category.id
                                    ? 'bg-primary text-primary-foreground'
                                    : 'hover:bg-muted'
                            )}
                        >
                            <span>{category.name}</span>
                            <span className={cn(
                                'text-xs px-2 py-0.5 rounded-full',
                                currentCategory === category.id
                                    ? 'bg-primary-foreground text-primary'
                                    : 'bg-muted text-muted-foreground'
                            )}>{category.count}</span>
                        </Link>
                    ))}
                </nav>
            </CardContent>
        </Card>
    );
}
