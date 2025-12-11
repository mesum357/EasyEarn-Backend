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

export function ChemicalOxygenDemandCalculator() {
  const [volumeSample, setVolumeSample] = useState("");
  const [volumeTitrant, setVolumeTitrant] = useState("");
  const [normalityTitrant, setNormalityTitrant] = useState("");
  const [blankTitrant, setBlankTitrant] = useState("");
  const [result, setResult] = useState<number | null>(null);

  const calculate = () => {
    const V_sample = parseFloat(volumeSample) / 1000; // Convert mL to L
    const V_titrant = parseFloat(volumeTitrant) / 1000; // Convert mL to L
    const N = parseFloat(normalityTitrant);
    const V_blank = parseFloat(blankTitrant) / 1000; // Convert mL to L
    
    if (V_sample > 0 && V_titrant > 0 && N > 0) {
      // COD (mg/L) = [(V_blank - V_titrant) × N × 8000] / V_sample
      // 8000 = equivalent weight of oxygen (8 g/mol) × 1000 (mg/g)
      const COD = ((V_blank - V_titrant) * N * 8000) / V_sample;
      setResult(Math.max(0, COD)); // Ensure non-negative
    } else {
      setResult(null);
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Chemical Oxygen Demand Calculator</CardTitle>
        <CardDescription>
          Calculate chemical oxygen demand (COD) from titration data.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <Label htmlFor="volumeSample">Sample Volume (mL)</Label>
            <Input
              id="volumeSample"
              type="number"
              value={volumeSample}
              onChange={(e) => setVolumeSample(e.target.value)}
              placeholder="Enter sample volume"
              className="mt-2"
            />
          </div>
          <div>
            <Label htmlFor="volumeTitrant">Titrant Volume Used (mL)</Label>
            <Input
              id="volumeTitrant"
              type="number"
              value={volumeTitrant}
              onChange={(e) => setVolumeTitrant(e.target.value)}
              placeholder="Enter titrant volume used"
              className="mt-2"
            />
          </div>
          <div>
            <Label htmlFor="normalityTitrant">Titrant Normality (N)</Label>
            <Input
              id="normalityTitrant"
              type="number"
              value={normalityTitrant}
              onChange={(e) => setNormalityTitrant(e.target.value)}
              placeholder="Enter titrant normality"
              className="mt-2"
            />
          </div>
          <div>
            <Label htmlFor="blankTitrant">Blank Titrant Volume (mL)</Label>
            <Input
              id="blankTitrant"
              type="number"
              value={blankTitrant}
              onChange={(e) => setBlankTitrant(e.target.value)}
              placeholder="Enter blank titrant volume"
              className="mt-2"
            />
          </div>
          <Button onClick={calculate} className="w-full">
            Calculate
          </Button>
          {result !== null && (
            <div className="mt-6 bg-muted p-4 rounded-lg">
              <div className="flex justify-between">
                <span>Chemical Oxygen Demand (COD):</span>
                <span className="font-bold">{result.toFixed(2)} mg/L</span>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

