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

export function BatteryChargeTimeCalculator() {
  const [batteryCapacity, setBatteryCapacity] = useState("");
  const [currentCharge, setCurrentCharge] = useState("0");
  const [chargerOutput, setChargerOutput] = useState("");
  const [efficiency, setEfficiency] = useState("0.85");
  const [result, setResult] = useState<{
    chargeTime: number;
    chargeTimeMinutes: number;
  } | null>(null);

  const calculate = () => {
    const capacity = parseFloat(batteryCapacity); // mAh
    const current = parseFloat(currentCharge); // Current charge percentage
    const output = parseFloat(chargerOutput); // Charger output in mA
    const eff = parseFloat(efficiency) || 0.85; // Charging efficiency
    
    if (capacity > 0 && output > 0 && current >= 0 && current <= 100) {
      const remainingCapacity = capacity * (1 - current / 100);
      // Account for charging efficiency
      const actualOutput = output * eff;
      const chargeTimeHours = remainingCapacity / actualOutput;
      const chargeTimeMinutes = chargeTimeHours * 60;
      
      setResult({
        chargeTime: chargeTimeHours,
        chargeTimeMinutes: chargeTimeMinutes,
      });
    } else {
      setResult(null);
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Battery Charge Time Calculator</CardTitle>
        <CardDescription>
          Calculate how long it will take to charge a battery based on capacity, current charge, and charger output.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <Label htmlFor="batteryCapacity">Battery Capacity (mAh)</Label>
            <Input
              id="batteryCapacity"
              type="number"
              value={batteryCapacity}
              onChange={(e) => setBatteryCapacity(e.target.value)}
              placeholder="Enter battery capacity"
              className="mt-2"
            />
          </div>
          <div>
            <Label htmlFor="currentCharge">Current Charge (%)</Label>
            <Input
              id="currentCharge"
              type="number"
              value={currentCharge}
              onChange={(e) => setCurrentCharge(e.target.value)}
              placeholder="Enter current charge percentage"
              className="mt-2"
            />
          </div>
          <div>
            <Label htmlFor="chargerOutput">Charger Output (mA)</Label>
            <Input
              id="chargerOutput"
              type="number"
              value={chargerOutput}
              onChange={(e) => setChargerOutput(e.target.value)}
              placeholder="Enter charger output current"
              className="mt-2"
            />
          </div>
          <div>
            <Label htmlFor="efficiency">Charging Efficiency (0.0-1.0)</Label>
            <Input
              id="efficiency"
              type="number"
              value={efficiency}
              onChange={(e) => setEfficiency(e.target.value)}
              placeholder="Enter efficiency (default: 0.85)"
              className="mt-2"
            />
          </div>
          <Button onClick={calculate} className="w-full">
            Calculate
          </Button>
          {result && (
            <div className="mt-6 bg-muted p-4 rounded-lg space-y-2">
              <div className="flex justify-between">
                <span>Charge Time:</span>
                <span className="font-bold">{result.chargeTime.toFixed(2)} hours</span>
              </div>
              <div className="flex justify-between">
                <span>Charge Time:</span>
                <span className="font-bold">{Math.floor(result.chargeTimeMinutes)} minutes</span>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

