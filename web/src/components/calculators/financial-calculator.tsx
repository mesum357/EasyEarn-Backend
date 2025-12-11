"use client";

import { useState, useEffect } from "react";
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

export function FinancialCalculator() {
  const [principal, setPrincipal] = useState("");
  const [rate, setRate] = useState("");
  const [time, setTime] = useState("");
  const [result, setResult] = useState<{ monthly: number; total: number; interest: number } | null>(null);

  useEffect(() => {
    console.log('[FinancialCalculator] Component rendered');
  }, []);

  const calculateLoan = () => {
    const p = parseFloat(principal);
    const r = parseFloat(rate) / 100 / 12; // Monthly rate
    const n = parseFloat(time) * 12; // Number of months

    if (p > 0 && r > 0 && n > 0) {
      const monthly = (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
      const total = monthly * n;
      const interest = total - p;

      setResult({
        monthly: monthly,
        total: total,
        interest: interest,
      });
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Financial Calculator</CardTitle>
        <CardDescription>
          Calculate loan payments, interest, and financial metrics.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <Label htmlFor="principal">Loan Amount ($)</Label>
            <Input
              id="principal"
              type="number"
              value={principal}
              onChange={(e) => setPrincipal(e.target.value)}
              placeholder="100000"
              className="mt-2"
            />
          </div>
          <div>
            <Label htmlFor="rate">Annual Interest Rate (%)</Label>
            <Input
              id="rate"
              type="number"
              value={rate}
              onChange={(e) => setRate(e.target.value)}
              placeholder="5.5"
              className="mt-2"
            />
          </div>
          <div>
            <Label htmlFor="time">Loan Term (Years)</Label>
            <Input
              id="time"
              type="number"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              placeholder="30"
              className="mt-2"
            />
          </div>
          <Button onClick={calculateLoan} className="w-full">
            Calculate
          </Button>
          {result && (
            <div className="mt-6 bg-muted p-4 rounded-lg space-y-2">
              <div className="flex justify-between">
                <span>Monthly Payment:</span>
                <span className="font-bold">${result.monthly.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Total Payment:</span>
                <span className="font-bold">${result.total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Total Interest:</span>
                <span className="font-bold">${result.interest.toFixed(2)}</span>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

