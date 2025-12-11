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

export function BirdAgeCalculator() {
  const [humanYears, setHumanYears] = useState("");
  const [birdType, setBirdType] = useState("small");
  const [result, setResult] = useState<number | null>(null);

  const calculateBirdAge = () => {
    const years = parseFloat(humanYears);
    if (isNaN(years) || years <= 0) return;

    // Bird age conversion varies by size
    // Small birds (parakeets, canaries): 1 human year ≈ 5-6 bird years
    // Medium birds (cockatiels): 1 human year ≈ 4-5 bird years
    // Large birds (parrots): 1 human year ≈ 3-4 bird years
    let multiplier;
    switch (birdType) {
      case "small":
        multiplier = 5.5;
        break;
      case "medium":
        multiplier = 4.5;
        break;
      case "large":
        multiplier = 3.5;
        break;
      default:
        multiplier = 5;
    }

    const birdYears = years * multiplier;
    setResult(birdYears);
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Bird Age Calculator</CardTitle>
        <CardDescription>
          Convert your bird's age from human years to bird years based on bird size.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <Label htmlFor="humanYears">Bird's Age (Human Years)</Label>
            <Input
              id="humanYears"
              type="number"
              value={humanYears}
              onChange={(e) => setHumanYears(e.target.value)}
              placeholder="3"
              className="mt-2"
            />
          </div>
          <div>
            <Label>Bird Size</Label>
            <Select value={birdType} onValueChange={setBirdType}>
              <SelectTrigger className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="small">Small (Parakeets, Canaries)</SelectItem>
                <SelectItem value="medium">Medium (Cockatiels)</SelectItem>
                <SelectItem value="large">Large (Parrots, Macaws)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={calculateBirdAge} className="w-full">
            Calculate
          </Button>
          {result !== null && (
            <div className="mt-6 bg-muted p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">Result</h3>
              <p className="text-2xl font-bold text-primary">
                {result.toFixed(1)} bird years
              </p>
              <p className="text-sm text-muted-foreground mt-1">Equivalent age in bird years</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}



