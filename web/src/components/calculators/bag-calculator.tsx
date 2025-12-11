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

export function BagCalculator() {
  const [bagType, setBagType] = useState("tote");
  const [width, setWidth] = useState("");
  const [height, setHeight] = useState("");
  const [depth, setDepth] = useState("");
  const [result, setResult] = useState<{
    volume: number;
    fabric: number;
  } | null>(null);

  const calculate = () => {
    const w = parseFloat(width);
    const h = parseFloat(height);
    const d = parseFloat(depth) || 0;
    
    if (w > 0 && h > 0) {
      // Calculate volume in cubic inches
      const volume = w * h * (d || 1);
      // Calculate fabric needed (simplified: 2 sides + bottom + handles)
      // For a simple bag: 2 × (width × height) + (width × depth) + handles
      const fabricSqInches = (2 * w * h) + (w * (d || 1)) + (w * 2); // Add handle allowance
      const fabricSqYards = fabricSqInches / 1296; // Convert to square yards
      
      setResult({
        volume: volume,
        fabric: fabricSqYards,
      });
    } else {
      setResult(null);
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Bag Calculator</CardTitle>
        <CardDescription>
          Calculate bag dimensions and fabric requirements for sewing projects.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <Label htmlFor="bagType">Bag Type</Label>
            <Select value={bagType} onValueChange={setBagType}>
              <SelectTrigger className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tote">Tote Bag</SelectItem>
                <SelectItem value="backpack">Backpack</SelectItem>
                <SelectItem value="messenger">Messenger Bag</SelectItem>
                <SelectItem value="handbag">Handbag</SelectItem>
              </SelectContent>
            </Select>
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
            <Label htmlFor="height">Height (inches)</Label>
            <Input
              id="height"
              type="number"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              placeholder="Enter height"
              className="mt-2"
            />
          </div>
          <div>
            <Label htmlFor="depth">Depth (inches) - Optional</Label>
            <Input
              id="depth"
              type="number"
              value={depth}
              onChange={(e) => setDepth(e.target.value)}
              placeholder="Enter depth (optional)"
              className="mt-2"
            />
          </div>
          <Button onClick={calculate} className="w-full">
            Calculate
          </Button>
          {result && (
            <div className="mt-6 bg-muted p-4 rounded-lg space-y-2">
              <div className="flex justify-between">
                <span>Volume:</span>
                <span className="font-bold">{result.volume.toFixed(2)} cubic inches</span>
              </div>
              <div className="flex justify-between">
                <span>Fabric Needed:</span>
                <span className="font-bold">{result.fabric.toFixed(3)} square yards</span>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

