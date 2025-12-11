
'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState, useMemo } from 'react';
import {
  getCalculatorDefinition,
  calculateResult,
  type CalculatorDefinition,
  type CalculationInput,
} from '@/ai/flows/calculator-engine-flow';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Sparkles } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

function AICalculator() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q');

  const [definition, setDefinition] = useState<CalculatorDefinition | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [calculating, setCalculating] = useState(false);
  const [result, setResult] = useState<number | null>(null);

  const [formState, setFormState] = useState<Record<string, string>>({});

  useEffect(() => {
    if (query) {
      setLoading(true);
      setError(null);
      setDefinition(null);
      setResult(null);
      setFormState({});
      
      getCalculatorDefinition({ query })
        .then((def) => {
          setDefinition(def);
          const initialFormState: Record<string, string> = {};
          def.input_fields.forEach(field => {
            initialFormState[field.name] = '';
          });
          setFormState(initialFormState);
        })
        .catch(() => {
          setError('Could not generate a calculator for your query. Please try a different one.');
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
        setLoading(false);
    }
  }, [query]);

  const handleInputChange = (fieldName: string, value: string) => {
    setFormState(prevState => ({
      ...prevState,
      [fieldName]: value
    }));
     setResult(null);
  };

  const handleCalculate = async () => {
    if (!definition || !query) return;

    setCalculating(true);
    setResult(null);

    const inputs: Record<string, number> = {};
    let hasError = false;
    for (const field of definition.input_fields) {
        const value = parseFloat(formState[field.name]);
        if (isNaN(value)) {
            hasError = true;
            break;
        }
        inputs[field.name] = value;
    }

    if (hasError) {
        setError("Please enter valid numbers in all fields.");
        setCalculating(false);
        return;
    }
    
    setError(null);

    try {
      const calcInput: CalculationInput = { query, inputs };
      const calcResult = await calculateResult(calcInput);
      setResult(calcResult.result);
    } catch (e) {
      setError('An error occurred during calculation. Please try again.');
    } finally {
      setCalculating(false);
    }
  };

  const formattedResult = useMemo(() => {
    if (result === null || !definition) return null;
    const { unit } = definition.output_format;
    const formatter = new Intl.NumberFormat('en-US', {
        style: unit === '$' ? 'currency' : 'decimal',
        currency: unit === '$' ? 'USD' : undefined,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
    
    if (unit && unit !== '$') {
        return `${formatter.format(result)}${unit === '%' ? '' : ' '}${unit}`;
    }

    return formatter.format(result);

  }, [result, definition]);


  if (loading) {
    return <CalculatorSkeleton />;
  }

  if (error) {
     return (
        <div className="container py-12">
            <Alert variant="destructive">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
            </Alert>
        </div>
     );
  }

  if (!definition) {
    return (
        <div className="container py-12 text-center">
            <p className="text-muted-foreground">Enter a query in the search bar on the homepage to get started.</p>
        </div>
    );
  }

  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
            <Sparkles className="text-primary w-6 h-6" />
            {definition.title}
        </CardTitle>
        <CardDescription>{definition.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Label>Inputs</Label>
          <div className="space-y-2">
            {definition.input_fields.map((field) => (
              <div key={field.name} className="flex items-center gap-2">
                <Label htmlFor={field.name} className="w-1/3">{field.label}</Label>
                <Input
                  id={field.name}
                  type={field.type}
                  placeholder={field.label}
                  value={formState[field.name] || ''}
                  onChange={(e) => handleInputChange(field.name, e.target.value)}
                  className="flex-grow"
                />
              </div>
            ))}
          </div>
        </div>

        {result !== null && (
          <div className="mt-6 bg-muted p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-center">{definition.output_format.result_label}</h3>
            <p className="text-3xl font-bold text-center mt-2 text-primary">
              {formattedResult}
            </p>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-end gap-2 mt-4">
        <Button onClick={handleCalculate} disabled={calculating}>
          {calculating ? 'Calculating...' : 'Calculate'}
        </Button>
      </CardFooter>
    </Card>
  );
}


function CalculatorSkeleton() {
    return (
        <Card className="w-full max-w-lg mx-auto">
            <CardHeader>
                <Skeleton className="h-8 w-3/4" />
                <Skeleton className="h-4 w-full mt-2" />
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <Skeleton className="h-6 w-1/4" />
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <Skeleton className="h-10 w-1/3" />
                            <Skeleton className="h-10 w-2/3" />
                        </div>
                        <div className="flex items-center gap-2">
                            <Skeleton className="h-10 w-1/3" />
                            <Skeleton className="h-10 w-2/3" />
                        </div>
                    </div>
                </div>
            </CardContent>
            <CardFooter className="flex justify-end mt-4">
                <Skeleton className="h-10 w-24" />
            </CardFooter>
        </Card>
    );
}

export default function AICalculatorPage() {
    return (
        <div className="container py-12">
            <Suspense fallback={<CalculatorSkeleton />}>
                <AICalculator />
            </Suspense>
        </div>
    )
}
