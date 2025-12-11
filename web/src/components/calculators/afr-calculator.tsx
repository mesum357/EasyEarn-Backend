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

export function AFRCalculator() {
  const [air, setAir] = useState("");
  const [fuel, setFuel] = useState("");
  const [result, setResult] = useState<number | null>(null);

  const calculate = () => {
    const a = parseFloat(air);
    const f = parseFloat(fuel);
    if (a > 0 && f > 0) {
      setResult(a / f);
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>AFR Calculator (Air-Fuel Ratio)</CardTitle>
        <CardDescription>
          Calculate the air-fuel ratio for combustion reactions.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <Label htmlFor="air">Air Mass</Label>
            <Input
              id="air"
              type="number"
              value={air}
              onChange={(e) => setAir(e.target.value)}
              placeholder="Enter air mass"
              className="mt-2"
            />
          </div>
          <div>
            <Label htmlFor="fuel">Fuel Mass</Label>
            <Input
              id="fuel"
              type="number"
              value={fuel}
              onChange={(e) => setFuel(e.target.value)}
              placeholder="Enter fuel mass"
              className="mt-2"
            />
          </div>
          <Button onClick={calculate} className="w-full">
            Calculate
          </Button>
          {result !== null && (
            <div className="mt-6 bg-muted p-4 rounded-lg">
              <div className="flex justify-between">
                <span>Air-Fuel Ratio:</span>
                <span className="font-bold">{result.toFixed(2)}</span>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

