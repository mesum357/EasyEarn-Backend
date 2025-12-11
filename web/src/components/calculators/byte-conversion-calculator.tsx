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

const BYTE_UNITS: Record<string, number> = {
  "bytes": 1,
  "kilobytes": 1024,
  "megabytes": 1024 * 1024,
  "gigabytes": 1024 * 1024 * 1024,
  "terabytes": 1024 * 1024 * 1024 * 1024,
  "petabytes": 1024 * 1024 * 1024 * 1024 * 1024,
};

export function ByteConversionCalculator() {
  const [value, setValue] = useState("");
  const [fromUnit, setFromUnit] = useState("bytes");
  const [toUnit, setToUnit] = useState("kilobytes");
  const [result, setResult] = useState<number | null>(null);

  const calculate = () => {
    const val = parseFloat(value);
    
    if (val > 0) {
      // Convert to bytes first
      const bytes = val * BYTE_UNITS[fromUnit];
      // Convert to target unit
      const converted = bytes / BYTE_UNITS[toUnit];
      setResult(converted);
    } else {
      setResult(null);
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Byte Conversion Calculator</CardTitle>
        <CardDescription>
          Convert between bytes, kilobytes, megabytes, gigabytes, terabytes, and petabytes.
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
                <SelectItem value="bytes">Bytes</SelectItem>
                <SelectItem value="kilobytes">Kilobytes (KB)</SelectItem>
                <SelectItem value="megabytes">Megabytes (MB)</SelectItem>
                <SelectItem value="gigabytes">Gigabytes (GB)</SelectItem>
                <SelectItem value="terabytes">Terabytes (TB)</SelectItem>
                <SelectItem value="petabytes">Petabytes (PB)</SelectItem>
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
                <SelectItem value="bytes">Bytes</SelectItem>
                <SelectItem value="kilobytes">Kilobytes (KB)</SelectItem>
                <SelectItem value="megabytes">Megabytes (MB)</SelectItem>
                <SelectItem value="gigabytes">Gigabytes (GB)</SelectItem>
                <SelectItem value="terabytes">Terabytes (TB)</SelectItem>
                <SelectItem value="petabytes">Petabytes (PB)</SelectItem>
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
                <span className="font-bold">{result.toFixed(6)} {toUnit === "bytes" ? "bytes" : toUnit === "kilobytes" ? "KB" : toUnit === "megabytes" ? "MB" : toUnit === "gigabytes" ? "GB" : toUnit === "terabytes" ? "TB" : "PB"}</span>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

