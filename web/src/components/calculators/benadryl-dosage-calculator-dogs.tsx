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

export function BenadrylDosageCalculatorDogs() {
  const [weight, setWeight] = useState("");
  const [weightUnit, setWeightUnit] = useState("lbs");
  const [result, setResult] = useState<{
    dosage: number;
    tablets: number;
    ml: number;
  } | null>(null);

  const calculateDosage = () => {
    const w = parseFloat(weight);
    if (isNaN(w) || w <= 0) return;

    // Convert to pounds if needed
    const weightInLbs = weightUnit === "kg" ? w * 2.20462 : w;
    
    // Standard dosage: 1mg per pound of body weight, 2-3 times per day
    // Benadryl tablets are typically 25mg
    const dosageMg = weightInLbs * 1; // 1mg per pound
    const tablets = dosageMg / 25; // 25mg per tablet
    const ml = dosageMg / 12.5; // Liquid Benadryl is typically 12.5mg per 5ml, so 2.5mg per ml

    setResult({
      dosage: dosageMg,
      tablets: tablets,
      ml: ml,
    });
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Benadryl Dosage Calculator for Dogs</CardTitle>
        <CardDescription>
          Calculate the appropriate Benadryl dosage for your dog based on weight. Always consult with a veterinarian.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="weight">Dog Weight</Label>
              <Input
                id="weight"
                type="number"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="50"
                className="mt-2"
              />
            </div>
            <div>
              <Label>Unit</Label>
              <Select value={weightUnit} onValueChange={setWeightUnit}>
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="lbs">lbs</SelectItem>
                  <SelectItem value="kg">kg</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button onClick={calculateDosage} className="w-full">
            Calculate
          </Button>
          {result && (
            <div className="mt-6 bg-muted p-4 rounded-lg space-y-2">
              <div className="flex justify-between">
                <span>Dosage:</span>
                <span className="font-bold">{result.dosage.toFixed(1)} mg</span>
              </div>
              <div className="flex justify-between">
                <span>Tablets (25mg each):</span>
                <span className="font-bold">{result.tablets.toFixed(1)} tablets</span>
              </div>
              <div className="flex justify-between">
                <span>Liquid (ml):</span>
                <span className="font-bold">{result.ml.toFixed(1)} ml</span>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                ⚠️ Always consult with a veterinarian before giving medication to your pet.
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}



