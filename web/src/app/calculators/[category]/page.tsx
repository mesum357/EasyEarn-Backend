
import { CategoryList } from '@/components/category-list';
import { CATEGORIES } from '@/lib/categories';
import { MATH_CALCULATORS_DATA } from '@/lib/math-calculators';
import { BIOLOGY_CALCULATORS_DATA } from '@/lib/biology-calculators';
import { CHEMISTRY_CALCULATORS_DATA } from '@/lib/chemistry-calculators';
import { CONSTRUCTION_CALCULATORS_DATA } from '@/lib/construction-calculators';
import { CONVERSION_CALCULATORS_DATA } from '@/lib/conversion-calculators';
import { ECOLOGY_CALCULATORS_DATA } from '@/lib/ecology-calculators';
import { EVERYDAY_CALCULATORS_DATA } from '@/lib/everyday-calculators';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight } from 'lucide-react';
import { ReadMore } from '@/components/read-more';

export default function CategoryPage({ params }: { params: { category: string } }) {
    const category = CATEGORIES.find(c => c.id === params.category);

    if (!category) {
        return (
            <div className="container py-12">
                <h1 className="text-3xl font-bold">Category not found</h1>
            </div>
        );
    }

    const renderMathCalculators = () => {
        return (
            <div>
                 <ReadMore text={MATH_CALCULATORS_DATA.description} className="mb-4" />
                
                <div className="space-y-12 mt-8">
                    {MATH_CALCULATORS_DATA.subcategories.map(subCategory => (
                        <div key={subCategory.title}>
                             <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                                <subCategory.icon className="h-6 w-6 text-primary" />
                                {subCategory.title}
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                {subCategory.calculators.map(calc => (
                                    <Link href={calc.href} key={calc.name} className="group">
                                        <Card className="h-full transition-all group-hover:shadow-md group-hover:-translate-y-0.5">
                                            <CardContent className="p-4 flex items-center justify-between">
                                                <h3 className="font-semibold text-base">{calc.name}</h3>
                                                <ArrowRight className="h-4 w-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                                            </CardContent>
                                        </Card>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )
    }

    const renderBiologyCalculators = () => {
        return (
            <div>
                 <ReadMore text={BIOLOGY_CALCULATORS_DATA.description} className="mb-4" />
                
                <div className="space-y-12 mt-8">
                    {BIOLOGY_CALCULATORS_DATA.subcategories.map(subCategory => (
                        <div key={subCategory.title}>
                             <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                                <subCategory.icon className="h-6 w-6 text-primary" />
                                {subCategory.title}
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                {subCategory.calculators.map(calc => (
                                    <Link href={calc.href} key={calc.name} className="group">
                                        <Card className="h-full transition-all group-hover:shadow-md group-hover:-translate-y-0.5">
                                            <CardContent className="p-4 flex items-center justify-between">
                                                <h3 className="font-semibold text-base">{calc.name}</h3>
                                                <ArrowRight className="h-4 w-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                                            </CardContent>
                                        </Card>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )
    }

    const renderChemistryCalculators = () => {
        return (
            <div>
                 <ReadMore text={CHEMISTRY_CALCULATORS_DATA.description} className="mb-4" />
                
                <div className="space-y-12 mt-8">
                    {CHEMISTRY_CALCULATORS_DATA.subcategories.map(subCategory => (
                        <div key={subCategory.title}>
                             <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                                <subCategory.icon className="h-6 w-6 text-primary" />
                                {subCategory.title}
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                {subCategory.calculators.map(calc => (
                                    <Link href={calc.href} key={calc.name} className="group">
                                        <Card className="h-full transition-all group-hover:shadow-md group-hover:-translate-y-0.5">
                                            <CardContent className="p-4 flex items-center justify-between">
                                                <h3 className="font-semibold text-base">{calc.name}</h3>
                                                <ArrowRight className="h-4 w-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                                            </CardContent>
                                        </Card>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )
    }

    const renderConstructionCalculators = () => {
        return (
            <div>
                 <ReadMore text={CONSTRUCTION_CALCULATORS_DATA.description} className="mb-4" />
                
                <div className="space-y-12 mt-8">
                    {CONSTRUCTION_CALCULATORS_DATA.subcategories.map(subCategory => (
                        <div key={subCategory.title}>
                             <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                                <subCategory.icon className="h-6 w-6 text-primary" />
                                {subCategory.title}
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                {subCategory.calculators.map(calc => (
                                    <Link href={calc.href} key={calc.name} className="group">
                                        <Card className="h-full transition-all group-hover:shadow-md group-hover:-translate-y-0.5">
                                            <CardContent className="p-4 flex items-center justify-between">
                                                <h3 className="font-semibold text-base">{calc.name}</h3>
                                                <ArrowRight className="h-4 w-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                                            </CardContent>
                                        </Card>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )
    }

    const renderConversionCalculators = () => {
        return (
            <div>
                 <ReadMore text={CONVERSION_CALCULATORS_DATA.description} className="mb-4" />
                
                <div className="space-y-12 mt-8">
                    {CONVERSION_CALCULATORS_DATA.subcategories.map(subCategory => (
                        <div key={subCategory.title}>
                             <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                                <subCategory.icon className="h-6 w-6 text-primary" />
                                {subCategory.title}
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                {subCategory.calculators.map(calc => (
                                    <Link href={calc.href} key={calc.name} className="group">
                                        <Card className="h-full transition-all group-hover:shadow-md group-hover:-translate-y-0.5">
                                            <CardContent className="p-4 flex items-center justify-between">
                                                <h3 className="font-semibold text-base">{calc.name}</h3>
                                                <ArrowRight className="h-4 w-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                                            </CardContent>
                                        </Card>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )
    }

    const renderEcologyCalculators = () => {
        return (
            <div>
                 <ReadMore text={ECOLOGY_CALCULATORS_DATA.description} className="mb-4" />
                
                <div className="space-y-12 mt-8">
                    {ECOLOGY_CALCULATORS_DATA.subcategories.map(subCategory => (
                        <div key={subCategory.title}>
                             <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                                <subCategory.icon className="h-6 w-6 text-primary" />
                                {subCategory.title}
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                {subCategory.calculators.map(calc => (
                                    <Link href={calc.href} key={calc.name} className="group">
                                        <Card className="h-full transition-all group-hover:shadow-md group-hover:-translate-y-0.5">
                                            <CardContent className="p-4 flex items-center justify-between">
                                                <h3 className="font-semibold text-base">{calc.name}</h3>
                                                <ArrowRight className="h-4 w-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                                            </CardContent>
                                        </Card>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )
    }

    const renderEverydayCalculators = () => {
        return (
            <div>
                 <ReadMore text={EVERYDAY_CALCULATORS_DATA.description} className="mb-4" />
                
                <div className="space-y-12 mt-8">
                    {EVERYDAY_CALCULATORS_DATA.subcategories.map(subCategory => (
                        <div key={subCategory.title}>
                             <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                                <subCategory.icon className="h-6 w-6 text-primary" />
                                {subCategory.title}
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                {subCategory.calculators.map(calc => (
                                    <Link href={calc.href} key={calc.name} className="group">
                                        <Card className="h-full transition-all group-hover:shadow-md group-hover:-translate-y-0.5">
                                            <CardContent className="p-4 flex items-center justify-between">
                                                <h3 className="font-semibold text-base">{calc.name}</h3>
                                                <ArrowRight className="h-4 w-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                                            </CardContent>
                                        </Card>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-4xl font-bold mb-2 text-primary">{category.name} Calculators</h1>
            <p className="text-muted-foreground mb-8">
                Browse through our collection of {category.count} free {category.name.toLowerCase()} calculators.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                <div className="md:col-span-1">
                    <CategoryList currentCategory={category.id}/>
                </div>
                <div className="md:col-span-3">
                    <div className="bg-card p-6 rounded-lg shadow-sm">
                        {category.id === 'math' ? renderMathCalculators() : 
                         category.id === 'biology' ? renderBiologyCalculators() :
                         category.id === 'chemistry' ? renderChemistryCalculators() :
                         category.id === 'construction' ? renderConstructionCalculators() :
                         category.id === 'conversion' ? renderConversionCalculators() :
                         category.id === 'ecology' ? renderEcologyCalculators() :
                         category.id === 'everyday' ? renderEverydayCalculators() : (
                            <div>
                                <h2 className="text-2xl font-bold mb-4">Calculators in this category</h2>
                                <p className="text-muted-foreground">
                                    Placeholder for the list of calculators in the {category.name} category.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export async function generateStaticParams() {
    return CATEGORIES.map(category => ({
        category: category.id,
    }));
}
