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
import { X, Plus } from "lucide-react";

export function StatisticsCalculator() {
  const [values, setValues] = useState<string[]>([""]);
  const [stats, setStats] = useState<{
    mean: number;
    median: number;
    mode: number | null;
    stdDev: number;
  } | null>(null);

  const handleInputChange = (index: number, value: string) => {
    const newValues = [...values];
    newValues[index] = value;
    setValues(newValues);
    setStats(null);
  };

  const addInput = () => {
    setValues([...values, ""]);
  };

  const removeInput = (index: number) => {
    if (values.length > 1) {
      setValues(values.filter((_, i) => i !== index));
    }
  };

  const calculateStats = () => {
    const numericValues = values
      .map((v) => parseFloat(v))
      .filter((v) => !isNaN(v))
      .sort((a, b) => a - b);

    if (numericValues.length > 0) {
      const mean = numericValues.reduce((a, b) => a + b, 0) / numericValues.length;
      const median =
        numericValues.length % 2 === 0
          ? (numericValues[numericValues.length / 2 - 1] + numericValues[numericValues.length / 2]) / 2
          : numericValues[Math.floor(numericValues.length / 2)];

      const variance =
        numericValues.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / numericValues.length;
      const stdDev = Math.sqrt(variance);

      // Simple mode calculation
      const frequency: { [key: number]: number } = {};
      numericValues.forEach((val) => {
        frequency[val] = (frequency[val] || 0) + 1;
      });
      const maxFreq = Math.max(...Object.values(frequency));
      const mode = maxFreq > 1 ? parseFloat(Object.keys(frequency).find((key) => frequency[parseFloat(key)] === maxFreq) || "0") : null;

      setStats({ mean, median, mode, stdDev });
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Statistics Calculator</CardTitle>
        <CardDescription>
          Calculate mean, median, mode, and standard deviation.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Label>Data Values</Label>
          <div className="space-y-2">
            {values.map((value, index) => (
              <div key={index} className="flex items-center gap-2">
                <Input
                  type="number"
                  placeholder={`Value ${index + 1}`}
                  value={value}
                  onChange={(e) => handleInputChange(index, e.target.value)}
                  className="flex-grow"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeInput(index)}
                  disabled={values.length <= 1}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
          <Button variant="outline" size="sm" onClick={addInput}>
            <Plus className="h-4 w-4 mr-2" />
            Add Value
          </Button>
          <Button onClick={calculateStats} className="w-full">
            Calculate Statistics
          </Button>
          {stats && (
            <div className="mt-6 bg-muted p-4 rounded-lg space-y-2">
              <div className="flex justify-between">
                <span>Mean:</span>
                <span className="font-bold">{stats.mean.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Median:</span>
                <span className="font-bold">{stats.median.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Mode:</span>
                <span className="font-bold">{stats.mode !== null ? stats.mode.toFixed(2) : "N/A"}</span>
              </div>
              <div className="flex justify-between">
                <span>Standard Deviation:</span>
                <span className="font-bold">{stats.stdDev.toFixed(2)}</span>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

