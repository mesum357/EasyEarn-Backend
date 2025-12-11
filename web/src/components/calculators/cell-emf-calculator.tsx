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

const F = 96485; // Faraday constant in C/mol
const R = 8.314; // Gas constant in J/(mol·K)
const T = 298.15; // Standard temperature in Kelvin (25°C)

export function CellEMFCalculator() {
  const [e0Cathode, setE0Cathode] = useState("");
  const [e0Anode, setE0Anode] = useState("");
  const [n, setN] = useState("");
  const [q, setQ] = useState("");
  const [result, setResult] = useState<number | null>(null);

  const calculate = () => {
    const E0cat = parseFloat(e0Cathode);
    const E0an = parseFloat(e0Anode);
    const electrons = parseFloat(n);
    const reactionQuotient = parseFloat(q) || 1; // Default to 1 if not provided
    
    if (!isNaN(E0cat) && !isNaN(E0an) && electrons > 0) {
      // E = E° - (RT/nF) * ln(Q)
      // E° = E°cathode - E°anode
      const E0 = E0cat - E0an;
      const E = E0 - ((R * T) / (electrons * F)) * Math.log(reactionQuotient);
      setResult(E);
    } else {
      setResult(null);
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Cell EMF Calculator – Electromotive Force of a Cell</CardTitle>
        <CardDescription>
          Calculate the electromotive force (EMF) using the Nernst equation.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <Label htmlFor="e0Cathode">Standard Reduction Potential - Cathode (V)</Label>
            <Input
              id="e0Cathode"
              type="number"
              value={e0Cathode}
              onChange={(e) => setE0Cathode(e.target.value)}
              placeholder="Enter E°cathode (e.g., 0.34 for Cu²⁺/Cu)"
              className="mt-2"
            />
          </div>
          <div>
            <Label htmlFor="e0Anode">Standard Reduction Potential - Anode (V)</Label>
            <Input
              id="e0Anode"
              type="number"
              value={e0Anode}
              onChange={(e) => setE0Anode(e.target.value)}
              placeholder="Enter E°anode (e.g., -0.76 for Zn²⁺/Zn)"
              className="mt-2"
            />
          </div>
          <div>
            <Label htmlFor="n">Number of Electrons Transferred</Label>
            <Input
              id="n"
              type="number"
              value={n}
              onChange={(e) => setN(e.target.value)}
              placeholder="Enter number of electrons (e.g., 2)"
              className="mt-2"
            />
          </div>
          <div>
            <Label htmlFor="q">Reaction Quotient (Q) - Optional</Label>
            <Input
              id="q"
              type="number"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Enter Q (default: 1 for standard conditions)"
              className="mt-2"
            />
          </div>
          <Button onClick={calculate} className="w-full">
            Calculate
          </Button>
          {result !== null && (
            <div className="mt-6 bg-muted p-4 rounded-lg space-y-2">
              <div className="flex justify-between">
                <span>Cell EMF (E):</span>
                <span className="font-bold">{result.toFixed(3)} V</span>
              </div>
              <div className="flex justify-between">
                <span>Standard Cell Potential (E°):</span>
                <span className="font-bold">{(parseFloat(e0Cathode) - parseFloat(e0Anode)).toFixed(3)} V</span>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

