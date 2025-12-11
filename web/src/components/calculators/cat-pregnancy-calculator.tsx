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

export function CatPregnancyCalculator() {
  const [matingDate, setMatingDate] = useState("");
  const [result, setResult] = useState<{
    dueDate: string;
    daysRemaining: number;
    weeksRemaining: number;
  } | null>(null);

  const calculatePregnancy = () => {
    if (!matingDate) return;
    
    const mating = new Date(matingDate);
    const dueDate = new Date(mating);
    dueDate.setDate(dueDate.getDate() + 63); // Cat pregnancy is typically 63-65 days
    
    const today = new Date();
    const daysRemaining = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    const weeksRemaining = Math.floor(daysRemaining / 7);

    setResult({
      dueDate: dueDate.toLocaleDateString(),
      daysRemaining,
      weeksRemaining,
    });
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Cat Pregnancy Calculator</CardTitle>
        <CardDescription>
          Estimate your cat's due date and track pregnancy progress.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <Label htmlFor="matingDate">Mating Date</Label>
            <Input
              id="matingDate"
              type="date"
              value={matingDate}
              onChange={(e) => setMatingDate(e.target.value)}
              className="mt-2"
            />
          </div>
          <Button onClick={calculatePregnancy} className="w-full">
            Calculate
          </Button>
          {result && (
            <div className="mt-6 bg-muted p-4 rounded-lg space-y-2">
              <div className="flex justify-between">
                <span>Expected Due Date:</span>
                <span className="font-bold">{result.dueDate}</span>
              </div>
              <div className="flex justify-between">
                <span>Days Remaining:</span>
                <span className="font-bold">{result.daysRemaining} days</span>
              </div>
              <div className="flex justify-between">
                <span>Weeks Remaining:</span>
                <span className="font-bold">{result.weeksRemaining} weeks</span>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Note: Cat pregnancy typically lasts 63-65 days from mating.
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}



