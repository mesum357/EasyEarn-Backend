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

export function AngleCutCalculator() {
  const [angle, setAngle] = useState("");
  const [width, setWidth] = useState("");
  const [result, setResult] = useState<{
    opposite: number;
    adjacent: number;
  } | null>(null);

  const calculate = () => {
    const a = parseFloat(angle);
    const w = parseFloat(width);
    
    if (a > 0 && a < 90 && w > 0) {
      const angleRad = (a * Math.PI) / 180;
      // For a miter cut, calculate the cut dimensions
      const opposite = w * Math.sin(angleRad);
      const adjacent = w * Math.cos(angleRad);
      setResult({
        opposite: opposite,
        adjacent: adjacent,
      });
    } else {
      setResult(null);
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Angle Cut Calculator</CardTitle>
        <CardDescription>
          Calculate miter cut dimensions for angle cuts.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <Label htmlFor="angle">Cut Angle (degrees)</Label>
            <Input
              id="angle"
              type="number"
              value={angle}
              onChange={(e) => setAngle(e.target.value)}
              placeholder="Enter angle (0-90 degrees)"
              className="mt-2"
            />
          </div>
          <div>
            <Label htmlFor="width">Material Width (inches)</Label>
            <Input
              id="width"
              type="number"
              value={width}
              onChange={(e) => setWidth(e.target.value)}
              placeholder="Enter material width"
              className="mt-2"
            />
          </div>
          <Button onClick={calculate} className="w-full">
            Calculate
          </Button>
          {result && (
            <div className="mt-6 bg-muted p-4 rounded-lg space-y-2">
              <div className="flex justify-between">
                <span>Opposite Side (cut depth):</span>
                <span className="font-bold">{result.opposite.toFixed(3)} inches</span>
              </div>
              <div className="flex justify-between">
                <span>Adjacent Side:</span>
                <span className="font-bold">{result.adjacent.toFixed(3)} inches</span>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

