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

export function BoilingPointCalculator() {
  const [normalBP, setNormalBP] = useState("");
  const [normalPressure, setNormalPressure] = useState("101.325");
  const [newPressure, setNewPressure] = useState("");
  const [enthalpy, setEnthalpy] = useState("");
  const [result, setResult] = useState<number | null>(null);

  const calculate = () => {
    const T1 = parseFloat(normalBP) + 273.15; // Convert to Kelvin
    const P1 = parseFloat(normalPressure);
    const P2 = parseFloat(newPressure);
    const deltaH = parseFloat(enthalpy) * 1000; // Convert kJ to J
    
    if (T1 > 0 && P1 > 0 && P2 > 0 && deltaH > 0) {
      // Clausius-Clapeyron equation: ln(P2/P1) = (ΔH/R) * (1/T1 - 1/T2)
      // Solving for T2: 1/T2 = 1/T1 - (R/ΔH) * ln(P2/P1)
      const T2 = 1 / ((1 / T1) - ((R / deltaH) * Math.log(P2 / P1)));
      setResult(T2 - 273.15); // Convert back to Celsius
    } else {
      setResult(null);
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Boiling Point Calculator</CardTitle>
        <CardDescription>
          Calculate boiling point at different pressures using the Clausius-Clapeyron equation.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <Label htmlFor="normalBP">Normal Boiling Point (°C)</Label>
            <Input
              id="normalBP"
              type="number"
              value={normalBP}
              onChange={(e) => setNormalBP(e.target.value)}
              placeholder="Enter normal boiling point (e.g., 100 for water)"
              className="mt-2"
            />
          </div>
          <div>
            <Label htmlFor="normalPressure">Normal Pressure (kPa)</Label>
            <Input
              id="normalPressure"
              type="number"
              value={normalPressure}
              onChange={(e) => setNormalPressure(e.target.value)}
              placeholder="101.325 (standard atmospheric pressure)"
              className="mt-2"
            />
          </div>
          <div>
            <Label htmlFor="newPressure">New Pressure (kPa)</Label>
            <Input
              id="newPressure"
              type="number"
              value={newPressure}
              onChange={(e) => setNewPressure(e.target.value)}
              placeholder="Enter new pressure"
              className="mt-2"
            />
          </div>
          <div>
            <Label htmlFor="enthalpy">Enthalpy of Vaporization (kJ/mol)</Label>
            <Input
              id="enthalpy"
              type="number"
              value={enthalpy}
              onChange={(e) => setEnthalpy(e.target.value)}
              placeholder="Enter ΔHvap (e.g., 40.7 for water)"
              className="mt-2"
            />
          </div>
          <Button onClick={calculate} className="w-full">
            Calculate
          </Button>
          {result !== null && (
            <div className="mt-6 bg-muted p-4 rounded-lg">
              <div className="flex justify-between">
                <span>Boiling Point at New Pressure:</span>
                <span className="font-bold">{result.toFixed(2)} °C</span>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

