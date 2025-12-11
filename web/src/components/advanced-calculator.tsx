"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Delete, Sigma, LineChart, Landmark, BarChart3, FunctionSquare, Triangle, ArrowRightLeft, DollarSign, Binary, Pi, SquareRadical } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ScientificCalculator } from '@/components/calculators/scientific-calculator';
import { GraphingCalculator } from '@/components/calculators/graphing-calculator';
import { FinancialCalculator } from '@/components/calculators/financial-calculator';
import { StatisticsCalculator } from '@/components/calculators/statistics-calculator';
import { AlgebraCalculator } from '@/components/calculators/algebra-calculator';
import { GeometryCalculator } from '@/components/calculators/geometry-calculator';
import { UnitConverter } from '@/components/calculators/unit-converter';
import { CurrencyConverter } from '@/components/calculators/currency-converter';
import { ProgrammingCalculator } from '@/components/calculators/programming-calculator';

const CalculatorButton = ({
  value,
  children,
  onClick,
  className,
  gridSpan,
}: {
  value: string;
  children: React.ReactNode;
  onClick: (value: string) => void;
  className?: string;
  gridSpan?: number;
}) => (
  <button
    onClick={() => onClick(value)}
    className={cn(
      'flex items-center justify-center rounded-lg text-xl font-medium focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background transition-all duration-150 active:brightness-90 h-12',
      'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-foreground',
       gridSpan ? `col-span-${gridSpan}` : 'col-span-1',
      className
    )}
  >
    {children}
  </button>
);

const calculatorCategories: { name: string; icon: LucideIcon; id: string }[] = [
    { name: 'Scientific', icon: Sigma, id: 'scientific' },
    { name: 'Graphing', icon: LineChart, id: 'graphing' },
    { name: 'Financial', icon: Landmark, id: 'financial' },
    { name: 'Statistics', icon: BarChart3, id: 'statistics' },
    { name: 'Algebra', icon: FunctionSquare, id: 'algebra' },
    { name: 'Geometry', icon: Triangle, id: 'geometry' },
    { name: 'Unit Converter', icon: ArrowRightLeft, id: 'unit-converter' },
    { name: 'Currency', icon: DollarSign, id: 'currency' },
    { name: 'Programming', icon: Binary, id: 'programming' },
]

export function AdvancedCalculator() {
  const [expression, setExpression] = useState('');
  const [display, setDisplay] = useState('0');
  const [currentCalculator, setCurrentCalculator] = useState<string>('basic');

  useEffect(() => {
    // This is to avoid hydration mismatch
    console.log('[AdvancedCalculator] Component mounted');
  }, []);

    const factorial = (n: number): number => {
        if (n < 0) return NaN;
        if (n === 0) return 1;
        let result = 1;
        for (let i = 2; i <= n; i++) {
            result *= i;
        }
        return result;
    };

  const handleButtonClick = (value: string) => {
    try {
        switch (value) {
        case 'C':
            setExpression('');
            setDisplay('0');
            break;
        case '←':
            if (expression.length > 0) {
                setExpression((prev) => prev.slice(0, -1));
            }
            break;
        case '=':
            // A simple and unsafe eval is used for this demonstration.
            // In a real application, use a proper math expression parser.
            // eslint-disable-next-line no-eval
            let evalExpression = expression
                .replace(/×/g, '*')
                .replace(/÷/g, '/')
                .replace(/π/g, 'Math.PI')
                .replace(/e/g, 'Math.E')
                .replace(/sin\(/g, 'Math.sin(')
                .replace(/cos\(/g, 'Math.cos(')
                .replace(/tan\(/g, 'Math.tan(')
                .replace(/ln\(/g, 'Math.log(')
                .replace(/log\(/g, 'Math.log10(')
                .replace(/√\(/g, 'Math.sqrt(');
            
             // Handle power
            if (evalExpression.includes('^')) {
                evalExpression = evalExpression.replace(/(\d+)\^(\d+)/g, 'Math.pow($1, $2)');
            }
            // Handle factorial
            if (evalExpression.includes('!')) {
                evalExpression = evalExpression.replace(/(\d+)!/g, (match, num) => String(factorial(Number(num))));
            }

            const result = eval(evalExpression);
            setDisplay(String(result));
            setExpression(String(result));
            break;
        case 'sin':
        case 'cos':
        case 'tan':
        case 'ln':
        case 'log':
        case '√':
            setExpression((prev) => prev + value + '(');
            break;
        case 'π':
        case 'e':
            setExpression((prev) => prev + value);
            break;
        case 'x²':
            setExpression((prev) => `(${prev})^2`);
            break;
        case 'x!':
             setExpression((prev) => `${prev}!`);
            break;
        case '÷':
        case '×':
        case '-':
        case '+':
        case '.':
        case '(':
        case ')':
        case '^':
            if (expression === '' && value !== '-' && value !== '(') return;
            setExpression((prev) => prev + value);
            break;
        default: // Numbers
            if (display === 'Error' || (display === '0' && value !== '.')) {
                setExpression(value);
            } else {
                setExpression((prev) => prev + value);
            }
        }
    } catch (error) {
        setDisplay('Error');
        setExpression('');
    }
  };

  useEffect(() => {
    if (expression === '') {
      setDisplay('0');
    } else {
      setDisplay(expression.replace(/\*/g, '×').replace(/\//g, '÷'));
    }
  }, [expression]);
  
  const basicButtons = [
    { value: 'C', label: 'C', className: 'bg-red-500/80 hover:bg-red-500 text-white' },
    { value: '←', label: <Delete />, className: 'bg-muted-foreground/50 hover:bg-muted-foreground/70 text-white' },
    { value: '%', label: '%', className: 'bg-muted-foreground/50 hover:bg-muted-foreground/70 text-white' },
    { value: '÷', label: '÷', className: 'bg-blue-500/80 hover:bg-blue-500 text-white' },
    { value: '7', label: '7' },
    { value: '8', label: '8' },
    { value: '9', label: '9' },
    { value: '×', label: '×', className: 'bg-blue-500/80 hover:bg-blue-500 text-white' },
    { value: '4', label: '4' },
    { value: '5', label: '5' },
    { value: '6', label: '6' },
    { value: '-', label: '-', className: 'bg-blue-500/80 hover:bg-blue-500 text-white' },
    { value: '1', label: '1' },
    { value: '2', label: '2' },
    { value: '3', label: '3' },
    { value: '+', label: '+', className: 'bg-blue-500/80 hover:bg-blue-500 text-white' },
    { value: '0', label: '0', gridSpan: 2 },
    { value: '.', label: '.' },
    { value: '=', label: '=', className: 'bg-primary hover:bg-primary/90 text-primary-foreground' },
  ];

  const scientificButtons = [
    { value: 'sin', label: 'sin' }, { value: 'cos', label: 'cos' }, { value: 'tan', label: 'tan' },
    { value: 'ln', label: 'ln' }, { value: 'log', label: 'log' },
    { value: 'π', label: <Pi/> }, { value: 'e', label: 'e' }, { value: '√', label: <SquareRadical /> },
    { value: '^', label: 'xʸ' }, { value: 'x!', label: 'x!' },
    { value: '(', label: '(' }, { value: ')', label: ')' },
    ...basicButtons
  ];


  const renderCalculator = () => {
    switch (currentCalculator) {
      case 'scientific':
        return <ScientificCalculator />;
      case 'graphing':
        return <GraphingCalculator />;
      case 'financial':
        return <FinancialCalculator />;
      case 'statistics':
        return <StatisticsCalculator />;
      case 'algebra':
        return <AlgebraCalculator />;
      case 'geometry':
        return <GeometryCalculator />;
      case 'unit-converter':
        return <UnitConverter />;
      case 'currency':
        return <CurrencyConverter />;
      case 'programming':
        return <ProgrammingCalculator />;
      default:
        // Basic calculator
        const buttons = basicButtons;
        const gridCols = 'grid-cols-4';
        return (
          <>
            <div className="p-4 rounded-t-lg text-right mb-2">
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-xl font-bold text-left">Basic Calculator</h2>
              </div>
              <div className="text-4xl font-bold text-foreground break-all h-12 flex items-end justify-end">{display}</div>
            </div>
            <div className={`grid ${gridCols} gap-2`}>
              {buttons.map((btn, i) => (
                <CalculatorButton
                  key={btn.value + i}
                  onClick={handleButtonClick}
                  value={btn.value}
                  className={cn('h-12 text-lg', btn.className)}
                  gridSpan={btn.gridSpan}
                >
                  {btn.label}
                </CalculatorButton>
              ))}
            </div>
          </>
        );
    }
  };

  const getCalculatorTitle = () => {
    const category = calculatorCategories.find(cat => cat.id === currentCalculator);
    return category ? category.name : 'Basic Calculator';
  };
  
  return (
    <Card className="w-full max-w-md mx-auto shadow-2xl overflow-hidden bg-card/80 backdrop-blur-sm border-white/20">
      <CardContent className="p-2">
        {currentCalculator !== 'basic' && (
          <div className="mb-4 flex justify-between items-center">
            <h2 className="text-xl font-bold">{getCalculatorTitle()}</h2>
            <Button variant="link" onClick={() => setCurrentCalculator('basic')} className="text-sm">
              Back to Basic
            </Button>
          </div>
        )}
        {renderCalculator()}
        <div className="mt-4 p-2 bg-background/50 rounded-lg">
          <div className="grid grid-cols-3 gap-2">
            {calculatorCategories.map((cat) => (
              <button
                key={cat.name}
                onClick={() => {
                  console.log('[AdvancedCalculator] Calculator clicked:', cat.name, 'id:', cat.id);
                  setCurrentCalculator(cat.id);
                }}
                className={cn(
                  "cursor-pointer flex flex-col items-center justify-center p-2 rounded-lg hover:bg-accent/50 text-center transition-colors h-full",
                  currentCalculator === cat.id && "bg-accent"
                )}
              >
                <cat.icon className="h-5 w-5 mb-1 text-primary"/>
                <span className="text-xs font-medium">{cat.name}</span>
              </button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
