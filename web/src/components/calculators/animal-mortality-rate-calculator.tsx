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

export function AnimalMortalityRateCalculator() {
  const [deaths, setDeaths] = useState("");
  const [totalAnimals, setTotalAnimals] = useState("");
  const [result, setResult] = useState<{
    rate: number;
    percentage: number;
  } | null>(null);

  const calculateMortality = () => {
    const d = parseFloat(deaths);
    const total = parseFloat(totalAnimals);

    if (!isNaN(d) && !isNaN(total) && total > 0) {
      const rate = d / total;
      const percentage = rate * 100;
      setResult({ rate, percentage });
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Animal Mortality Rate Calculator</CardTitle>
        <CardDescription>
          Calculate the mortality rate for livestock or animal populations.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <Label htmlFor="deaths">Number of Deaths</Label>
            <Input
              id="deaths"
              type="number"
              value={deaths}
              onChange={(e) => setDeaths(e.target.value)}
              placeholder="5"
              className="mt-2"
            />
          </div>
          <div>
            <Label htmlFor="total">Total Number of Animals</Label>
            <Input
              id="total"
              type="number"
              value={totalAnimals}
              onChange={(e) => setTotalAnimals(e.target.value)}
              placeholder="100"
              className="mt-2"
            />
          </div>
          <Button onClick={calculateMortality} className="w-full">
            Calculate
          </Button>
          {result && (
            <div className="mt-6 bg-muted p-4 rounded-lg space-y-2">
              <div className="flex justify-between">
                <span>Mortality Rate:</span>
                <span className="font-bold">{result.rate.toFixed(4)}</span>
              </div>
              <div className="flex justify-between">
                <span>Mortality Percentage:</span>
                <span className="font-bold">{result.percentage.toFixed(2)}%</span>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}



