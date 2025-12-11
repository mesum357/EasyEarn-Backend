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

export function ProgrammingCalculator() {
  const [input, setInput] = useState("");
  const [fromBase, setFromBase] = useState("decimal");
  const [toBase, setToBase] = useState("binary");
  const [result, setResult] = useState<string | null>(null);

  const convert = () => {
    try {
      let decimal: number;
      
      // Convert to decimal first
      if (fromBase === "decimal") {
        decimal = parseInt(input, 10);
      } else if (fromBase === "binary") {
        decimal = parseInt(input, 2);
      } else if (fromBase === "hex") {
        decimal = parseInt(input, 16);
      } else {
        decimal = parseInt(input, 8);
      }

      // Convert from decimal to target base
      if (toBase === "decimal") {
        setResult(decimal.toString());
      } else if (toBase === "binary") {
        setResult(decimal.toString(2));
      } else if (toBase === "hex") {
        setResult(decimal.toString(16).toUpperCase());
      } else {
        setResult(decimal.toString(8));
      }
    } catch (error) {
      setResult("Invalid input");
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Programming Calculator</CardTitle>
        <CardDescription>
          Convert between decimal, binary, hexadecimal, and octal number systems.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <Label htmlFor="input">Number</Label>
            <Input
              id="input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Enter number"
              className="mt-2"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>From Base</Label>
              <Select value={fromBase} onValueChange={setFromBase}>
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="decimal">Decimal</SelectItem>
                  <SelectItem value="binary">Binary</SelectItem>
                  <SelectItem value="hex">Hexadecimal</SelectItem>
                  <SelectItem value="octal">Octal</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>To Base</Label>
              <Select value={toBase} onValueChange={setToBase}>
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="decimal">Decimal</SelectItem>
                  <SelectItem value="binary">Binary</SelectItem>
                  <SelectItem value="hex">Hexadecimal</SelectItem>
                  <SelectItem value="octal">Octal</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button onClick={convert} className="w-full">
            Convert
          </Button>
          {result && (
            <div className="mt-6 bg-muted p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">Result</h3>
              <p className="text-2xl font-bold text-primary font-mono">{result}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

