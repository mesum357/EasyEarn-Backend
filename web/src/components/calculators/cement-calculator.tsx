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

export function CementCalculator() {
  const [length, setLength] = useState("");
  const [width, setWidth] = useState("");
  const [thickness, setThickness] = useState("");
  const [result, setResult] = useState<{
    volume: number;
    bags: number;
  } | null>(null);

  const calculate = () => {
    const l = parseFloat(length);
    const w = parseFloat(width);
    const t = parseFloat(thickness) / 12; // Convert inches to feet
    
    if (l > 0 && w > 0 && t > 0) {
      const volumeCubicFeet = l * w * t;
      const volumeCubicYards = volumeCubicFeet / 27;
      // Standard: 1 cubic yard requires ~6 bags of cement (80 lb bags)
      const bags = volumeCubicYards * 6;
      setResult({
        volume: volumeCubicYards,
        bags: bags,
      });
    } else {
      setResult(null);
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Cement Calculator</CardTitle>
        <CardDescription>
          Calculate the amount of cement needed for your project.
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
              placeholder="Enter thickness"
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
                <span className="font-bold">{result.volume.toFixed(3)} cubic yards</span>
              </div>
              <div className="flex justify-between">
                <span>Bags Needed (80 lb):</span>
                <span className="font-bold">{Math.ceil(result.bags)} bags</span>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

