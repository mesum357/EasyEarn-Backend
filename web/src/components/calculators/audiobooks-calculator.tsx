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

export function AudiobooksCalculator() {
  const [dailyCommute, setDailyCommute] = useState("");
  const [weeklyCommute, setWeeklyCommute] = useState("");
  const [result, setResult] = useState<{
    dailyHours: number;
    weeklyHours: number;
    monthlyHours: number;
    yearlyHours: number;
    booksPerYear: number;
  } | null>(null);

  const calculate = () => {
    const daily = parseFloat(dailyCommute) / 60; // Convert minutes to hours
    const weekly = parseFloat(weeklyCommute) || 5; // Days per week
    
    if (daily > 0 && weekly > 0) {
      const dailyHours = daily;
      const weeklyHours = daily * weekly;
      const monthlyHours = weeklyHours * 4.33; // Average weeks per month
      const yearlyHours = weeklyHours * 52;
      // Average audiobook length: 10 hours
      const avgBookLength = 10;
      const booksPerYear = yearlyHours / avgBookLength;
      
      setResult({
        dailyHours: dailyHours,
        weeklyHours: weeklyHours,
        monthlyHours: monthlyHours,
        yearlyHours: yearlyHours,
        booksPerYear: booksPerYear,
      });
    } else {
      setResult(null);
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Audiobooks Calculator - Reclaim the Dead Time</CardTitle>
        <CardDescription>
          Calculate how many audiobooks you can listen to during your commute or daily activities.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <Label htmlFor="dailyCommute">Daily Commute Time (minutes)</Label>
            <Input
              id="dailyCommute"
              type="number"
              value={dailyCommute}
              onChange={(e) => setDailyCommute(e.target.value)}
              placeholder="Enter daily commute time"
              className="mt-2"
            />
          </div>
          <div>
            <Label htmlFor="weeklyCommute">Days per Week</Label>
            <Input
              id="weeklyCommute"
              type="number"
              value={weeklyCommute}
              onChange={(e) => setWeeklyCommute(e.target.value)}
              placeholder="Enter days per week (default: 5)"
              className="mt-2"
            />
          </div>
          <Button onClick={calculate} className="w-full">
            Calculate
          </Button>
          {result && (
            <div className="mt-6 bg-muted p-4 rounded-lg space-y-2">
              <div className="flex justify-between">
                <span>Daily Listening Time:</span>
                <span className="font-bold">{result.dailyHours.toFixed(2)} hours</span>
              </div>
              <div className="flex justify-between">
                <span>Weekly Listening Time:</span>
                <span className="font-bold">{result.weeklyHours.toFixed(2)} hours</span>
              </div>
              <div className="flex justify-between">
                <span>Monthly Listening Time:</span>
                <span className="font-bold">{result.monthlyHours.toFixed(2)} hours</span>
              </div>
              <div className="flex justify-between">
                <span>Yearly Listening Time:</span>
                <span className="font-bold">{result.yearlyHours.toFixed(2)} hours</span>
              </div>
              <div className="flex justify-between pt-2 border-t">
                <span>Books Per Year (avg 10 hrs/book):</span>
                <span className="font-bold">{result.booksPerYear.toFixed(1)} books</span>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

