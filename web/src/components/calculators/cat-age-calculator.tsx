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

export function CatAgeCalculator() {
  const [humanYears, setHumanYears] = useState("");
  const [result, setResult] = useState<number | null>(null);

  const calculateCatAge = () => {
    const years = parseFloat(humanYears);
    if (isNaN(years) || years <= 0) return;

    // Cat age conversion: First year = 15 human years, second year = 9, then +4 per year
    let catYears;
    if (years <= 1) {
      catYears = years * 15;
    } else if (years <= 2) {
      catYears = 15 + (years - 1) * 9;
    } else {
      catYears = 24 + (years - 2) * 4;
    }

    setResult(catYears);
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Cat Age Calculator</CardTitle>
        <CardDescription>
          Convert your cat's age from human years to cat years.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <Label htmlFor="humanYears">Cat's Age (Human Years)</Label>
            <Input
              id="humanYears"
              type="number"
              value={humanYears}
              onChange={(e) => setHumanYears(e.target.value)}
              placeholder="5"
              className="mt-2"
            />
          </div>
          <Button onClick={calculateCatAge} className="w-full">
            Calculate
          </Button>
          {result !== null && (
            <div className="mt-6 bg-muted p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">Result</h3>
              <p className="text-2xl font-bold text-primary">
                {result.toFixed(0)} cat years
              </p>
              <p className="text-sm text-muted-foreground mt-1">Equivalent age in cat years</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}



