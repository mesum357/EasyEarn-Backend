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

export function BasalAreaCalculator() {
  const [trees, setTrees] = useState<Array<{ dbh: string }>>([{ dbh: "" }]);
  const [result, setResult] = useState<number | null>(null);

  const handleInputChange = (index: number, value: string) => {
    const newTrees = [...trees];
    newTrees[index].dbh = value;
    setTrees(newTrees);
    setResult(null);
  };

  const addTree = () => {
    setTrees([...trees, { dbh: "" }]);
  };

  const removeTree = (index: number) => {
    if (trees.length > 1) {
      setTrees(trees.filter((_, i) => i !== index));
    }
  };

  const calculateBasalArea = () => {
    const dbhValues = trees
      .map((t) => parseFloat(t.dbh))
      .filter((v) => !isNaN(v) && v > 0);

    if (dbhValues.length > 0) {
      // Basal Area = sum of (π × (DBH/2)²) for all trees
      // Usually expressed per acre: BA = sum(0.005454 × DBH²)
      const basalArea = dbhValues.reduce((sum, dbh) => {
        return sum + 0.005454 * dbh * dbh; // 0.005454 = π/(4 × 144) conversion factor
      }, 0);
      setResult(basalArea);
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Basal Area Calculator</CardTitle>
        <CardDescription>
          Calculate the basal area of trees in a forest stand. Enter DBH (Diameter at Breast Height) in inches.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Label>Tree DBH (Diameter at Breast Height in inches)</Label>
          <div className="space-y-2">
            {trees.map((tree, index) => (
              <div key={index} className="flex items-center gap-2">
                <Input
                  type="number"
                  placeholder={`Tree ${index + 1} DBH (inches)`}
                  value={tree.dbh}
                  onChange={(e) => handleInputChange(index, e.target.value)}
                  className="flex-grow"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeTree(index)}
                  disabled={trees.length <= 1}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
          <Button variant="outline" size="sm" onClick={addTree}>
            <Plus className="h-4 w-4 mr-2" />
            Add Tree
          </Button>
          <Button onClick={calculateBasalArea} className="w-full">
            Calculate Basal Area
          </Button>
          {result !== null && (
            <div className="mt-6 bg-muted p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">Result</h3>
              <p className="text-2xl font-bold text-primary">
                {result.toFixed(2)} sq ft/acre
              </p>
              <p className="text-sm text-muted-foreground mt-1">Basal Area per Acre</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}



