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

const ALUMINUM_DENSITY = 0.0975; // lb/in³ (pounds per cubic inch)

export function AluminumWeightCalculator() {
  const [shape, setShape] = useState("plate");
  const [length, setLength] = useState("");
  const [width, setWidth] = useState("");
  const [thickness, setThickness] = useState("");
  const [diameter, setDiameter] = useState("");
  const [result, setResult] = useState<number | null>(null);

  const calculate = () => {
    if (shape === "plate") {
      const l = parseFloat(length);
      const w = parseFloat(width);
      const t = parseFloat(thickness);
      
      if (l > 0 && w > 0 && t > 0) {
        const volume = l * w * t; // cubic inches
        const weight = volume * ALUMINUM_DENSITY;
        setResult(weight);
      } else {
        setResult(null);
      }
    } else if (shape === "round") {
      const d = parseFloat(diameter);
      const t = parseFloat(thickness);
      const l = parseFloat(length);
      
      if (d > 0 && t > 0 && l > 0) {
        const radius = d / 2;
        const volume = Math.PI * radius * radius * l; // cubic inches
        const weight = volume * ALUMINUM_DENSITY;
        setResult(weight);
      } else {
        setResult(null);
      }
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Aluminum Weight Calculator</CardTitle>
        <CardDescription>
          Calculate the weight of aluminum based on dimensions.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <Label htmlFor="shape">Shape</Label>
            <Select value={shape} onValueChange={setShape}>
              <SelectTrigger className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="plate">Plate/Sheet</SelectItem>
                <SelectItem value="round">Round Bar</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {shape === "plate" ? (
            <>
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
            </>
          ) : (
            <>
              <div>
                <Label htmlFor="diameter">Diameter (inches)</Label>
                <Input
                  id="diameter"
                  type="number"
                  value={diameter}
                  onChange={(e) => setDiameter(e.target.value)}
                  placeholder="Enter diameter"
                  className="mt-2"
                />
              </div>
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
            </>
          )}
          
          <Button onClick={calculate} className="w-full">
            Calculate
          </Button>
          {result !== null && (
            <div className="mt-6 bg-muted p-4 rounded-lg">
              <div className="flex justify-between">
                <span>Weight:</span>
                <span className="font-bold">{result.toFixed(2)} lbs</span>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

