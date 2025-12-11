"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Delete, Pi, SquareRadical } from "lucide-react";
import { cn } from "@/lib/utils";

export function ScientificCalculator() {
  const [expression, setExpression] = useState("");
  const [display, setDisplay] = useState("0");

  useEffect(() => {
    console.log('[ScientificCalculator] Component rendered');
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
        case "C":
          setExpression("");
          setDisplay("0");
          break;
        case "←":
          if (expression.length > 0) {
            setExpression((prev) => prev.slice(0, -1));
          }
          break;
        case "=":
          let evalExpression = expression
            .replace(/×/g, "*")
            .replace(/÷/g, "/")
            .replace(/π/g, "Math.PI")
            .replace(/e/g, "Math.E")
            .replace(/sin\(/g, "Math.sin(")
            .replace(/cos\(/g, "Math.cos(")
            .replace(/tan\(/g, "Math.tan(")
            .replace(/ln\(/g, "Math.log(")
            .replace(/log\(/g, "Math.log10(")
            .replace(/√\(/g, "Math.sqrt(");

          if (evalExpression.includes("^")) {
            evalExpression = evalExpression.replace(/(\d+)\^(\d+)/g, "Math.pow($1, $2)");
          }
          if (evalExpression.includes("!")) {
            evalExpression = evalExpression.replace(/(\d+)!/g, (match, num) =>
              String(factorial(Number(num)))
            );
          }

          const result = eval(evalExpression);
          setDisplay(String(result));
          setExpression(String(result));
          break;
        case "sin":
        case "cos":
        case "tan":
        case "ln":
        case "log":
        case "√":
          setExpression((prev) => prev + value + "(");
          break;
        case "π":
        case "e":
          setExpression((prev) => prev + value);
          break;
        case "x²":
          setExpression((prev) => `(${prev})^2`);
          break;
        case "x!":
          setExpression((prev) => `${prev}!`);
          break;
        case "÷":
        case "×":
        case "-":
        case "+":
        case ".":
        case "(":
        case ")":
        case "^":
          if (expression === "" && value !== "-" && value !== "(") return;
          setExpression((prev) => prev + value);
          break;
        default:
          if (display === "Error" || (display === "0" && value !== ".")) {
            setExpression(value);
          } else {
            setExpression((prev) => prev + value);
          }
      }
    } catch (error) {
      setDisplay("Error");
      setExpression("");
    }
  };

  useEffect(() => {
    if (expression === "") {
      setDisplay("0");
    } else {
      setDisplay(expression.replace(/\*/g, "×").replace(/\//g, "÷"));
    }
  }, [expression]);

  const buttons = [
    { value: "C", label: "C", className: "bg-red-500/80 hover:bg-red-500 text-white" },
    { value: "←", label: <Delete />, className: "bg-muted-foreground/50 hover:bg-muted-foreground/70 text-white" },
    { value: "(", label: "(" },
    { value: ")", label: ")" },
    { value: "÷", label: "÷", className: "bg-blue-500/80 hover:bg-blue-500 text-white" },
    { value: "sin", label: "sin" },
    { value: "cos", label: "cos" },
    { value: "tan", label: "tan" },
    { value: "×", label: "×", className: "bg-blue-500/80 hover:bg-blue-500 text-white" },
    { value: "ln", label: "ln" },
    { value: "log", label: "log" },
    { value: "√", label: <SquareRadical /> },
    { value: "-", label: "-", className: "bg-blue-500/80 hover:bg-blue-500 text-white" },
    { value: "π", label: <Pi /> },
    { value: "e", label: "e" },
    { value: "^", label: "xʸ" },
    { value: "+", label: "+", className: "bg-blue-500/80 hover:bg-blue-500 text-white" },
    { value: "x²", label: "x²" },
    { value: "x!", label: "x!" },
    { value: ".", label: "." },
    { value: "7", label: "7" },
    { value: "8", label: "8" },
    { value: "9", label: "9" },
    { value: "=", label: "=", className: "bg-primary hover:bg-primary/90 text-primary-foreground", gridSpan: 2 },
    { value: "4", label: "4" },
    { value: "5", label: "5" },
    { value: "6", label: "6" },
    { value: "1", label: "1" },
    { value: "2", label: "2" },
    { value: "3", label: "3" },
    { value: "0", label: "0", gridSpan: 2 },
  ];

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Scientific Calculator</CardTitle>
        <CardDescription>
          Advanced calculator with trigonometric, logarithmic, and other scientific functions.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="p-4 rounded-lg bg-muted mb-4">
          <div className="text-4xl font-bold text-foreground break-all h-16 flex items-end justify-end">
            {display}
          </div>
        </div>
        <div className="grid grid-cols-5 gap-2">
          {buttons.map((btn, i) => (
            <Button
              key={btn.value + i}
              onClick={() => handleButtonClick(btn.value)}
              className={cn(
                "h-12 text-lg",
                btn.className,
                btn.gridSpan === 2 && "col-span-2"
              )}
              variant={btn.className ? undefined : "outline"}
            >
              {btn.label}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

