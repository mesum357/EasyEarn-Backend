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

export function BillionToTrillionConverter() {
  const [value, setValue] = useState("");
  const [fromUnit, setFromUnit] = useState("billion");
  const [toUnit, setToUnit] = useState("trillion");
  const [result, setResult] = useState<number | null>(null);

  const calculate = () => {
    const val = parseFloat(value);
    
    if (val > 0) {
      let billions = 0;
      
      // Convert to billions first
      if (fromUnit === "billion") {
        billions = val;
      } else if (fromUnit === "trillion") {
        billions = val * 1000;
      } else if (fromUnit === "million") {
        billions = val / 1000;
      } else if (fromUnit === "thousand") {
        billions = val / 1000000;
      }
      
      // Convert to target unit
      let converted = 0;
      if (toUnit === "billion") {
        converted = billions;
      } else if (toUnit === "trillion") {
        converted = billions / 1000;
      } else if (toUnit === "million") {
        converted = billions * 1000;
      } else if (toUnit === "thousand") {
        converted = billions * 1000000;
      }
      
      setResult(converted);
    } else {
      setResult(null);
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Billion to Trillion Converter</CardTitle>
        <CardDescription>
          Convert between large number units: thousands, millions, billions, and trillions.
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
                <SelectItem value="thousand">Thousand</SelectItem>
                <SelectItem value="million">Million</SelectItem>
                <SelectItem value="billion">Billion</SelectItem>
                <SelectItem value="trillion">Trillion</SelectItem>
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
                <SelectItem value="thousand">Thousand</SelectItem>
                <SelectItem value="million">Million</SelectItem>
                <SelectItem value="billion">Billion</SelectItem>
                <SelectItem value="trillion">Trillion</SelectItem>
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
                <span className="font-bold">{result.toFixed(6)} {toUnit}</span>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

