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

const ACRES_PER_SQ_FT = 1 / 43560;
const ACRES_PER_SQ_METER = 1 / 4046.86;
const ACRES_PER_HECTARE = 0.404686;

export function AcreageCalculator() {
  const [value, setValue] = useState("");
  const [fromUnit, setFromUnit] = useState("square-feet");
  const [result, setResult] = useState<{
    acres: number;
    hectares: number;
    squareFeet: number;
    squareMeters: number;
  } | null>(null);

  const calculate = () => {
    const val = parseFloat(value);
    
    if (val > 0) {
      let acres = 0;
      
      switch (fromUnit) {
        case "square-feet":
          acres = val * ACRES_PER_SQ_FT;
          break;
        case "square-meters":
          acres = val * ACRES_PER_SQ_METER;
          break;
        case "hectares":
          acres = val / ACRES_PER_HECTARE;
          break;
        case "acres":
          acres = val;
          break;
      }
      
      setResult({
        acres: acres,
        hectares: acres * ACRES_PER_HECTARE,
        squareFeet: acres / ACRES_PER_SQ_FT,
        squareMeters: acres / ACRES_PER_SQ_METER,
      });
    } else {
      setResult(null);
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Acreage Calculator</CardTitle>
        <CardDescription>
          Convert between acres, hectares, square feet, and square meters.
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
                <SelectItem value="square-feet">Square Feet</SelectItem>
                <SelectItem value="square-meters">Square Meters</SelectItem>
                <SelectItem value="hectares">Hectares</SelectItem>
                <SelectItem value="acres">Acres</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={calculate} className="w-full">
            Convert
          </Button>
          {result && (
            <div className="mt-6 bg-muted p-4 rounded-lg space-y-2">
              <div className="flex justify-between">
                <span>Acres:</span>
                <span className="font-bold">{result.acres.toFixed(6)}</span>
              </div>
              <div className="flex justify-between">
                <span>Hectares:</span>
                <span className="font-bold">{result.hectares.toFixed(6)}</span>
              </div>
              <div className="flex justify-between">
                <span>Square Feet:</span>
                <span className="font-bold">{result.squareFeet.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Square Meters:</span>
                <span className="font-bold">{result.squareMeters.toFixed(2)}</span>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

