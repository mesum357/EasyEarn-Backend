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

const BATH_WATER_GALLONS = 36; // Average bath uses ~36 gallons
const SHOWER_RATE_GPM = 2.1; // Average shower flow rate: 2.1 gallons per minute

export function BathVsShowerCalculator() {
  const [showerTime, setShowerTime] = useState("");
  const [frequency, setFrequency] = useState("");
  const [result, setResult] = useState<{
    bathWater: number;
    showerWater: number;
    difference: number;
    savings: number;
  } | null>(null);

  const calculate = () => {
    const time = parseFloat(showerTime);
    const freq = parseFloat(frequency) || 1; // Times per day
    
    if (time > 0) {
      const bathWater = BATH_WATER_GALLONS * freq;
      const showerWater = time * SHOWER_RATE_GPM * freq;
      const difference = Math.abs(bathWater - showerWater);
      const savings = bathWater > showerWater ? difference : -difference;
      
      setResult({
        bathWater: bathWater,
        showerWater: showerWater,
        difference: difference,
        savings: savings,
      });
    } else {
      setResult(null);
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Bath vs Shower Calculator</CardTitle>
        <CardDescription>
          Compare water usage between taking a bath and a shower.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <Label htmlFor="showerTime">Shower Duration (minutes)</Label>
            <Input
              id="showerTime"
              type="number"
              value={showerTime}
              onChange={(e) => setShowerTime(e.target.value)}
              placeholder="Enter shower duration"
              className="mt-2"
            />
          </div>
          <div>
            <Label htmlFor="frequency">Times per Day</Label>
            <Input
              id="frequency"
              type="number"
              value={frequency}
              onChange={(e) => setFrequency(e.target.value)}
              placeholder="Enter frequency (default: 1)"
              className="mt-2"
            />
          </div>
          <Button onClick={calculate} className="w-full">
            Calculate
          </Button>
          {result && (
            <div className="mt-6 bg-muted p-4 rounded-lg space-y-2">
              <div className="flex justify-between">
                <span>Bath Water Usage:</span>
                <span className="font-bold">{result.bathWater.toFixed(1)} gallons</span>
              </div>
              <div className="flex justify-between">
                <span>Shower Water Usage:</span>
                <span className="font-bold">{result.showerWater.toFixed(1)} gallons</span>
              </div>
              <div className="flex justify-between">
                <span>Difference:</span>
                <span className={`font-bold ${result.savings > 0 ? "text-green-600" : "text-red-600"}`}>
                  {result.savings > 0 ? "Shower saves" : "Bath saves"} {Math.abs(result.savings).toFixed(1)} gallons
                </span>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

