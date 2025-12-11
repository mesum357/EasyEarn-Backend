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

export function BoardFootCalculator() {
  const [length, setLength] = useState("");
  const [width, setWidth] = useState("");
  const [thickness, setThickness] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [result, setResult] = useState<number | null>(null);

  const calculate = () => {
    const l = parseFloat(length);
    const w = parseFloat(width);
    const t = parseFloat(thickness);
    const qty = parseFloat(quantity) || 1;
    
    if (l > 0 && w > 0 && t > 0) {
      // Board foot = (length × width × thickness) / 12
      // All measurements in inches
      const boardFeet = (l * w * t * qty) / 12;
      setResult(boardFeet);
    } else {
      setResult(null);
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Board Foot Calculator</CardTitle>
        <CardDescription>
          Calculate board feet for lumber. Enter dimensions in inches.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <Label htmlFor="length">Length (inches)</Label>
            <Input
              id="length"
              type="number"
              value={length}
              onChange={(e) => setLength(e.target.value)}
              placeholder="Enter length"
              className="mt-2"
            />
          </div>
          <div>
            <Label htmlFor="width">Width (inches)</Label>
            <Input
              id="width"
              type="number"
              value={width}
              onChange={(e) => setWidth(e.target.value)}
              placeholder="Enter width"
              className="mt-2"
            />
          </div>
          <div>
            <Label htmlFor="thickness">Thickness (inches)</Label>
            <Input
              id="thickness"
              type="number"
              value={thickness}
              onChange={(e) => setThickness(e.target.value)}
              placeholder="Enter thickness"
              className="mt-2"
            />
          </div>
          <div>
            <Label htmlFor="quantity">Quantity</Label>
            <Input
              id="quantity"
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="Enter quantity"
              className="mt-2"
            />
          </div>
          <Button onClick={calculate} className="w-full">
            Calculate
          </Button>
          {result !== null && (
            <div className="mt-6 bg-muted p-4 rounded-lg">
              <div className="flex justify-between">
                <span>Board Feet:</span>
                <span className="font-bold">{result.toFixed(2)} bd ft</span>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

