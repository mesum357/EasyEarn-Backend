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

export function AcresPerHourCalculator() {
  const [width, setWidth] = useState("");
  const [speed, setSpeed] = useState("");
  const [efficiency, setEfficiency] = useState("85");
  const [result, setResult] = useState<number | null>(null);

  const calculateAcresPerHour = () => {
    const w = parseFloat(width); // in feet
    const s = parseFloat(speed); // in mph
    const eff = parseFloat(efficiency) / 100; // efficiency as decimal

    if (!isNaN(w) && !isNaN(s) && !isNaN(eff) && w > 0 && s > 0) {
      // Formula: (Width (ft) × Speed (mph) × Efficiency) / 8.25
      // 8.25 is the constant to convert to acres per hour
      const acresPerHour = (w * s * eff) / 8.25;
      setResult(acresPerHour);
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Acres Per Hour Calculator</CardTitle>
        <CardDescription>
          Calculate the field coverage rate in acres per hour for farming equipment.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <Label htmlFor="width">Implement Width (feet)</Label>
            <Input
              id="width"
              type="number"
              value={width}
              onChange={(e) => setWidth(e.target.value)}
              placeholder="20"
              className="mt-2"
            />
          </div>
          <div>
            <Label htmlFor="speed">Speed (mph)</Label>
            <Input
              id="speed"
              type="number"
              value={speed}
              onChange={(e) => setSpeed(e.target.value)}
              placeholder="5"
              className="mt-2"
            />
          </div>
          <div>
            <Label htmlFor="efficiency">Field Efficiency (%)</Label>
            <Input
              id="efficiency"
              type="number"
              value={efficiency}
              onChange={(e) => setEfficiency(e.target.value)}
              placeholder="85"
              className="mt-2"
            />
          </div>
          <Button onClick={calculateAcresPerHour} className="w-full">
            Calculate
          </Button>
          {result !== null && (
            <div className="mt-6 bg-muted p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">Result</h3>
              <p className="text-2xl font-bold text-primary">
                {result.toFixed(2)} acres/hour
              </p>
              <p className="text-sm text-muted-foreground mt-1">Field coverage rate</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}



