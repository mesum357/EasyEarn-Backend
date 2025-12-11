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

const CONVERSIONS: Record<string, number> = {
  "newton": 1,
  "kilonewton": 1000,
  "pound-force": 4.44822,
  "kilogram-force": 9.80665,
  "dyne": 0.00001,
};

export function ForceConverter() {
  const [value, setValue] = useState("");
  const [fromUnit, setFromUnit] = useState("newton");
  const [toUnit, setToUnit] = useState("pound-force");
  const [result, setResult] = useState<number | null>(null);

  const calculate = () => {
    const val = parseFloat(value);
    
    if (val > 0) {
      // Convert to Newtons first, then to target unit
      const newtons = val * CONVERSIONS[fromUnit];
      const converted = newtons / CONVERSIONS[toUnit];
      setResult(converted);
    } else {
      setResult(null);
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Force Converter</CardTitle>
        <CardDescription>
          Convert between different force units: Newtons, kilonewtons, pounds-force, kilograms-force, and dynes.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <Label htmlFor="value">Value</Label>
            <Input
              id="value"
              type="number"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="Enter value"
              className="mt-2"
            />
          </div>
          <div>
            <Label htmlFor="fromUnit">From Unit</Label>
            <Select value={fromUnit} onValueChange={setFromUnit}>
              <SelectTrigger className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newton">Newton (N)</SelectItem>
                <SelectItem value="kilonewton">Kilonewton (kN)</SelectItem>
                <SelectItem value="pound-force">Pound-force (lbf)</SelectItem>
                <SelectItem value="kilogram-force">Kilogram-force (kgf)</SelectItem>
                <SelectItem value="dyne">Dyne</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="toUnit">To Unit</Label>
            <Select value={toUnit} onValueChange={setToUnit}>
              <SelectTrigger className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newton">Newton (N)</SelectItem>
                <SelectItem value="kilonewton">Kilonewton (kN)</SelectItem>
                <SelectItem value="pound-force">Pound-force (lbf)</SelectItem>
                <SelectItem value="kilogram-force">Kilogram-force (kgf)</SelectItem>
                <SelectItem value="dyne">Dyne</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={calculate} className="w-full">
            Convert
          </Button>
          {result !== null && (
            <div className="mt-6 bg-muted p-4 rounded-lg">
              <div className="flex justify-between">
                <span>Result:</span>
                <span className="font-bold">{result.toFixed(6)} {toUnit === "newton" ? "N" : toUnit === "kilonewton" ? "kN" : toUnit === "pound-force" ? "lbf" : toUnit === "kilogram-force" ? "kgf" : "dyne"}</span>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

