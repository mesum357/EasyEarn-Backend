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

export function AsphaltCalculator() {
  const [length, setLength] = useState("");
  const [width, setWidth] = useState("");
  const [thickness, setThickness] = useState("");
  const [result, setResult] = useState<{
    volume: number;
    tons: number;
  } | null>(null);

  const calculate = () => {
    const l = parseFloat(length);
    const w = parseFloat(width);
    const t = parseFloat(thickness) / 12; // Convert inches to feet
    
    if (l > 0 && w > 0 && t > 0) {
      const area = l * w; // square feet
      const volume = area * t; // cubic feet
      const volumeCubicYards = volume / 27;
      // Asphalt density: ~145 lbs per cubic foot = ~2.4 tons per cubic yard
      const tons = volumeCubicYards * 2.4;
      setResult({
        volume: volumeCubicYards,
        tons: tons,
      });
    } else {
      setResult(null);
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Asphalt Calculator</CardTitle>
        <CardDescription>
          Calculate the amount of asphalt needed for your driveway.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <Label htmlFor="length">Length (feet)</Label>
            <Input
              id="length"
              type="number"
              value={length}
              onChange={(e) => setLength(e.target.value)}
              placeholder="Enter length"
              className="mt-2"
            />
          </div>
          <div>
            <Label htmlFor="width">Width (feet)</Label>
            <Input
              id="width"
              type="number"
              value={width}
              onChange={(e) => setWidth(e.target.value)}
              placeholder="Enter width"
              className="mt-2"
            />
          </div>
          <div>
            <Label htmlFor="thickness">Thickness (inches)</Label>
            <Input
              id="thickness"
              type="number"
              value={thickness}
              onChange={(e) => setThickness(e.target.value)}
              placeholder="Enter thickness (typically 2-4 inches)"
              className="mt-2"
            />
          </div>
          <Button onClick={calculate} className="w-full">
            Calculate
          </Button>
          {result && (
            <div className="mt-6 bg-muted p-4 rounded-lg space-y-2">
              <div className="flex justify-between">
                <span>Volume:</span>
                <span className="font-bold">{result.volume.toFixed(2)} cubic yards</span>
              </div>
              <div className="flex justify-between">
                <span>Weight:</span>
                <span className="font-bold">{result.tons.toFixed(2)} tons</span>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

