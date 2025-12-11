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

const R = 8.314; // Gas constant in J/(mol·K)

export function ActivationEnergyCalculator() {
  const [k1, setK1] = useState("");
  const [k2, setK2] = useState("");
  const [t1, setT1] = useState("");
  const [t2, setT2] = useState("");
  const [result, setResult] = useState<number | null>(null);

  const calculate = () => {
    const rate1 = parseFloat(k1);
    const rate2 = parseFloat(k2);
    const temp1 = parseFloat(t1);
    const temp2 = parseFloat(t2);
    
    if (rate1 > 0 && rate2 > 0 && temp1 > 0 && temp2 > 0 && temp1 !== temp2) {
      // Arrhenius equation: ln(k2/k1) = (Ea/R) * (1/T1 - 1/T2)
      // Solving for Ea: Ea = R * ln(k2/k1) / (1/T1 - 1/T2)
      const T1 = temp1 + 273.15; // Convert to Kelvin
      const T2 = temp2 + 273.15;
      const Ea = (R * Math.log(rate2 / rate1)) / ((1 / T1) - (1 / T2));
      setResult(Ea);
    } else {
      setResult(null);
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Activation Energy Calculator</CardTitle>
        <CardDescription>
          Calculate activation energy using the Arrhenius equation from rate constants at two temperatures.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <Label htmlFor="k1">Rate Constant at T₁ (k₁)</Label>
            <Input
              id="k1"
              type="number"
              value={k1}
              onChange={(e) => setK1(e.target.value)}
              placeholder="Enter rate constant"
              className="mt-2"
            />
          </div>
          <div>
            <Label htmlFor="t1">Temperature T₁ (°C)</Label>
            <Input
              id="t1"
              type="number"
              value={t1}
              onChange={(e) => setT1(e.target.value)}
              placeholder="Enter temperature"
              className="mt-2"
            />
          </div>
          <div>
            <Label htmlFor="k2">Rate Constant at T₂ (k₂)</Label>
            <Input
              id="k2"
              type="number"
              value={k2}
              onChange={(e) => setK2(e.target.value)}
              placeholder="Enter rate constant"
              className="mt-2"
            />
          </div>
          <div>
            <Label htmlFor="t2">Temperature T₂ (°C)</Label>
            <Input
              id="t2"
              type="number"
              value={t2}
              onChange={(e) => setT2(e.target.value)}
              placeholder="Enter temperature"
              className="mt-2"
            />
          </div>
          <Button onClick={calculate} className="w-full">
            Calculate
          </Button>
          {result !== null && (
            <div className="mt-6 bg-muted p-4 rounded-lg">
              <div className="flex justify-between">
                <span>Activation Energy (Ea):</span>
                <span className="font-bold">{(result / 1000).toFixed(2)} kJ/mol</span>
              </div>
              <div className="flex justify-between mt-2">
                <span>Activation Energy (Ea):</span>
                <span className="font-bold">{result.toFixed(2)} J/mol</span>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

