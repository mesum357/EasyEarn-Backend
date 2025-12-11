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

// Carbon footprint in kg CO2 per bag (approximate values)
const BAG_FOOTPRINTS: Record<string, number> = {
  "plastic": 0.05, // kg CO2 per plastic bag
  "paper": 0.08, // kg CO2 per paper bag
  "cotton": 2.0, // kg CO2 per cotton bag (reusable)
  "reusable-plastic": 0.1, // kg CO2 per reusable plastic bag
};

export function BagFootprintCalculator() {
  const [bagType, setBagType] = useState("plastic");
  const [quantity, setQuantity] = useState("");
  const [uses, setUses] = useState("1");
  const [result, setResult] = useState<{
    totalFootprint: number;
    perUse: number;
  } | null>(null);

  const calculate = () => {
    const qty = parseFloat(quantity);
    const useCount = parseFloat(uses) || 1;
    
    if (qty > 0) {
      const footprintPerBag = BAG_FOOTPRINTS[bagType] || 0.05;
      const totalFootprint = qty * footprintPerBag;
      const perUse = totalFootprint / (qty * useCount);
      
      setResult({
        totalFootprint: totalFootprint,
        perUse: perUse,
      });
    } else {
      setResult(null);
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Bag Footprint Calculator</CardTitle>
        <CardDescription>
          Calculate the carbon footprint of different types of bags.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <Label htmlFor="bagType">Bag Type</Label>
            <Select value={bagType} onValueChange={setBagType}>
              <SelectTrigger className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="plastic">Plastic Bag (single-use)</SelectItem>
                <SelectItem value="paper">Paper Bag</SelectItem>
                <SelectItem value="cotton">Cotton Bag (reusable)</SelectItem>
                <SelectItem value="reusable-plastic">Reusable Plastic Bag</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="quantity">Number of Bags</Label>
            <Input
              id="quantity"
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="Enter number of bags"
              className="mt-2"
            />
          </div>
          <div>
            <Label htmlFor="uses">Uses per Bag (for reusable bags)</Label>
            <Input
              id="uses"
              type="number"
              value={uses}
              onChange={(e) => setUses(e.target.value)}
              placeholder="Enter number of uses"
              className="mt-2"
            />
          </div>
          <Button onClick={calculate} className="w-full">
            Calculate
          </Button>
          {result && (
            <div className="mt-6 bg-muted p-4 rounded-lg space-y-2">
              <div className="flex justify-between">
                <span>Total Carbon Footprint:</span>
                <span className="font-bold">{result.totalFootprint.toFixed(3)} kg CO₂</span>
              </div>
              <div className="flex justify-between">
                <span>Footprint per Use:</span>
                <span className="font-bold">{result.perUse.toFixed(4)} kg CO₂</span>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

