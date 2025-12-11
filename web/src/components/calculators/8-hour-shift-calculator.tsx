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

export function EightHourShiftCalculator() {
  const [startTime, setStartTime] = useState("");
  const [breakDuration, setBreakDuration] = useState("30");
  const [result, setResult] = useState<{
    endTime: string;
    totalHours: number;
    workHours: number;
  } | null>(null);

  const parseTime = (timeStr: string): number => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes; // Convert to minutes since midnight
  };

  const formatTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60) % 24;
    const mins = minutes % 60;
    return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
  };

  const calculate = () => {
    if (startTime.includes(':')) {
      const startMinutes = parseTime(startTime);
      const breakMins = parseFloat(breakDuration) || 0;
      // 8 hours = 480 minutes
      const workMinutes = 480;
      const endMinutes = startMinutes + workMinutes + breakMins;
      const totalMinutes = workMinutes + breakMins;
      
      setResult({
        endTime: formatTime(endMinutes),
        totalHours: totalMinutes / 60,
        workHours: workMinutes / 60,
      });
    } else {
      setResult(null);
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>8-Hour Shift Calculator</CardTitle>
        <CardDescription>
          Calculate end time and total hours for an 8-hour work shift.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <Label htmlFor="startTime">Start Time (HH:MM)</Label>
            <Input
              id="startTime"
              type="text"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              placeholder="Enter start time (e.g., 09:00)"
              className="mt-2"
            />
          </div>
          <div>
            <Label htmlFor="breakDuration">Break Duration (minutes)</Label>
            <Input
              id="breakDuration"
              type="number"
              value={breakDuration}
              onChange={(e) => setBreakDuration(e.target.value)}
              placeholder="Enter break duration (default: 30)"
              className="mt-2"
            />
          </div>
          <Button onClick={calculate} className="w-full">
            Calculate
          </Button>
          {result && (
            <div className="mt-6 bg-muted p-4 rounded-lg space-y-2">
              <div className="flex justify-between">
                <span>End Time:</span>
                <span className="font-bold">{result.endTime}</span>
              </div>
              <div className="flex justify-between">
                <span>Work Hours:</span>
                <span className="font-bold">{result.workHours.toFixed(2)} hours</span>
              </div>
              <div className="flex justify-between">
                <span>Total Time (with breaks):</span>
                <span className="font-bold">{result.totalHours.toFixed(2)} hours</span>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

