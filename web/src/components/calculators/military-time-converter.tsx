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

export function MilitaryTimeConverter() {
  const [time, setTime] = useState("");
  const [format, setFormat] = useState("12-hour");
  const [result, setResult] = useState<string | null>(null);

  const convertToMilitary = (time12: string): string => {
    const [timePart, period] = time12.split(/\s*(AM|PM)/i);
    const [hours, minutes] = timePart.split(':').map(Number);
    
    let militaryHours = hours;
    if (period?.toUpperCase() === 'PM' && hours !== 12) {
      militaryHours = hours + 12;
    } else if (period?.toUpperCase() === 'AM' && hours === 12) {
      militaryHours = 0;
    }
    
    return `${String(militaryHours).padStart(2, '0')}${String(minutes || 0).padStart(2, '0')}`;
  };

  const convertTo12Hour = (military: string): string => {
    const hours = parseInt(military.substring(0, 2));
    const minutes = parseInt(military.substring(2, 4));
    
    let period = 'AM';
    let displayHours = hours;
    
    if (hours === 0) {
      displayHours = 12;
    } else if (hours === 12) {
      period = 'PM';
    } else if (hours > 12) {
      displayHours = hours - 12;
      period = 'PM';
    }
    
    return `${displayHours}:${String(minutes).padStart(2, '0')} ${period}`;
  };

  const calculate = () => {
    if (format === "12-hour") {
      // Convert 12-hour to military
      const military = convertToMilitary(time);
      setResult(military);
    } else {
      // Convert military to 12-hour
      if (time.length === 4 && /^\d{4}$/.test(time)) {
        const standard = convertTo12Hour(time);
        setResult(standard);
      } else {
        setResult(null);
      }
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Military Time Converter</CardTitle>
        <CardDescription>
          Convert between 12-hour and 24-hour (military) time formats.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <Label htmlFor="format">Conversion Direction</Label>
            <Select value={format} onValueChange={setFormat}>
              <SelectTrigger className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="12-hour">12-Hour to Military</SelectItem>
                <SelectItem value="military">Military to 12-Hour</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="time">
              {format === "12-hour" ? "12-Hour Time (e.g., 2:30 PM)" : "Military Time (e.g., 1430)"}
            </Label>
            <Input
              id="time"
              type="text"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              placeholder={format === "12-hour" ? "Enter time (e.g., 2:30 PM)" : "Enter time (e.g., 1430)"}
              className="mt-2"
            />
          </div>
          <Button onClick={calculate} className="w-full">
            Convert
          </Button>
          {result && (
            <div className="mt-6 bg-muted p-4 rounded-lg">
              <div className="flex justify-between">
                <span>Result:</span>
                <span className="font-bold">{result}</span>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

