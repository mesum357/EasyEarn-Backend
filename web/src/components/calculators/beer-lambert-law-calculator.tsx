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

export function BeerLambertLawCalculator() {
  const [absorbance, setAbsorbance] = useState("");
  const [molarAbsorptivity, setMolarAbsorptivity] = useState("");
  const [pathLength, setPathLength] = useState("");
  const [result, setResult] = useState<number | null>(null);

  const calculate = () => {
    const A = parseFloat(absorbance);
    const ε = parseFloat(molarAbsorptivity);
    const l = parseFloat(pathLength);
    if (A > 0 && ε > 0 && l > 0) {
      setResult(A / (ε * l));
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Beer-Lambert Law Calculator</CardTitle>
        <CardDescription>
          Calculate concentration using the Beer-Lambert law: A = εcl
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <Label htmlFor="absorbance">Absorbance (A)</Label>
            <Input
              id="absorbance"
              type="number"
              value={absorbance}
              onChange={(e) => setAbsorbance(e.target.value)}
              placeholder="Enter absorbance"
              className="mt-2"
            />
          </div>
          <div>
            <Label htmlFor="molarAbsorptivity">Molar Absorptivity (ε)</Label>
            <Input
              id="molarAbsorptivity"
              type="number"
              value={molarAbsorptivity}
              onChange={(e) => setMolarAbsorptivity(e.target.value)}
              placeholder="Enter molar absorptivity"
              className="mt-2"
            />
          </div>
          <div>
            <Label htmlFor="pathLength">Path Length (l, in cm)</Label>
            <Input
              id="pathLength"
              type="number"
              value={pathLength}
              onChange={(e) => setPathLength(e.target.value)}
              placeholder="Enter path length"
              className="mt-2"
            />
          </div>
          <Button onClick={calculate} className="w-full">
            Calculate Concentration
          </Button>
          {result !== null && (
            <div className="mt-6 bg-muted p-4 rounded-lg">
              <div className="flex justify-between">
                <span>Concentration (c):</span>
                <span className="font-bold">{result.toFixed(4)} mol/L</span>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

