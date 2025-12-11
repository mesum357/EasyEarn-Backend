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

export function AudiobookSpeedCalculator() {
  const [bookLength, setBookLength] = useState("");
  const [playbackSpeed, setPlaybackSpeed] = useState("1.0");
  const [result, setResult] = useState<{
    actualTime: number;
    timeSaved: number;
  } | null>(null);

  const calculate = () => {
    const length = parseFloat(bookLength); // Length in hours
    const speed = parseFloat(playbackSpeed);
    
    if (length > 0 && speed > 0) {
      const actualTime = length / speed;
      const timeSaved = length - actualTime;
      
      setResult({
        actualTime: actualTime,
        timeSaved: timeSaved,
      });
    } else {
      setResult(null);
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Audiobook Speed Calculator</CardTitle>
        <CardDescription>
          Calculate actual listening time when using different playback speeds.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <Label htmlFor="bookLength">Book Length (hours)</Label>
            <Input
              id="bookLength"
              type="number"
              value={bookLength}
              onChange={(e) => setBookLength(e.target.value)}
              placeholder="Enter book length in hours"
              className="mt-2"
            />
          </div>
          <div>
            <Label htmlFor="playbackSpeed">Playback Speed (1.0 = normal, 1.5 = 1.5x, etc.)</Label>
            <Input
              id="playbackSpeed"
              type="number"
              value={playbackSpeed}
              onChange={(e) => setPlaybackSpeed(e.target.value)}
              placeholder="Enter playback speed"
              className="mt-2"
            />
          </div>
          <Button onClick={calculate} className="w-full">
            Calculate
          </Button>
          {result && (
            <div className="mt-6 bg-muted p-4 rounded-lg space-y-2">
              <div className="flex justify-between">
                <span>Actual Listening Time:</span>
                <span className="font-bold">{result.actualTime.toFixed(2)} hours</span>
              </div>
              <div className="flex justify-between">
                <span>Time Saved:</span>
                <span className="font-bold">{result.timeSaved.toFixed(2)} hours</span>
              </div>
              <div className="flex justify-between">
                <span>Time Saved:</span>
                <span className="font-bold">{Math.floor(result.timeSaved * 60)} minutes</span>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

