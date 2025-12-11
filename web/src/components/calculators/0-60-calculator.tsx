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

export function ZeroToSixtyCalculator() {
  const [distance, setDistance] = useState("");
  const [time, setTime] = useState("");
  const [result, setResult] = useState<{
    speed: number;
    acceleration: number;
  } | null>(null);

  const calculate = () => {
    const d = parseFloat(distance); // Distance in feet
    const t = parseFloat(time); // Time in seconds
    
    if (d > 0 && t > 0) {
      // Convert distance from feet to meters
      const distanceMeters = d * 0.3048;
      // Calculate average velocity: v = d/t
      const avgVelocity = distanceMeters / t; // m/s
      // For 0-60 mph: final velocity = 60 mph = 26.8224 m/s
      // Using v² = u² + 2as, where u=0: a = v²/(2s)
      // Or using v = at: a = v/t
      const finalVelocity = 26.8224; // 60 mph in m/s
      const acceleration = (2 * distanceMeters) / (t * t); // m/s²
      const speed = avgVelocity * 2.237; // Convert to mph
      
      setResult({
        speed: speed,
        acceleration: acceleration,
      });
    } else {
      setResult(null);
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>0-60 Calculator</CardTitle>
        <CardDescription>
          Calculate 0-60 mph acceleration time and performance metrics.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <Label htmlFor="distance">Distance Traveled (feet)</Label>
            <Input
              id="distance"
              type="number"
              value={distance}
              onChange={(e) => setDistance(e.target.value)}
              placeholder="Enter distance in feet"
              className="mt-2"
            />
          </div>
          <div>
            <Label htmlFor="time">Time (seconds)</Label>
            <Input
              id="time"
              type="number"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              placeholder="Enter time in seconds"
              className="mt-2"
            />
          </div>
          <Button onClick={calculate} className="w-full">
            Calculate
          </Button>
          {result && (
            <div className="mt-6 bg-muted p-4 rounded-lg space-y-2">
              <div className="flex justify-between">
                <span>Average Speed:</span>
                <span className="font-bold">{result.speed.toFixed(2)} mph</span>
              </div>
              <div className="flex justify-between">
                <span>Acceleration:</span>
                <span className="font-bold">{result.acceleration.toFixed(2)} m/s²</span>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

