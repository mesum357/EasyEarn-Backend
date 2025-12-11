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

export function FireFlowCalculator() {
  const [area, setArea] = useState("");
  const [occupancy, setOccupancy] = useState("");
  const [result, setResult] = useState<number | null>(null);

  const calculate = () => {
    const a = parseFloat(area);
    const occ = parseFloat(occupancy);
    
    if (a > 0) {
      // Fire flow calculation: Q = 18 * C * A^0.5
      // Where C is a coefficient based on occupancy (typically 1.0-1.5)
      // Simplified: Q = 18 * A^0.5 for standard calculations
      const C = occ > 0 ? occ : 1.0;
      const flow = 18 * C * Math.sqrt(a);
      setResult(flow);
    } else {
      setResult(null);
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Fire Flow Calculator</CardTitle>
        <CardDescription>
          Calculate required fire flow based on building area and occupancy type.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <Label htmlFor="area">Building Area (square feet)</Label>
            <Input
              id="area"
              type="number"
              value={area}
              onChange={(e) => setArea(e.target.value)}
              placeholder="Enter building area"
              className="mt-2"
            />
          </div>
          <div>
            <Label htmlFor="occupancy">Occupancy Coefficient (C) - Optional</Label>
            <Input
              id="occupancy"
              type="number"
              value={occupancy}
              onChange={(e) => setOccupancy(e.target.value)}
              placeholder="Enter coefficient (default: 1.0)"
              className="mt-2"
            />
          </div>
          <Button onClick={calculate} className="w-full">
            Calculate
          </Button>
          {result !== null && (
            <div className="mt-6 bg-muted p-4 rounded-lg">
              <div className="flex justify-between">
                <span>Required Fire Flow:</span>
                <span className="font-bold">{result.toFixed(2)} GPM</span>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Formula: Q = 18 × C × √A (where A is area in sq ft)
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

