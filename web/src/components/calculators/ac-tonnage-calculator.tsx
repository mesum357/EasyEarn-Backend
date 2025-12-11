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

export function ACTonnageCalculator() {
  const [length, setLength] = useState("");
  const [width, setWidth] = useState("");
  const [height, setHeight] = useState("");
  const [result, setResult] = useState<number | null>(null);

  const calculate = () => {
    const l = parseFloat(length);
    const w = parseFloat(width);
    const h = parseFloat(height);
    
    if (l > 0 && w > 0 && h > 0) {
      const volume = l * w * h; // cubic feet
      // General rule: 1 ton per 400-600 sq ft, or ~1 ton per 12,000 BTU
      // Simplified: 1 ton per 400 sq ft of floor area
      const area = l * w;
      const tonnage = area / 400;
      setResult(tonnage);
    } else {
      setResult(null);
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>AC Tonnage Calculator</CardTitle>
        <CardDescription>
          Calculate the required AC tonnage based on room dimensions.
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
            <Label htmlFor="height">Height (feet) - Optional</Label>
            <Input
              id="height"
              type="number"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              placeholder="Enter height (optional)"
              className="mt-2"
            />
          </div>
          <Button onClick={calculate} className="w-full">
            Calculate
          </Button>
          {result !== null && (
            <div className="mt-6 bg-muted p-4 rounded-lg">
              <div className="flex justify-between">
                <span>Required AC Tonnage:</span>
                <span className="font-bold">{result.toFixed(2)} tons</span>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Note: This is an estimate. Actual requirements may vary based on insulation, windows, climate, and other factors.
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

