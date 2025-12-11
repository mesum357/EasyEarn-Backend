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

export function ActivityCoefficientCalculator() {
  const [ionicStrength, setIonicStrength] = useState("");
  const [charge, setCharge] = useState("");
  const [result, setResult] = useState<number | null>(null);

  const calculate = () => {
    const I = parseFloat(ionicStrength);
    const z = parseFloat(charge);
    
    if (I > 0 && z !== 0) {
      // Debye-Hückel limiting law: log(γ) = -A * z² * √I
      // A ≈ 0.509 for water at 25°C
      const A = 0.509;
      const logGamma = -A * z * z * Math.sqrt(I);
      const gamma = Math.pow(10, logGamma);
      setResult(gamma);
    } else {
      setResult(null);
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Activity Coefficient Calculator</CardTitle>
        <CardDescription>
          Calculate activity coefficients using Debye-Hückel limiting law.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <Label htmlFor="ionicStrength">Ionic Strength (mol/L)</Label>
            <Input
              id="ionicStrength"
              type="number"
              value={ionicStrength}
              onChange={(e) => setIonicStrength(e.target.value)}
              placeholder="Enter ionic strength"
              className="mt-2"
            />
          </div>
          <div>
            <Label htmlFor="charge">Ion Charge (z)</Label>
            <Input
              id="charge"
              type="number"
              value={charge}
              onChange={(e) => setCharge(e.target.value)}
              placeholder="Enter charge (e.g., 1, 2, -1)"
              className="mt-2"
            />
          </div>
          <Button onClick={calculate} className="w-full">
            Calculate
          </Button>
          {result !== null && (
            <div className="mt-6 bg-muted p-4 rounded-lg">
              <div className="flex justify-between">
                <span>Activity Coefficient (γ):</span>
                <span className="font-bold">{result.toFixed(4)}</span>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Note: This uses the Debye-Hückel limiting law, valid for dilute solutions (I &lt; 0.1 M)
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

