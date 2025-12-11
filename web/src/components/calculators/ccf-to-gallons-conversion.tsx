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

const GALLONS_PER_CCF = 748.052; // 1 CCF (100 cubic feet) = 748.052 gallons

export function CCFToGallonsConversion() {
  const [ccf, setCcf] = useState("");
  const [result, setResult] = useState<{
    gallons: number;
    liters: number;
    cubicFeet: number;
  } | null>(null);

  const calculate = () => {
    const ccfValue = parseFloat(ccf);
    
    if (ccfValue > 0) {
      const gallons = ccfValue * GALLONS_PER_CCF;
      const liters = gallons * 3.78541;
      const cubicFeet = ccfValue * 100;
      
      setResult({
        gallons: gallons,
        liters: liters,
        cubicFeet: cubicFeet,
      });
    } else {
      setResult(null);
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>CCF to Gallons Conversion</CardTitle>
        <CardDescription>
          Convert CCF (hundred cubic feet) to gallons and other volume units.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <Label htmlFor="ccf">CCF (Hundred Cubic Feet)</Label>
            <Input
              id="ccf"
              type="number"
              value={ccf}
              onChange={(e) => setCcf(e.target.value)}
              placeholder="Enter CCF value"
              className="mt-2"
            />
          </div>
          <Button onClick={calculate} className="w-full">
            Convert
          </Button>
          {result && (
            <div className="mt-6 bg-muted p-4 rounded-lg space-y-2">
              <div className="flex justify-between">
                <span>Gallons:</span>
                <span className="font-bold">{result.gallons.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Liters:</span>
                <span className="font-bold">{result.liters.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Cubic Feet:</span>
                <span className="font-bold">{result.cubicFeet.toFixed(2)}</span>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

