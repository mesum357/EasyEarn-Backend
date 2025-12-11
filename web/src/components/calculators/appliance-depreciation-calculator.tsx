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

export function ApplianceDepreciationCalculator() {
  const [purchasePrice, setPurchasePrice] = useState("");
  const [yearsOld, setYearsOld] = useState("");
  const [usefulLife, setUsefulLife] = useState("10");
  const [result, setResult] = useState<{
    currentValue: number;
    depreciation: number;
    depreciationRate: number;
  } | null>(null);

  const calculate = () => {
    const price = parseFloat(purchasePrice);
    const age = parseFloat(yearsOld);
    const life = parseFloat(usefulLife);
    
    if (price > 0 && age >= 0 && life > 0 && age <= life) {
      // Straight-line depreciation
      const annualDepreciation = price / life;
      const totalDepreciation = annualDepreciation * age;
      const currentValue = price - totalDepreciation;
      const depreciationRate = (totalDepreciation / price) * 100;
      
      setResult({
        currentValue: Math.max(0, currentValue),
        depreciation: totalDepreciation,
        depreciationRate: depreciationRate,
      });
    } else {
      setResult(null);
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Appliance Depreciation Calculator</CardTitle>
        <CardDescription>
          Calculate the current value and depreciation of appliances using straight-line depreciation.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <Label htmlFor="purchasePrice">Purchase Price ($)</Label>
            <Input
              id="purchasePrice"
              type="number"
              value={purchasePrice}
              onChange={(e) => setPurchasePrice(e.target.value)}
              placeholder="Enter purchase price"
              className="mt-2"
            />
          </div>
          <div>
            <Label htmlFor="yearsOld">Years Old</Label>
            <Input
              id="yearsOld"
              type="number"
              value={yearsOld}
              onChange={(e) => setYearsOld(e.target.value)}
              placeholder="Enter age in years"
              className="mt-2"
            />
          </div>
          <div>
            <Label htmlFor="usefulLife">Useful Life (years)</Label>
            <Input
              id="usefulLife"
              type="number"
              value={usefulLife}
              onChange={(e) => setUsefulLife(e.target.value)}
              placeholder="Enter expected useful life"
              className="mt-2"
            />
          </div>
          <Button onClick={calculate} className="w-full">
            Calculate
          </Button>
          {result && (
            <div className="mt-6 bg-muted p-4 rounded-lg space-y-2">
              <div className="flex justify-between">
                <span>Current Value:</span>
                <span className="font-bold">${result.currentValue.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Total Depreciation:</span>
                <span className="font-bold">${result.depreciation.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Depreciation Rate:</span>
                <span className="font-bold">{result.depreciationRate.toFixed(1)}%</span>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

