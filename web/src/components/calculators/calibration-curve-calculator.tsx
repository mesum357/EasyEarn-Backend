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

export function CalibrationCurveCalculator() {
  const [slope, setSlope] = useState("");
  const [intercept, setIntercept] = useState("");
  const [signal, setSignal] = useState("");
  const [result, setResult] = useState<number | null>(null);

  const calculate = () => {
    const m = parseFloat(slope);
    const b = parseFloat(intercept);
    const y = parseFloat(signal);
    
    if (!isNaN(m) && !isNaN(b) && !isNaN(y)) {
      // Linear calibration: y = mx + b
      // Solving for x (concentration): x = (y - b) / m
      if (m !== 0) {
        const concentration = (y - b) / m;
        setResult(concentration);
      } else {
        setResult(null);
      }
    } else {
      setResult(null);
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Calibration Curve Calculator</CardTitle>
        <CardDescription>
          Calculate concentration from a linear calibration curve: Signal = Slope × Concentration + Intercept
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <Label htmlFor="slope">Slope (m)</Label>
            <Input
              id="slope"
              type="number"
              value={slope}
              onChange={(e) => setSlope(e.target.value)}
              placeholder="Enter slope from calibration curve"
              className="mt-2"
            />
          </div>
          <div>
            <Label htmlFor="intercept">Intercept (b)</Label>
            <Input
              id="intercept"
              type="number"
              value={intercept}
              onChange={(e) => setIntercept(e.target.value)}
              placeholder="Enter y-intercept"
              className="mt-2"
            />
          </div>
          <div>
            <Label htmlFor="signal">Measured Signal (y)</Label>
            <Input
              id="signal"
              type="number"
              value={signal}
              onChange={(e) => setSignal(e.target.value)}
              placeholder="Enter measured signal value"
              className="mt-2"
            />
          </div>
          <Button onClick={calculate} className="w-full">
            Calculate
          </Button>
          {result !== null && (
            <div className="mt-6 bg-muted p-4 rounded-lg">
              <div className="flex justify-between">
                <span>Concentration:</span>
                <span className="font-bold">{result.toFixed(4)}</span>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Formula: Concentration = (Signal - Intercept) / Slope
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

