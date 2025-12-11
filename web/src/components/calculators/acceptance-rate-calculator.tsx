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

export function AcceptanceRateCalculator() {
  const [accepted, setAccepted] = useState("");
  const [total, setTotal] = useState("");
  const [result, setResult] = useState<{
    rate: number;
    rejected: number;
  } | null>(null);

  const calculate = () => {
    const acc = parseFloat(accepted);
    const tot = parseFloat(total);
    
    if (acc >= 0 && tot > 0 && acc <= tot) {
      const rate = (acc / tot) * 100;
      const rejected = tot - acc;
      
      setResult({
        rate: rate,
        rejected: rejected,
      });
    } else {
      setResult(null);
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Acceptance Rate Calculator</CardTitle>
        <CardDescription>
          Calculate acceptance rates for applications, admissions, or any selection process.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <Label htmlFor="accepted">Number Accepted</Label>
            <Input
              id="accepted"
              type="number"
              value={accepted}
              onChange={(e) => setAccepted(e.target.value)}
              placeholder="Enter number accepted"
              className="mt-2"
            />
          </div>
          <div>
            <Label htmlFor="total">Total Applications</Label>
            <Input
              id="total"
              type="number"
              value={total}
              onChange={(e) => setTotal(e.target.value)}
              placeholder="Enter total applications"
              className="mt-2"
            />
          </div>
          <Button onClick={calculate} className="w-full">
            Calculate
          </Button>
          {result && (
            <div className="mt-6 bg-muted p-4 rounded-lg space-y-2">
              <div className="flex justify-between">
                <span>Acceptance Rate:</span>
                <span className="font-bold">{result.rate.toFixed(2)}%</span>
              </div>
              <div className="flex justify-between">
                <span>Number Rejected:</span>
                <span className="font-bold">{result.rejected.toFixed(0)}</span>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

