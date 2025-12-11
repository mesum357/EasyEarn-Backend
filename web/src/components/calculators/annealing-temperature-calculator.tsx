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

export function AnnealingTemperatureCalculator() {
  const [gcContent, setGcContent] = useState("");
  const [primerLength, setPrimerLength] = useState("");
  const [saltConcentration, setSaltConcentration] = useState("50");
  const [result, setResult] = useState<number | null>(null);

  const calculateAnnealingTemp = () => {
    const gc = parseFloat(gcContent);
    const length = parseFloat(primerLength);
    const salt = parseFloat(saltConcentration);

    if (!isNaN(gc) && !isNaN(length) && !isNaN(salt)) {
      // Simplified formula: Tm = 64.9 + 41 * (GC - 16.4) / length
      // More accurate: Tm = 64.9 + 41 * (GC% - 16.4) / length - 600 / length
      const tm = 64.9 + (41 * (gc - 16.4)) / length - 600 / length;
      // Adjust for salt concentration (simplified)
      const adjustedTm = tm + 0.41 * (salt - 50) / 50;
      setResult(adjustedTm);
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Annealing Temperature Calculator</CardTitle>
        <CardDescription>
          Calculate the optimal annealing temperature for PCR primers based on GC content and primer length.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <Label htmlFor="gc">GC Content (%)</Label>
            <Input
              id="gc"
              type="number"
              value={gcContent}
              onChange={(e) => setGcContent(e.target.value)}
              placeholder="50"
              className="mt-2"
            />
          </div>
          <div>
            <Label htmlFor="length">Primer Length (bp)</Label>
            <Input
              id="length"
              type="number"
              value={primerLength}
              onChange={(e) => setPrimerLength(e.target.value)}
              placeholder="20"
              className="mt-2"
            />
          </div>
          <div>
            <Label htmlFor="salt">Salt Concentration (mM)</Label>
            <Input
              id="salt"
              type="number"
              value={saltConcentration}
              onChange={(e) => setSaltConcentration(e.target.value)}
              placeholder="50"
              className="mt-2"
            />
          </div>
          <Button onClick={calculateAnnealingTemp} className="w-full">
            Calculate
          </Button>
          {result !== null && (
            <div className="mt-6 bg-muted p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">Result</h3>
              <p className="text-2xl font-bold text-primary">
                {result.toFixed(1)}°C
              </p>
              <p className="text-sm text-muted-foreground mt-1">Annealing Temperature</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}



