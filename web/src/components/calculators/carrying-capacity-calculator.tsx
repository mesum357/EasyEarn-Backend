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

export function CarryingCapacityCalculator() {
  const [area, setArea] = useState("");
  const [resourceAvailability, setResourceAvailability] = useState("");
  const [resourceConsumption, setResourceConsumption] = useState("");
  const [result, setResult] = useState<number | null>(null);

  const calculate = () => {
    const A = parseFloat(area); // Area in square kilometers
    const R = parseFloat(resourceAvailability); // Resource availability per unit area
    const C = parseFloat(resourceConsumption); // Resource consumption per individual
    
    if (A > 0 && R > 0 && C > 0) {
      // Carrying capacity = (Area × Resource Availability) / Resource Consumption per Individual
      const capacity = (A * R) / C;
      setResult(capacity);
    } else {
      setResult(null);
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Carrying Capacity Calculator</CardTitle>
        <CardDescription>
          Calculate the maximum population size that an environment can sustain based on resource availability and consumption.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <Label htmlFor="area">Area (square kilometers)</Label>
            <Input
              id="area"
              type="number"
              value={area}
              onChange={(e) => setArea(e.target.value)}
              placeholder="Enter area"
              className="mt-2"
            />
          </div>
          <div>
            <Label htmlFor="resourceAvailability">Resource Availability (units/km²)</Label>
            <Input
              id="resourceAvailability"
              type="number"
              value={resourceAvailability}
              onChange={(e) => setResourceAvailability(e.target.value)}
              placeholder="Enter resource availability per km²"
              className="mt-2"
            />
          </div>
          <div>
            <Label htmlFor="resourceConsumption">Resource Consumption per Individual (units/person)</Label>
            <Input
              id="resourceConsumption"
              type="number"
              value={resourceConsumption}
              onChange={(e) => setResourceConsumption(e.target.value)}
              placeholder="Enter consumption per person"
              className="mt-2"
            />
          </div>
          <Button onClick={calculate} className="w-full">
            Calculate
          </Button>
          {result !== null && (
            <div className="mt-6 bg-muted p-4 rounded-lg">
              <div className="flex justify-between">
                <span>Carrying Capacity:</span>
                <span className="font-bold">{result.toFixed(0)} individuals</span>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Formula: K = (A × R) / C (where K = carrying capacity, A = area, R = resource availability, C = consumption per individual)
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

