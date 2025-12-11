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

export function BinaryConverter() {
  const [value, setValue] = useState("");
  const [fromBase, setFromBase] = useState("binary");
  const [toBase, setToBase] = useState("decimal");
  const [result, setResult] = useState<string | null>(null);

  const parseNumber = (val: string, base: number): number => {
    if (base === 2) {
      return parseInt(val, 2);
    } else if (base === 8) {
      return parseInt(val, 8);
    } else if (base === 10) {
      return parseInt(val, 10);
    } else if (base === 16) {
      return parseInt(val, 16);
    }
    return 0;
  };

  const formatNumber = (num: number, base: number): string => {
    if (base === 2) {
      return num.toString(2);
    } else if (base === 8) {
      return num.toString(8);
    } else if (base === 10) {
      return num.toString(10);
    } else if (base === 16) {
      return num.toString(16).toUpperCase();
    }
    return "";
  };

  const getBaseNumber = (base: string): number => {
    switch (base) {
      case "binary": return 2;
      case "octal": return 8;
      case "decimal": return 10;
      case "hexadecimal": return 16;
      default: return 10;
    }
  };

  const calculate = () => {
    const fromBaseNum = getBaseNumber(fromBase);
    const toBaseNum = getBaseNumber(toBase);
    
    try {
      const num = parseNumber(value, fromBaseNum);
      if (!isNaN(num)) {
        const converted = formatNumber(num, toBaseNum);
        setResult(converted);
      } else {
        setResult(null);
      }
    } catch {
      setResult(null);
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Binary Converter</CardTitle>
        <CardDescription>
          Convert between binary, octal, decimal, and hexadecimal number systems.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <Label htmlFor="value">Value</Label>
            <Input
              id="value"
              type="text"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="Enter value"
              className="mt-2"
            />
          </div>
          <div>
            <Label htmlFor="fromBase">From Base</Label>
            <Select value={fromBase} onValueChange={setFromBase}>
              <SelectTrigger className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="binary">Binary (2)</SelectItem>
                <SelectItem value="octal">Octal (8)</SelectItem>
                <SelectItem value="decimal">Decimal (10)</SelectItem>
                <SelectItem value="hexadecimal">Hexadecimal (16)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="toBase">To Base</Label>
            <Select value={toBase} onValueChange={setToBase}>
              <SelectTrigger className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="binary">Binary (2)</SelectItem>
                <SelectItem value="octal">Octal (8)</SelectItem>
                <SelectItem value="decimal">Decimal (10)</SelectItem>
                <SelectItem value="hexadecimal">Hexadecimal (16)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={calculate} className="w-full">
            Convert
          </Button>
          {result && (
            <div className="mt-6 bg-muted p-4 rounded-lg">
              <div className="flex justify-between">
                <span>Result:</span>
                <span className="font-bold">{result}</span>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

