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

const kB = 1.380649e-23; // Boltzmann constant in J/K
const PI = Math.PI;

export function DiffusionCoefficientCalculator() {
  const [temperature, setTemperature] = useState("");
  const [viscosity, setViscosity] = useState("");
  const [radius, setRadius] = useState("");
  const [result, setResult] = useState<number | null>(null);

  const calculate = () => {
    const T = parseFloat(temperature) + 273.15; // Convert to Kelvin
    const eta = parseFloat(viscosity) * 0.001; // Convert mPa·s to Pa·s
    const r = parseFloat(radius) * 1e-9; // Convert nm to m
    
    if (T > 0 && eta > 0 && r > 0) {
      // Stokes-Einstein equation: D = kT / (6πηr)
      const D = (kB * T) / (6 * PI * eta * r);
      setResult(D * 1e10); // Convert to cm²/s (multiply by 1e10)
    } else {
      setResult(null);
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Diffusion Coefficient Calculator</CardTitle>
        <CardDescription>
          Calculate diffusion coefficients using the Stokes-Einstein equation.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <Label htmlFor="temperature">Temperature (°C)</Label>
            <Input
              id="temperature"
              type="number"
              value={temperature}
              onChange={(e) => setTemperature(e.target.value)}
              placeholder="Enter temperature (e.g., 25)"
              className="mt-2"
            />
          </div>
          <div>
            <Label htmlFor="viscosity">Solvent Viscosity (mPa·s)</Label>
            <Input
              id="viscosity"
              type="number"
              value={viscosity}
              onChange={(e) => setViscosity(e.target.value)}
              placeholder="Enter viscosity (e.g., 0.89 for water at 25°C)"
              className="mt-2"
            />
          </div>
          <div>
            <Label htmlFor="radius">Particle Radius (nm)</Label>
            <Input
              id="radius"
              type="number"
              value={radius}
              onChange={(e) => setRadius(e.target.value)}
              placeholder="Enter particle radius in nanometers"
              className="mt-2"
            />
          </div>
          <Button onClick={calculate} className="w-full">
            Calculate
          </Button>
          {result !== null && (
            <div className="mt-6 bg-muted p-4 rounded-lg">
              <div className="flex justify-between">
                <span>Diffusion Coefficient (D):</span>
                <span className="font-bold">{result.toExponential(4)} cm²/s</span>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Note: This uses the Stokes-Einstein equation, valid for spherical particles in dilute solutions.
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

