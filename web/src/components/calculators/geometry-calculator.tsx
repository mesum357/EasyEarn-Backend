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

export function GeometryCalculator() {
  const [shape, setShape] = useState("circle");
  const [radius, setRadius] = useState("");
  const [length, setLength] = useState("");
  const [width, setWidth] = useState("");
  const [result, setResult] = useState<{ area: number; perimeter: number } | null>(null);

  const calculate = () => {
    if (shape === "circle") {
      const r = parseFloat(radius);
      if (r > 0) {
        setResult({
          area: Math.PI * r * r,
          perimeter: 2 * Math.PI * r,
        });
      }
    } else if (shape === "rectangle") {
      const l = parseFloat(length);
      const w = parseFloat(width);
      if (l > 0 && w > 0) {
        setResult({
          area: l * w,
          perimeter: 2 * (l + w),
        });
      }
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Geometry Calculator</CardTitle>
        <CardDescription>
          Calculate area, perimeter, and volume of various shapes.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <Label>Shape</Label>
            <Select value={shape} onValueChange={setShape}>
              <SelectTrigger className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="circle">Circle</SelectItem>
                <SelectItem value="rectangle">Rectangle</SelectItem>
                <SelectItem value="triangle">Triangle</SelectItem>
                <SelectItem value="square">Square</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {shape === "circle" && (
            <div>
              <Label htmlFor="radius">Radius</Label>
              <Input
                id="radius"
                type="number"
                value={radius}
                onChange={(e) => setRadius(e.target.value)}
                className="mt-2"
              />
            </div>
          )}
          {shape === "rectangle" && (
            <>
              <div>
                <Label htmlFor="length">Length</Label>
                <Input
                  id="length"
                  type="number"
                  value={length}
                  onChange={(e) => setLength(e.target.value)}
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="width">Width</Label>
                <Input
                  id="width"
                  type="number"
                  value={width}
                  onChange={(e) => setWidth(e.target.value)}
                  className="mt-2"
                />
              </div>
            </>
          )}
          <Button onClick={calculate} className="w-full">
            Calculate
          </Button>
          {result && (
            <div className="mt-6 bg-muted p-4 rounded-lg space-y-2">
              <div className="flex justify-between">
                <span>Area:</span>
                <span className="font-bold">{result.area.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Perimeter:</span>
                <span className="font-bold">{result.perimeter.toFixed(2)}</span>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

