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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const E_STEEL = 29000000; // Modulus of elasticity for steel (psi)
const E_WOOD = 1600000; // Modulus of elasticity for wood (psi)

export function BeamDeflectionCalculator() {
  const [load, setLoad] = useState("");
  const [length, setLength] = useState("");
  const [material, setMaterial] = useState("steel");
  const [momentOfInertia, setMomentOfInertia] = useState("");
  const [result, setResult] = useState<number | null>(null);

  const calculate = () => {
    const P = parseFloat(load);
    const L = parseFloat(length);
    const I = parseFloat(momentOfInertia);
    const E = material === "steel" ? E_STEEL : E_WOOD;
    
    if (P > 0 && L > 0 && I > 0) {
      // Simple beam deflection: δ = (P × L³) / (48 × E × I)
      // For simply supported beam with point load at center
      const deflection = (P * Math.pow(L * 12, 3)) / (48 * E * I); // Convert feet to inches
      setResult(deflection);
    } else {
      setResult(null);
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Beam Deflection Calculator</CardTitle>
        <CardDescription>
          Calculate beam deflection for a simply supported beam with a point load at center.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <Label htmlFor="load">Point Load (lbs)</Label>
            <Input
              id="load"
              type="number"
              value={load}
              onChange={(e) => setLoad(e.target.value)}
              placeholder="Enter point load"
              className="mt-2"
            />
          </div>
          <div>
            <Label htmlFor="length">Beam Length (feet)</Label>
            <Input
              id="length"
              type="number"
              value={length}
              onChange={(e) => setLength(e.target.value)}
              placeholder="Enter beam length"
              className="mt-2"
            />
          </div>
          <div>
            <Label htmlFor="material">Material</Label>
            <Select value={material} onValueChange={setMaterial}>
              <SelectTrigger className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="steel">Steel</SelectItem>
                <SelectItem value="wood">Wood</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="momentOfInertia">Moment of Inertia (in⁴)</Label>
            <Input
              id="momentOfInertia"
              type="number"
              value={momentOfInertia}
              onChange={(e) => setMomentOfInertia(e.target.value)}
              placeholder="Enter moment of inertia"
              className="mt-2"
            />
          </div>
          <Button onClick={calculate} className="w-full">
            Calculate
          </Button>
          {result !== null && (
            <div className="mt-6 bg-muted p-4 rounded-lg">
              <div className="flex justify-between">
                <span>Maximum Deflection:</span>
                <span className="font-bold">{result.toFixed(4)} inches</span>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Formula: δ = (P × L³) / (48 × E × I)
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

