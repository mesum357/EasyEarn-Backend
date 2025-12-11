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

export function MLVSSCalculator() {
  const [mlss, setMlss] = useState("");
  const [volatileFraction, setVolatileFraction] = useState("");
  const [result, setResult] = useState<number | null>(null);

  const calculateMLVSS = () => {
    const mlssValue = parseFloat(mlss);
    const vf = parseFloat(volatileFraction) / 100; // Convert percentage to decimal

    if (!isNaN(mlssValue) && !isNaN(vf) && mlssValue > 0 && vf >= 0 && vf <= 1) {
      // MLVSS = MLSS × Volatile Fraction
      const mlvss = mlssValue * vf;
      setResult(mlvss);
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>MLVSS Calculator</CardTitle>
        <CardDescription>
          Calculate Mixed Liquor Volatile Suspended Solids (MLVSS) from MLSS and volatile fraction.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <Label htmlFor="mlss">MLSS (mg/L)</Label>
            <Input
              id="mlss"
              type="number"
              value={mlss}
              onChange={(e) => setMlss(e.target.value)}
              placeholder="3000"
              className="mt-2"
            />
          </div>
          <div>
            <Label htmlFor="vf">Volatile Fraction (%)</Label>
            <Input
              id="vf"
              type="number"
              value={volatileFraction}
              onChange={(e) => setVolatileFraction(e.target.value)}
              placeholder="80"
              className="mt-2"
            />
          </div>
          <Button onClick={calculateMLVSS} className="w-full">
            Calculate
          </Button>
          {result !== null && (
            <div className="mt-6 bg-muted p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">Result</h3>
              <p className="text-2xl font-bold text-primary">
                {result.toFixed(2)} mg/L
              </p>
              <p className="text-sm text-muted-foreground mt-1">MLVSS (Mixed Liquor Volatile Suspended Solids)</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}



