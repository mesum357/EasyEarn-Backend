"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export function AlgebraCalculator() {
  const [equation, setEquation] = useState("");
  const [result, setResult] = useState<string | null>(null);

  const solveEquation = () => {
    // Simple linear equation solver: ax + b = c
    // For a full implementation, you'd use a proper equation parser
    try {
      const match = equation.match(/(\d+)x\s*([+-])\s*(\d+)\s*=\s*(\d+)/);
      if (match) {
        const [, a, op, b, c] = match;
        const aVal = parseFloat(a);
        const bVal = op === "+" ? parseFloat(b) : -parseFloat(b);
        const cVal = parseFloat(c);
        const x = (cVal - bVal) / aVal;
        setResult(`x = ${x}`);
      } else {
        setResult("Please enter equation in format: ax + b = c");
      }
    } catch (error) {
      setResult("Error: Invalid equation format");
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Algebra Calculator</CardTitle>
        <CardDescription>
          Solve algebraic equations and simplify expressions.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <Label htmlFor="equation">Equation (e.g., 2x + 5 = 13)</Label>
            <Input
              id="equation"
              value={equation}
              onChange={(e) => setEquation(e.target.value)}
              placeholder="2x + 5 = 13"
              className="mt-2"
            />
          </div>
          <Button onClick={solveEquation} className="w-full">
            Solve
          </Button>
          {result && (
            <div className="mt-6 bg-muted p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">Result</h3>
              <p className="text-2xl font-bold text-primary">{result}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

