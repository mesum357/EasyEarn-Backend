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

const GRAVITY = 9.81; // m/s²
const EFFICIENCY = 0.85; // Typical hydroelectric efficiency (85%)

export function HydroelectricPowerCalculator() {
  const [flowRate, setFlowRate] = useState("");
  const [head, setHead] = useState("");
  const [result, setResult] = useState<{
    power: number;
    energy: number;
  } | null>(null);

  const calculate = () => {
    const Q = parseFloat(flowRate); // Flow rate in m³/s
    const H = parseFloat(head); // Head height in meters
    const DENSITY = 1000; // Water density in kg/m³
    
    if (Q > 0 && H > 0) {
      // Power = η × ρ × g × Q × H
      // Where: η = efficiency, ρ = density, g = gravity, Q = flow rate, H = head
      const powerWatts = EFFICIENCY * DENSITY * GRAVITY * Q * H;
      const powerMW = powerWatts / 1000000; // Convert to MW
      const energyMWh = powerMW * 24; // Energy per day
      
      setResult({
        power: powerMW,
        energy: energyMWh,
      });
    } else {
      setResult(null);
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Hydroelectric Power Calculator</CardTitle>
        <CardDescription>
          Calculate hydroelectric power generation based on flow rate and head height.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <Label htmlFor="flowRate">Flow Rate (m³/s)</Label>
            <Input
              id="flowRate"
              type="number"
              value={flowRate}
              onChange={(e) => setFlowRate(e.target.value)}
              placeholder="Enter flow rate"
              className="mt-2"
            />
          </div>
          <div>
            <Label htmlFor="head">Head Height (meters)</Label>
            <Input
              id="head"
              type="number"
              value={head}
              onChange={(e) => setHead(e.target.value)}
              placeholder="Enter head height"
              className="mt-2"
            />
          </div>
          <Button onClick={calculate} className="w-full">
            Calculate
          </Button>
          {result && (
            <div className="mt-6 bg-muted p-4 rounded-lg space-y-2">
              <div className="flex justify-between">
                <span>Power Output:</span>
                <span className="font-bold">{result.power.toFixed(3)} MW</span>
              </div>
              <div className="flex justify-between">
                <span>Energy per Day:</span>
                <span className="font-bold">{result.energy.toFixed(2)} MWh</span>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Formula: P = η × ρ × g × Q × H (where η = 0.85 efficiency)
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

