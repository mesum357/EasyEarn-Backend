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

const DEGREES_TO_RADIANS = Math.PI / 180;
const RADIANS_TO_DEGREES = 180 / Math.PI;
const DEGREES_TO_GRADIANS = 10 / 9;
const GRADIANS_TO_DEGREES = 9 / 10;

export function AngleConversionCalculator() {
  const [value, setValue] = useState("");
  const [fromUnit, setFromUnit] = useState("degrees");
  const [toUnit, setToUnit] = useState("radians");
  const [result, setResult] = useState<number | null>(null);

  const calculate = () => {
    const val = parseFloat(value);
    
    if (!isNaN(val)) {
      let degrees = 0;
      
      // Convert to degrees first
      switch (fromUnit) {
        case "degrees":
          degrees = val;
          break;
        case "radians":
          degrees = val * RADIANS_TO_DEGREES;
          break;
        case "gradians":
          degrees = val * GRADIANS_TO_DEGREES;
          break;
      }
      
      // Convert to target unit
      let converted = 0;
      switch (toUnit) {
        case "degrees":
          converted = degrees;
          break;
        case "radians":
          converted = degrees * DEGREES_TO_RADIANS;
          break;
        case "gradians":
          converted = degrees * DEGREES_TO_GRADIANS;
          break;
      }
      
      setResult(converted);
    } else {
      setResult(null);
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Angle Conversion Calculator</CardTitle>
        <CardDescription>
          Convert between degrees, radians, and gradians.
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
                <SelectItem value="degrees">Degrees (°)</SelectItem>
                <SelectItem value="radians">Radians (rad)</SelectItem>
                <SelectItem value="gradians">Gradians (grad)</SelectItem>
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
                <SelectItem value="degrees">Degrees (°)</SelectItem>
                <SelectItem value="radians">Radians (rad)</SelectItem>
                <SelectItem value="gradians">Gradians (grad)</SelectItem>
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
                <span className="font-bold">{result.toFixed(6)} {toUnit === "degrees" ? "°" : toUnit === "radians" ? "rad" : "grad"}</span>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

