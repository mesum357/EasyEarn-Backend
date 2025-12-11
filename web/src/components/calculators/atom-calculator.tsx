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

const AVOGADRO = 6.022e23; // Avogadro's number

export function AtomCalculator() {
  const [mass, setMass] = useState("");
  const [molarMass, setMolarMass] = useState("");
  const [result, setResult] = useState<{
    moles: number;
    atoms: number;
  } | null>(null);

  const calculate = () => {
    const m = parseFloat(mass);
    const MM = parseFloat(molarMass);
    
    if (m > 0 && MM > 0) {
      const moles = m / MM;
      const atoms = moles * AVOGADRO;
      setResult({
        moles: moles,
        atoms: atoms,
      });
    } else {
      setResult(null);
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Atom Calculator</CardTitle>
        <CardDescription>
          Calculate number of atoms, moles, and mass conversions.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <Label htmlFor="mass">Mass (grams)</Label>
            <Input
              id="mass"
              type="number"
              value={mass}
              onChange={(e) => setMass(e.target.value)}
              placeholder="Enter mass in grams"
              className="mt-2"
            />
          </div>
          <div>
            <Label htmlFor="molarMass">Molar Mass (g/mol)</Label>
            <Input
              id="molarMass"
              type="number"
              value={molarMass}
              onChange={(e) => setMolarMass(e.target.value)}
              placeholder="Enter molar mass (e.g., 18 for H₂O)"
              className="mt-2"
            />
          </div>
          <Button onClick={calculate} className="w-full">
            Calculate
          </Button>
          {result && (
            <div className="mt-6 bg-muted p-4 rounded-lg space-y-2">
              <div className="flex justify-between">
                <span>Number of Moles:</span>
                <span className="font-bold">{result.moles.toExponential(4)} mol</span>
              </div>
              <div className="flex justify-between">
                <span>Number of Atoms/Molecules:</span>
                <span className="font-bold">{result.atoms.toExponential(4)}</span>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

